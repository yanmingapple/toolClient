import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';
import { AIAgentCore } from './ai/AIAgentCore';

/**
 * 智能提醒
 */
export interface SmartReminder {
  id: string;
  eventId: string;
  type: 'preparation' | 'location' | 'dependency' | 'best-time' | 'checklist';
  message: string;
  triggerTime: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

/**
 * 智能提醒服务
 * 提供上下文感知的智能提醒功能
 */
export class SmartReminderService {
  private static instance: SmartReminderService;
  private databaseClient: DatabaseClient | null = null;
  private aiAgentCore: AIAgentCore | null = null;

  private constructor() {}

  public static getInstance(): SmartReminderService {
    if (!SmartReminderService.instance) {
      SmartReminderService.instance = new SmartReminderService();
    }
    return SmartReminderService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 设置AI智能体核心
   */
  public setAIAgentCore(core: AIAgentCore): void {
    this.aiAgentCore = core;
  }

  /**
   * 为事件生成智能提醒
   */
  public async generateSmartReminders(event: any): Promise<ServiceResult<SmartReminder[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      const reminders: SmartReminder[] = [];

      // 1. 检查是否需要提前准备（会议类）
      if (event.type === '会议') {
        const preparationReminders = await this.generatePreparationReminders(event);
        reminders.push(...preparationReminders);
      }

      // 2. 检查依赖任务
      const dependencyReminders = await this.generateDependencyReminders(event);
      reminders.push(...dependencyReminders);

      // 3. 基于工作模式的提醒
      const bestTimeReminders = await this.generateBestTimeReminders(event);
      reminders.push(...bestTimeReminders);

      // 4. 检查清单提醒
      if (event.checklist && Array.isArray(event.checklist)) {
        const checklistReminders = await this.generateChecklistReminders(event);
        reminders.push(...checklistReminders);
      }

      return ServiceResultFactory.success(reminders);
    } catch (error: any) {
      console.error('生成智能提醒失败:', error);
      return ServiceResultFactory.error(`生成智能提醒失败: ${error.message}`);
    }
  }

  /**
   * 生成准备提醒（会议前准备材料等）
   */
  private async generatePreparationReminders(event: any): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];
    const eventDateTime = new Date(`${event.date}T${event.time}`);

    // 提前1小时提醒准备会议材料
    const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
    reminders.push({
      id: `prep_1h_${event.id}`,
      eventId: event.id,
      type: 'preparation',
      message: `记得准备会议材料：${event.title}`,
      triggerTime: oneHourBefore.toISOString(),
      priority: 'high',
      data: { preparationType: 'materials' }
    });

    // 提前30分钟提醒检查清单
    if (event.checklist && event.checklist.length > 0) {
      const thirtyMinBefore = new Date(eventDateTime.getTime() - 30 * 60 * 1000);
      const checklistText = event.checklist.map((item: any) => item.text || item).join('、');
      reminders.push({
        id: `prep_30m_${event.id}`,
        eventId: event.id,
        type: 'checklist',
        message: `检查清单：${checklistText}`,
        triggerTime: thirtyMinBefore.toISOString(),
        priority: 'medium',
        data: { checklist: event.checklist }
      });
    }

    return reminders;
  }

  /**
   * 生成依赖任务提醒
   */
  private async generateDependencyReminders(event: any): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];

    // 如果有依赖任务，检查是否完成
    if (event.dependencies && Array.isArray(event.dependencies)) {
      for (const dep of event.dependencies) {
        if (!dep.completed) {
          reminders.push({
            id: `dep_${event.id}_${dep.id}`,
            eventId: event.id,
            type: 'dependency',
            message: `${event.title} 需要先完成：${dep.title}`,
            triggerTime: new Date().toISOString(), // 立即提醒
            priority: 'high',
            data: { dependencyId: dep.id, dependencyTitle: dep.title }
          });
        }
      }
    }

    return reminders;
  }

  /**
   * 生成最佳时间提醒
   */
  private async generateBestTimeReminders(event: any): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];

    if (!this.aiAgentCore || !this.databaseClient) {
      return reminders;
    }

    try {
      // 获取日历模块的建议
      const suggestions = await this.aiAgentCore.generateSuggestions('calendar', {
        currentData: event
      });

      if (suggestions.success && suggestions.data) {
        for (const suggestion of suggestions.data) {
          if (suggestion.type === 'time' && suggestion.data?.time) {
            const suggestedTime = suggestion.data.time;
            const currentTime = new Date().toTimeString().slice(0, 5);
            
            // 如果当前时间接近建议的最佳时间
            if (this.isTimeClose(currentTime, suggestedTime)) {
              reminders.push({
                id: `best_time_${event.id}`,
                eventId: event.id,
                type: 'best-time',
                message: suggestion.content,
                triggerTime: new Date().toISOString(),
                priority: 'low',
                data: { suggestedTime }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('生成最佳时间提醒失败:', error);
    }

    return reminders;
  }

  /**
   * 生成检查清单提醒
   */
  private async generateChecklistReminders(event: any): Promise<SmartReminder[]> {
    const reminders: SmartReminder[] = [];
    const eventDateTime = new Date(`${event.date}T${event.time}`);

    // 在事件开始前30分钟提醒检查清单
    const thirtyMinBefore = new Date(eventDateTime.getTime() - 30 * 60 * 1000);
    const incompleteItems = event.checklist.filter((item: any) => !item.completed);
    
    if (incompleteItems.length > 0) {
      const itemsText = incompleteItems.map((item: any) => item.text || item).join('、');
      reminders.push({
        id: `checklist_${event.id}`,
        eventId: event.id,
        type: 'checklist',
        message: `待完成事项：${itemsText}`,
        triggerTime: thirtyMinBefore.toISOString(),
        priority: 'medium',
        data: { checklist: incompleteItems }
      });
    }

    return reminders;
  }

  /**
   * 检查时间是否接近
   */
  private isTimeClose(time1: string, time2: string): boolean {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    return Math.abs(minutes1 - minutes2) <= 30; // 30分钟内认为接近
  }

  /**
   * 检查并触发待处理的提醒
   */
  public async checkAndTriggerReminders(): Promise<ServiceResult<SmartReminder[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      // 获取所有事件
      const eventsResult = await this.databaseClient.execute(SQLStatements.SELECT_ALL_EVENTS) as any[];
      const now = new Date();
      const triggeredReminders: SmartReminder[] = [];

      for (const event of eventsResult) {
        const reminders = await this.generateSmartReminders(event);
        if (reminders.success && reminders.data) {
          for (const reminder of reminders.data) {
            const triggerTime = new Date(reminder.triggerTime);
            // 如果提醒时间已到或已过
            if (triggerTime <= now) {
              triggeredReminders.push(reminder);
            }
          }
        }
      }

      return ServiceResultFactory.success(triggeredReminders);
    } catch (error: any) {
      console.error('检查提醒失败:', error);
      return ServiceResultFactory.error(`检查提醒失败: ${error.message}`);
    }
  }
}

