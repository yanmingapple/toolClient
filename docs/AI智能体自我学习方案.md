# AI智能体通用化架构方案

## 一、问题分析

### 1.1 当前方案的局限性

当前的 **AI智能体自我学习方案** 主要针对**日历提醒**功能设计，存在以下局限性：

1. **功能耦合**：学习机制与日历提醒功能紧密耦合
2. **数据模型单一**：主要针对 `events` 和 `todos` 表
3. **学习维度固定**：时间偏好、事件类型等维度只适用于日历
4. **扩展困难**：添加新功能（如信用卡提醒）需要大量重复工作

### 1.2 扩展需求

系统需要支持多个功能模块：
- ✅ **日历提醒**（已实现）
- ⬜ **信用卡提醒**（需要扩展）
- ⬜ **账单管理**（未来）
- ⬜ **习惯追踪**（未来）
- ⬜ **其他自定义功能**（未来）

## 二、通用化架构设计

### 2.1 核心设计理念

**插件化 + 通用化 + 可扩展**

```
┌─────────────────────────────────────────┐
│      AI智能体核心引擎（通用）            │
│  - 行为记录（通用）                      │
│  - 偏好学习（通用）                      │
│  - 模式识别（通用）                      │
│  - 反馈循环（通用）                      │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌─────▼─────┐
│ 插件1  │          │   插件2    │
│日历提醒│          │信用卡提醒  │
└────────┘          └───────────┘
```

### 2.2 通用数据模型

#### 2.2.1 模块注册表

```sql
-- 功能模块注册表
CREATE TABLE IF NOT EXISTS ai_modules (
  id TEXT PRIMARY KEY,
  module_name TEXT UNIQUE NOT NULL,  -- 'calendar' | 'credit_card' | 'bill' | 'habit'
  module_type TEXT NOT NULL,  -- 'reminder' | 'tracker' | 'manager'
  display_name TEXT NOT NULL,  -- 显示名称
  description TEXT,  -- 模块描述
  version TEXT,  -- 模块版本
  enabled INTEGER DEFAULT 1,  -- 是否启用
  config TEXT,  -- JSON格式，模块配置
  created_at TEXT,
  updated_at TEXT
);
```

#### 2.2.2 通用行为记录表（改进版）

```sql
-- 用户行为记录表（通用化）
CREATE TABLE IF NOT EXISTS user_behavior_log (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default',
  module_id TEXT NOT NULL,  -- 关联 ai_modules.id
  action_type TEXT NOT NULL,  -- 通用动作类型
  action_category TEXT,  -- 'create' | 'update' | 'delete' | 'view' | 'complete'
  action_data TEXT,  -- JSON格式，存储操作详情（模块自定义）
  context TEXT,  -- JSON格式，存储操作上下文
  timestamp TEXT NOT NULL,
  session_id TEXT,
  FOREIGN KEY (module_id) REFERENCES ai_modules(id)
);

-- 索引
CREATE INDEX idx_behavior_module_time ON user_behavior_log(module_id, timestamp);
CREATE INDEX idx_behavior_action ON user_behavior_log(action_type);
```

#### 2.2.3 通用偏好学习表（改进版）

```sql
-- 用户偏好表（通用化）
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default',
  module_id TEXT NOT NULL,  -- 关联 ai_modules.id
  preference_type TEXT NOT NULL,  -- 偏好类型（模块自定义）
  preference_key TEXT NOT NULL,  -- 偏好键
  preference_value TEXT,  -- JSON格式，存储偏好值
  confidence REAL DEFAULT 0.5,
  sample_count INTEGER DEFAULT 1,
  last_updated TEXT,
  FOREIGN KEY (module_id) REFERENCES ai_modules(id),
  UNIQUE(user_id, module_id, preference_type, preference_key)
);

-- 索引
CREATE INDEX idx_preferences_module_type ON user_preferences(module_id, preference_type);
```

#### 2.2.4 通用学习模式表（改进版）

```sql
-- AI学习到的模式（通用化）
CREATE TABLE IF NOT EXISTS ai_learned_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default',
  module_id TEXT NOT NULL,  -- 关联 ai_modules.id
  pattern_type TEXT NOT NULL,  -- 模式类型（模块自定义）
  pattern_data TEXT NOT NULL,  -- JSON格式，存储模式详情
  frequency INTEGER DEFAULT 1,
  confidence REAL DEFAULT 0.5,
  first_seen TEXT,
  last_seen TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (module_id) REFERENCES ai_modules(id)
);

-- 索引
CREATE INDEX idx_patterns_module_type ON ai_learned_patterns(module_id, pattern_type);
```

### 2.3 插件化架构

#### 2.3.1 模块接口定义

```typescript
// electron/service/ai/IModule.ts

/**
 * AI模块接口（所有功能模块必须实现）
 */
export interface IAIModule {
  // 模块信息
  getModuleInfo(): ModuleInfo;
  
  // 行为记录
  recordBehavior(action: UserAction, context: ActionContext): Promise<void>;
  
  // 偏好学习
  learnPreference(action: UserAction, context: ActionContext): Promise<void>;
  
  // 模式识别
  detectPattern(action: UserAction, context: ActionContext): Promise<void>;
  
  // 智能建议
  generateSuggestion(context: SuggestionContext): Promise<Suggestion[]>;
  
  // 反馈处理
  processFeedback(feedback: UserFeedback): Promise<void>;
}

/**
 * 模块信息
 */
export interface ModuleInfo {
  id: string;
  name: string;
  type: string;
  displayName: string;
  description: string;
  version: string;
}

/**
 * 用户行为
 */
export interface UserAction {
  type: string;  // 'create' | 'update' | 'delete' | 'view' | 'complete'
  category: string;  // 模块自定义分类
  data: any;  // 模块自定义数据
}

/**
 * 操作上下文
 */
export interface ActionContext {
  timestamp: string;
  sessionId?: string;
  device?: string;
  location?: string;
  previousAction?: UserAction;
}

/**
 * 建议上下文
 */
export interface SuggestionContext {
  userInput?: string;
  currentData?: any;
  historicalData?: any;
}

/**
 * 建议
 */
export interface Suggestion {
  type: string;  // 'time' | 'tag' | 'reminder' | 'action'
  content: string;
  confidence: number;
  data?: any;
}

/**
 * 用户反馈
 */
export interface UserFeedback {
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'modified';
  modifiedData?: any;
}
```

#### 2.3.2 日历提醒模块实现示例

```typescript
// electron/service/ai/modules/CalendarModule.ts

export class CalendarModule implements IAIModule {
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
    await this.logBehavior('calendar', action, context);
  }

  async learnPreference(action: UserAction, context: ActionContext): Promise<void> {
    if (action.type === 'create' && action.category === 'event') {
      const event = action.data as Event;
      
      // 学习时间偏好
      await this.learnTimePreference('event', event.type, event.time);
      
      // 学习提醒偏好
      await this.learnReminderPreference(event.type, event.reminder);
    }
  }

  async detectPattern(action: UserAction, context: ActionContext): Promise<void> {
    if (action.type === 'create' && action.category === 'event') {
      await this.detectRecurringEventPattern(action.data as Event);
    }
  }

  async generateSuggestion(context: SuggestionContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
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
    await this.updateLearningModel(feedback);
  }
}
```

#### 2.3.3 信用卡提醒模块实现示例

```typescript
// electron/service/ai/modules/CreditCardModule.ts

export class CreditCardModule implements IAIModule {
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
    await this.logBehavior('credit_card', action, context);
  }

  async learnPreference(action: UserAction, context: ActionContext): Promise<void> {
    if (action.type === 'create' && action.category === 'card') {
      const card = action.data as CreditCard;
      
      // 学习还款偏好（偏好日期、偏好金额等）
      await this.learnPaymentPreference(card.bankName, card.dueDay);
      
      // 学习账单检查偏好
      await this.learnBillCheckPreference(card.billingDay);
    }
  }

  async detectPattern(action: UserAction, context: ActionContext): Promise<void> {
    if (action.type === 'complete' && action.category === 'payment') {
      // 检测还款模式（如：总是在还款日前3天还款）
      await this.detectPaymentPattern(action.data);
    }
  }

  async generateSuggestion(context: SuggestionContext): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // 还款提醒建议
    const paymentSuggestions = await this.suggestPaymentReminder(context.currentData);
    suggestions.push(...paymentSuggestions);
    
    // 账单检查建议
    const billCheckSuggestions = await this.suggestBillCheck(context.currentData);
    suggestions.push(...billCheckSuggestions);
    
    return suggestions;
  }

  async processFeedback(feedback: UserFeedback): Promise<void> {
    await this.updateLearningModel(feedback);
  }

  /**
   * 学习还款偏好
   */
  private async learnPaymentPreference(
    bankName: string,
    dueDay: number
  ): Promise<void> {
    // 学习用户偏好在哪一天还款
    // 例如：总是在还款日前3天还款
    await this.updatePreference('credit_card', 'payment_preference', {
      bank: bankName,
      preferredDaysBeforeDue: 3,
      typicalPaymentDay: dueDay - 3
    });
  }

  /**
   * 建议还款提醒
   */
  private async suggestPaymentReminder(
    cards: CreditCard[]
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    for (const card of cards) {
      const preference = await this.getPaymentPreference(card.bankName);
      const daysBeforeDue = preference?.preferredDaysBeforeDue || 3;
      const reminderDate = this.calculateReminderDate(card.dueDay, daysBeforeDue);
      
      if (this.isNearReminderDate(reminderDate)) {
        suggestions.push({
          type: 'reminder',
          content: `${card.bankName} 信用卡将在 ${daysBeforeDue} 天后到期，建议提前还款`,
          confidence: 0.9,
          data: { cardId: card.id, reminderDate }
        });
      }
    }
    
    return suggestions;
  }
}
```

### 2.4 AI智能体核心引擎（通用）

```typescript
// electron/service/ai/AIAgentCore.ts

/**
 * AI智能体核心引擎（通用，支持所有模块）
 */
export class AIAgentCore {
  private modules: Map<string, IAIModule> = new Map();
  
  /**
   * 注册模块
   */
  registerModule(module: IAIModule): void {
    const info = module.getModuleInfo();
    this.modules.set(info.id, module);
    
    // 注册到数据库
    this.registerModuleToDB(info);
  }
  
  /**
   * 记录行为并学习（通用）
   */
  async recordAndLearn(
    moduleId: string,
    action: UserAction,
    context: ActionContext
  ): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }
    
    // 1. 记录行为（通用）
    await this.logBehavior(moduleId, action, context);
    
    // 2. 模块特定学习
    await module.recordBehavior(action, context);
    await module.learnPreference(action, context);
    await module.detectPattern(action, context);
    
    // 3. 更新知识库（通用）
    await this.updateKnowledgeBase(moduleId, action, context);
  }
  
  /**
   * 生成智能建议（通用）
   */
  async generateSuggestions(
    moduleId: string,
    context: SuggestionContext
  ): Promise<Suggestion[]> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return [];
    }
    
    // 1. 模块特定建议
    const moduleSuggestions = await module.generateSuggestion(context);
    
    // 2. 通用建议（基于跨模块学习）
    const crossModuleSuggestions = await this.generateCrossModuleSuggestions(
      moduleId,
      context
    );
    
    return [...moduleSuggestions, ...crossModuleSuggestions];
  }
  
  /**
   * 处理反馈（通用）
   */
  async processFeedback(
    moduleId: string,
    feedback: UserFeedback
  ): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return;
    }
    
    // 1. 模块特定反馈处理
    await module.processFeedback(feedback);
    
    // 2. 通用反馈学习
    await this.learnFromFeedback(moduleId, feedback);
  }
  
  /**
   * 跨模块学习（通用）
   */
  private async generateCrossModuleSuggestions(
    moduleId: string,
    context: SuggestionContext
  ): Promise<Suggestion[]> {
    // 例如：如果用户在日历中经常创建"还款"事件
    // 可以建议在信用卡模块中设置自动提醒
    const suggestions: Suggestion[] = [];
    
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
    
    return suggestions;
  }
}
```

## 三、实施步骤

### 3.1 第一阶段：架构重构（1周）

1. **创建通用数据模型**
   - 创建 `ai_modules` 表
   - 修改 `user_behavior_log` 表，添加 `module_id` 字段
   - 修改 `user_preferences` 表，添加 `module_id` 字段
   - 修改 `ai_learned_patterns` 表，添加 `module_id` 字段

2. **创建模块接口**
   - 定义 `IAIModule` 接口
   - 创建 `AIAgentCore` 核心引擎

3. **重构日历模块**
   - 将现有日历学习逻辑封装为 `CalendarModule`
   - 实现 `IAIModule` 接口

### 3.2 第二阶段：信用卡模块（1周）

1. **创建信用卡模块**
   - 实现 `CreditCardModule` 类
   - 实现信用卡特定的学习逻辑
   - 实现信用卡特定的建议生成

2. **集成到核心引擎**
   - 注册信用卡模块
   - 测试跨模块学习

### 3.3 第三阶段：扩展性测试（1周）

1. **测试新模块添加**
   - 创建示例模块（如：习惯追踪）
   - 验证插件化架构的扩展性

2. **优化和文档**
   - 优化性能
   - 完善文档
   - 创建模块开发指南

## 四、优势总结

### 4.1 通用化优势

✅ **一次开发，多处使用**：核心学习机制可以应用于所有模块
✅ **易于扩展**：添加新功能只需实现 `IAIModule` 接口
✅ **统一管理**：所有模块的学习数据统一管理
✅ **跨模块学习**：可以学习跨模块的模式和关联

### 4.2 插件化优势

✅ **模块独立**：每个模块可以独立开发和测试
✅ **灵活配置**：可以启用/禁用特定模块
✅ **版本管理**：每个模块可以独立版本管理
✅ **易于维护**：模块之间解耦，易于维护

### 4.3 实际应用

- **日历提醒**：学习时间偏好、事件类型偏好
- **信用卡提醒**：学习还款偏好、账单检查偏好
- **习惯追踪**：学习习惯执行模式、最佳执行时间
- **账单管理**：学习账单支付模式、预算管理偏好

## 五、总结

通过**通用化架构 + 插件化设计**，AI智能体学习系统可以：

1. ✅ **支持多模块**：日历、信用卡、账单、习惯等
2. ✅ **统一学习机制**：核心学习逻辑通用化
3. ✅ **易于扩展**：新功能只需实现接口
4. ✅ **跨模块学习**：发现模块之间的关联模式

**不再是只针对日历提醒，而是一个通用的AI智能体学习框架！**

---

**最后更新**: 2026-01-30  
**版本**: 2.0（通用化架构）  
**状态**: ✅ 架构设计完成，待实施

