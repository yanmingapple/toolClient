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
  time: string; // HH:mm 开始时间
  endTime?: string; // HH:mm 结束时间
  description?: string; // 事件描述
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
        return { success: false, message: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_ALL_EVENTS) as any[];
      const events: Event[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        date: row.date,
        time: row.time,
        endTime: row.endTime || undefined,
        description: row.description || '',
        reminder: row.reminder || 0,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: events };
    } catch (error: any) {
      console.error('获取所有事件失败:', error);
      return { success: false, message: error.message || '获取事件失败' };
    }
  }

  /**
   * 根据ID获取事件
   */
  public async getEventById(eventId: string): Promise<ServiceResult<Event | null>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_EVENT_BY_ID, [eventId]) as any[];
      if (rows && rows.length > 0) {
        const row = rows[0];
        const event: Event = {
          id: row.id,
          title: row.title,
          type: row.type,
          date: row.date,
          time: row.time,
          endTime: row.endTime || undefined,
          description: row.description || '',
          reminder: row.reminder || 0,
          createTime: row.createTime,
          updateTime: row.updateTime
        };
        return { success: true, data: event };
      } else {
        return { success: true, data: null };
      }
    } catch (error: any) {
      console.error('获取事件失败:', error);
      return { success: false, message: error.message || '获取事件失败' };
    }
  }

  /**
   * 根据日期获取事件
   */
  public async getEventsByDate(date: string): Promise<ServiceResult<Event[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_EVENTS_BY_DATE, [date]) as any[];
      const events: Event[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        date: row.date,
        time: row.time,
        endTime: row.endTime || undefined,
        description: row.description || '',
        reminder: row.reminder || 0,
        createTime: row.createTime,
        updateTime: row.updateTime
      }));

      return { success: true, data: events };
    } catch (error: any) {
      console.error('根据日期获取事件失败:', error);
      return { success: false, message: error.message || '获取事件失败' };
    }
  }

  /**
   * 保存事件（新增或更新）
   * 注意：数据只存储在SQLite中，Markdown日志只是记录操作历史
   */
  public async saveEvent(event: Event): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      const now = new Date().toISOString();
      const createTime = event.createTime || now;
      const updateTime = now;

      // 判断是新增还是更新
      const existingEvent = await this.getEventById(event.id);
      const isNew = !existingEvent.success || !existingEvent.data;
      const action = isNew ? 'created' : 'updated';

      // 1. 先保存到SQLite（这是唯一的数据源）
      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_EVENT, [
        event.id,
        event.title,
        event.type,
        event.date,
        event.time,
        event.endTime || null,
        event.description || '',
        event.reminder || 0,
        createTime,
        updateTime
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('保存事件失败:', error);
      return { success: false, message: error.message || '保存事件失败' };
    }
  }

  /**
   * 删除事件
   * 注意：数据只存储在SQLite中，Markdown日志只是记录操作历史
   */
  public async deleteEvent(eventId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      // 1. 先获取事件信息（用于日志记录）
      const eventResult = await this.getEventById(eventId);
      const event = eventResult.success ? eventResult.data : null;

      // 2. 从SQLite删除（这是唯一的数据源）
      await this.databaseClient.execute(SQLStatements.DELETE_EVENT_BY_ID, [eventId]);

      return { success: true };
    } catch (error: any) {
      console.error('删除事件失败:', error);
      return { success: false, message: error.message || '删除事件失败' };
    }
  }

  /**
   * 标记事件为完成
   * 自动生成工作日志
   */
  public async completeEvent(
    eventId: string,
    options?: {
      actualMinutes?: number;
      interruptionCount?: number;
      notes?: string;
    }
  ): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      // 获取事件信息
      const eventResult = await this.getEventById(eventId);
      if (!eventResult.success || !eventResult.data) {
        return { success: false, message: '事件不存在' };
      }

      const event = eventResult.data;

      // 提取工作模式（不写入日志文件，只用于总结）
      try {
        const { WorkLogService } = await import('./workLogService');
        const workLogService = WorkLogService.getInstance();
        workLogService.setDatabaseClient(this.databaseClient);

        // 只提取工作模式，不生成日志文件
        await workLogService.extractWorkPatternsOnly({
          eventId: event.id,
          title: event.title,
          type: event.type,
          createTime: event.createTime || new Date().toISOString(),
          completeTime: new Date().toISOString(),
          estimatedMinutes: options?.actualMinutes ? undefined : 60,
          actualMinutes: options?.actualMinutes,
          interruptionCount: options?.interruptionCount || 0,
          description: options?.notes
        });
      } catch (error: any) {
        console.warn('提取工作模式失败:', error);
        // 不影响事件完成操作
      }

      return { success: true };
    } catch (error: any) {
      console.error('完成事件失败:', error);
      return { success: false, message: error.message || '完成事件失败' };
    }
  }

  /**
   * 获取所有代办事项
   */
  public async getAllTodos(): Promise<ServiceResult<Todo[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
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
      return { success: false, message: error.message || '获取代办事项失败' };
    }
  }

  /**
   * 根据日期获取代办事项
   */
  public async getTodosByDate(date: string): Promise<ServiceResult<Todo[]>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
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
      return { success: false, message: error.message || '获取代办事项失败' };
    }
  }

  /**
   * 保存代办事项（新增或更新）
   * 注意：数据只存储在SQLite中，Markdown日志只是记录操作历史
   */
  public async saveTodo(todo: Todo): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      const now = new Date().toISOString();
      const createTime = todo.createTime || now;
      const updateTime = now;

      // 判断是新增还是更新
      const existingTodo = await this.getTodoById(todo.id);
      const isNew = !existingTodo.success || !existingTodo.data;
      const action = isNew ? 'created' : 'updated';

      // 1. 先保存到SQLite（这是唯一的数据源）
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
      return { success: false, message: error.message || '保存代办事项失败' };
    }
  }

  /**
   * 根据ID获取代办事项
   */
  public async getTodoById(todoId: string): Promise<ServiceResult<Todo | null>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      const rows = await this.databaseClient.execute(SQLStatements.SELECT_TODO_BY_ID, [todoId]) as any[];
      if (rows && rows.length > 0) {
        const row = rows[0];
        const todo: Todo = {
          id: row.id,
          text: row.text,
          date: row.date,
          done: row.done === 1 || row.done === true,
          createTime: row.createTime,
          updateTime: row.updateTime
        };
        return { success: true, data: todo };
      } else {
        return { success: true, data: null };
      }
    } catch (error: any) {
      console.error('获取代办事项失败:', error);
      return { success: false, message: error.message || '获取代办事项失败' };
    }
  }

  /**
   * 删除代办事项
   * 注意：数据只存储在SQLite中，Markdown日志只是记录操作历史
   */
  public async deleteTodo(todoId: string): Promise<ServiceResult<void>> {
    try {
      if (!this.databaseClient) {
        return { success: false, message: '数据库未初始化' };
      }

      // 1. 先获取代办信息（用于日志记录）
      const todoResult = await this.getTodoById(todoId);
      const todo = todoResult.success ? todoResult.data : null;

      // 2. 从SQLite删除（这是唯一的数据源）
      await this.databaseClient.execute(SQLStatements.DELETE_TODO_BY_ID, [todoId]);

      return { success: true };
    } catch (error: any) {
      console.error('删除代办事项失败:', error);
      return { success: false, message: error.message || '删除代办事项失败' };
    }
  }
}

