import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult } from '../model/result/ServiceResult';

/**
 * AI提供商配置
 */
export interface AIProvider {
  id: string;
  provider: string; // 'openai' | 'deepseek' | 'baidu' | 'ali' | 'tencent'
  apiKey: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
  createTime?: string;
  updateTime?: string;
}

/**
 * 自然语言解析结果
 */
export interface NaturalLanguageParseResult {
  intent?: 'event' | 'todo' | 'search'; // 用户意图：事件、代办、检索
  title?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type?: string;
  reminder?: number; // 提醒时间（分钟）
  description?: string;
  tags?: string[]; // 标签数组
  text?: string; // 代办内容
  aiResponse?: string; // AI 的直接回答（当不需要工具时，如"明天几号"）
  searchCriteria?: { // 搜索条件（仅当intent为search时，离线模式使用）
    keywords: string[]; // 关键词数组
    dateRange: { start: string | null; end: string | null }; // 日期范围
    types: string[]; // 事件类型过滤
    todoStatus: 'all' | 'done' | 'undone'; // 代办状态
    searchIn: string[]; // 搜索范围
  };
  searchResults?: { // AI直接返回的匹配结果（仅当intent为search时，在线模式使用）
    events: any[]; // 匹配的事件列表
    todos: any[]; // 匹配的代办列表
  };
  confidence: number; // 0-1，解析置信度
  source?: 'online'; // 解析来源（仅在线模式）
  autoSaved?: boolean; // 是否已自动保存
  saveError?: string; // 保存错误信息
  plan?: any; // 计划信息
}

/**
 * AI服务类
 */
export class AIService {
  private static instance: AIService;
  private databaseClient: DatabaseClient | null = null;
  private currentProvider: AIProvider | null = null;
  private toolRegistry: any = null;
  private contextManager: any = null;

  private constructor() {
    // 延迟加载 ToolRegistry，避免循环依赖
  }

  /**
   * 获取上下文管理器（延迟加载）
   */
  private async getContextManager(): Promise<any> {
    if (!this.contextManager) {
      const { ContextManager } = await import('./ai/contextManager');
      this.contextManager = ContextManager.getInstance();
    }
    return this.contextManager;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 获取工具注册表（延迟加载）
   */
  private async getToolRegistry(): Promise<any> {
    if (!this.toolRegistry) {
      const { ToolRegistry } = await import('./ai/toolRegistry');
      this.toolRegistry = ToolRegistry.getInstance();
      if (this.databaseClient) {
        this.toolRegistry.setDatabaseClient(this.databaseClient);
      }
      await this.toolRegistry.autoRegisterTools();
    }
    return this.toolRegistry;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
    // 如果工具注册表已初始化，也设置其数据库客户端
    if (this.toolRegistry) {
      this.toolRegistry.setDatabaseClient(client);
    }
    // 初始化上下文管理器
    this.initializeContextManager(client);
  }

  /**
   * 初始化上下文管理器
   */
  private async initializeContextManager(client: DatabaseClient): Promise<void> {
    try {
      const contextManager = await this.getContextManager();
      contextManager.setDatabaseClient(client);
      
      // 确保上下文表已创建
      const SQLStatements = await import('../dataService/sql');
      await client.execute(SQLStatements.SQLStatements.CREATE_AI_CONTEXT_TABLE);
      
      // 加载所有上下文
      await contextManager.loadAllContextsFromDatabase();
      
      // 清理过期上下文
      await contextManager.cleanupExpiredContexts();
      
      console.log('上下文管理器初始化成功');
    } catch (error: any) {
      console.error('初始化上下文管理器失败:', error);
    }
  }

  /**
   * 检查网络状态
   */
  private async checkNetworkStatus(): Promise<boolean> {
    try {
      // 在 Electron 主进程中，使用 Node.js 的 https 模块进行更可靠的检测
      const https = require('https');
      const { URL } = require('url');
      
      // 使用多个检测点，提高准确性
      const checkUrls = [
        'https://www.baidu.com',
        'https://www.google.com',
        'https://api.openai.com'
      ];
      
      // 尝试连接多个端点，只要有一个成功就认为在线
      for (const urlStr of checkUrls) {
        try {
          const url = new URL(urlStr);
          const result = await new Promise<boolean>((resolve) => {
            const req = https.request({
              hostname: url.hostname,
              port: 443,
              path: url.pathname || '/',
              method: 'HEAD',
              timeout: 3000
            }, (res: any) => {
              // 收到响应，说明网络是通的
              resolve(true);
              res.destroy();
            });
            
            req.on('error', () => {
              resolve(false);
            });
            
            req.on('timeout', () => {
              req.destroy();
              resolve(false);
            });
            
            req.end();
          });
          
          if (result) {
            return true;
          }
        } catch (error) {
          // 继续尝试下一个URL
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.error('检查网络状态失败:', error);
      // 如果检测失败，默认返回false（离线模式）
      return false;
    }
  }

  /**
   * 解析自然语言（自动切换在线/离线模式，自动识别意图）
   */
  public async parseNaturalLanguage(
    text: string,
    context?: { currentDate?: string; userTimezone?: string; mode?: 'event' | 'todo' | 'search' }
  ): Promise<ServiceResult<NaturalLanguageParseResult>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    // 1. 检查缓存
    const cacheKey = `parse_${text}_${context?.currentDate || new Date().toISOString().split('T')[0]}`;
    const cached = await this.getCache(cacheKey);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    // 2. 识别用户意图（优先使用传入的mode，否则使用AI自动识别）
    let intent: 'event' | 'todo' | 'search';
    if (context?.mode) {
      intent = context.mode;
    } else {
      intent = await this.detectIntent(text);
    }
    const contextWithIntent = { ...context, intent };

    // 3. 如果是检索意图，使用AI理解搜索条件
    if (intent === 'search') {
      // 使用AI理解搜索意图
      const provider = await this.getCurrentProvider();
      if (!provider) {
        return {
          success: false,
          message: 'AI服务未配置，无法进行智能搜索'
        };
      }

      try {
        // 对于搜索意图，需要先获取数据再构建提示词
        const prompt = await this.buildParsePrompt(text, contextWithIntent);
        const response = await this.callAI(prompt, provider);
        const result = this.parseSearchResponse(response, context?.currentDate);
        
        return {
          success: true,
          data: {
            ...result,
            source: 'online'
          }
        };
      } catch (error: any) {
        // AI调用失败，直接返回错误
        console.error('AI搜索理解失败:', error);
        return {
          success: false,
          message: `AI搜索理解失败: ${error.message}`
        };
      }
    }

    // 4. 调用AI API
    try {
      // 获取AI配置
      const provider = await this.getCurrentProvider();
      if (!provider) {
        return {
          success: false,
          message: 'AI服务未配置，请先配置AI服务'
        };
      }

      const prompt = await this.buildParsePrompt(text, contextWithIntent);
      const response = await this.callAI(prompt, provider);
      const result = this.parseAIResponse(response);
      // 确保结果包含意图
      if (!result.intent) {
        result.intent = intent;
      }
      
      // 4. 缓存结果
      await this.setCache(cacheKey, JSON.stringify(result), 3600); // 缓存1小时
      
      return {
        success: true,
        data: {
          ...result,
          source: 'online'
        }
      };
    } catch (error: any) {
      // AI调用失败，直接返回错误
      console.error('AI调用失败:', error);
      return {
        success: false,
        message: `AI调用失败: ${error.message}`
      };
    }
  }

  /**
   * 获取当前AI提供商（公开方法，供其他服务使用）
   */
  public async getCurrentProvider(): Promise<AIProvider | null> {
    if (this.currentProvider) {
      return this.currentProvider;
    }

    if (!this.databaseClient) {
      return null;
    }

    try {
      const result = await this.databaseClient.execute(SQLStatements.SELECT_AI_CONFIG);
      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as any;
        this.currentProvider = {
          id: row.id,
          provider: row.provider,
          apiKey: row.api_key,
          baseUrl: row.base_url,
          model: row.model,
          enabled: row.enabled === 1,
          createTime: row.create_time,
          updateTime: row.update_time
        };
        return this.currentProvider;
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
    }

    return null;
  }

  /**
   * 识别用户意图（使用AI自动识别）
   */
  private async detectIntent(text: string): Promise<'event' | 'todo' | 'search'> {
    try {
      const provider = await this.getCurrentProvider();
      if (!provider) {
        // 没有配置，默认返回 event
        console.warn('AI服务未配置，使用默认意图: event');
        return 'event';
      }

      const prompt = this.buildIntentDetectionPrompt(text);
      const response = await this.callAI(prompt, provider);
      const intent = this.parseIntentResponse(response);
      
      return intent || 'event'; // 默认返回事件
    } catch (error: any) {
      console.error('AI意图识别失败:', error);
      // 识别失败，默认返回 event
      return 'event';
    }
  }

  /**
   * 构建意图识别提示词
   */
  private buildIntentDetectionPrompt(text: string): string {
    return `你是一个智能助手，需要识别用户的意图。

用户输入："${text}"

请分析用户的意图，判断用户想要：
1. **event（事件）**：用户想要添加一个日历事件，通常包含明确的日期和时间，比如"明天下午3点开会"、"下周三上午10点体检"
2. **todo（代办）**：用户想要添加一个代办事项，通常是一个需要完成的任务，可能没有明确的时间，比如"记得给客户回电"、"下午3点给客户回电"
3. **search（检索）**：用户想要查找或搜索已有的数据，比如"查找包含'会议'的事件"、"显示今天的日程"

请只返回JSON格式：
{
  "intent": "event" | "todo" | "search",
  "confidence": 0.0-1.0,
  "reason": "识别原因"
}

注意：
- 如果包含明确的日期和时间（如"明天下午3点"），通常是event
- 如果只是任务描述（如"记得做某事"），通常是todo
- 如果包含查找、搜索、显示等关键词，通常是search
- 如果同时包含日期和任务描述，优先判断为event`;
  }

  /**
   * 解析AI返回的意图识别结果
   */
  private parseIntentResponse(response: string): 'event' | 'todo' | 'search' | null {
    try {
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const json = JSON.parse(jsonStr);
      const intent = json.intent;
      
      if (intent === 'event' || intent === 'todo' || intent === 'search') {
        return intent;
      }
      
      return null;
    } catch (error) {
      console.error('解析意图识别结果失败:', error);
      return null;
    }
  }

  /**
   * 离线模式：使用简单规则识别意图（降级方案）
   */
  private detectIntentOffline(text: string): 'event' | 'todo' | 'search' {
    const lowerText = text.toLowerCase();
    
    // 检索关键词
    const searchKeywords = ['查找', '搜索', '检索', '找', '查询', '看看', '显示', '列出', '有哪些'];
    if (searchKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'search';
    }
    
    // 代办关键词
    const todoKeywords = ['代办', '待办', 'todo', '任务', '要做', '记得', '提醒我', '别忘了'];
    if (todoKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'todo';
    }
    
    // 事件关键词（包含时间和日期）
    const datePatterns = [
      /\d+月\d+日/, /\d+日/, /明天|后天|大后天|今天|今日/,
      /下周[一二三四五六日]/, /下周一|下周二|下周三|下周四|下周五|下周六|下周日/,
      /周一|周二|周三|周四|周五|周六|周日/
    ];
    const timePatterns = [
      /\d+点\d+分/, /\d+点/, /\d+:\d+/, /上午|下午|晚上|早上|早晨|傍晚/
    ];
    
    const hasDate = datePatterns.some(pattern => pattern.test(text));
    const hasTime = timePatterns.some(pattern => pattern.test(text));
    
    // 如果有明确的日期和时间，通常是事件
    if (hasDate && hasTime) {
      return 'event';
    }
    
    // 如果有日期，可能是事件或代办
    if (hasDate) {
      // 检查是否有事件特征词
      const eventKeywords = ['会议', '约会', '生日', '纪念日', '活动', '聚会', '见面'];
      if (eventKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'event';
      }
      // 默认返回事件
      return 'event';
    }
    
    // 默认返回事件
    return 'event';
  }

  /**
   * 加载用户记忆数据（工作模式、最佳时间、任务偏好等）
   */
  private async loadUserMemory(): Promise<{
    workPatterns: string;
    bestTimes: string;
    taskPreferences: string;
    todayLog: string;
    yesterdayLog: string;
    longTermMemory: string;
    currentEvents: any[];
    currentTodos: any[];
  }> {
    const memory: {
      workPatterns: string;
      bestTimes: string;
      taskPreferences: string;
      todayLog: string;
      yesterdayLog: string;
      longTermMemory: string;
      currentEvents: any[];
      currentTodos: any[];
    } = {
      workPatterns: '',
      bestTimes: '',
      taskPreferences: '',
      todayLog: '',
      yesterdayLog: '',
      longTermMemory: '',
      currentEvents: [],
      currentTodos: []
    };

    try {
      // 1. 直接从 SQLite 读取当前有效的事件和待办（唯一数据源）
      const { EventService } = await import('./eventService');
      const eventService = EventService.getInstance();
      const [eventsResult, todosResult] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getAllTodos()
      ]);
      
      if (eventsResult.success && eventsResult.data) {
        memory.currentEvents = eventsResult.data;
      }
      if (todosResult.success && todosResult.data) {
        memory.currentTodos = todosResult.data;
      }
      
      // 2. 基于 SQLite 数据生成长期记忆
      memory.longTermMemory = await this.generateLongTermMemoryFromSQLite(
        memory.currentEvents,
        memory.currentTodos
      );
      
      // 3. 读取 Markdown 日志（仅操作历史，不作为数据源）
      const { MemoryService } = await import('./memoryService');
      const memoryService = MemoryService.getInstance();
      const sessionMemory = await memoryService.getSessionMemory();
      if (sessionMemory.success && sessionMemory.data) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Markdown 日志只作为操作历史参考，不包含数据本身
        memory.todayLog = sessionMemory.data[`daily/${today}.md`] || '';
        memory.yesterdayLog = sessionMemory.data[`daily/${yesterdayStr}.md`] || '';
      }

      // 4. 读取工作模式文件（从 habits 目录）
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { app } = require('electron');
        const memoryBasePath = path.join(app.getPath('userData'), 'memory');
        
        const workPatternsPath = path.join(memoryBasePath, 'habits', 'work-patterns.md');
        if (fs.existsSync(workPatternsPath)) {
          memory.workPatterns = fs.readFileSync(workPatternsPath, 'utf-8');
        }
        
        const bestTimesPath = path.join(memoryBasePath, 'habits', 'best-times.md');
        if (fs.existsSync(bestTimesPath)) {
          memory.bestTimes = fs.readFileSync(bestTimesPath, 'utf-8');
        }
        
        const taskPreferencesPath = path.join(memoryBasePath, 'habits', 'task-preferences.md');
        if (fs.existsSync(taskPreferencesPath)) {
          memory.taskPreferences = fs.readFileSync(taskPreferencesPath, 'utf-8');
        }
      } catch (error) {
        console.warn('读取记忆文件失败:', error);
      }
    } catch (error) {
      console.warn('加载用户记忆失败:', error);
    }

    return memory;
  }

  /**
   * 基于 SQLite 数据生成长期记忆
   * 分析当前有效的事件和待办，生成摘要和洞察
   */
  private async generateLongTermMemoryFromSQLite(
    events: any[],
    todos: any[]
  ): Promise<string> {
    try {
      // 如果数据为空，返回空字符串
      if ((!events || events.length === 0) && (!todos || todos.length === 0)) {
        return '';
      }

      // 分析数据生成摘要
      const insights: string[] = [];
      
      // 1. 事件类型分布
      const eventTypeCount: { [key: string]: number } = {};
      events.forEach(event => {
        eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
      });
      if (Object.keys(eventTypeCount).length > 0) {
        const typeSummary = Object.entries(eventTypeCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => `${type}: ${count}个`)
          .join('，');
        insights.push(`事件类型分布：${typeSummary}`);
      }
      
      // 2. 待办完成情况
      const completedTodos = todos.filter(t => t.done).length;
      const totalTodos = todos.length;
      if (totalTodos > 0) {
        const completionRate = Math.round((completedTodos / totalTodos) * 100);
        insights.push(`待办完成率：${completionRate}% (${completedTodos}/${totalTodos})`);
      }
      
      // 3. 最近的事件和待办（最近7天）
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= sevenDaysAgo && eventDate <= today;
      });
      const recentTodos = todos.filter(t => {
        const todoDate = new Date(t.date);
        return todoDate >= sevenDaysAgo && todoDate <= today;
      });
      
      if (recentEvents.length > 0 || recentTodos.length > 0) {
        insights.push(`最近7天：${recentEvents.length}个事件，${recentTodos.length}个待办`);
      }
      
      // 4. 时间分布分析
      const timeSlots: { [key: string]: number } = {};
      events.forEach(event => {
        if (event.time) {
          const hour = parseInt(event.time.split(':')[0]);
          const slot = hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上';
          timeSlots[slot] = (timeSlots[slot] || 0) + 1;
        }
      });
      if (Object.keys(timeSlots).length > 0) {
        const timeSummary = Object.entries(timeSlots)
          .sort((a, b) => b[1] - a[1])
          .map(([slot, count]) => `${slot}: ${count}个`)
          .join('，');
        insights.push(`时间分布：${timeSummary}`);
      }

      // 如果没有任何洞察，返回空字符串
      if (insights.length === 0) {
        return '';
      }

      // 生成 Markdown 格式的长期记忆
      return `# 长期记忆摘要

## 数据概览
- 总事件数：${events.length}
- 总待办数：${todos.length}

## 洞察
${insights.map(insight => `- ${insight}`).join('\n')}

> 注：此记忆基于 SQLite 数据库中的当前有效数据生成，确保数据一致性。
`;
    } catch (error) {
      console.warn('生成长期记忆失败:', error);
      return '';
    }
  }

  /**
   * 构建AI提示词（包含意图识别和用户记忆）
   */
  private async buildParsePrompt(text: string, context?: any): Promise<string> {
    const currentDate = context?.currentDate || new Date().toISOString().split('T')[0];
    const userTimezone = context?.userTimezone || 'Asia/Shanghai';
    // intent应该已经在context中，如果没有则使用离线识别作为降级
    const intent = context?.intent || this.detectIntentOffline(text);
    
    // 加载用户记忆数据
    const userMemory = await this.loadUserMemory();

    if (intent === 'search') {
      const currentDate = context?.currentDate || new Date().toISOString().split('T')[0];
      // 获取所有事件和代办数据
      const { EventService } = await import('./eventService');
      const eventService = EventService.getInstance();
      const [eventsResult, todosResult] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getAllTodos()
      ]);
      
      const allEvents = eventsResult.success ? eventsResult.data || [] : [];
      const allTodos = todosResult.success ? todosResult.data || [] : [];
      
      // 将数据转换为JSON字符串，传给AI分析
      const eventsJson = JSON.stringify(allEvents.map(e => ({
        id: e.id,
        title: e.title,
        type: e.type,
        date: e.date,
        time: e.time,
        description: '' // Event 接口没有 description 属性
      })));
      
      const todosJson = JSON.stringify(allTodos.map(t => ({
        id: t.id,
        text: t.text,
        date: t.date,
        done: t.done
      })));
      
      // 构建记忆上下文
      let memoryContext = '';
      if (userMemory.workPatterns) {
        memoryContext += `\n## 用户工作模式\n${userMemory.workPatterns}\n`;
      }
      if (userMemory.bestTimes) {
        memoryContext += `\n## 最佳工作时间\n${userMemory.bestTimes}\n`;
      }
      if (userMemory.taskPreferences) {
        memoryContext += `\n## 任务偏好\n${userMemory.taskPreferences}\n`;
      }
      if (userMemory.todayLog) {
        memoryContext += `\n## 今日工作日志\n${userMemory.todayLog}\n`;
      }
      
      return `你是一个智能日历助手。用户想要检索信息。

当前日期：${currentDate}

用户输入："${text}"
${memoryContext ? `\n## 用户记忆和习惯\n${memoryContext}` : ''}

以下是所有可用的事件和代办数据：

事件数据：
${eventsJson}

代办数据：
${todosJson}

请根据用户的查询意图，分析并返回匹配的结果。注意：
1. **理解语义**：如果用户说"明天有哪些工作？"，"工作"是指事件类型，不是关键词。应该匹配type字段为"工作"且date为明天的记录。
2. **日期理解**：理解"今天"、"明天"、"下周"等时间表达，转换为具体日期进行匹配
3. **类型识别**：区分"工作"、"会议"、"生日"等是类型，而不是关键词。应该精确匹配type字段。
4. **精确匹配**：根据类型、日期等条件精确匹配，而不是简单的关键词搜索
5. **语义理解**：如果用户说"未完成的代办"，应该匹配done=false的代办
6. **参考用户习惯**：如果用户有特定的工作模式或偏好，可以在匹配时考虑这些因素

请返回JSON格式：
{
  "intent": "search",
  "matchedEvents": [
    {
      "id": "事件ID",
      "title": "事件标题",
      "type": "事件类型",
      "date": "日期",
      "time": "时间",
      "matchReason": "匹配原因"
    }
  ],
  "matchedTodos": [
    {
      "id": "代办ID",
      "text": "代办内容",
      "date": "日期",
      "done": false,
      "matchReason": "匹配原因"
    }
  ],
  "confidence": 0.9
}

只返回真正匹配的结果，如果没有匹配的，返回空数组。`;
    }

    if (intent === 'todo') {
      // 构建记忆上下文
      let memoryContext = '';
      if (userMemory.workPatterns) {
        memoryContext += `\n## 用户工作模式\n${userMemory.workPatterns}\n`;
      }
      if (userMemory.bestTimes) {
        memoryContext += `\n## 最佳工作时间\n${userMemory.bestTimes}\n`;
      }
      if (userMemory.taskPreferences) {
        memoryContext += `\n## 任务偏好\n${userMemory.taskPreferences}\n`;
      }
      if (userMemory.todayLog) {
        memoryContext += `\n## 今日工作日志\n${userMemory.todayLog}\n`;
      }
      
      return `你是一个智能日历助手。请将以下自然语言转换为结构化的代办事项信息。

当前日期：${currentDate}
用户时区：${userTimezone}

用户输入："${text}"
${memoryContext ? `\n## 用户记忆和习惯\n${memoryContext}` : ''}

请返回JSON格式：
{
  "intent": "todo",
  "text": "代办事项内容",
  "date": "YYYY-MM-DD（可选，如果没有指定则使用今天）",
  "confidence": 0.95
}

注意：
1. 提取代办事项的核心内容作为text字段
2. 如果有日期信息，解析为YYYY-MM-DD格式
3. 如果没有日期，date字段可以为空或使用当前日期
4. **参考用户的工作模式和最佳时间**：如果用户有特定的工作习惯，可以在建议中体现
5. **参考今日日志**：了解用户今天已经做了什么，避免重复或冲突`;
    }

    // 默认是事件
    // 构建记忆上下文
    let memoryContext = '';
    if (userMemory.workPatterns) {
      memoryContext += `\n## 用户工作模式\n${userMemory.workPatterns}\n`;
    }
    if (userMemory.bestTimes) {
      memoryContext += `\n## 最佳工作时间\n${userMemory.bestTimes}\n`;
    }
    if (userMemory.taskPreferences) {
      memoryContext += `\n## 任务偏好\n${userMemory.taskPreferences}\n`;
    }
    if (userMemory.todayLog) {
      memoryContext += `\n## 今日工作日志\n${userMemory.todayLog}\n`;
    }
    if (userMemory.longTermMemory) {
      memoryContext += `\n## 长期记忆\n${userMemory.longTermMemory}\n`;
    }
    
    return `你是一个智能日历助手。请将以下自然语言转换为结构化的事件信息。

当前日期：${currentDate}
用户时区：${userTimezone}

用户输入："${text}"
${memoryContext ? `\n## 用户记忆和习惯\n${memoryContext}` : ''}

请返回JSON格式：
{
  "intent": "event",
  "title": "事件标题",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "type": "工作|会议|生日|纪念日|其他",
  "reminder": 30,
  "description": "事件描述",
  "tags": ["标签1", "标签2"],
  "confidence": 0.95
}

注意：
1. 日期解析要准确，如"明天"、"下周三"、"3月15日"
2. **时间建议**：参考用户的最佳工作时间，如果用户没有指定时间，建议安排在用户效率较高的时间段
3. **类型推断**：根据事件内容和用户的任务偏好推断类型
4. **提醒时间**：根据事件类型和用户习惯建议合适的提醒时间
5. **避免冲突**：参考今日日志，避免与已有安排冲突
6. 提取关键词作为标签`;
  }

  /**
   * 调用AI接口（公开方法，供其他服务使用）
   */
  public async callAI(
    prompt: string, 
    provider: AIProvider,
    useTools: boolean = false,
    sessionId?: string
  ): Promise<string> {
    // 如果提供了sessionId，使用上下文管理
    if (sessionId) {
      return await this.callAIWithContext(prompt, provider, sessionId, useTools);
    }

    // 否则使用传统方式（无上下文）
    let tools: any[] | undefined = undefined;
    
    // 如果启用工具调用，获取工具列表
    if (useTools) {
      const toolRegistry = await this.getToolRegistry();
      tools = toolRegistry.getToolsForAI();
    }

    if (provider.provider === 'openai') {
      return await this.callOpenAI(prompt, provider, tools);
    } else if (provider.provider === 'deepseek') {
      return await this.callDeepSeek(prompt, provider, tools);
    } else {
      throw new Error(`Unsupported AI provider: ${provider.provider}`);
    }
  }

  /**
   * 使用上下文调用AI
   */
  private async callAIWithContext(
    prompt: string,
    provider: AIProvider,
    sessionId: string,
    useTools: boolean
  ): Promise<string> {
    const contextManager = await this.getContextManager();
    
    // 添加用户消息（异步保存到数据库）
    await contextManager.addMessage(sessionId, {
      role: 'user',
      content: prompt
    }, this);

    // 获取对话历史
    const messages = contextManager.getMessages(sessionId);

    // 获取工具列表（如果需要）
    let tools: any[] | undefined = undefined;
    if (useTools) {
      const toolRegistry = await this.getToolRegistry();
      tools = toolRegistry.getToolsForAI();
    }

    // 调用AI（传入对话历史）
    let response: string;
    if (provider.provider === 'openai') {
      response = await this.callOpenAIWithMessages(messages, provider, tools, sessionId);
    } else if (provider.provider === 'deepseek') {
      response = await this.callDeepSeekWithMessages(messages, provider, tools, sessionId);
    } else {
      throw new Error(`Unsupported AI provider: ${provider.provider}`);
    }

    // 添加AI响应（异步保存到数据库）
    await contextManager.addMessage(sessionId, {
      role: 'assistant',
      content: response
    }, this);

    // 检查是否需要压缩上下文
    const stats = contextManager.getContextStats(sessionId);
    if (stats.needsCompression) {
      await contextManager.compressContext(sessionId, this);
    }

    return response;
  }

  /**
   * 智能判断是否需要调用本地工具
   * 这是一个通用的 AI 框架方法，让 AI 自己判断是否需要工具
   * 返回对象包含判断结果和可能的直接回答
   */
  private async needsLocalTools(text: string, context?: any): Promise<{
    needsTools: boolean;
    directAnswer?: string; // 如果不需要工具，AI 可能已经给出了答案
  }> {
    try {
      const provider = await this.getCurrentProvider();
      if (!provider) {
        // 没有 AI 配置，默认需要工具
        return { needsTools: true };
      }

      // 获取可用工具列表（用于 AI 判断）
      const toolRegistry = await this.getToolRegistry();
      const availableTools = toolRegistry.getToolsForAI();
      const toolNames = availableTools.map((t: any) => t.function?.name || t.name).filter(Boolean).join(', ');

      // 获取当前上下文信息（日期等）
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];

      // 构建通用的判断提示词（不写死具体问题类型）
      const systemPrompt = `你是一个智能助手，需要判断用户的问题是否需要调用本地工具。

**可用工具**：${toolNames || '无'}

**当前上下文**：
- 当前日期：${currentDate}（${weekday}）

**判断原则**：
1. 如果问题只需要你的知识、计算能力或推理能力就能回答，不需要工具
2. 如果问题需要访问本地数据（数据库、文件、用户数据等）或执行本地操作（创建、更新、删除数据等），需要工具
3. 如果问题涉及用户的具体数据、事件、待办、文件等，需要工具

**输出格式**（JSON）：
{
  "needsTools": true/false,
  "directAnswer": "如果不需要工具，直接给出答案；如果需要工具，留空"
}`;

      const userMessage = `用户问题："${text}"

请判断是否需要调用本地工具，并按照输出格式返回 JSON。`;

      // 调用 AI 判断
      let response: string;
      if (provider.provider === 'openai') {
        response = await this.callOpenAIWithSystemPrompt(systemPrompt, userMessage, provider);
      } else if (provider.provider === 'deepseek') {
        response = await this.callDeepSeekWithSystemPrompt(systemPrompt, userMessage, provider);
      } else {
        // 默认需要工具
        return { needsTools: true };
      }

      // 尝试解析 JSON 响应
      try {
        // 提取 JSON 部分（可能包含 markdown 代码块）
        let jsonStr = response.trim();
        const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        } else {
          // 尝试直接查找 JSON 对象
          const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            jsonStr = braceMatch[0];
          }
        }

        const result = JSON.parse(jsonStr);
        const needsTools = result.needsTools === true || result.needsTools === 'true';
        const directAnswer = result.directAnswer || undefined;

        console.log(`[needsLocalTools] 问题："${text}" -> ${needsTools ? '需要' : '不需要'}本地工具${directAnswer ? `，直接回答：${directAnswer.substring(0, 50)}...` : ''}`);
        
        return {
          needsTools,
          directAnswer
        };
      } catch (parseError) {
        // JSON 解析失败，尝试从文本中提取
        const lowerResponse = response.toLowerCase();
        const needsTools = lowerResponse.includes('"needsTools": true') || 
                          lowerResponse.includes('needsTools: true') ||
                          lowerResponse.includes('需要工具') ||
                          lowerResponse.includes('yes');
        
        console.log(`[needsLocalTools] JSON 解析失败，使用文本判断："${text}" -> ${needsTools ? '需要' : '不需要'}本地工具`);
        return { needsTools };
      }

    } catch (error: any) {
      console.error('判断是否需要本地工具失败，默认需要工具:', error);
      // 出错时默认需要工具，保证功能可用
      return { needsTools: true };
    }
  }

  /**
   * 智能解析自然语言（使用 Plan-and-Solve 架构）
   * 先判断是否需要本地工具，如果不需要，直接返回 AI 回答
   * 如果需要，再使用 Plan-and-Solve 架构执行
   */
  public async parseNaturalLanguageWithPlanAndSolve(
    text: string,
    context?: any,
    sessionId?: string,
    ipcSender?: (channel: string, data: any) => void
  ): Promise<ServiceResult<NaturalLanguageParseResult>> {
    try {
      // 1. 先判断是否需要本地工具（AI 框架自动判断）
      const toolCheck = await this.needsLocalTools(text, context);
      
      if (!toolCheck.needsTools) {
        // 不需要本地工具，使用 AI 的直接回答（如果已提供）或让 AI 回答
        console.log('[parseNaturalLanguageWithPlanAndSolve] 不需要本地工具，直接返回 AI 回答');
        const provider = await this.getCurrentProvider();
        if (!provider) {
          return {
            success: false,
            message: 'AI服务未配置'
          };
        }

        // 如果判断过程中 AI 已经给出了直接回答，使用它
        if (toolCheck.directAnswer) {
          return {
            success: true,
            data: {
              intent: 'search',
              searchResults: {
                events: [],
                todos: []
              },
              aiResponse: toolCheck.directAnswer,
              confidence: 0.9,
              source: 'online'
            }
          };
        }

        // 否则，让 AI 直接回答（提供上下文信息）
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;
        const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];

        const systemPrompt = `你是一个智能助手。当前日期是 ${currentDate}（${weekday}）。请直接回答用户的问题，不需要调用任何工具。`;
        const userMessage = text;

        let response: string;
        if (provider.provider === 'openai') {
          response = await this.callOpenAIWithSystemPrompt(systemPrompt, userMessage, provider, undefined, sessionId);
        } else if (provider.provider === 'deepseek') {
          response = await this.callDeepSeekWithSystemPrompt(systemPrompt, userMessage, provider, undefined, sessionId);
        } else {
          return {
            success: false,
            message: '不支持的 AI 提供商'
          };
        }

        // 返回 AI 的直接回答
        return {
          success: true,
          data: {
            intent: 'search',
            searchResults: {
              events: [],
              todos: []
            },
            aiResponse: response,
            confidence: 0.9,
            source: 'online'
          }
        };
      }

      // 2. 需要本地工具，使用 Plan-and-Solve 架构
      const toolRegistry = await this.getToolRegistry();
      const { PlanAndSolveAgent } = await import('./ai/planAndSolveAgent');
      
      const agent = new PlanAndSolveAgent(this, toolRegistry, sessionId, ipcSender);
      const plan = await agent.execute(text, context);
      
      // 将计划结果转换为 NaturalLanguageParseResult
      return await this.convertPlanToResult(plan);
      
    } catch (error: any) {
      console.error('Plan-and-Solve 执行失败，降级到工具调用模式:', error);
      console.error('错误堆栈:', error.stack);
      // 降级到工具调用模式
      try {
        return await this.parseNaturalLanguageWithTools(text, context);
      } catch (fallbackError: any) {
        console.error('工具调用模式也失败，降级到传统模式:', fallbackError);
        // 最后降级到传统模式
        return await this.parseNaturalLanguage(text, context);
      }
    }
  }

  /**
   * 智能解析自然语言（使用工具调用框架）
   * 这是新的方法，使用工具调用而不是硬编码提示词
   */
  public async parseNaturalLanguageWithTools(
    text: string,
    context?: any
  ): Promise<ServiceResult<NaturalLanguageParseResult>> {
    try {
      // 1. 获取工具注册表
      const toolRegistry = await this.getToolRegistry();
      const tools = toolRegistry.getToolsForAI();
      
      // 2. 构建动态系统提示词
      const systemPrompt = this.buildSystemPromptWithTools(tools, context);
      
      // 3. 获取AI配置
      const provider = await this.getCurrentProvider();
      if (!provider) {
        return {
          success: false,
          message: 'AI服务未配置，请先配置AI服务'
        };
      }

      // 4. 调用AI（使用工具调用）
      const userMessage = `用户输入："${text}"\n\n请理解用户的意图，并使用合适的工具来完成用户的请求。`;
      
      // 根据提供商选择不同的调用方法
      let response: string;
      if (provider.provider === 'openai') {
        response = await this.callOpenAIWithSystemPrompt(
          systemPrompt,
          userMessage,
          provider,
          tools
        );
      } else if (provider.provider === 'deepseek') {
        response = await this.callDeepSeekWithSystemPrompt(
          systemPrompt,
          userMessage,
          provider,
          tools
        );
      } else {
        // 不支持的提供商，降级到传统模式
        throw new Error(`Tool calling not supported for provider: ${provider.provider}`);
      }
      
      // 5. 解析AI响应
      return this.parseAIResponseWithTools(response, text);
      
    } catch (error: any) {
      console.error('工具调用失败，降级到传统模式:', error);
      // 降级到传统模式
      return await this.parseNaturalLanguage(text, context);
    }
  }

  /**
   * 构建系统提示词（基于可用工具动态生成）
   */
  private buildSystemPromptWithTools(tools: any[], context?: any): string {
    const currentDate = context?.currentDate || new Date().toISOString().split('T')[0];
    const userTimezone = context?.userTimezone || 'Asia/Shanghai';
    
    const toolDescriptions = tools.map(t => 
      `- **${t.function.name}**: ${t.function.description}`
    ).join('\n');

    return `你是一个智能助手，可以帮助用户管理日历、代办、记忆等。

## 当前上下文
- 当前日期：${currentDate}
- 用户时区：${userTimezone}

## 可用工具
${toolDescriptions}

## 工作流程
1. **理解用户意图**：分析用户想要做什么（创建事件、创建代办、搜索、查询等）
2. **选择合适的工具**：根据意图选择最合适的工具
3. **执行工具调用**：如果需要多个工具，按顺序调用
4. **返回结果**：将工具执行结果整理后返回给用户

## 注意事项
- 使用工具时，确保参数格式正确（参考工具的参数定义）
- 如果工具调用失败，尝试其他方法或降级处理
- 始终以用户的需求为中心
- 对于日期相关的操作，使用 get_current_date 和 calculate_date_offset 工具来准确计算日期
- 对于需要用户记忆的操作，使用 read_work_patterns、read_best_times 等工具获取用户习惯
- 返回结果时，使用JSON格式，包含intent、confidence等字段`;
  }

  /**
   * 解析AI响应（工具调用模式）
   */
  private parseAIResponseWithTools(
    response: string,
    originalText: string
  ): ServiceResult<NaturalLanguageParseResult> {
    try {
      // AI可能直接返回JSON，或者返回工具调用的结果
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const json = JSON.parse(jsonStr);
      
      // 如果AI返回了工具执行结果，解析它
      if (json.intent) {
        return {
          success: true,
          data: {
            ...json,
            source: 'online'
          }
        };
      }

      // 如果AI返回了工具调用的结果，尝试提取信息
      // 这里可以根据实际返回格式进行解析
      return {
        success: true,
        data: {
          intent: 'event',
          title: originalText,
          confidence: 0.8,
          source: 'online'
        }
      };
    } catch (error: any) {
      console.error('解析AI响应失败:', error);
      return {
        success: false,
        message: `解析AI响应失败: ${error.message}`
      };
    }
  }

  /**
   * 将任务计划转换为 NaturalLanguageParseResult
   */
  private async convertPlanToResult(plan: any): Promise<ServiceResult<NaturalLanguageParseResult>> {
    try {
      // 获取工具注册表，用于分析工具元数据
      const toolRegistry = await this.getToolRegistry();
      const allTools = toolRegistry.getAllTools();
      const toolMap = new Map<string, any>(allTools.map((t: any) => [t.name, t]));
      
      // 基于工具元数据分析计划意图
      const planAnalysis = this.analyzePlanByToolMetadata(plan, toolMap);
      
      // 收集执行结果
      const executionResults = this.collectExecutionResults(plan);
      
      // 基于工具元数据和执行结果，动态决定返回格式
      return await this.processConvertPlanToResult(plan, executionResults, planAnalysis);
    } catch (error: any) {
      return {
        success: false,
        message: `转换计划结果失败: ${error.message}`
      };
    }
  }

  /**
   * 基于工具元数据分析计划意图
   */
  private analyzePlanByToolMetadata(plan: any, toolMap: Map<string, any>): {
    primaryIntent: string;
    operationTypes: string[];
    resultEntityTypes: Set<string>;
    hasAutoSave: boolean;
    requiresConfirmation: boolean;
  } {
    const operationTypes = new Set<string>();
    const resultEntityTypes = new Set<string>();
    const intents = new Set<string>();
    let hasAutoSave = false;
    let requiresConfirmation = false;
    
    for (const step of plan.steps) {
      if (step.tool && toolMap.has(step.tool)) {
        const tool = toolMap.get(step.tool)!;
        const metadata = tool.metadata;
        
        if (metadata) {
          if (metadata.operationType) {
            operationTypes.add(metadata.operationType);
          }
          if (metadata.resultEntityType) {
            resultEntityTypes.add(metadata.resultEntityType);
          }
          if (metadata.autoSave) {
            hasAutoSave = true;
          }
          if (metadata.requiresConfirmation) {
            requiresConfirmation = true;
          }
          if (metadata.intent) {
            metadata.intent.forEach((i: string) => intents.add(i));
          }
        }
      }
    }
    
    // 根据操作类型推断主要意图
    let primaryIntent = 'event'; // 默认
    if (operationTypes.has('query')) {
      primaryIntent = 'search';
    } else if (operationTypes.has('create')) {
      if (resultEntityTypes.has('todo')) {
        primaryIntent = 'todo';
      } else if (resultEntityTypes.has('event')) {
        primaryIntent = 'event';
      }
    } else if (intents.size > 0) {
      // 如果有明确的意图声明，使用第一个
      primaryIntent = Array.from(intents)[0];
    }
    
    return {
      primaryIntent,
      operationTypes: Array.from(operationTypes),
      resultEntityTypes,
      hasAutoSave,
      requiresConfirmation
    };
  }

  /**
   * 收集执行结果
   */
  private collectExecutionResults(plan: any): {
    events: any[];
    todos: any[];
    otherResults: any[];
  } {
    const events: any[] = [];
    const todos: any[] = [];
    const otherResults: any[] = [];
    
    // 查找所有成功执行的步骤，提取结果
    const successSteps = plan.steps
      .filter((s: any) => s.status === 'success')
      .sort((a: any, b: any) => b.order - a.order);

    for (const step of successSteps) {
      if (step.result) {
        let result = step.result;
        
        // 如果结果是字符串，尝试解析为 JSON
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch {
            // 如果不是 JSON，保持原样
          }
        }
        
        // 如果结果是数组，检查数组元素类型
        if (Array.isArray(result)) {
          result.forEach((item: any) => {
            // 如果 item 是字符串，尝试解析
            if (typeof item === 'string') {
              try {
                item = JSON.parse(item);
              } catch {
                // 解析失败，跳过
                return;
              }
            }
            
            // 判断是事件还是待办：事件有 title 和 type，待办有 text
            // 注意：必须确保 item 有 id 字段，避免将查询问题本身误判为数据
            if (item && item.id) {
              if (item.title && (item.type || item.time)) {
                events.push(item);
              } else if (item.text || (item.date && !item.time && !item.title)) {
                todos.push(item);
              } else {
                otherResults.push(item);
              }
            }
          });
        } 
        // 如果结果包含 matchedEvents 或 matchedTodos
        else if (result && typeof result === 'object') {
          if (result.matchedEvents && Array.isArray(result.matchedEvents)) {
            events.push(...result.matchedEvents);
          }
          if (result.matchedTodos && Array.isArray(result.matchedTodos)) {
            todos.push(...result.matchedTodos);
          }
          // 如果结果本身是事件或待办
          if (result.id) {
            if (result.title && (result.type || result.time)) {
              events.push(result);
            } else if (result.text) {
              todos.push(result);
            } else if (result.event) {
              events.push(result.event);
            } else if (result.todo) {
              todos.push(result.todo);
            } else {
              otherResults.push(result);
            }
          }
        }
      }
    }
    
    // 调试日志：显示收集到的数据
    if (events.length > 0 || todos.length > 0) {
      console.log(`[convertPlanToResult] 收集到结果: events=${events.length}, todos=${todos.length}`);
    }
    
    return { events, todos, otherResults };
  }

  /**
   * 将任务计划转换为 NaturalLanguageParseResult（处理逻辑部分）
   */
  private async processConvertPlanToResult(
    plan: any,
    executionResults: { events: any[]; todos: any[]; otherResults: any[] },
    planAnalysis: { primaryIntent: string; operationTypes: string[]; resultEntityTypes: Set<string>; hasAutoSave: boolean; requiresConfirmation: boolean }
  ): Promise<ServiceResult<NaturalLanguageParseResult>> {
    const { events: allEvents, todos: allTodos } = executionResults;
    const { primaryIntent, operationTypes } = planAnalysis;
    
    // 检查是否是查询操作
    const hasQueryTool = operationTypes.includes('query');
    const isQueryGoal = plan.goal && (plan.goal.includes('查询') || plan.goal.includes('搜索') || plan.goal.includes('查找'));

    // 如果使用了查询工具或者是查询问题，且没有收集到数据，返回空搜索结果
    if ((hasQueryTool || isQueryGoal) && allEvents.length === 0 && allTodos.length === 0) {
      return {
        success: true,
        data: {
          intent: 'search',
          searchResults: {
            events: [],
            todos: []
          },
          confidence: 0.9,
          source: 'online'
        }
      };
    }

    // 如果有收集到事件或待办，返回搜索结果
    if (allEvents.length > 0 || allTodos.length > 0) {
      // 验证收集到的数据一致性
      this.validateSearchResults(allEvents, allTodos);
      
      return {
        success: true,
        data: {
          intent: 'search',
          searchResults: {
            events: allEvents,
            todos: allTodos
          },
          confidence: 0.9,
          source: 'online'
        }
      };
    }

    // 如果没有收集到数据，检查最后一步的结果（用于非搜索场景）
    const successSteps = plan.steps
      .filter((s: any) => s.status === 'success')
      .sort((a: any, b: any) => b.order - a.order);
    const lastSuccessStep = successSteps[0];
    if (lastSuccessStep && lastSuccessStep.result) {
      const result = lastSuccessStep.result;
      
      // 如果结果是事件或代办，自动保存到数据库和Markdown（但必须确保不是查询问题）
      if ((result.event || result.title) && !isQueryGoal) {
        // 确保有 id 字段，避免将查询问题误判为事件
        if (result.id || result.event?.id) {
          // 自动保存事件
          const eventData = {
            id: result.id || result.event?.id || `event_${Date.now()}`,
            title: result.title || result.event?.title,
            type: result.type || result.event?.type || '其他',
            date: result.date || result.event?.date || new Date().toISOString().split('T')[0],
            time: result.time || result.event?.time || '09:00',
            reminder: result.reminder || result.event?.reminder || 30,
            createTime: new Date().toISOString()
          };
          
          const saveResult = await this.autoSaveEvent(eventData);
          if (saveResult.success) {
            return {
              success: true,
              data: {
                intent: 'event',
                title: eventData.title,
                date: eventData.date,
                time: eventData.time,
                type: eventData.type,
                reminder: eventData.reminder,
                description: result.description || result.event?.description,
                confidence: 0.9,
                source: 'online',
                autoSaved: true // 标记为自动保存
              }
            };
          } else {
            // 保存失败，返回数据但不标记为已保存
            return {
              success: true,
              data: {
                intent: 'event',
                title: eventData.title,
                date: eventData.date,
                time: eventData.time,
                type: eventData.type,
                reminder: eventData.reminder,
                description: result.description || result.event?.description,
                confidence: 0.9,
                source: 'online',
                autoSaved: false,
                saveError: saveResult.message
              }
            };
          }
        }
      }

      // 如果是待办，自动保存到数据库和Markdown（必须确保有 id 字段，且不是查询问题）
      if ((result.todo || result.text) && !isQueryGoal && (result.id || result.todo?.id)) {
        // 自动保存待办
        const todoData = {
          id: result.id || result.todo?.id || `todo_${Date.now()}`,
          text: result.text || result.todo?.text,
          date: result.date || result.todo?.date || new Date().toISOString().split('T')[0],
          done: false,
          createTime: new Date().toISOString()
        };
        
        const saveResult = await this.autoSaveTodo(todoData);
        if (saveResult.success) {
          return {
            success: true,
            data: {
              intent: 'todo',
              text: todoData.text,
              date: todoData.date,
              confidence: 0.9,
              source: 'online',
              autoSaved: true // 标记为自动保存
            }
          };
        } else {
          // 保存失败，返回数据但不标记为已保存
          return {
            success: true,
            data: {
              intent: 'todo',
              text: todoData.text,
              date: todoData.date,
              confidence: 0.9,
              source: 'online',
              autoSaved: false,
              saveError: saveResult.message
            }
          };
        }
      }
    }

    // 如果是查询问题但没有结果，返回空搜索结果
    if (hasQueryTool || isQueryGoal) {
      return {
        success: true,
        data: {
          intent: 'search',
          searchResults: {
            events: [],
            todos: []
          },
          confidence: 0.9,
          source: 'online'
        }
      };
    }

    // 默认返回成功，但需要用户进一步处理（避免将查询问题保存为事件）
    // 如果目标是查询问题，返回搜索意图
    if (isQueryGoal) {
      return {
        success: true,
        data: {
          intent: 'search',
          searchResults: {
            events: [],
            todos: []
          },
          confidence: 0.8,
          source: 'online'
        }
      };
    }
      
    return {
      success: true,
      data: {
        intent: 'event',
        title: plan.goal,
        confidence: 0.8,
        source: 'online',
        // 附加计划信息
        plan: plan
      } as any
    };
  }

  /**
   * 基于分析结果构建返回数据
   */
  private async buildResultFromAnalysis(
    analysis: {
      primaryIntent: string;
      operationTypes: string[];
      resultEntityTypes: Set<string>;
      hasAutoSave: boolean;
      requiresConfirmation: boolean;
    },
    results: {
      events: any[];
      todos: any[];
      otherResults: any[];
    },
    plan: any
  ): Promise<ServiceResult<NaturalLanguageParseResult>> {
    const { primaryIntent, operationTypes, resultEntityTypes, hasAutoSave } = analysis;
    const { events, todos } = results;
    
    // 如果是查询操作，返回搜索结果
    if (operationTypes.includes('query') || primaryIntent === 'search') {
      this.validateSearchResults(events, todos);
      return {
        success: true,
        data: {
          intent: 'search',
          searchResults: {
            events,
            todos
          },
          confidence: 0.9,
          source: 'online'
        }
      };
    }
    
    // 如果是创建操作，且工具声明了自动保存，则自动保存
    if (operationTypes.includes('create') && hasAutoSave) {
      // 处理事件创建
      if (resultEntityTypes.has('event') && events.length > 0) {
        const eventData = events[0];
        // 确保数据完整
        if (!eventData.id) {
          eventData.id = `event_${Date.now()}`;
        }
        if (!eventData.createTime) {
          eventData.createTime = new Date().toISOString();
        }
        
        const saveResult = await this.autoSaveEvent(eventData);
        if (saveResult.success) {
          return {
            success: true,
            data: {
              intent: 'event',
              title: eventData.title,
              date: eventData.date,
              time: eventData.time,
              type: eventData.type,
              reminder: eventData.reminder,
              description: eventData.description,
              confidence: 0.9,
              source: 'online',
              autoSaved: true
            }
          };
        } else {
          return {
            success: true,
            data: {
              intent: 'event',
              title: eventData.title,
              date: eventData.date,
              time: eventData.time,
              type: eventData.type,
              reminder: eventData.reminder,
              description: eventData.description,
              confidence: 0.9,
              source: 'online',
              autoSaved: false,
              saveError: saveResult.message
            }
          };
        }
      }
      
      // 处理待办创建
      if (resultEntityTypes.has('todo') && todos.length > 0) {
        const todoData = todos[0];
        // 确保数据完整
        if (!todoData.id) {
          todoData.id = `todo_${Date.now()}`;
        }
        if (!todoData.createTime) {
          todoData.createTime = new Date().toISOString();
        }
        if (todoData.done === undefined) {
          todoData.done = false;
        }
        
        const saveResult = await this.autoSaveTodo(todoData);
        if (saveResult.success) {
          return {
            success: true,
            data: {
              intent: 'todo',
              text: todoData.text,
              date: todoData.date,
              confidence: 0.9,
              source: 'online',
              autoSaved: true
            }
          };
        } else {
          return {
            success: true,
            data: {
              intent: 'todo',
              text: todoData.text,
              date: todoData.date,
              confidence: 0.9,
              source: 'online',
              autoSaved: false,
              saveError: saveResult.message
            }
          };
        }
      }
    }
    
    // 默认返回
    return {
      success: true,
      data: {
        intent: primaryIntent as any,
        title: plan.goal,
        confidence: 0.8,
        source: 'online',
        autoSaved: false
      } as any
    };
  }

  /**
   * 自动保存事件到数据库和Markdown日志
   */
  private async autoSaveEvent(eventData: any): Promise<ServiceResult<void>> {
    try {
      const { EventService } = await import('./eventService');
      const eventService = EventService.getInstance();
      const result = await eventService.saveEvent(eventData);
      
      if (result.success) {
        console.log(`[autoSaveEvent] 事件已自动保存: ${eventData.title}`);
      } else {
        console.error(`[autoSaveEvent] 事件保存失败: ${result.message}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('[autoSaveEvent] 保存事件异常:', error);
      return {
        success: false,
        message: error.message || '自动保存事件失败'
      };
    }
  }

  /**
   * 自动保存待办到数据库和Markdown日志
   */
  private async autoSaveTodo(todoData: any): Promise<ServiceResult<void>> {
    try {
      const { EventService } = await import('./eventService');
      const eventService = EventService.getInstance();
      const result = await eventService.saveTodo(todoData);
      
      if (result.success) {
        console.log(`[autoSaveTodo] 待办已自动保存: ${todoData.text}`);
      } else {
        console.error(`[autoSaveTodo] 待办保存失败: ${result.message}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('[autoSaveTodo] 保存待办异常:', error);
      return {
        success: false,
        message: error.message || '自动保存待办失败'
      };
    }
  }

  /**
   * 验证搜索结果数据一致性
   */
  private validateSearchResults(events: any[], todos: any[]): void {
    // 验证事件数据完整性
    for (const event of events) {
      if (!event.id || !event.title || !event.date) {
        console.warn(`[convertPlanToResult] 事件数据不完整:`, {
          id: event.id,
          title: event.title,
          date: event.date
        });
        // 尝试修复：如果缺少关键字段，标记为无效
        if (!event.id || !event.title) {
          const index = events.indexOf(event);
          if (index > -1) {
            events.splice(index, 1);
            console.warn(`[convertPlanToResult] 已移除无效事件数据`);
          }
        }
      }
      
      // 验证日期格式
      if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
        console.warn(`[convertPlanToResult] 事件日期格式错误: ${event.date}`);
      }
      
      // 验证时间格式
      if (event.time && !/^\d{2}:\d{2}$/.test(event.time)) {
        console.warn(`[convertPlanToResult] 事件时间格式错误: ${event.time}`);
      }
    }
    
    // 验证待办数据完整性
    for (const todo of todos) {
      if (!todo.id || !todo.text || !todo.date) {
        console.warn(`[convertPlanToResult] 待办数据不完整:`, {
          id: todo.id,
          text: todo.text,
          date: todo.date
        });
        // 尝试修复：如果缺少关键字段，标记为无效
        if (!todo.id || !todo.text) {
          const index = todos.indexOf(todo);
          if (index > -1) {
            todos.splice(index, 1);
            console.warn(`[convertPlanToResult] 已移除无效待办数据`);
          }
        }
      }
      
      // 验证日期格式
      if (todo.date && !/^\d{4}-\d{2}-\d{2}$/.test(todo.date)) {
        console.warn(`[convertPlanToResult] 待办日期格式错误: ${todo.date}`);
      }
    }
    
    // 去重：基于 ID 去重
    const eventIds = new Set();
    const todoIds = new Set();
    
    for (let i = events.length - 1; i >= 0; i--) {
      if (eventIds.has(events[i].id)) {
        events.splice(i, 1);
        console.warn(`[convertPlanToResult] 发现重复事件，已移除`);
      } else {
        eventIds.add(events[i].id);
      }
    }
    
    for (let i = todos.length - 1; i >= 0; i--) {
      if (todoIds.has(todos[i].id)) {
        todos.splice(i, 1);
        console.warn(`[convertPlanToResult] 发现重复待办，已移除`);
      } else {
        todoIds.add(todos[i].id);
      }
    }
  }

  /**
   * 调用OpenAI API（支持Function Calling和系统提示词）
   */
  private async callOpenAIWithSystemPrompt(
    systemPrompt: string,
    userMessage: string,
    provider: AIProvider,
    tools?: any[],
    sessionId?: string
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const model = provider.model || 'gpt-3.5-turbo';

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const requestBody: any = {
      model: model,
      messages: messages,
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCalls(message, tools, provider, messages, 5, sessionId);
    }

    return message.content;
  }

  /**
   * 调用DeepSeek API（支持Function Calling和系统提示词）
   */
  private async callDeepSeekWithSystemPrompt(
    systemPrompt: string,
    userMessage: string,
    provider: AIProvider,
    tools?: any[],
    sessionId?: string
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.deepseek.com/v1';
    const model = provider.model || 'deepseek-reasoner';

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const requestBody: any = {
      model: model,
      messages: messages,
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCallsForDeepSeek(message, tools, provider, messages, 5, sessionId);
    }

    return message.content;
  }

  /**
   * 调用OpenAI API（使用消息数组，支持上下文）
   */
  private async callOpenAIWithMessages(
    messages: any[],
    provider: AIProvider,
    tools?: any[],
    sessionId?: string
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const model = provider.model || 'gpt-3.5-turbo';

    const requestBody: any = {
      model: model,
      messages: messages,
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCalls(message, tools, provider, messages, 5, sessionId);
    }

    return message.content;
  }

  /**
   * 调用DeepSeek API（使用消息数组，支持上下文）
   */
  private async callDeepSeekWithMessages(
    messages: any[],
    provider: AIProvider,
    tools?: any[],
    sessionId?: string
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.deepseek.com/v1';
    const model = provider.model || 'deepseek-reasoner';

    const requestBody: any = {
      model: model,
      messages: messages,
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCallsForDeepSeek(message, tools, provider, messages, 5, sessionId);
    }

    return message.content;
  }

  /**
   * 调用OpenAI API（支持Function Calling）
   */
  private async callOpenAI(
    prompt: string, 
    provider: AIProvider, 
    tools?: any[],
    messages?: any[]
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const model = provider.model || 'gpt-3.5-turbo';

    const requestBody: any = {
      model: model,
      messages: messages || [
        { role: 'system', content: '你是一个专业的日历助手，擅长解析自然语言并转换为结构化事件信息。请只返回JSON格式，不要包含其他内容。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
      // Function Calling模式下不使用response_format
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCalls(message, tools, provider, messages || []);
    }

    return message.content;
  }

  /**
   * 处理工具调用（递归执行）
   */
  private async handleToolCalls(
    message: any,
    tools: any[],
    provider: AIProvider,
    previousMessages: any[],
    maxIterations: number = 5,
    sessionId?: string
  ): Promise<string> {
    if (maxIterations <= 0) {
      throw new Error('Tool call recursion limit reached');
    }

    const toolRegistry = await this.getToolRegistry();
    const toolResults: any[] = [];

    // 执行所有工具调用
    for (const toolCall of message.tool_calls || []) {
      try {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`[Tool Call] ${toolName}`, toolArgs);
        
        const result = await toolRegistry.executeTool(toolName, toolArgs);
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolName,
          content: JSON.stringify(result)
        });
      } catch (error: any) {
        console.error(`Tool execution failed:`, error);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolCall.function.name,
          content: JSON.stringify({ error: error.message })
        });
      }
    }

    // 将工具调用结果发送回AI
    const newMessages = [
      ...previousMessages,
      message,
      ...toolResults
    ];

    // 再次调用AI，传入工具执行结果
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const model = provider.model || 'gpt-3.5-turbo';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: newMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const nextMessage = data.choices[0].message;
    
    // 如果AI又调用了工具，继续递归处理
    if (nextMessage.tool_calls && nextMessage.tool_calls.length > 0) {
      return await this.handleToolCalls(nextMessage, tools, provider, newMessages, maxIterations - 1, sessionId);
    }

    return nextMessage.content || JSON.stringify(nextMessage);
  }

  /**
   * 调用DeepSeek API（支持Function Calling）
   */
  private async callDeepSeek(
    prompt: string, 
    provider: AIProvider,
    tools?: any[],
    messages?: any[]
  ): Promise<string> {
    const baseUrl = provider.baseUrl || 'https://api.deepseek.com/v1';
    const model = provider.model || 'deepseek-reasoner';

    const requestBody: any = {
      model: model,
      messages: messages || [
        { role: 'system', content: '你是一个专业的日历助手，擅长解析自然语言并转换为结构化事件信息。请只返回JSON格式，不要包含其他内容。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    };

    // 如果提供了工具，使用Function Calling
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    } else {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 如果AI选择了工具，执行工具调用
    if (message.tool_calls && tools) {
      return await this.handleToolCallsForDeepSeek(message, tools, provider, messages || []);
    }

    return message.content;
  }

  /**
   * 处理DeepSeek工具调用（递归执行）
   */
  private async handleToolCallsForDeepSeek(
    message: any,
    tools: any[],
    provider: AIProvider,
    previousMessages: any[],
    maxIterations: number = 5,
    sessionId?: string
  ): Promise<string> {
    if (maxIterations <= 0) {
      throw new Error('Tool call recursion limit reached');
    }

    const toolRegistry = await this.getToolRegistry();
    const toolResults: any[] = [];

    // 执行所有工具调用
    for (const toolCall of message.tool_calls || []) {
      try {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`[Tool Call] ${toolName}`, toolArgs);
        
        const result = await toolRegistry.executeTool(toolName, toolArgs);
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolName,
          content: JSON.stringify(result)
        });
      } catch (error: any) {
        console.error(`Tool execution failed:`, error);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolCall.function.name,
          content: JSON.stringify({ error: error.message })
        });
      }
    }

    // 将工具调用结果发送回AI
    const newMessages = [
      ...previousMessages,
      message,
      ...toolResults
    ];

    // 再次调用AI，传入工具执行结果
    const baseUrl = provider.baseUrl || 'https://api.deepseek.com/v1';
    const model = provider.model || 'deepseek-reasoner';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: newMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const nextMessage = data.choices[0].message;
    
    // 如果AI又调用了工具，继续递归处理
    if (nextMessage.tool_calls && nextMessage.tool_calls.length > 0) {
      return await this.handleToolCallsForDeepSeek(nextMessage, tools, provider, newMessages, maxIterations - 1, sessionId);
    }

    return nextMessage.content || JSON.stringify(nextMessage);
  }

  /**
   * 解析搜索响应（AI直接返回匹配结果）
   */
  private parseSearchResponse(response: string, currentDate?: string): NaturalLanguageParseResult {
    try {
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const json = JSON.parse(jsonStr);
      
      // AI直接返回匹配的结果
      return {
        intent: 'search',
        searchResults: {
          events: json.matchedEvents || [],
          todos: json.matchedTodos || []
        },
        confidence: json.confidence || 0.9
      };
    } catch (error) {
      console.error('解析搜索响应失败:', error);
      // 降级处理：返回空结果
      return {
        intent: 'search',
        searchResults: {
          events: [],
          todos: []
        },
        confidence: 0.6
      };
    }
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(response: string): NaturalLanguageParseResult {
    try {
      // 清理响应文本（移除可能的markdown代码块标记）
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const json = JSON.parse(jsonStr);
      
      // 根据意图类型返回不同的结果
      const intent = json.intent || 'event';
      
      if (intent === 'search') {
        // 搜索意图的解析在parseSearchResponse中处理
        return {
          intent: 'search',
          confidence: json.confidence || 0.9
        };
      }
      
      if (intent === 'todo') {
        const today = new Date();
        return {
          intent: 'todo',
          text: json.text || '',
          date: json.date || today.toISOString().split('T')[0],
          confidence: json.confidence || 0.9
        };
      }
      
      // 默认是事件
      const today = new Date();
      const result: NaturalLanguageParseResult = {
        intent: 'event',
        title: json.title || '',
        date: json.date || today.toISOString().split('T')[0],
        time: json.time || '09:00',
        type: json.type || '其他',
        reminder: json.reminder || 30,
        description: json.description,
        tags: json.tags || [],
        confidence: json.confidence || 0.8,
        source: 'online'
      };

      return result;
    } catch (error) {
      throw new Error('Failed to parse AI response: ' + (error as Error).message);
    }
  }

  /**
   * 获取缓存
   */
  private async getCache(cacheKey: string): Promise<string | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      const result = await this.databaseClient.execute(SQLStatements.SELECT_AI_CACHE, [cacheKey]);
      if (result && Array.isArray(result) && result.length > 0) {
        return (result[0] as any).cache_value;
      }
    } catch (error) {
      console.error('获取缓存失败:', error);
    }

    return null;
  }

  /**
   * 设置缓存
   */
  private async setCache(cacheKey: string, cacheValue: string, expireSeconds: number): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const id = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expireTime = new Date(Date.now() + expireSeconds * 1000).toISOString();
      const createTime = new Date().toISOString();

      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_AI_CACHE, [
        id,
        cacheKey,
        cacheValue,
        expireTime,
        createTime
      ]);
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }

  /**
   * 获取AI配置（获取最新的配置，包括禁用的）
   */
  public async getAIConfig(): Promise<ServiceResult<AIProvider | null>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    try {
      // 获取最新的配置（按更新时间排序，包括禁用的）
      const result = await this.databaseClient.execute(
        'SELECT * FROM ai_config ORDER BY update_time DESC LIMIT 1'
      );
      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as any;
        const config: AIProvider = {
          id: row.id,
          provider: row.provider,
          apiKey: row.api_key,
          baseUrl: row.base_url || undefined,
          model: row.model || undefined,
          enabled: row.enabled === 1,
          createTime: row.create_time,
          updateTime: row.update_time
        };
        return { success: true, data: config };
      }
      return { success: true, data: null };
    } catch (error: any) {
      console.error('获取AI配置失败:', error);
      return { success: false, message: error.message || '获取AI配置失败' };
    }
  }

  /**
   * 配置AI服务
   */
  public async configureAI(config: Omit<AIProvider, 'id' | 'createTime' | 'updateTime'>): Promise<ServiceResult<void>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    try {
      const id = config.provider;
      const now = new Date().toISOString();

      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_AI_CONFIG, [
        id,
        config.provider,
        config.apiKey,
        config.baseUrl || null,
        config.model || null,
        config.enabled ? 1 : 0,
        now,
        now
      ]);

      // 清除缓存的provider
      this.currentProvider = null;

      return { success: true };
    } catch (error: any) {
      console.error('配置AI服务失败:', error);
      return { success: false, message: error.message || '配置AI服务失败' };
    }
  }

  /**
   * 智能分类事件
   */
  public async classifyEvent(event: any): Promise<ServiceResult<{
    type: string;
    tags: string[];
    priority: number;
    energyLevel: string;
  }>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    try {
      const provider = await this.getCurrentProvider();
      if (!provider) {
        // 没有AI配置，使用规则引擎
        return this.classifyEventByRules(event);
      }

      const prompt = `分析以下事件，返回JSON格式：
{
  "type": "工作|会议|生日|纪念日|其他",
  "tags": ["标签1", "标签2"],
  "priority": 1-5,
  "energyLevel": "高|中|低"
}

事件信息：
- 标题：${event.title}
- 描述：${event.description || '无'}
- 当前类型：${event.type || '未分类'}`;

      const response = await this.callAI(prompt, provider);
      const result = JSON.parse(response);

      // 保存AI分析结果
      await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_EVENT_AI_METADATA, [
        event.id,
        result.type,
        JSON.stringify(result.tags || []),
        result.priority || 3,
        result.energyLevel || '中',
        JSON.stringify(result),
        result.confidence || 0.8,
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      return { success: true, data: result };
    } catch (error: any) {
      console.error('智能分类失败:', error);
      return this.classifyEventByRules(event);
    }
  }

  /**
   * 使用规则引擎分类事件
   */
  private classifyEventByRules(event: any): ServiceResult<{
    type: string;
    tags: string[];
    priority: number;
    energyLevel: string;
  }> {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const text = `${title} ${description}`;

    let type = '其他';
    const tags: string[] = [];
    let priority = 3;
    let energyLevel = '中';

    // 类型识别
    if (text.includes('会议') || text.includes('开会') || text.includes('讨论')) {
      type = '会议';
      tags.push('会议');
    } else if (text.includes('工作') || text.includes('任务') || text.includes('项目')) {
      type = '工作';
      tags.push('工作');
    } else if (text.includes('生日')) {
      type = '生日';
      tags.push('生日');
      priority = 5;
    } else if (text.includes('纪念日')) {
      type = '纪念日';
      tags.push('纪念日');
      priority = 4;
    }

    // 优先级识别
    if (text.includes('重要') || text.includes('紧急')) {
      priority = 5;
      tags.push('重要');
    } else if (text.includes('紧急')) {
      priority = 4;
      tags.push('紧急');
    }

    // 精力消耗识别
    if (text.includes('深度') || text.includes('复杂') || text.includes('困难')) {
      energyLevel = '高';
    } else if (text.includes('简单') || text.includes('轻松')) {
      energyLevel = '低';
    }

    return { success: true, data: { type, tags, priority, energyLevel } };
  }

  /**
   * 检测事件冲突
   */
  public async detectConflicts(
    newEvent: any,
    existingEvents: any[]
  ): Promise<ServiceResult<{
    hasConflict: boolean;
    conflicts: Array<{
      eventId: string;
      eventTitle: string;
      conflictType: 'time' | 'location' | 'person' | 'resource';
      suggestion?: string;
    }>;
  }>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    const conflicts: Array<{
      eventId: string;
      eventTitle: string;
      conflictType: 'time' | 'location' | 'person' | 'resource';
      suggestion?: string;
    }> = [];

    const newEventStart = new Date(`${newEvent.date}T${newEvent.time}`);
    // 如果有结束时间，使用结束时间；否则默认1小时
    const newEventEnd = newEvent.endTime 
      ? new Date(`${newEvent.date}T${newEvent.endTime}`)
      : new Date(newEventStart.getTime() + 60 * 60 * 1000);

    for (const existingEvent of existingEvents) {
      // 时间冲突检测
      if (existingEvent.date === newEvent.date) {
        const existingStart = new Date(`${existingEvent.date}T${existingEvent.time}`);
        // 如果有结束时间，使用结束时间；否则默认1小时
        const existingEnd = existingEvent.endTime
          ? new Date(`${existingEvent.date}T${existingEvent.endTime}`)
          : new Date(existingStart.getTime() + 60 * 60 * 1000);

        if (
          (newEventStart >= existingStart && newEventStart < existingEnd) ||
          (newEventEnd > existingStart && newEventEnd <= existingEnd) ||
          (newEventStart <= existingStart && newEventEnd >= existingEnd)
        ) {
          conflicts.push({
            eventId: existingEvent.id,
            eventTitle: existingEvent.title,
            conflictType: 'time',
            suggestion: `建议将时间调整为 ${this.suggestAlternativeTime(newEventStart, existingEvents)}`
          });
        }
      }
    }

    return {
      success: true,
      data: {
        hasConflict: conflicts.length > 0,
        conflicts
      }
    };
  }

  /**
   * 建议替代时间
   */
  private suggestAlternativeTime(originalTime: Date, existingEvents: any[]): string {
    // 简单实现：建议延后1小时
    const suggested = new Date(originalTime.getTime() + 60 * 60 * 1000);
    return suggested.toTimeString().slice(0, 5);
  }

  /**
   * 优化日程安排
   * 直接从 SQLite 获取当天的事件进行分析和建议
   */
  public async optimizeSchedule(
    events?: any[] // 保留参数以保持兼容性，但不再使用
  ): Promise<ServiceResult<{
    suggestions: Array<{
      type: 'reschedule' | 'merge' | 'cancel' | 'split';
      eventId: string;
      reason: string;
      newTime?: string;
    }>;
    insights: {
      busyLevel: 'low' | 'medium' | 'high' | 'very-high';
      workLifeBalance: number;
      recommendations: string[];
    };
  }>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    try {
      // 直接从 SQLite 获取当天的事件（不依赖传入参数或日志）
      const { EventService } = await import('./eventService');
      const eventService = EventService.getInstance();
      const allEventsResult = await eventService.getAllEvents();
      
      if (!allEventsResult.success || !allEventsResult.data) {
        return { success: false, message: '获取事件失败' };
      }
      
      // 获取当天日期（本地时区）
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      // 过滤出当天的事件
      const todayEvents = allEventsResult.data.filter(e => e.date === today);
      
      // 加载用户记忆数据（用于个性化建议）
      const userMemory = await this.loadUserMemory();
      
      // 获取用户工作模式和偏好
      const userHabits = await this.getUserHabits();
      const bestTimes = await this.getBestWorkTimes();
      const currentEnergyLevel = this.getCurrentEnergyLevel();

      const suggestions: Array<{
        type: 'reschedule' | 'merge' | 'cancel' | 'split';
        eventId: string;
        reason: string;
        newTime?: string;
      }> = [];

      const recommendations: string[] = [];

      // 分析忙碌程度（基于当天事件）
    const busyLevel = this.calculateBusyLevel(todayEvents);

    // 工作生活平衡
    const workEvents = todayEvents.filter(e => e.type === '工作' || e.type === '会议');
    const lifeEvents = todayEvents.filter(e => e.type === '生日' || e.type === '纪念日' || e.type === '其他');
    const workLifeBalance = lifeEvents.length / (workEvents.length + lifeEvents.length || 1);

    // 生成建议
    if (busyLevel === 'very-high') {
      recommendations.push('今日日程非常繁忙，建议取消或推迟部分非紧急事件');
    } else if (busyLevel === 'high') {
      recommendations.push('今日日程较满，建议合理安排休息时间');
    }

    if (workLifeBalance < 0.3) {
      recommendations.push('工作事件较多，建议增加生活类事件以保持平衡');
    }

    // 基于个人习惯和精力状态的智能建议（使用记忆数据）
    // 按事件类型分组，避免重复建议
    const eventsByType = new Map<string, any[]>();
    todayEvents.forEach(event => {
      if (!eventsByType.has(event.type)) {
        eventsByType.set(event.type, []);
      }
      eventsByType.get(event.type)!.push(event);
    });

    // 为每种类型生成一个建议（而不是为每个事件生成）
    for (const [eventType, typeEvents] of eventsByType.entries()) {
      // 检查该类型的事件是否都不在最佳时间范围内
      const eventTime = this.parseTime(typeEvents[0].time);
      const eventHour = eventTime.hour;
      
      // 从记忆文件中提取最佳时间（如果存在）
      let bestTimeFromMemory: { start: number; end: number } | null = null;
      if (userMemory.bestTimes) {
        // 解析best-times.md中的时间段信息
        const timeMatch = userMemory.bestTimes.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
        if (timeMatch) {
          bestTimeFromMemory = {
            start: parseInt(timeMatch[1]),
            end: parseInt(timeMatch[3])
          };
        }
      }
      
      // 检查是否在最佳工作时间（优先使用记忆数据）
      const bestTimeForType = bestTimeFromMemory || bestTimes[eventType] || bestTimes['default'];
      if (bestTimeForType && !this.isInBestTimeRange(eventHour, bestTimeForType)) {
        const suggestedTime = this.getSuggestedTime(bestTimeForType);
        const reason = userMemory.bestTimes 
          ? `根据你的历史工作记录，${eventType}类任务在这个时间段效率更高`
          : `根据你的工作习惯，${eventType}类任务在${bestTimeForType.start}-${bestTimeForType.end}点效率更高`;
        
        // 只为第一个事件生成建议（代表该类型）
        suggestions.push({
          type: 'reschedule',
          eventId: typeEvents[0].id,
          reason: reason,
          newTime: suggestedTime
        });
      }

      // 检查精力消耗匹配（只检查一次）
      const energyLevel = this.getEventEnergyLevel(eventType);
      if (energyLevel === 'high' && currentEnergyLevel === 'low') {
        // 只为第一个高精力事件生成建议
        const highEnergyEvent = typeEvents.find(e => this.getEventEnergyLevel(e.type) === 'high');
        if (highEnergyEvent) {
          suggestions.push({
            type: 'reschedule',
            eventId: highEnergyEvent.id,
            reason: '当前精力较低，建议将高精力消耗任务调整到精力充沛时段',
            newTime: this.getSuggestedTime(bestTimes['high-energy'] || bestTimes['default'])
          });
          break; // 只生成一个精力建议
        }
      }
    }

    // 检测可以合并的事件（基于当天事件）
    // 使用 Set 记录已处理的事件对，避免重复建议
    const processedPairs = new Set<string>();
    const mergeSuggestions = new Map<string, string[]>(); // eventId -> [相似事件标题]
    
    for (let i = 0; i < todayEvents.length; i++) {
      for (let j = i + 1; j < todayEvents.length; j++) {
        const event1 = todayEvents[i];
        const event2 = todayEvents[j];
        
        // 生成唯一键，避免重复检测
        const pairKey = `${event1.id}_${event2.id}`;
        const reversePairKey = `${event2.id}_${event1.id}`;
        
        if (processedPairs.has(pairKey) || processedPairs.has(reversePairKey)) {
          continue;
        }
        
        // 检查是否相似（同一天、同一类型、标题相似）
        if (event1.date === event2.date && event1.type === event2.type) {
          // 检查标题相似度（简单实现：包含相同关键词）
          const title1 = event1.title.toLowerCase();
          const title2 = event2.title.toLowerCase();
          const isSimilar = title1 === title2 || 
                           (title1.length > 2 && title2.includes(title1)) ||
                           (title2.length > 2 && title1.includes(title2));
          
          if (isSimilar) {
            processedPairs.add(pairKey);
            
            // 收集相似事件
            if (!mergeSuggestions.has(event1.id)) {
              mergeSuggestions.set(event1.id, []);
            }
            mergeSuggestions.get(event1.id)!.push(event2.title);
          }
        }
      }
    }
    
    // 为每个需要合并的事件生成一个建议（包含所有相似事件）
    for (const [eventId, similarTitles] of mergeSuggestions.entries()) {
      const uniqueTitles = Array.from(new Set(similarTitles));
      if (uniqueTitles.length > 0) {
        suggestions.push({
          type: 'merge',
          eventId: eventId,
          reason: `发现${uniqueTitles.length}个相似事件（${uniqueTitles.join('、')}），建议合并`
        });
      }
    }

    // 添加基于习惯的建议（使用记忆数据）
    if (userMemory.workPatterns) {
      // 从工作模式中提取建议
      if (userMemory.workPatterns.includes('批量处理') || userMemory.workPatterns.includes('相似任务')) {
        recommendations.push('根据你的工作模式，建议将相似类型的任务批量处理，提高效率');
      }
      if (userMemory.workPatterns.includes('休息') || userMemory.workPatterns.includes('打断')) {
        recommendations.push('记得在任务之间安排休息时间，保持精力充沛');
      }
    } else {
      // 降级到默认习惯
      if (userHabits.batchSimilarTasks) {
        recommendations.push('建议将相似类型的任务批量处理，提高效率');
      }
      if (userHabits.needBreakTime && busyLevel !== 'low') {
        recommendations.push('记得在任务之间安排休息时间，保持精力充沛');
      }
    }

    // 去重建议：相同 eventId 和 reason 的建议只保留一个
    const uniqueSuggestions = new Map<string, any>();
    for (const suggestion of suggestions) {
      const key = `${suggestion.eventId}_${suggestion.type}_${suggestion.reason}`;
      if (!uniqueSuggestions.has(key)) {
        uniqueSuggestions.set(key, suggestion);
      }
    }
    
    // 限制建议数量（最多10个），并按优先级排序
    const finalSuggestions = Array.from(uniqueSuggestions.values())
      .slice(0, 10)
      .sort((a, b) => {
        // 优先显示 reschedule 建议，然后是 merge 建议
        if (a.type === 'reschedule' && b.type !== 'reschedule') return -1;
        if (a.type !== 'reschedule' && b.type === 'reschedule') return 1;
        return 0;
      });

      return {
        success: true,
        data: {
          suggestions: finalSuggestions,
          insights: {
            busyLevel,
            workLifeBalance,
            recommendations
          }
        }
      };
    } catch (error: any) {
      console.error('优化日程失败:', error);
      return { success: false, message: error.message || '优化日程失败' };
    }
  }

  /**
   * 获取用户工作习惯
   */
  private async getUserHabits(): Promise<{
    batchSimilarTasks: boolean;
    needBreakTime: boolean;
    preferMorning: boolean;
  }> {
    // 从数据库或配置文件读取用户习惯
    // 这里返回默认值，实际应该从user_preferences表读取
    return {
      batchSimilarTasks: true,
      needBreakTime: true,
      preferMorning: false
    };
  }

  /**
   * 获取最佳工作时间
   */
  private async getBestWorkTimes(): Promise<Record<string, { start: number; end: number }>> {
    // 从数据库或配置文件读取最佳工作时间
    // 这里返回默认值，实际应该从ai_learned_patterns表读取
    return {
      '工作': { start: 14, end: 16 },
      '会议': { start: 10, end: 12 },
      '编码': { start: 14, end: 17 },
      '文档': { start: 9, end: 11 },
      'default': { start: 10, end: 12 },
      'high-energy': { start: 14, end: 16 }
    };
  }

  /**
   * 获取当前精力状态
   */
  private getCurrentEnergyLevel(): 'high' | 'medium' | 'low' {
    const hour = new Date().getHours();
    // 根据时间判断精力状态（简化版）
    if (hour >= 9 && hour <= 11) return 'high'; // 上午
    if (hour >= 14 && hour <= 16) return 'high'; // 下午
    if (hour >= 20) return 'low'; // 晚上
    return 'medium';
  }

  /**
   * 解析时间字符串
   */
  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * 判断是否在最佳时间范围内
   */
  private isInBestTimeRange(hour: number, range: { start: number; end: number }): boolean {
    return hour >= range.start && hour < range.end;
  }

  /**
   * 获取建议时间
   */
  private getSuggestedTime(range: { start: number; end: number }): string {
    const suggestedHour = Math.floor((range.start + range.end) / 2);
    return `${String(suggestedHour).padStart(2, '0')}:00`;
  }

  /**
   * 获取事件精力消耗等级
   */
  private getEventEnergyLevel(eventType: string): 'high' | 'medium' | 'low' {
    const energyMap: Record<string, 'high' | 'medium' | 'low'> = {
      '编码': 'high',
      '文档': 'medium',
      '会议': 'low',
      '工作': 'medium',
      '其他': 'low'
    };
    return energyMap[eventType] || 'medium';
  }

  /**
   * 计算忙碌程度
   */
  private calculateBusyLevel(events: any[]): 'low' | 'medium' | 'high' | 'very-high' {
    const count = events.length;
    if (count >= 8) return 'very-high';
    if (count >= 5) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  }

  /**
   * 生成日程摘要
   */
  public async generateSummary(
    events: any[],
    period: 'day' | 'week' | 'month'
  ): Promise<ServiceResult<string>> {
    if (!this.databaseClient) {
      return { success: false, message: '数据库未初始化' };
    }

    try {
      const provider = await this.getCurrentProvider();
      if (!provider) {
        // 没有AI配置，使用规则引擎生成摘要
        return this.generateSummaryByRules(events, period);
      }

      // 加载用户记忆数据
      const userMemory = await this.loadUserMemory();
      
      const eventsJson = JSON.stringify(events.slice(0, 50)); // 限制数量
      
      // 构建记忆上下文
      let memoryContext = '';
      if (userMemory.workPatterns) {
        memoryContext += `\n## 用户工作模式\n${userMemory.workPatterns}\n`;
      }
      if (userMemory.todayLog) {
        memoryContext += `\n## 今日工作日志\n${userMemory.todayLog}\n`;
      }
      if (userMemory.longTermMemory) {
        memoryContext += `\n## 长期记忆\n${userMemory.longTermMemory}\n`;
      }
      
      const prompt = `请为以下${period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}的事件生成摘要：

${eventsJson}
${memoryContext ? `\n## 用户记忆和习惯\n${memoryContext}` : ''}

请用中文生成一个简洁的摘要，包括：
1. 事件总数
2. 主要事件类型
3. 重要提醒
4. **个性化洞察**：基于用户的工作模式和历史记录，提供个性化的建议和洞察`;

      const response = await this.callAI(prompt, provider);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('生成摘要失败:', error);
      return this.generateSummaryByRules(events, period);
    }
  }

  /**
   * 使用规则引擎生成摘要
   */
  private generateSummaryByRules(events: any[], period: 'day' | 'week' | 'month'): ServiceResult<string> {
    const periodName = period === 'day' ? '今日' : period === 'week' ? '本周' : '本月';
    const total = events.length;

    const typeCount: { [key: string]: number } = {};
    events.forEach(event => {
      typeCount[event.type] = (typeCount[event.type] || 0) + 1;
    });

    const typeSummary = Object.entries(typeCount)
      .map(([type, count]) => `${type}: ${count}个`)
      .join('，');

    const summary = `${periodName}共有 ${total} 个事件。\n事件类型分布：${typeSummary}。`;

    return { success: true, data: summary };
  }

  /**
   * 检查网络状态（公开方法）
   */
  public async checkNetworkStatusPublic(): Promise<boolean> {
    return await this.checkNetworkStatus();
  }

}
