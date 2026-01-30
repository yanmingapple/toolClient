import { DatabaseClient } from '../../dataService/database';
import { ServiceResult } from '../../model/result/ServiceResult';

/**
 * 工具定义接口
 */
export interface ToolDefinition {
  name: string;                    // 工具名称
  description: string;              // 工具描述（AI可见）
  category: 'database' | 'memory' | 'file' | 'event' | 'todo' | 'system'; // 工具分类
  parameters: {                    // 参数定义（JSON Schema格式）
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
  handler: (...args: any[]) => Promise<any>; // 工具执行函数
}

/**
 * 工具注册表
 * 自动发现和注册所有可用工具
 */
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();
  private databaseClient: DatabaseClient | null = null;

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 注册工具
   */
  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * 获取所有工具
   */
  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 根据分类获取工具
   */
  public getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  /**
   * 获取工具定义（用于Function Calling）
   */
  public getToolsForAI(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  /**
   * 执行工具
   */
  /**
   * 将 snake_case 转换为 camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 规范化参数名称（将 snake_case 转换为 camelCase）
   * 这是统一处理参数名称转换的地方，所有工具都会自动受益
   */
  private normalizeArgs(args: any): any {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      return args;
    }
    
    const normalized: any = {};
    for (const [key, value] of Object.entries(args)) {
      // 如果键名包含下划线，转换为驼峰命名
      const camelKey = this.snakeToCamel(key);
      // 优先使用驼峰命名（如果原键名是 snake_case，则使用转换后的）
      if (camelKey !== key) {
        // 如果转换后的键名已存在（可能是原始参数中同时存在两种格式），优先使用驼峰命名
        normalized[camelKey] = args[camelKey] !== undefined ? args[camelKey] : value;
      } else {
        // 如果已经是驼峰命名，直接使用
        normalized[key] = value;
      }
    }
    
    return normalized;
  }

  public async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    try {
      // 规范化参数名称（将 snake_case 转换为 camelCase）
      const normalizedArgs = this.normalizeArgs(args);
      if (JSON.stringify(args) !== JSON.stringify(normalizedArgs)) {
        console.log(`[ToolRegistry] 参数名称规范化:`, args, '->', normalizedArgs);
      }
      
      console.log(`[ToolRegistry] 执行工具: ${name}`, normalizedArgs);
      const result = await tool.handler(normalizedArgs);
      console.log(`[ToolRegistry] 工具执行成功: ${name}`, typeof result === 'string' ? result.substring(0, 100) : (typeof result === 'object' ? JSON.stringify(result).substring(0, 100) : result));
      return result;
    } catch (error: any) {
      console.error(`[ToolRegistry] 工具执行失败 (${name}):`, error);
      console.error(`[ToolRegistry] 错误堆栈:`, error.stack);
      throw error;
    }
  }

  /**
   * 自动注册所有可用工具
   */
  public async autoRegisterTools(): Promise<void> {
    // 1. 注册数据库工具
    this.registerDatabaseTools();
    
    // 2. 注册记忆系统工具
    this.registerMemoryTools();
    
    // 3. 注册事件和代办工具
    this.registerEventTools();
    
    // 4. 注册文件系统工具
    this.registerFileTools();
    
    // 5. 注册系统工具
    this.registerSystemTools();
  }

  private registerDatabaseTools(): void {
    // SQLite查询工具
    this.registerTool({
      name: 'query_sqlite',
      description: '执行SQLite数据库查询，可以查询events、todos等表的数据。返回查询结果数组。',
      category: 'database',
      parameters: {
        type: 'object',
        properties: {
          sql: {
            type: 'string',
            description: 'SQL查询语句，例如：SELECT * FROM events WHERE date = ?'
          },
          params: {
            type: 'array',
            description: 'SQL参数数组，例如：["2026-01-30"]'
          }
        },
        required: ['sql']
      },
      handler: async (args: { sql: string; params?: any[] }) => {
        if (!this.databaseClient) {
          throw new Error('Database client not initialized');
        }
        const result = await this.databaseClient.execute(args.sql, args.params || []);
        return result;
      }
    });

    // 获取所有事件
    this.registerTool({
      name: 'get_all_events',
      description: '获取所有事件数据，返回事件列表，包括id、title、type、date、time等字段',
      category: 'event',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.getAllEvents();
        if (result.success) {
          return result.data || [];
        }
        throw new Error(result.message || 'Failed to get events');
      }
    });

    // 根据日期获取事件
    this.registerTool({
      name: 'get_events_by_date',
      description: '根据日期获取事件列表，日期格式：YYYY-MM-DD',
      category: 'event',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: '日期，格式：YYYY-MM-DD，例如：2026-01-30'
          }
        },
        required: ['date']
      },
      handler: async (args: { date: string }) => {
        // 验证日期格式
        const dateStr = args.date?.trim();
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }
        
        // 验证日期是否有效
        const testDate = new Date(dateStr + 'T00:00:00');
        if (isNaN(testDate.getTime())) {
          throw new Error(`Invalid date value: ${dateStr}`);
        }
        
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.getEventsByDate(dateStr);
        if (result.success) {
          return result.data || [];
        }
        throw new Error(result.message || 'Failed to get events');
      }
    });

    // 获取所有代办
    this.registerTool({
      name: 'get_all_todos',
      description: '获取所有代办事项数据，返回代办列表，包括id、text、date、done等字段',
      category: 'todo',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.getAllTodos();
        if (result.success) {
          return result.data || [];
        }
        throw new Error(result.message || 'Failed to get todos');
      }
    });

    // 根据日期获取代办
    this.registerTool({
      name: 'get_todos_by_date',
      description: '根据日期获取代办列表，日期格式：YYYY-MM-DD',
      category: 'todo',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: '日期，格式：YYYY-MM-DD，例如：2026-01-30'
          }
        },
        required: ['date']
      },
      handler: async (args: { date: string }) => {
        // 验证日期格式
        const dateStr = args.date?.trim();
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }
        
        // 验证日期是否有效
        const testDate = new Date(dateStr + 'T00:00:00');
        if (isNaN(testDate.getTime())) {
          throw new Error(`Invalid date value: ${dateStr}`);
        }
        
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.getTodosByDate(dateStr);
        if (result.success) {
          return result.data || [];
        }
        throw new Error(result.message || 'Failed to get todos');
      }
    });
  }

  private registerMemoryTools(): void {
    // 读取今日日志
    this.registerTool({
      name: 'read_today_log',
      description: '读取今日工作日志（Markdown格式），包含今天的所有操作记录',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const result = await service.readTodayLog();
        if (result.success) {
          return result.data || '';
        }
        return '';
      }
    });

    // 读取指定日期日志
    this.registerTool({
      name: 'read_log_by_date',
      description: '读取指定日期的工作日志（Markdown格式），日期格式：YYYY-MM-DD',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: '日期，格式：YYYY-MM-DD，例如：2026-01-30'
          }
        },
        required: ['date']
      },
      handler: async (args: { date: string }) => {
        // 验证日期格式
        const dateStr = args.date?.trim();
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }
        
        // 验证日期是否有效
        const testDate = new Date(dateStr + 'T00:00:00');
        if (isNaN(testDate.getTime())) {
          throw new Error(`Invalid date value: ${dateStr}`);
        }
        
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const result = await service.readLogByDate(dateStr);
        if (result.success) {
          return result.data || '';
        }
        return '';
      }
    });

    // 搜索记忆
    this.registerTool({
      name: 'search_memory',
      description: '在记忆系统中搜索内容（支持全文搜索），返回相关记忆片段',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词'
          },
          limit: {
            type: 'number',
            description: '返回结果数量限制，默认10'
          }
        },
        required: ['query']
      },
      handler: async (args: { query: string; limit?: number }) => {
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const result = await service.searchMemory(args.query, args.limit || 10);
        if (result.success) {
          return result.data || [];
        }
        return [];
      }
    });

    // 读取工作模式
    this.registerTool({
      name: 'read_work_patterns',
      description: '读取用户工作模式文件（work-patterns.md），包含用户的工作习惯和模式',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        const patternsPath = path.join(app.getPath('userData'), 'memory', 'habits', 'work-patterns.md');
        if (fs.existsSync(patternsPath)) {
          return fs.readFileSync(patternsPath, 'utf-8');
        }
        return '';
      }
    });

    // 读取最佳工作时间
    this.registerTool({
      name: 'read_best_times',
      description: '读取用户最佳工作时间文件（best-times.md），包含用户在不同时间段的效率数据',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        const bestTimesPath = path.join(app.getPath('userData'), 'memory', 'habits', 'best-times.md');
        if (fs.existsSync(bestTimesPath)) {
          return fs.readFileSync(bestTimesPath, 'utf-8');
        }
        return '';
      }
    });

    // 读取任务偏好
    this.registerTool({
      name: 'read_task_preferences',
      description: '读取用户任务偏好文件（task-preferences.md），包含用户对不同类型任务的偏好',
      category: 'memory',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const { MemoryService } = await import('../memoryService');
        const service = MemoryService.getInstance();
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        const preferencesPath = path.join(app.getPath('userData'), 'memory', 'habits', 'task-preferences.md');
        if (fs.existsSync(preferencesPath)) {
          return fs.readFileSync(preferencesPath, 'utf-8');
        }
        return '';
      }
    });
  }

  private registerEventTools(): void {
    // 创建事件
    this.registerTool({
      name: 'create_event',
      description: '创建新事件，自动生成ID和时间戳',
      category: 'event',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '事件标题' },
          date: { type: 'string', description: '日期 YYYY-MM-DD' },
          time: { type: 'string', description: '时间 HH:mm' },
          type: { type: 'string', description: '事件类型：工作、会议、生日、纪念日、其他' },
          reminder: { type: 'number', description: '提醒时间（分钟），默认30' },
          description: { type: 'string', description: '事件描述（可选）' }
        },
        required: ['title', 'date', 'time']
      },
      handler: async (args: any) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const crypto = require('crypto');
        const event = {
          id: crypto.randomUUID(),
          title: args.title,
          date: args.date,
          time: args.time,
          type: args.type || '其他',
          reminder: args.reminder || 30,
          description: args.description,
          createTime: new Date().toISOString()
        };
        const result = await service.saveEvent(event);
        if (result.success) {
          return { success: true, event };
        }
        throw new Error(result.message || 'Failed to create event');
      }
    });

    // 更新事件
    this.registerTool({
      name: 'update_event',
      description: '更新现有事件',
      category: 'event',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '事件ID' },
          title: { type: 'string', description: '事件标题' },
          date: { type: 'string', description: '日期 YYYY-MM-DD' },
          time: { type: 'string', description: '时间 HH:mm' },
          type: { type: 'string', description: '事件类型' },
          reminder: { type: 'number', description: '提醒时间（分钟）' },
          description: { type: 'string', description: '事件描述' }
        },
        required: ['id']
      },
      handler: async (args: any) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const eventResult = await service.getEventById(args.id);
        if (!eventResult.success || !eventResult.data) {
          throw new Error('Event not found');
        }
        const event = {
          ...eventResult.data,
          ...args,
          updateTime: new Date().toISOString()
        };
        const result = await service.saveEvent(event);
        if (result.success) {
          return { success: true, event };
        }
        throw new Error(result.message || 'Failed to update event');
      }
    });

    // 删除事件
    this.registerTool({
      name: 'delete_event',
      description: '删除事件',
      category: 'event',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '事件ID' }
        },
        required: ['id']
      },
      handler: async (args: { id: string }) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.deleteEvent(args.id);
        if (result.success) {
          return { success: true };
        }
        throw new Error(result.message || 'Failed to delete event');
      }
    });

    // 创建代办
    this.registerTool({
      name: 'create_todo',
      description: '创建新代办事项，自动生成ID和时间戳',
      category: 'todo',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '代办内容' },
          date: { type: 'string', description: '日期 YYYY-MM-DD' }
        },
        required: ['text', 'date']
      },
      handler: async (args: any) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const crypto = require('crypto');
        const todo = {
          id: crypto.randomUUID(),
          text: args.text,
          date: args.date,
          done: false,
          createTime: new Date().toISOString()
        };
        const result = await service.saveTodo(todo);
        if (result.success) {
          return { success: true, todo };
        }
        throw new Error(result.message || 'Failed to create todo');
      }
    });

    // 更新代办
    this.registerTool({
      name: 'update_todo',
      description: '更新代办事项（可以修改内容、日期、完成状态）',
      category: 'todo',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '代办ID' },
          text: { type: 'string', description: '代办内容' },
          date: { type: 'string', description: '日期 YYYY-MM-DD' },
          done: { type: 'boolean', description: '是否完成' }
        },
        required: ['id']
      },
      handler: async (args: any) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const todoResult = await service.getTodoById(args.id);
        if (!todoResult.success || !todoResult.data) {
          throw new Error('Todo not found');
        }
        const todo = {
          ...todoResult.data,
          ...args,
          updateTime: new Date().toISOString()
        };
        const result = await service.saveTodo(todo);
        if (result.success) {
          return { success: true, todo };
        }
        throw new Error(result.message || 'Failed to update todo');
      }
    });

    // 删除代办
    this.registerTool({
      name: 'delete_todo',
      description: '删除代办事项',
      category: 'todo',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '代办ID' }
        },
        required: ['id']
      },
      handler: async (args: { id: string }) => {
        const { EventService } = await import('../eventService');
        const service = EventService.getInstance();
        const result = await service.deleteTodo(args.id);
        if (result.success) {
          return { success: true };
        }
        throw new Error(result.message || 'Failed to delete todo');
      }
    });
  }

  private registerFileTools(): void {
    // 读取文件
    this.registerTool({
      name: 'read_file',
      description: '读取文件内容（文本文件）',
      category: 'file',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '文件路径（绝对路径或相对于userData目录）' }
        },
        required: ['path']
      },
      handler: async (args: { path: string }) => {
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        
        // 如果是相对路径，相对于userData目录
        let filePath = args.path;
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(app.getPath('userData'), filePath);
        }
        
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, 'utf-8');
        }
        throw new Error(`File not found: ${filePath}`);
      }
    });
  }

  private registerSystemTools(): void {
    // 获取当前日期
    this.registerTool({
      name: 'get_current_date',
      description: '获取当前日期（YYYY-MM-DD格式），基于本地时区',
      category: 'system',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        // 使用本地时区获取日期，避免时区问题
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    });

    // 获取当前时间
    this.registerTool({
      name: 'get_current_time',
      description: '获取当前时间（HH:mm格式）',
      category: 'system',
      parameters: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    });

    // 计算日期偏移
    this.registerTool({
      name: 'calculate_date_offset',
      description: '计算日期偏移，例如：今天+1=明天，今天-1=昨天',
      category: 'system',
      parameters: {
        type: 'object',
        properties: {
          baseDate: {
            type: 'string',
            description: '基准日期，格式：YYYY-MM-DD，如果为空则使用今天'
          },
          days: {
            type: 'number',
            description: '偏移天数，正数表示未来，负数表示过去'
          }
        },
        required: ['days']
      },
      handler: async (args: { baseDate?: string; days: number }) => {
        let base: Date;
        if (args.baseDate) {
          // 验证日期格式
          const dateStr = args.baseDate.trim();
          // 检查是否是 YYYY-MM-DD 格式
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            console.warn(`[calculate_date_offset] Invalid date format: ${dateStr}, using current date`);
            base = new Date();
          } else {
            // 使用本地时区解析日期
            const [year, month, day] = dateStr.split('-').map(Number);
            base = new Date(year, month - 1, day);
            console.log(`[calculate_date_offset] 解析基准日期: ${dateStr} -> ${base.toLocaleString('zh-CN')}`);
            // 检查日期是否有效
            if (isNaN(base.getTime())) {
              console.warn(`[calculate_date_offset] Invalid date value: ${dateStr}, using current date`);
              base = new Date();
            }
          }
        } else {
          base = new Date();
          console.log(`[calculate_date_offset] 使用当前日期: ${base.toLocaleString('zh-CN')}`);
        }
        
        // 使用本地时区计算日期偏移
        const result = new Date(base);
        const beforeDate = result.getDate();
        result.setDate(result.getDate() + (args.days || 0));
        const afterDate = result.getDate();
        
        console.log(`[calculate_date_offset] 日期偏移计算: baseDate=${args.baseDate || 'today'}, days=${args.days}, 结果: ${result.toLocaleString('zh-CN')}`);
        
        // 再次验证结果日期
        if (isNaN(result.getTime())) {
          throw new Error(`Invalid date calculation result: baseDate=${args.baseDate}, days=${args.days}`);
        }
        
        // 使用本地时区格式化日期
        const year = result.getFullYear();
        const month = String(result.getMonth() + 1).padStart(2, '0');
        const day = String(result.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        console.log(`[calculate_date_offset] 格式化结果: ${formattedDate}`);
        return formattedDate;
      }
    });
  }
}

