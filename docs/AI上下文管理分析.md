# AI 上下文管理分析

## 一、当前实现状态

### 1.1 各组件使用 AI 的情况

| 组件 | 是否使用AI | AI调用方式 | 上下文管理 |
|------|-----------|-----------|-----------|
| **Planner** | ✅ 是 | `callAI(prompt, provider, false)` | ❌ **无持久化上下文** |
| **Executor** | ❌ 否 | 不直接调用AI | ✅ 有执行上下文（ExecutionContext） |
| **Observer** | ❌ 否 | 不调用AI | ✅ 有执行历史记录 |
| **Evaluator** | ✅ 是 | `callAI(prompt, provider, false)` | ❌ **无持久化上下文** |

### 1.2 AI 上下文管理现状

#### ❌ **当前问题：每次AI调用都是独立的**

```typescript
// Planner 中的调用
const response = await this.aiService.callAI(prompt, provider, false);
// ↑ 每次都是新的独立请求，没有对话历史

// Evaluator 中的调用
const response = await this.aiService.callAI(prompt, provider, false);
// ↑ 每次都是新的独立请求，没有对话历史
```

**问题分析**：
1. **无对话历史**：每次调用AI都是独立的，AI不知道之前的对话内容
2. **无上下文传递**：虽然通过提示词传递了部分上下文，但AI无法记住之前的决策
3. **重复信息**：每次调用都需要重新传递所有上下文信息

## 二、上下文类型分析

### 2.1 执行上下文（ExecutionContext）

✅ **已实现**：在 `Executor` 中维护

```typescript
const context: ExecutionContext = {
  plan: plan,                    // 任务计划
  currentStepIndex: 0,           // 当前步骤索引
  stepResults: new Map(),        // 步骤结果映射
  variables: new Map()            // 变量存储
};
```

**特点**：
- ✅ 在单次任务执行期间存在
- ✅ 用于步骤间传递数据
- ❌ 任务完成后销毁
- ❌ 不传递给AI

### 2.2 AI 对话上下文

❌ **未实现**：AI调用没有维护对话历史

**当前实现**：
```typescript
// 每次调用都是独立的
const response = await this.aiService.callAI(prompt, provider, false);
```

**理想实现**（需要改进）：
```typescript
// 维护对话历史
const messages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userMessage },
  { role: 'assistant', content: previousResponse },  // ← 历史对话
  { role: 'user', content: currentMessage }          // ← 当前请求
];
```

## 三、各组件详细分析

### 3.1 Planner（规划器）

**AI调用位置**：
```typescript:29:34:electron/service/ai/planner.ts
const provider = await this.aiService.getCurrentProvider();
if (!provider) {
  throw new Error('AI provider not configured');
}

const response = await this.aiService.callAI(prompt, provider, false);
```

**上下文传递方式**：
- ✅ 通过 `buildPlanningPrompt` 构建提示词，包含：
  - 用户目标
  - 当前日期
  - 可用工具列表
  - 之前的执行历史（重新规划时）
- ❌ **没有对话历史**：每次调用都是新对话

**影响**：
- 重新规划时，AI无法记住之前的规划决策
- 需要重新传递所有上下文信息

### 3.2 Executor（执行器）

**AI使用情况**：
- ❌ 不直接调用AI
- ✅ 维护 `ExecutionContext`（执行上下文）
- ✅ 通过 `context.stepResults` 存储步骤结果

**上下文管理**：
```typescript:29:34:electron/service/ai/executor.ts
const context: ExecutionContext = {
  plan: plan,
  currentStepIndex: 0,
  stepResults: new Map(),  // 步骤结果
  variables: new Map()      // 变量存储
};
```

**特点**：
- ✅ 上下文在单次执行期间存在
- ✅ 用于步骤间数据传递
- ❌ 不传递给AI（因为不调用AI）

### 3.3 Observer（观察器）

**AI使用情况**：
- ❌ 不使用AI
- ✅ 维护执行历史记录

**上下文管理**：
```typescript:8:9:electron/service/ai/observer.ts
private executionHistory: ExecutionHistory[] = [];
private listeners: Map<string, ((data: any) => void)[]> = new Map();
```

**特点**：
- ✅ 记录所有执行历史
- ✅ 可以查询历史记录
- ❌ 不传递给AI（因为不调用AI）

### 3.4 Evaluator（评估器）

**AI调用位置**：
```typescript:104:115:electron/service/ai/evaluator.ts
const provider = await this.aiService.getCurrentProvider();
if (!provider) {
  // 降级到简单评估
  return { ... };
}

const response = await this.aiService.callAI(prompt, provider, false);
```

**上下文传递方式**：
- ✅ 通过提示词传递：
  - 步骤描述
  - 执行结果
- ❌ **没有对话历史**：每次评估都是新对话

**影响**：
- AI无法记住之前的评估决策
- 无法学习评估模式

## 四、AIService 的上下文管理

### 4.1 Provider 缓存

✅ **已实现**：Provider配置会被缓存

```typescript:53:53:electron/service/aiService.ts
private currentProvider: AIProvider | null = null;
```

```typescript:258:281:electron/service/aiService.ts
public async getCurrentProvider(): Promise<AIProvider | null> {
  if (this.currentProvider) {
    return this.currentProvider;  // ← 返回缓存的provider
  }
  // ... 从数据库加载
  this.currentProvider = { ... };  // ← 缓存provider
  return this.currentProvider;
}
```

**特点**：
- ✅ Provider配置会被缓存（避免重复查询数据库）
- ❌ 但这不是AI对话上下文

### 4.2 AI 调用方式

**当前实现**：
```typescript
// 每次调用都是独立的
public async callAI(
  prompt: string, 
  provider: AIProvider,
  useTools: boolean = false
): Promise<string>
```

**问题**：
- ❌ 没有维护对话历史
- ❌ 每次调用都是新对话
- ❌ AI无法记住之前的交互

## 五、改进建议

### 5.1 添加对话上下文管理

#### 方案1：在 AIService 中维护对话历史

```typescript
export class AIService {
  private conversationHistory: Map<string, any[]> = new Map();  // 会话ID -> 消息历史

  public async callAIWithContext(
    prompt: string,
    provider: AIProvider,
    sessionId: string,  // 会话ID
    useTools: boolean = false
  ): Promise<string> {
    // 获取或创建对话历史
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    const history = this.conversationHistory.get(sessionId)!;

    // 添加用户消息
    history.push({ role: 'user', content: prompt });

    // 调用AI（传入历史）
    const response = await this.callAIWithHistory(history, provider, useTools);

    // 添加AI响应
    history.push({ role: 'assistant', content: response });

    return response;
  }
}
```

#### 方案2：在 PlanAndSolveAgent 中维护上下文

```typescript
export class PlanAndSolveAgent {
  private conversationContext: any[] = [];  // 对话历史

  async execute(goal: string, context?: any): Promise<TaskPlan> {
    // 初始化对话上下文
    this.conversationContext = [
      { role: 'system', content: '你是一个任务规划专家...' },
      { role: 'user', content: goal }
    ];

    // Planner 使用上下文
    plan = await this.planner.createPlanWithContext(goal, context, this.conversationContext);

    // Executor 执行...

    // Evaluator 使用上下文
    evaluation = await this.evaluator.evaluateWithContext(step, result, this.conversationContext);
  }
}
```

### 5.2 上下文传递优化

#### 当前方式（每次传递完整上下文）：
```typescript
const prompt = `你是一个任务规划专家。请将以下目标分解为一系列可执行步骤。

## 用户目标
${goal}

## 当前上下文
- 当前日期：${currentDate}
${context ? `- 其他上下文：${JSON.stringify(context, null, 2)}` : ''}

## 可用工具
${toolDescriptions}
...`;
```

#### 改进方式（使用对话历史）：
```typescript
const messages = [
  { role: 'system', content: systemPrompt },
  ...this.conversationContext,  // ← 历史对话
  { role: 'user', content: currentPrompt }
];
```

### 5.3 上下文生命周期管理

**建议的上下文管理策略**：

1. **任务级上下文**：每个任务计划维护自己的对话历史
   ```typescript
   interface TaskPlan {
     id: string;
     goal: string;
     steps: TaskStep[];
     conversationHistory?: any[];  // ← 添加对话历史
   }
   ```

2. **会话级上下文**：PlanAndSolveAgent 维护会话级上下文
   ```typescript
   export class PlanAndSolveAgent {
     private sessionContext: any[] = [];  // 会话级上下文
   }
   ```

3. **全局上下文**：AIService 维护全局上下文（可选）
   ```typescript
   export class AIService {
     private globalContext: any[] = [];  // 全局上下文（用户偏好、历史等）
   }
   ```

## 六、总结

### 6.1 当前状态

| 上下文类型 | 状态 | 说明 |
|-----------|------|------|
| **执行上下文** | ✅ 已实现 | Executor 中维护，用于步骤间数据传递 |
| **执行历史** | ✅ 已实现 | Observer 中维护，用于记录和查询 |
| **AI对话上下文** | ❌ **未实现** | 每次AI调用都是独立请求 |
| **Provider缓存** | ✅ 已实现 | AIService 中缓存provider配置 |

### 6.2 关键发现

1. **AI上下文不是一直存在的**
   - 每次调用 `callAI` 都是独立的请求
   - 没有维护对话历史
   - AI无法记住之前的交互

2. **执行上下文是存在的**
   - `ExecutionContext` 在单次任务执行期间存在
   - 用于步骤间传递数据
   - 但不传递给AI

3. **需要改进的地方**
   - 添加AI对话上下文管理
   - 在多次AI调用之间传递历史
   - 优化上下文传递方式

### 6.3 建议

**短期改进**（简单）：
- 在 `PlanAndSolveAgent` 中维护对话历史
- 在重新规划时传递之前的对话历史

**长期改进**（完整）：
- 在 `AIService` 中添加对话上下文管理
- 支持会话级和任务级上下文
- 实现上下文持久化（可选）

---

**最后更新**: 2026-01-30
**状态**: 📊 分析完成，待改进

