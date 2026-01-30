import { IAIModule, ModuleInfo, UserAction, ActionContext, SuggestionContext, Suggestion, UserFeedback } from '../IModule';
import { DatabaseClient } from '../../../dataService/database';
import { SQLStatements } from '../../../dataService/sql';

/**
 * 信用卡提醒模块实现
 */
export class CreditCardModule implements IAIModule {
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
      id: 'credit_card',
      name: 'credit_card',
      type: 'reminder',
      displayName: '信用卡提醒',
      description: '智能信用卡账单管理和还款提醒',
      version: '1.0.0'
    };
  }

  async recordBehavior(action: UserAction, context: ActionContext): Promise<void> {
    // 记录信用卡相关行为
    // 行为记录由 AIAgentCore 统一处理
  }

  async learnPreference(action: UserAction, context: ActionContext): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    if (action.type === 'create' && action.category === 'card') {
      const card = action.data;
      
      // 学习还款偏好（偏好日期、偏好金额等）
      if (card.dueDay) {
        await this.learnPaymentPreference(card.bankName, card.dueDay);
      }
      
      // 学习账单检查偏好
      if (card.billingDay) {
        await this.learnBillCheckPreference(card.billingDay);
      }
    }

    if (action.type === 'complete' && action.category === 'payment') {
      const payment = action.data;
      // 学习实际还款日期偏好
      await this.learnActualPaymentPreference(payment.bankName, payment.paymentDay, payment.dueDay);
    }
  }

  async detectPattern(action: UserAction, context: ActionContext): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    if (action.type === 'complete' && action.category === 'payment') {
      // 检测还款模式（如：总是在还款日前3天还款）
      await this.detectPaymentPattern(action.data);
    }
  }

  async generateSuggestion(context: SuggestionContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (!this.databaseClient) {
      return suggestions;
    }

    // 还款提醒建议
    const paymentSuggestions = await this.suggestPaymentReminder(context.currentData);
    suggestions.push(...paymentSuggestions);
    
    // 账单检查建议
    const billCheckSuggestions = await this.suggestBillCheck(context.currentData);
    suggestions.push(...billCheckSuggestions);
    
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
   * 学习还款偏好
   */
  private async learnPaymentPreference(
    bankName: string,
    dueDay: number
  ): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const preferenceKey = `${bankName}_payment`;
      const existing = await this.databaseClient.execute(
        SQLStatements.SELECT_PREFERENCE,
        ['default', 'credit_card', 'payment_preference', preferenceKey]
      ) as any[];

      const preferenceValue = {
        bank: bankName,
        dueDay: dueDay,
        preferredDaysBeforeDue: 3, // 默认提前3天
        typicalPaymentDay: dueDay - 3
      };

      if (existing && existing.length > 0) {
        const id = existing[0].id;
        const confidence = Math.min(0.95, existing[0].confidence + 0.1);
        await this.databaseClient.execute(SQLStatements.UPDATE_PREFERENCE, [
          JSON.stringify(preferenceValue),
          confidence,
          new Date().toISOString(),
          id
        ]);
      } else {
        const id = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_PREFERENCE, [
          id,
          'default',
          'credit_card',
          'payment_preference',
          preferenceKey,
          JSON.stringify(preferenceValue),
          0.5,
          1,
          new Date().toISOString()
        ]);
      }
    } catch (error) {
      console.error('学习还款偏好失败:', error);
    }
  }

  /**
   * 学习实际还款偏好
   */
  private async learnActualPaymentPreference(
    bankName: string,
    paymentDay: number,
    dueDay: number
  ): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const daysBeforeDue = dueDay - paymentDay;
      const preferenceKey = `${bankName}_actual_payment`;
      const existing = await this.databaseClient.execute(
        SQLStatements.SELECT_PREFERENCE,
        ['default', 'credit_card', 'payment_preference', preferenceKey]
      ) as any[];

      if (existing && existing.length > 0) {
        const existingValue = JSON.parse(existing[0].preference_value || '{}');
        existingValue.samples = existingValue.samples || [];
        existingValue.samples.push(daysBeforeDue);
        const avgDaysBefore = Math.round(
          existingValue.samples.reduce((a: number, b: number) => a + b, 0) / existingValue.samples.length
        );
        existingValue.preferredDaysBeforeDue = avgDaysBefore;
        existingValue.typicalPaymentDay = dueDay - avgDaysBefore;

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
          'credit_card',
          'payment_preference',
          preferenceKey,
          JSON.stringify({
            preferredDaysBeforeDue: daysBeforeDue,
            typicalPaymentDay: paymentDay,
            samples: [daysBeforeDue]
          }),
          0.5,
          1,
          new Date().toISOString()
        ]);
      }
    } catch (error) {
      console.error('学习实际还款偏好失败:', error);
    }
  }

  /**
   * 学习账单检查偏好
   */
  private async learnBillCheckPreference(billingDay: number): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    // 实现账单检查偏好学习逻辑
  }

  /**
   * 检测还款模式
   */
  private async detectPaymentPattern(payment: any): Promise<void> {
    if (!this.databaseClient) {
      return;
    }

    try {
      const patternKey = `${payment.bankName}_payment_pattern`;
      const daysBeforeDue = payment.dueDay - payment.paymentDay;
      
      // 检查是否已有相似模式
      const existingPatterns = await this.databaseClient.execute(
        SQLStatements.SELECT_PATTERN_BY_TYPE,
        ['credit_card', 'default', 'payment_pattern']
      ) as any[];

      let foundPattern = false;
      for (const pattern of existingPatterns) {
        const patternData = JSON.parse(pattern.pattern_data || '{}');
        if (patternData.bankName === payment.bankName && 
            Math.abs(patternData.daysBeforeDue - daysBeforeDue) <= 1) {
          // 更新现有模式
          const id = pattern.id;
          await this.databaseClient.execute(SQLStatements.UPDATE_PATTERN, [
            Math.min(0.95, pattern.confidence + 0.1),
            new Date().toISOString(),
            id
          ]);
          foundPattern = true;
          break;
        }
      }

      if (!foundPattern) {
        // 创建新模式
        const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_PATTERN, [
          id,
          'default',
          'credit_card',
          'payment_pattern',
          JSON.stringify({
            bankName: payment.bankName,
            daysBeforeDue: daysBeforeDue,
            description: `总是在还款日前${daysBeforeDue}天还款`
          }),
          1,
          0.5,
          new Date().toISOString(),
          new Date().toISOString(),
          1
        ]);
      }
    } catch (error) {
      console.error('检测还款模式失败:', error);
    }
  }

  /**
   * 建议还款提醒
   */
  private async suggestPaymentReminder(
    cards: any[]
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (!this.databaseClient || !cards || cards.length === 0) {
      return suggestions;
    }

    try {
      const today = new Date();
      const currentDay = today.getDate();

      for (const card of cards) {
        // 获取还款偏好
        const preference = await this.databaseClient.execute(
          SQLStatements.SELECT_PREFERENCE,
          ['default', 'credit_card', 'payment_preference', `${card.bankName}_actual_payment`]
        ) as any[];

        let daysBeforeDue = 3; // 默认提前3天
        if (preference && preference.length > 0) {
          const value = JSON.parse(preference[0].preference_value || '{}');
          daysBeforeDue = value.preferredDaysBeforeDue || 3;
        }

        // 计算提醒日期
        const reminderDay = card.dueDay - daysBeforeDue;
        const daysUntilReminder = reminderDay > currentDay 
          ? reminderDay - currentDay 
          : (reminderDay + this.getDaysInMonth(today)) - currentDay;

        // 如果3天内需要提醒
        if (daysUntilReminder <= 3 && daysUntilReminder >= 0) {
          suggestions.push({
            type: 'reminder',
            content: `${card.bankName} 信用卡将在 ${daysUntilReminder === 0 ? '今天' : `${daysUntilReminder}天后`} 到期，建议提前还款`,
            confidence: 0.9,
            data: { 
              cardId: card.id, 
              reminderDate: this.calculateReminderDate(card.dueDay, daysBeforeDue),
              daysBeforeDue 
            }
          });
        }
      }
    } catch (error) {
      console.error('建议还款提醒失败:', error);
    }

    return suggestions;
  }

  /**
   * 建议账单检查
   */
  private async suggestBillCheck(cards: any[]): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (!this.databaseClient || !cards || cards.length === 0) {
      return suggestions;
    }

    try {
      const today = new Date();
      const currentDay = today.getDate();

      for (const card of cards) {
        // 如果今天是账单日或账单日后1-2天，建议检查账单
        const daysSinceBilling = currentDay >= card.billingDay 
          ? currentDay - card.billingDay
          : (currentDay + this.getDaysInMonth(today)) - card.billingDay;

        if (daysSinceBilling >= 0 && daysSinceBilling <= 2) {
          suggestions.push({
            type: 'reminder',
            content: `${card.bankName} 信用卡账单已出，建议检查账单金额`,
            confidence: 0.85,
            data: { cardId: card.id, billingDay: card.billingDay }
          });
        }
      }
    } catch (error) {
      console.error('建议账单检查失败:', error);
    }

    return suggestions;
  }

  /**
   * 计算提醒日期
   */
  private calculateReminderDate(dueDay: number, daysBefore: number): string {
    const today = new Date();
    const reminderDay = dueDay - daysBefore;
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    // 如果提醒日在当前月
    if (reminderDay > 0) {
      return `${year}-${String(month).padStart(2, '0')}-${String(reminderDay).padStart(2, '0')}`;
    } else {
      // 如果提醒日在上个月
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastMonthYear = month === 1 ? year - 1 : year;
      const daysInLastMonth = this.getDaysInMonth(new Date(lastMonthYear, lastMonth - 1));
      const actualDay = daysInLastMonth + reminderDay;
      return `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }
  }

  /**
   * 获取月份天数
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}

