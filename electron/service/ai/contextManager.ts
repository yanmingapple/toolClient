/**
 * 对话上下文管理器
 * 负责管理AI对话历史，并提供上下文压缩功能
 */

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp?: string;
  toolCalls?: any[];
  toolCallId?: string;
}

export interface ConversationContext {
  sessionId: string;
  messages: ConversationMessage[];
  metadata?: {
    goal?: string;
    planId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * 上下文管理器
 */
export class ContextManager {
  private static instance: ContextManager;
  private contexts: Map<string, ConversationContext> = new Map();
  private maxMessages: number = 50; // 最大消息数（压缩前）
  private maxCompressedMessages: number = 20; // 压缩后保留的消息数
  private databaseClient: any = null; // 数据库客户端
  private autoSave: boolean = true; // 自动保存开关
  private contextExpireDays: number = 30; // 上下文过期天数（默认30天）

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * 设置数据库客户端
   */
  setDatabaseClient(client: any): void {
    this.databaseClient = client;
  }

  /**
   * 设置自动保存开关
   */
  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }

  /**
   * 设置上下文过期天数
   */
  setContextExpireDays(days: number): void {
    this.contextExpireDays = days;
  }

  /**
   * 获取或创建上下文
   */
  getOrCreateContext(sessionId: string, systemPrompt?: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      const context: ConversationContext = {
        sessionId,
        messages: systemPrompt ? [
          {
            role: 'system',
            content: systemPrompt,
            timestamp: new Date().toISOString()
          }
        ] : [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      this.contexts.set(sessionId, context);
    }
    return this.contexts.get(sessionId)!;
  }

  /**
   * 添加消息到上下文
   */
  async addMessage(sessionId: string, message: ConversationMessage, aiService?: any): Promise<void> {
    const context = this.getOrCreateContext(sessionId);
    context.messages.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });
    context.metadata!.updatedAt = new Date().toISOString();

    // 如果消息数超过限制，压缩上下文
    if (context.messages.length > this.maxMessages) {
      await this.compressContext(sessionId, aiService);
    }

    // 自动保存到数据库
    if (this.autoSave && this.databaseClient) {
      await this.saveContextToDatabase(sessionId, context);
    }
  }

  /**
   * 获取上下文消息（用于AI调用）
   */
  getMessages(sessionId: string, includeSystem: boolean = true): ConversationMessage[] {
    const context = this.getOrCreateContext(sessionId);
    if (includeSystem) {
      return [...context.messages];
    }
    return context.messages.filter(m => m.role !== 'system');
  }

  /**
   * 压缩上下文
   * 策略：
   * 1. 保留系统提示词
   * 2. 保留最近的N条消息
   * 3. 将中间的消息总结为一条消息
   */
  async compressContext(sessionId: string, aiService?: any): Promise<void> {
    const context = this.getOrCreateContext(sessionId);
    if (context.messages.length <= this.maxCompressedMessages) {
      return; // 不需要压缩
    }

    // 分离系统消息和其他消息
    const systemMessages = context.messages.filter(m => m.role === 'system');
    const otherMessages = context.messages.filter(m => m.role !== 'system');

    // 保留最近的N条消息
    const recentMessages = otherMessages.slice(-this.maxCompressedMessages);
    const oldMessages = otherMessages.slice(0, -this.maxCompressedMessages);

    if (oldMessages.length === 0) {
      return; // 没有需要压缩的消息
    }

    // 总结旧消息
    const summary = await this.summarizeMessages(oldMessages, aiService);

    // 重新构建消息列表
    context.messages = [
      ...systemMessages,
      {
        role: 'assistant',
        content: `[上下文总结] ${summary}`,
        timestamp: new Date().toISOString()
      },
      ...recentMessages
    ];

    context.metadata!.updatedAt = new Date().toISOString();

    // 自动保存到数据库
    if (this.autoSave && this.databaseClient) {
      await this.saveContextToDatabase(sessionId, context);
    }
  }

  /**
   * 总结消息（使用AI或简单规则）
   */
  private async summarizeMessages(
    messages: ConversationMessage[],
    aiService?: any
  ): Promise<string> {
    // 如果没有AI服务，使用简单总结
    if (!aiService) {
      return this.simpleSummarize(messages);
    }

    try {
      const provider = await aiService.getCurrentProvider();
      if (!provider) {
        return this.simpleSummarize(messages);
      }

      // 构建总结提示词
      const messagesText = messages.map(m => 
        `[${m.role}] ${m.content}`
      ).join('\n');

      const prompt = `请总结以下对话历史，提取关键信息和决策：

${messagesText}

请用简洁的语言总结：
1. 用户的主要目标
2. 已完成的步骤
3. 重要的决策和结果
4. 需要注意的问题

总结（200字以内）：`;

      const response = await aiService.callAI(prompt, provider, false);
      return response.trim();
    } catch (error: any) {
      console.error('AI总结失败，使用简单总结:', error);
      return this.simpleSummarize(messages);
    }
  }

  /**
   * 简单总结（规则-based）
   */
  private simpleSummarize(messages: ConversationMessage[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    const summary = [
      `共${messages.length}条消息`,
      `用户输入${userMessages.length}次`,
      `AI响应${assistantMessages.length}次`
    ];

    // 提取关键信息
    const goals = userMessages
      .map(m => m.content)
      .filter(c => c.length > 10)
      .slice(0, 3);

    if (goals.length > 0) {
      summary.push(`主要目标：${goals.join('; ')}`);
    }

    return summary.join('。');
  }

  /**
   * 清除上下文
   */
  async clearContext(sessionId: string): Promise<void> {
    this.contexts.delete(sessionId);
    
    // 从数据库删除
    if (this.databaseClient) {
      try {
        const sqlModule = await import('../../dataService/sql');
        const SQLStatements = sqlModule.SQLStatements;
        await this.databaseClient.execute(
          SQLStatements.DELETE_AI_CONTEXT_BY_SESSION,
          [sessionId]
        );
      } catch (error: any) {
        console.error('删除上下文失败:', error);
      }
    }
  }

  /**
   * 清除所有上下文
   */
  clearAllContexts(): void {
    this.contexts.clear();
  }

  /**
   * 获取上下文统计信息
   */
  getContextStats(sessionId: string): {
    messageCount: number;
    tokenEstimate: number;
    needsCompression: boolean;
  } {
    const context = this.getOrCreateContext(sessionId);
    const messageCount = context.messages.length;
    const tokenEstimate = this.estimateTokens(context.messages);
    const needsCompression = messageCount > this.maxMessages;

    return {
      messageCount,
      tokenEstimate,
      needsCompression
    };
  }

  /**
   * 估算token数量（简单估算：1 token ≈ 4 字符）
   */
  private estimateTokens(messages: ConversationMessage[]): number {
    const totalChars = messages.reduce((sum, m) => 
      sum + (m.content?.length || 0), 0
    );
    return Math.ceil(totalChars / 4);
  }

  /**
   * 设置最大消息数
   */
  setMaxMessages(max: number): void {
    this.maxMessages = max;
  }

  /**
   * 设置压缩后保留的消息数
   */
  setMaxCompressedMessages(max: number): void {
    this.maxCompressedMessages = max;
  }

  /**
   * 保存上下文到数据库
   */
  private async saveContextToDatabase(sessionId: string, context: ConversationContext): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const sqlModule = await import('../../dataService/sql');
      const SQLStatements = sqlModule.SQLStatements;
      const now = new Date().toISOString();
      
      // 检查上下文是否已存在
      const existing = await this.databaseClient.execute(
        SQLStatements.SELECT_AI_CONTEXT_BY_SESSION,
        [sessionId]
      );

      const createTime = existing && Array.isArray(existing) && existing.length > 0
        ? (existing[0] as any).create_time
        : now;
      await this.databaseClient.execute(
        SQLStatements.INSERT_OR_REPLACE_AI_CONTEXT,
        [
          sessionId,
          JSON.stringify(context.messages),
          JSON.stringify(context.metadata || {}),
          createTime,
          now,
          now
        ]
      );
    } catch (error: any) {
      console.error('保存上下文到数据库失败:', error);
    }
  }

  /**
   * 从数据库加载上下文
   */
  async loadContextFromDatabase(sessionId: string): Promise<ConversationContext | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      const sqlModule = await import('../../dataService/sql');
      const SQLStatements = sqlModule.SQLStatements;
      const result = await this.databaseClient.execute(
        SQLStatements.SELECT_AI_CONTEXT_BY_SESSION,
        [sessionId]
      );

      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as any;
        const context: ConversationContext = {
          sessionId: row.session_id,
          messages: JSON.parse(row.messages),
          metadata: row.metadata ? JSON.parse(row.metadata) : {
            createdAt: row.create_time,
            updatedAt: row.update_time
          }
        };

        // 更新访问时间（更新updated_at字段）
        await this.databaseClient.execute(
          'UPDATE ai_context SET updated_at = ? WHERE session_id = ?',
          [new Date().toISOString(), sessionId]
        );

        // 加载到内存
        this.contexts.set(sessionId, context);
        return context;
      }
    } catch (error: any) {
      console.error('从数据库加载上下文失败:', error);
    }

    return null;
  }

  /**
   * 加载所有上下文（应用启动时调用）
   */
  async loadAllContextsFromDatabase(): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const SQLStatements = (await import('../../dataService/sql')).SQLStatements;
      const result = await this.databaseClient.execute(
        SQLStatements.SELECT_ALL_AI_CONTEXTS
      );

      if (result && Array.isArray(result)) {
        for (const row of result) {
          const r = row as any;
          try {
            const context: ConversationContext = {
              sessionId: r.session_id,
              messages: JSON.parse(r.messages),
              metadata: r.metadata ? JSON.parse(r.metadata) : {
                createdAt: r.create_time,
                updatedAt: r.update_time
              }
            };
            this.contexts.set(r.session_id, context);
          } catch (error: any) {
            console.error(`加载上下文 ${r.session_id} 失败:`, error);
          }
        }
      }
    } catch (error: any) {
      console.error('加载所有上下文失败:', error);
    }
  }

  /**
   * 清理过期上下文
   */
  async cleanupExpiredContexts(): Promise<number> {
    if (!this.databaseClient) {
      return 0;
    }

    try {
      const SQLStatements = (await import('../../dataService/sql')).SQLStatements;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() - this.contextExpireDays);
      const expireDateStr = expireDate.toISOString();

      await this.databaseClient.execute(
        SQLStatements.DELETE_OLD_AI_CONTEXTS,
        [expireDateStr]
      );

      // 从内存中删除
      const expiredSessions: string[] = [];
      for (const [sessionId, context] of this.contexts.entries()) {
        const lastAccess = context.metadata?.updatedAt || context.metadata?.createdAt;
        if (lastAccess && new Date(lastAccess) < expireDate) {
          expiredSessions.push(sessionId);
        }
      }
      expiredSessions.forEach(id => this.contexts.delete(id));

      return expiredSessions.length;
    } catch (error: any) {
      console.error('清理过期上下文失败:', error);
      return 0;
    }
  }

  /**
   * 获取或创建上下文（优先从数据库加载）
   */
  async getOrCreateContextAsync(sessionId: string, systemPrompt?: string): Promise<ConversationContext> {
    // 先尝试从内存加载
    if (this.contexts.has(sessionId)) {
      return this.contexts.get(sessionId)!;
    }

    // 尝试从数据库加载
    if (this.databaseClient) {
      const context = await this.loadContextFromDatabase(sessionId);
      if (context) {
        return context;
      }
    }

    // 创建新上下文
    return this.getOrCreateContext(sessionId, systemPrompt);
  }
}

