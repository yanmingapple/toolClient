import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 打断记录
 */
export interface Interruption {
  id: string;
  eventId?: string;
  taskTitle: string;
  lastAction: string;
  notes?: string;
  context?: string;
  interruptTime: string;
  reminderScheduled: boolean;
  reminderTime?: string;
  createdAt: string;
}

/**
 * 打断服务
 * 负责记录和管理工作打断，支持打断恢复提醒
 */
export class InterruptionService {
  private static instance: InterruptionService;
  private databaseClient: DatabaseClient | null = null;

  private constructor() {}

  public static getInstance(): InterruptionService {
    if (!InterruptionService.instance) {
      InterruptionService.instance = new InterruptionService();
    }
    return InterruptionService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 记录打断
   */
  public async recordInterruption(
    interruption: Omit<Interruption, 'id' | 'createdAt' | 'reminderScheduled'>
  ): Promise<ServiceResult<Interruption>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      const id = `interrupt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      // 计算提醒时间（15分钟后）
      const reminderTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await this.databaseClient.execute(SQLStatements.INSERT_INTERRUPTION, [
        id,
        interruption.eventId || null,
        interruption.taskTitle,
        interruption.lastAction,
        interruption.notes || null,
        interruption.context ? JSON.stringify(interruption.context) : null,
        interruption.interruptTime,
        1, // reminderScheduled
        reminderTime,
        now
      ]);

      const result: Interruption = {
        id,
        eventId: interruption.eventId,
        taskTitle: interruption.taskTitle,
        lastAction: interruption.lastAction,
        notes: interruption.notes,
        context: interruption.context,
        interruptTime: interruption.interruptTime,
        reminderScheduled: true,
        reminderTime,
        createdAt: now
      };

      return ServiceResultFactory.success(result, '打断已记录');
    } catch (error: any) {
      console.error('记录打断失败:', error);
      return ServiceResultFactory.error(`记录打断失败: ${error.message}`);
    }
  }

  /**
   * 获取待处理的提醒
   */
  public async getPendingReminders(): Promise<ServiceResult<Interruption[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_PENDING_REMINDERS) as any[];
      const interruptions: Interruption[] = rows.map(row => ({
        id: row.id,
        eventId: row.event_id,
        taskTitle: row.task_title,
        lastAction: row.last_action,
        notes: row.notes,
        context: row.context ? JSON.parse(row.context) : undefined,
        interruptTime: row.interrupt_time,
        reminderScheduled: row.reminder_scheduled === 1,
        reminderTime: row.reminder_time,
        createdAt: row.created_at
      }));

      return ServiceResultFactory.success(interruptions);
    } catch (error: any) {
      console.error('获取待处理提醒失败:', error);
      return ServiceResultFactory.error(`获取待处理提醒失败: ${error.message}`);
    }
  }

  /**
   * 获取事件的所有打断记录
   */
  public async getInterruptionsByEvent(eventId: string): Promise<ServiceResult<Interruption[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_INTERRUPTIONS_BY_EVENT, [eventId]) as any[];
      const interruptions: Interruption[] = rows.map(row => ({
        id: row.id,
        eventId: row.event_id,
        taskTitle: row.task_title,
        lastAction: row.last_action,
        notes: row.notes,
        context: row.context ? JSON.parse(row.context) : undefined,
        interruptTime: row.interrupt_time,
        reminderScheduled: row.reminder_scheduled === 1,
        reminderTime: row.reminder_time,
        createdAt: row.created_at
      }));

      return ServiceResultFactory.success(interruptions);
    } catch (error: any) {
      console.error('获取打断记录失败:', error);
      return ServiceResultFactory.error(`获取打断记录失败: ${error.message}`);
    }
  }

  /**
   * 标记提醒已处理
   */
  public async markReminderHandled(interruptionId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      await this.databaseClient.execute(SQLStatements.UPDATE_INTERRUPTION, [
        0, // reminderScheduled = false
        null, // reminderTime = null
        interruptionId
      ]);

      return ServiceResultFactory.success(undefined, '提醒已标记为已处理');
    } catch (error: any) {
      console.error('标记提醒失败:', error);
      return ServiceResultFactory.error(`标记提醒失败: ${error.message}`);
    }
  }

  /**
   * 删除打断记录
   */
  public async deleteInterruption(interruptionId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      await this.databaseClient.execute(SQLStatements.DELETE_INTERRUPTION, [interruptionId]);
      return ServiceResultFactory.success(undefined, '打断记录已删除');
    } catch (error: any) {
      console.error('删除打断记录失败:', error);
      return ServiceResultFactory.error(`删除打断记录失败: ${error.message}`);
    }
  }
}

