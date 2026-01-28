import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult } from '../model/result/ServiceResult';

/**
 * 事件接口
 */
export interface Event {
  id: string;
  title: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reminder: number; // 提醒时间（分钟）
  createTime?: string;
  updateTime?: string;
}

/**
 * 代办事项接口
 */
export interface Todo {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  createTime?: string;
  updateTime?: string;
}

/**
 * 事件服务类
 * 负责处理事件和代办事项的数据库操作
 */
export class EventService {
  private static instance: EventService;
  private databaseClient: DatabaseClient | null = null;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 获取所有事件
   */
  public async getAllEvents(): Promise<ServiceResult<Event[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_ALL_EVENTS) as any[];
      const events: Event[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        date: row.date,
        time: row.time,
        reminder: row.reminder || 0,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: events };
    } catch (error: any) {
      console.error('获取所有事件失败:', error);
      return { success: false, error: error.message || '获取事件失败' };
    }
  }

  /**
   * 根据日期获取事件
   */
  public async getEventsByDate(date: string): Promise<ServiceResult<Event[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_EVENTS_BY_DATE, [date]) as any[];
      const events: Event[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        date: row.date,
        time: row.time,
        reminder: row.reminder || 0,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: events };
    } catch (error: any) {
      console.error('根据日期获取事件失败:', error);
      return { success: false, error: error.message || '获取事件失败' };
    }
  }

  /**
   * 保存事件（新增或更新）
   */
  public async saveEvent(event: Event): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const now = new Date().toISOString();
      const createTime = event.createTime || now;
      const updateTime = now;

      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_EVENT, [
        event.id,
        event.title,
        event.type,
        event.date,
        event.time,
        event.reminder || 0,
        createTime,
        updateTime
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('保存事件失败:', error);
      return { success: false, error: error.message || '保存事件失败' };
    }
  }

  /**
   * 删除事件
   */
  public async deleteEvent(eventId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      await this.databaseClient.execute(SQLStatements.DELETE_EVENT_BY_ID, [eventId]);
      return { success: true };
    } catch (error: any) {
      console.error('删除事件失败:', error);
      return { success: false, error: error.message || '删除事件失败' };
    }
  }

  /**
   * 获取所有代办事项
   */
  public async getAllTodos(): Promise<ServiceResult<Todo[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_ALL_TODOS) as any[];
      const todos: Todo[] = rows.map(row => ({
        id: row.id,
        text: row.text,
        date: row.date,
        done: row.done === 1 || row.done === true,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: todos };
    } catch (error: any) {
      console.error('获取所有代办事项失败:', error);
      return { success: false, error: error.message || '获取代办事项失败' };
    }
  }

  /**
   * 根据日期获取代办事项
   */
  public async getTodosByDate(date: string): Promise<ServiceResult<Todo[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_TODOS_BY_DATE, [date]) as any[];
      const todos: Todo[] = rows.map(row => ({
        id: row.id,
        text: row.text,
        date: row.date,
        done: row.done === 1 || row.done === true,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: todos };
    } catch (error: any) {
      console.error('根据日期获取代办事项失败:', error);
      return { success: false, error: error.message || '获取代办事项失败' };
    }
  }

  /**
   * 保存代办事项（新增或更新）
   */
  public async saveTodo(todo: Todo): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      const now = new Date().toISOString();
      const createTime = todo.createTime || now;
      const updateTime = now;

      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_TODO, [
        todo.id,
        todo.text,
        todo.date,
        todo.done ? 1 : 0,
        createTime,
        updateTime
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('保存代办事项失败:', error);
      return { success: false, error: error.message || '保存代办事项失败' };
    }
  }

  /**
   * 删除代办事项
   */
  public async deleteTodo(todoId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, error: '数据库未初始化' };
      }

      await this.databaseClient.execute(SQLStatements.DELETE_TODO_BY_ID, [todoId]);
      return { success: true };
    } catch (error: any) {
      console.error('删除代办事项失败:', error);
      return { success: false, error: error.message || '删除代办事项失败' };
    }
  }
}

