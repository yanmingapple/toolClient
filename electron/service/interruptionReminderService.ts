import { InterruptionService, Interruption } from './interruptionService';
import { NotificationService } from './notificationService';
import { WebContentsService } from './webContentsService';

/**
 * 恢复提醒触发服务
 * 定时检查待处理的打断恢复提醒，并触发系统通知
 */
export class InterruptionReminderService {
  private static instance: InterruptionReminderService;
  private checkInterval: NodeJS.Timeout | null = null;
  private interruptionService: InterruptionService | null = null;
  private isRunning: boolean = false;
  private lastCheckedTime: Date | null = null;
  private processedReminders: Set<string> = new Set(); // 已处理的提醒ID，避免重复通知

  private constructor() {}

  public static getInstance(): InterruptionReminderService {
    if (!InterruptionReminderService.instance) {
      InterruptionReminderService.instance = new InterruptionReminderService();
    }
    return InterruptionReminderService.instance;
  }

  /**
   * 设置打断服务实例
   */
  public setInterruptionService(service: InterruptionService): void {
    this.interruptionService = service;
  }

  /**
   * 启动定时检查
   */
  public start(): void {
    if (this.isRunning) {
      console.log('[InterruptionReminderService] 服务已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('[InterruptionReminderService] 启动恢复提醒触发服务');

    // 立即执行一次检查
    this.checkPendingReminders();

    // 每5分钟检查一次
    this.checkInterval = setInterval(() => {
      this.checkPendingReminders();
    }, 5 * 60 * 1000); // 5分钟
  }

  /**
   * 停止定时检查
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('[InterruptionReminderService] 停止恢复提醒触发服务');
  }

  /**
   * 检查待处理的提醒
   */
  private async checkPendingReminders(): Promise<void> {
    if (!this.interruptionService) {
      console.warn('[InterruptionReminderService] InterruptionService 未设置');
      return;
    }

    try {
      const result = await this.interruptionService.getPendingReminders();
      
      if (!result.success || !result.data) {
        return;
      }

      const pendingReminders = result.data;
      const now = new Date();

      // 过滤出需要触发的提醒（提醒时间已到且未处理过）
      const remindersToTrigger = pendingReminders.filter(reminder => {
        if (!reminder.reminderTime) {
          return false;
        }
        
        const reminderTime = new Date(reminder.reminderTime);
        const isTimeReached = reminderTime <= now;
        const notProcessed = !this.processedReminders.has(reminder.id);
        
        return isTimeReached && notProcessed;
      });

      if (remindersToTrigger.length === 0) {
        return;
      }

      console.log(`[InterruptionReminderService] 发现 ${remindersToTrigger.length} 个待触发的恢复提醒`);

      // 触发每个提醒
      for (const reminder of remindersToTrigger) {
        await this.triggerReminder(reminder);
        // 标记为已处理，避免重复通知
        this.processedReminders.add(reminder.id);
      }

      this.lastCheckedTime = new Date();
    } catch (error: any) {
      console.error('[InterruptionReminderService] 检查待处理提醒失败:', error);
    }
  }

  /**
   * 触发单个提醒
   */
  private async triggerReminder(reminder: Interruption): Promise<void> {
    try {
      // 构建通知消息
      const title = '⏰ 恢复提醒';
      const body = `继续：${reminder.taskTitle}\n${reminder.lastAction || ''}`;

      // 显示系统通知
      NotificationService.show(title, body, {
        onClick: () => {
          // 通知点击时，发送到前端显示详情
          this.sendReminderToFrontend(reminder);
        }
      });

      // 同时发送到前端（所有窗口）
      this.sendReminderToFrontend(reminder);

      console.log(`[InterruptionReminderService] 已触发恢复提醒: ${reminder.taskTitle}`);
    } catch (error: any) {
      console.error('[InterruptionReminderService] 触发提醒失败:', error);
    }
  }

  /**
   * 发送提醒到前端
   */
  private sendReminderToFrontend(reminder: Interruption): void {
    try {
      WebContentsService.sendToRenderer('interruption-reminder:triggered', {
        interruption: reminder
      });
    } catch (error: any) {
      console.error('[InterruptionReminderService] 发送提醒到前端失败:', error);
    }
  }

  /**
   * 清除已处理的提醒标记（用于重新检查）
   */
  public clearProcessedReminders(): void {
    this.processedReminders.clear();
  }

  /**
   * 手动触发检查（用于测试）
   */
  public async manualCheck(): Promise<void> {
    await this.checkPendingReminders();
  }
}

