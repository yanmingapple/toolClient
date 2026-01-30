import { IAIModule, ModuleInfo, UserAction, ActionContext, SuggestionContext, Suggestion, UserFeedback } from '../IModule';
import { DatabaseClient } from '../../../dataService/database';
import { SQLStatements } from '../../../dataService/sql';

/**
 * 日历提醒模块实现
 */
export class CalendarModule implements IAIModule {
  private databaseClient: DatabaseClient | null = null;

  constructor(databaseClient?: DatabaseClient) {
    if (databaseClient) {
      this.databaseClient = databaseClient;
    }
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  getModuleInfo(): ModuleInfo {
    return {
      id: 'calendar',
      name: 'calendar',
      type: 'reminder',
      displayName: '日历提醒',
      description: '智能日历事件管理和提醒',
      version: '1.0.0'
    };
  }

  async recordBehavior(action: UserAction, context: ActionContext): Promise<void> {
    // 记录日历相关行为
    // 行为记录由 AIAgentCore 统一处理
  }

  async learnPreference(action: UserAction, context: ActionContext): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    if (action.type === 'create' && action.category === 'event') {
      const event = action.data;
      
      // 学习时间偏好
      if (event.time) {
        await this.learnTimePreference('event', event.type, event.time);
      }
      
      // 学习提醒偏好
      if (event.reminder) {
        await this.learnReminderPreference(event.type, event.reminder);
      }
    }
  }

  async detectPattern(action: UserAction, context: ActionContext): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    if (action.type === 'create' && action.category === 'event') {
      await this.detectRecurringEventPattern(action.data);
    }
  }

  async generateSuggestion(context: SuggestionContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (!this.databaseClient) {
      return suggestions;
    }

    // 时间建议
    if (context.userInput) {
      const timeSuggestion = await this.suggestTime(context.userInput);
      if (timeSuggestion) {
        suggestions.push(timeSuggestion);
      }
    }
    
    // 标签建议
    const tagSuggestions = await this.suggestTags(context.currentData);
    suggestions.push(...tagSuggestions);
    
    return suggestions;
  }

  async processFeedback(feedback: UserFeedback): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    // 根据反馈更新学习模型
    // 如果用户接受了建议，增加置信度
    // 如果用户拒绝了建议，降低置信度
  }

  /**
   * 学习时间偏好
   */
  private async learnTimePreference(
    category: string,
    eventType: string,
    time: string
  ): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const preferenceKey = `${category}_${eventType}_time`;
      const existing = await this.databaseClient.execute(
        SQLStatements.SELECT_PREFERENCE,
        ['default', 'calendar', 'time_preference', preferenceKey]
      ) as any[];

      const hour = parseInt(time.split(':')[0]);
      const preferenceValue = {
        preferredHour: hour,
        samples: [hour]
      };

      if (existing && existing.length > 0) {
        // 更新现有偏好
        const existingValue = JSON.parse(existing[0].preference_value || '{}');
        existingValue.samples.push(hour);
        const avgHour = Math.round(
          existingValue.samples.reduce((a: number, b: number) => a + b, 0) / existingValue.samples.length
        );
        existingValue.preferredHour = avgHour;

        const id = existing[0].id;
        const confidence = Math.min(0.95, existing[0].confidence + 0.1);
        await this.databaseClient.execute(SQLStatements.UPDATE_PREFERENCE, [
          JSON.stringify(existingValue),
          confidence,
          new Date().toISOString(),
          id
        ]);
      } else {
        // 创建新偏好
        const id = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_PREFERENCE, [
          id,
          'default',
          'calendar',
          'time_preference',
          preferenceKey,
          JSON.stringify(preferenceValue),
          0.5,
          1,
          new Date().toISOString()
        ]);
      }
    } catch (error) {
      console.error('学习时间偏好失败:', error);
    }
  }

  /**
   * 学习提醒偏好
   */
  private async learnReminderPreference(
    eventType: string,
    reminder: number
  ): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const preferenceKey = `${eventType}_reminder`;
      const existing = await this.databaseClient.execute(
        SQLStatements.SELECT_PREFERENCE,
        ['default', 'calendar', 'reminder_preference', preferenceKey]
      ) as any[];

      if (existing && existing.length > 0) {
        const existingValue = JSON.parse(existing[0].preference_value || '{}');
        existingValue.samples = existingValue.samples || [];
        existingValue.samples.push(reminder);
        const avgReminder = Math.round(
          existingValue.samples.reduce((a: number, b: number) => a + b, 0) / existingValue.samples.length
        );
        existingValue.preferredReminder = avgReminder;

        const id = existing[0].id;
        const confidence = Math.min(0.95, existing[0].confidence + 0.1);
        await this.databaseClient.execute(SQLStatements.UPDATE_PREFERENCE, [
          JSON.stringify(existingValue),
          confidence,
          new Date().toISOString(),
          id
        ]);
      } else {
        const id = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_PREFERENCE, [
          id,
          'default',
          'calendar',
          'reminder_preference',
          preferenceKey,
          JSON.stringify({ preferredReminder: reminder, samples: [reminder] }),
          0.5,
          1,
          new Date().toISOString()
        ]);
      }
    } catch (error) {
      console.error('学习提醒偏好失败:', error);
    }
  }

  /**
   * 检测重复事件模式
   */
  private async detectRecurringEventPattern(event: any): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    // 这里可以实现重复事件检测逻辑
    // 例如：如果用户每周一都创建相同类型的事件，可以建议设置为重复事件
  }

  /**
   * 建议时间
   */
  private async suggestTime(userInput: string): Promise<Suggestion | null> {
    if (!this.databaseClient) {
      return null;
    }

    // 基于历史偏好建议时间
    try {
      const preferences = await this.databaseClient.execute(
        SQLStatements.SELECT_PREFERENCES_BY_MODULE,
        ['calendar', 'default']
      ) as any[];

      // 查找相关的时间偏好
      for (const pref of preferences) {
        if (pref.preference_type === 'time_preference') {
          const value = JSON.parse(pref.preference_value || '{}');
          if (value.preferredHour) {
            const suggestedTime = `${String(value.preferredHour).padStart(2, '0')}:00`;
            return {
              type: 'time',
              content: `建议时间：${suggestedTime}（基于历史偏好）`,
              confidence: pref.confidence,
              data: { time: suggestedTime }
            };
          }
        }
      }
    } catch (error) {
      console.error('建议时间失败:', error);
    }

    return null;
  }

  /**
   * 建议标签
   */
  private async suggestTags(currentData: any): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (!this.databaseClient) {
      return suggestions;
    }

    try {
      // 基于历史标签使用情况推荐
      const tags = await this.databaseClient.execute(
        SQLStatements.SELECT_ALL_TAGS
      ) as any[];

      // 推荐使用频率最高的标签
      const topTags = tags.slice(0, 5).map((tag: any) => ({
        type: 'tag' as const,
        content: `建议标签：${tag.name}`,
        confidence: Math.min(0.9, tag.usage_count / 10),
        data: { tagId: tag.id, tagName: tag.name }
      }));

      suggestions.push(...topTags);
    } catch (error) {
      console.error('建议标签失败:', error);
    }

    return suggestions;
  }
}

