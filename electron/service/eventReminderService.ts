import { EventService, Event } from './eventService';
import { NotificationService } from './notificationService';
import { WebContentsService } from './webContentsService';
import { DatabaseClient } from '../dataService/database';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 事件提醒服务类
 * 负责定时检查事件提醒并触发通知
 */
export class EventReminderService {
  private static instance: EventReminderService;
  private databaseClient: DatabaseClient | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private checkIntervalMs: number = 60000; // 默认每分钟检查一次
  private remindedEvents: Set<string> = new Set(); // 已提醒的事件ID集合

  private constructor() {}

  public static getInstance(): EventReminderService {
    if (!EventReminderService.instance) {
      EventReminderService.instance = new EventReminderService();
    }
    return EventReminderService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 启动提醒检查
   */
  public start(): void {
    if (this.checkInterval) {
      console.log('[EventReminderService] 提醒检查已在运行');
      return;
    }

    console.log('[EventReminderService] 启动事件提醒检查服务');
    // 立即检查一次
    this.checkReminders();
    // 然后定时检查
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, this.checkIntervalMs);
  }

  /**
   * 停止提醒检查
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[EventReminderService] 已停止事件提醒检查服务');
    }
  }

  /**
   * 检查需要提醒的事件
   */
  private async checkReminders(): Promise<void> {
    try {
      if (!this.databaseClient) {
        console.warn('[EventReminderService] 数据库未初始化，跳过提醒检查');
        return;
      }

      const eventService = EventService.getInstance();
      eventService.setDatabaseClient(this.databaseClient);

      // 获取所有事件
      const eventsResult = await eventService.getAllEvents();
      if (!eventsResult.success || !eventsResult.data) {
        return;
      }

      const now = new Date();
      const nowTime = now.getTime();

      for (const event of eventsResult.data) {
        // 跳过没有设置提醒的事件
        if (!event.reminder || event.reminder <= 0) {
          continue;
        }

        // 跳过已提醒的事件
        if (this.remindedEvents.has(event.id)) {
          continue;
        }

        // 计算事件时间
        const eventDateTime = new Date(`${event.date} ${event.time}`);
        if (isNaN(eventDateTime.getTime())) {
          console.warn(`[EventReminderService] 事件 ${event.id} 的日期时间格式无效: ${event.date} ${event.time}`);
          continue;
        }

        const eventTime = eventDateTime.getTime();
        const remindTime = eventTime - event.reminder * 60 * 1000; // 提前提醒时间（毫秒）

        // 检查是否到了提醒时间
        // 允许在提醒时间后的5分钟内触发（避免因为检查间隔错过提醒）
        const reminderWindow = 5 * 60 * 1000; // 5分钟窗口
        if (nowTime >= remindTime && nowTime <= eventTime && nowTime <= remindTime + reminderWindow) {
          await this.triggerReminder(event);
          this.remindedEvents.add(event.id);
        }

        // 如果事件时间已过，清理已提醒记录（避免内存泄漏）
        if (nowTime > eventTime) {
          this.remindedEvents.delete(event.id);
        }
      }
    } catch (error) {
      console.error('[EventReminderService] 检查提醒失败:', error);
    }
  }

  /**
   * 触发提醒
   */
  private async triggerReminder(event: Event): Promise<void> {
    try {
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const timeStr = eventDateTime.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const title = `📅 事件提醒: ${event.title}`;
      const body = `时间: ${timeStr}\n类型: ${event.type}${event.description ? `\n描述: ${event.description}` : ''}`;

      console.log(`[EventReminderService] 触发提醒: ${title}`);

      // 显示系统通知
      NotificationService.show(title, body, {
        onClick: () => {
          // 点击通知时，打开事件提醒窗口
          WebContentsService.sendToRenderer('open-event-reminder-dialog');
        }
      });

      // 向所有窗口发送提醒消息
      WebContentsService.sendToRenderer('event-reminder:triggered', {
        eventId: event.id,
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        description: event.description
      });
    } catch (error) {
      console.error(`[EventReminderService] 触发提醒失败:`, error);
    }
  }

  /**
   * 清除已提醒记录（用于测试或重置）
   */
  public clearRemindedEvents(): void {
    this.remindedEvents.clear();
    console.log('[EventReminderService] 已清除所有已提醒记录');
  }

  /**
   * 手动触发一次提醒检查（用于测试）
   */
  public async checkNow(): Promise<ServiceResult<void>> {
    try {
      await this.checkReminders();
      return ServiceResultFactory.success(undefined, '提醒检查完成');
    } catch (error: any) {
      return ServiceResultFactory.error(`提醒检查失败: ${error.message}`);
    }
  }
}

