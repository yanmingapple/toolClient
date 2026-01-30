import { DatabaseClient } from '../../dataService/database';
import { SQLStatements } from '../../dataService/sql';
import { IAIModule, ModuleInfo, UserAction, ActionContext, SuggestionContext, Suggestion, UserFeedback } from './IModule';
import { ServiceResult, ServiceResultFactory } from '../../model/result/ServiceResult';

/**
 * AI智能体核心引擎（通用，支持所有模块）
 */
export class AIAgentCore {
  private static instance: AIAgentCore;
  private modules: Map<string, IAIModule> = new Map();
  private databaseClient: DatabaseClient | null = null;

  private constructor() {}

  public static getInstance(): AIAgentCore {
    if (!AIAgentCore.instance) {
      AIAgentCore.instance = new AIAgentCore();
    }
    return AIAgentCore.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 注册模块
   */
  public async registerModule(module: IAIModule): Promise<ServiceResult<void>> {
    try {
      const info = module.getModuleInfo();
      this.modules.set(info.id, module);
      
      // 注册到数据库
      await this.registerModuleToDB(info);
      
      return ServiceResultFactory.success(undefined, `模块 ${info.displayName} 注册成功`);
    } catch (error: any) {
      console.error('注册模块失败:', error);
      return ServiceResultFactory.error(`注册模块失败: ${error.message}`);
    }
  }

  /**
   * 注册模块到数据库
   */
  private async registerModuleToDB(info: ModuleInfo): Promise<void> {
    if (!this.databaseClient) {
      throw new Error('数据库客户端未初始化');
    }

    const now = new Date().toISOString();
    await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_AI_MODULE, [
      info.id,
      info.name,
      info.type,
      info.displayName,
      info.description,
      info.version,
      1, // enabled
      JSON.stringify({}), // config
      now,
      now
    ]);
  }

  /**
   * 记录行为并学习（通用）
   */
  public async recordAndLearn(
    moduleId: string,
    action: UserAction,
    context: ActionContext
  ): Promise<ServiceResult<void>> {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        return ServiceResultFactory.error(`模块 ${moduleId} 未找到`);
      }

      // 1. 记录行为（通用）
      await this.logBehavior(moduleId, action, context);

      // 2. 模块特定学习
      await module.recordBehavior(action, context);
      await module.learnPreference(action, context);
      await module.detectPattern(action, context);

      // 3. 更新知识库（通用）
      await this.updateKnowledgeBase(moduleId, action, context);

      return ServiceResultFactory.success(undefined, '行为记录和学习完成');
    } catch (error: any) {
      console.error('记录行为并学习失败:', error);
      return ServiceResultFactory.error(`记录行为并学习失败: ${error.message}`);
    }
  }

  /**
   * 生成智能建议（通用）
   */
  public async generateSuggestions(
    moduleId: string,
    context: SuggestionContext
  ): Promise<ServiceResult<Suggestion[]>> {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        return ServiceResultFactory.success([]);
      }

      // 1. 模块特定建议
      const moduleSuggestions = await module.generateSuggestion(context);

      // 2. 通用建议（基于跨模块学习）
      const crossModuleSuggestions = await this.generateCrossModuleSuggestions(
        moduleId,
        context
      );

      const allSuggestions = [...moduleSuggestions, ...crossModuleSuggestions];
      return ServiceResultFactory.success(allSuggestions);
    } catch (error: any) {
      console.error('生成建议失败:', error);
      return ServiceResultFactory.error(`生成建议失败: ${error.message}`);
    }
  }

  /**
   * 处理反馈（通用）
   */
  public async processFeedback(
    moduleId: string,
    feedback: UserFeedback
  ): Promise<ServiceResult<void>> {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        return ServiceResultFactory.error(`模块 ${moduleId} 未找到`);
      }

      // 1. 模块特定反馈处理
      await module.processFeedback(feedback);

      // 2. 通用反馈学习
      await this.learnFromFeedback(moduleId, feedback);

      return ServiceResultFactory.success(undefined, '反馈处理完成');
    } catch (error: any) {
      console.error('处理反馈失败:', error);
      return ServiceResultFactory.error(`处理反馈失败: ${error.message}`);
    }
  }

  /**
   * 记录行为到数据库（通用）
   */
  private async logBehavior(
    moduleId: string,
    action: UserAction,
    context: ActionContext
  ): Promise<void> {
    if (!this.databaseClient) {
      throw new Error('数据库客户端未初始化');
    }

    const id = `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.databaseClient.execute(SQLStatements.INSERT_BEHAVIOR_LOG, [
      id,
      'default', // user_id
      moduleId,
      action.type,
      action.category,
      JSON.stringify(action.data),
      JSON.stringify(context),
      context.timestamp || new Date().toISOString(),
      context.sessionId || null
    ]);
  }

  /**
   * 更新知识库（通用）
   */
  private async updateKnowledgeBase(
    moduleId: string,
    action: UserAction,
    context: ActionContext
  ): Promise<void> {
    // 这里可以添加通用的知识库更新逻辑
    // 例如：更新统计信息、分析趋势等
  }

  /**
   * 跨模块学习（通用）
   */
  private async generateCrossModuleSuggestions(
    moduleId: string,
    context: SuggestionContext
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (!this.databaseClient) {
      return suggestions;
    }

    try {
      // 分析跨模块模式
      const crossPatterns = await this.analyzeCrossModulePatterns(moduleId);

      for (const pattern of crossPatterns) {
        if (pattern.confidence > 0.7) {
          suggestions.push({
            type: 'cross_module',
            content: pattern.suggestion,
            confidence: pattern.confidence,
            data: pattern.data
          });
        }
      }
    } catch (error) {
      console.error('生成跨模块建议失败:', error);
    }

    return suggestions;
  }

  /**
   * 分析跨模块模式
   */
  private async analyzeCrossModulePatterns(moduleId: string): Promise<Array<{
    suggestion: string;
    confidence: number;
    data: any;
  }>> {
    const patterns: Array<{
      suggestion: string;
      confidence: number;
      data: any;
    }> = [];

    if (!this.databaseClient) {
      return patterns;
    }

    try {
      // 1. 分析日历模块中的"还款"相关事件，建议信用卡模块自动提醒
      if (moduleId === 'calendar') {
        const repaymentPattern = await this.detectRepaymentPattern();
        if (repaymentPattern) {
          patterns.push(repaymentPattern);
        }
      }

      // 2. 分析信用卡模块中的还款行为，建议日历模块创建定期提醒
      if (moduleId === 'credit_card') {
        const calendarReminderPattern = await this.detectCalendarReminderPattern();
        if (calendarReminderPattern) {
          patterns.push(calendarReminderPattern);
        }
      }

      // 3. 分析工作模式，建议优化日程安排
      const workPatternSuggestion = await this.analyzeWorkPatternSuggestion(moduleId);
      if (workPatternSuggestion) {
        patterns.push(workPatternSuggestion);
      }

      // 4. 分析时间偏好，建议跨模块应用
      const timePreferenceSuggestion = await this.analyzeTimePreferenceSuggestion(moduleId);
      if (timePreferenceSuggestion) {
        patterns.push(timePreferenceSuggestion);
      }
    } catch (error) {
      console.error('分析跨模块模式失败:', error);
    }

    return patterns;
  }

  /**
   * 检测还款模式（日历 -> 信用卡）
   */
  private async detectRepaymentPattern(): Promise<{
    suggestion: string;
    confidence: number;
    data: any;
  } | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      // 查询最近30天日历中"还款"相关事件
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const rows = await this.databaseClient.execute(`
        SELECT action_data, timestamp
        FROM user_behavior_log
        WHERE module_id = 'calendar'
          AND action_type = 'create'
          AND action_data LIKE '%还款%'
          AND timestamp >= ?
        ORDER BY timestamp DESC
        LIMIT 10
      `, [thirtyDaysAgo.toISOString()]) as any[];

      if (rows.length >= 3) {
        // 如果最近30天有3次以上还款事件，建议设置信用卡自动提醒
        return {
          suggestion: '检测到您经常在日历中创建还款事件，建议在信用卡模块中设置自动还款提醒，避免重复操作',
          confidence: 0.75,
          data: {
            patternType: 'repayment',
            eventCount: rows.length,
            targetModule: 'credit_card'
          }
        };
      }
    } catch (error) {
      console.error('检测还款模式失败:', error);
    }

    return null;
  }

  /**
   * 检测日历提醒模式（信用卡 -> 日历）
   */
  private async detectCalendarReminderPattern(): Promise<{
    suggestion: string;
    confidence: number;
    data: any;
  } | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      // 查询信用卡模块中的还款行为
      const rows = await this.databaseClient.execute(`
        SELECT action_data, timestamp
        FROM user_behavior_log
        WHERE module_id = 'credit_card'
          AND action_type = 'complete'
          AND timestamp >= datetime('now', '-90 days')
        ORDER BY timestamp DESC
        LIMIT 20
      `) as any[];

      if (rows.length >= 5) {
        // 分析还款日期模式
        const paymentDates = rows.map((row: any) => {
          const data = JSON.parse(row.action_data || '{}');
          return new Date(data.paymentDate || row.timestamp);
        });

        // 检测是否有规律（例如：每月固定日期）
        const dayOfMonthCounts: { [key: number]: number } = {};
        paymentDates.forEach(date => {
          const day = date.getDate();
          dayOfMonthCounts[day] = (dayOfMonthCounts[day] || 0) + 1;
        });

        const mostCommonDay = Object.entries(dayOfMonthCounts)
          .sort((a, b) => b[1] - a[1])[0];

        if (mostCommonDay && mostCommonDay[1] >= 3) {
          return {
            suggestion: `检测到您通常在每月${mostCommonDay[0]}日还款，建议在日历中创建定期提醒，避免忘记`,
            confidence: 0.8,
            data: {
              patternType: 'calendar_reminder',
              dayOfMonth: parseInt(mostCommonDay[0]),
              frequency: mostCommonDay[1],
              targetModule: 'calendar'
            }
          };
        }
      }
    } catch (error) {
      console.error('检测日历提醒模式失败:', error);
    }

    return null;
  }

  /**
   * 分析工作模式建议
   */
  private async analyzeWorkPatternSuggestion(moduleId: string): Promise<{
    suggestion: string;
    confidence: number;
    data: any;
  } | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      // 查询用户偏好，分析工作模式
      const rows = await this.databaseClient.execute(`
        SELECT preference_type, preference_key, preference_value, sample_count, confidence
        FROM user_preferences
        WHERE module_id = ?
          AND preference_type IN ('time_preference', 'task_preference')
        ORDER BY sample_count DESC, confidence DESC
        LIMIT 5
      `, [moduleId]) as any[];

      if (rows.length > 0) {
        const topPreference = rows[0];
        const value = JSON.parse(topPreference.preference_value || '{}');
        
        if (topPreference.confidence > 0.7 && topPreference.sample_count >= 5) {
          return {
            suggestion: `根据您的工作模式，${value.description || '建议优化日程安排'}，提高工作效率`,
            confidence: topPreference.confidence,
            data: {
              patternType: 'work_pattern',
              preference: topPreference,
              value
            }
          };
        }
      }
    } catch (error) {
      console.error('分析工作模式建议失败:', error);
    }

    return null;
  }

  /**
   * 分析时间偏好建议
   */
  private async analyzeTimePreferenceSuggestion(moduleId: string): Promise<{
    suggestion: string;
    confidence: number;
    data: any;
  } | null> {
    if (!this.databaseClient) {
      return null;
    }

    try {
      // 查询时间偏好
      const rows = await this.databaseClient.execute(`
        SELECT preference_value, sample_count, confidence
        FROM user_preferences
        WHERE module_id = ?
          AND preference_type = 'time_preference'
        ORDER BY confidence DESC, sample_count DESC
        LIMIT 1
      `, [moduleId]) as any[];

      if (rows.length > 0) {
        const preference = rows[0];
        const value = JSON.parse(preference.preference_value || '{}');
        
        if (preference.confidence > 0.75 && value.bestTime) {
          return {
            suggestion: `您的最佳工作时间是${value.bestTime}，建议将重要任务安排在这个时间段`,
            confidence: preference.confidence,
            data: {
              patternType: 'time_preference',
              bestTime: value.bestTime,
              confidence: preference.confidence
            }
          };
        }
      }
    } catch (error) {
      console.error('分析时间偏好建议失败:', error);
    }

    return null;
  }

  /**
   * 从反馈中学习
   */
  private async learnFromFeedback(
    moduleId: string,
    feedback: UserFeedback
  ): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    // 这里可以实现通用的反馈学习逻辑
    // 例如：如果用户拒绝了某个建议，降低该建议的置信度
  }

  /**
   * 获取所有已注册的模块
   */
  public getRegisteredModules(): ModuleInfo[] {
    return Array.from(this.modules.values()).map(module => module.getModuleInfo());
  }

  /**
   * 获取指定模块
   */
  public getModule(moduleId: string): IAIModule | undefined {
    return this.modules.get(moduleId);
  }
}

