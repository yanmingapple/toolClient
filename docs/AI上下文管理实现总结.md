# AI 上下文管理实现总结

## 一、实现概述

已成功实现AI对话上下文管理和自动压缩功能，让AI能够记住之前的交互，并在上下文过长时自动压缩。

## 二、核心组件

### 2.1 ContextManager（上下文管理器）

**文件**: `electron/service/ai/contextManager.ts`

**功能**:
- ✅ 管理多个会话的对话历史
- ✅ 自动压缩上下文（当消息数超过阈值时）
- ✅ 支持AI总结和简单总结两种压缩策略
- ✅ Token估算和统计

**关键方法**:
```typescript
// 获取或创建上下文
getOrCreateContext(sessionId: string, systemPrompt?: string): ConversationContext

// 添加消息
addMessage(sessionId: string, message: ConversationMessage): void

// 获取消息历史（用于AI调用）
getMessages(sessionId: string, includeSystem: boolean = true): ConversationMessage[]

// 压缩上下文
compressContext(sessionId: string, aiService?: any): Promise<void>
```

**压缩策略**:
1. 保留系统提示词
2. 保留最近的N条消息（默认20条）
3. 将中间的消息总结为一条消息
4. 使用AI总结（如果可用）或简单规则总结

### 2.2 AIService 上下文集成

**文件**: `electron/service/aiService.ts`

**新增功能**:
- ✅ `callAI` 方法支持 `sessionId` 参数
- ✅ `callAIWithContext` 方法：使用上下文调用AI
- ✅ `callOpenAIWithMessages` 和 `callDeepSeekWithMessages`：支持消息历史
- ✅ 工具调用结果自动添加到上下文

**关键改动**:
```typescript
// 支持上下文的AI调用
public async callAI(
  prompt: string, 
  provider: AIProvider,
  useTools: boolean = false,
  sessionId?: string  // ← 新增参数
): Promise<string>

// 使用上下文调用AI
private async callAIWithContext(
  prompt: string,
  provider: AIProvider,
  sessionId: string,
  useTools: boolean,
  tools?: any[]
): Promise<string>
```

### 2.3 Planner 上下文支持

**文件**: `electron/service/ai/planner.ts`

**改动**:
- ✅ 构造函数支持 `sessionId` 参数
- ✅ `createPlan` 方法自动初始化上下文
- ✅ 使用上下文调用AI（通过 `callAI` 的 `sessionId` 参数）

**关键代码**:
```typescript
constructor(aiService: AIService, toolRegistry: ToolRegistry, sessionId?: string) {
  this.sessionId = sessionId || `plan_${Date.now()}`;
}

async createPlan(goal: string, context?: any): Promise<TaskPlan> {
  // 初始化上下文
  await this.initializeContext(goal, tools, context);
  
  // 使用上下文调用AI
  const response = await this.aiService.callAI(prompt, provider, false, this.sessionId);
}
```

### 2.4 Evaluator 上下文支持

**文件**: `electron/service/ai/evaluator.ts`

**改动**:
- ✅ 构造函数支持 `sessionId` 参数
- ✅ `evaluateWithAI` 方法使用上下文调用AI

**关键代码**:
```typescript
constructor(aiService: AIService, sessionId?: string) {
  this.sessionId = sessionId || `eval_${Date.now()}`;
}

private async evaluateWithAI(...): Promise<EvaluationResult> {
  const response = await this.aiService.callAI(prompt, provider, false, this.sessionId);
}
```

### 2.5 PlanAndSolveAgent 会话管理

**文件**: `electron/service/ai/planAndSolveAgent.ts`

**改动**:
- ✅ 维护会话ID
- ✅ 所有子组件（Planner、Evaluator）共享同一个会话ID
- ✅ 提供上下文管理方法

**关键代码**:
```typescript
constructor(
  aiService: AIService,
  toolRegistry: ToolRegistry,
  sessionId?: string
) {
  this.sessionId = sessionId || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 所有子组件共享同一个sessionId
  this.evaluator = new Evaluator(aiService, this.sessionId);
  this.planner = new Planner(aiService, toolRegistry, this.sessionId);
}
```

## 三、上下文压缩机制

### 3.1 压缩触发条件

- **默认阈值**: 消息数超过50条时触发压缩
- **压缩后保留**: 保留最近的20条消息
- **压缩策略**: 
  1. 保留系统提示词
  2. 保留最近的N条消息
  3. 将中间的消息总结为一条消息

### 3.2 压缩方法

#### AI总结（优先）
```typescript
private async summarizeMessages(
  messages: ConversationMessage[],
  aiService?: any
): Promise<string>
```

**特点**:
- 使用AI总结，提取关键信息
- 包含：用户目标、已完成步骤、重要决策、需要注意的问题
- 如果AI不可用，降级到简单总结

#### 简单总结（降级）
```typescript
private simpleSummarize(messages: ConversationMessage[]): string
```

**特点**:
- 规则-based总结
- 统计消息数量
- 提取关键目标（前3条用户消息）

### 3.3 压缩示例

**压缩前**:
```
[system] 你是一个任务规划专家...
[user] 创建明天的会议
[assistant] 已创建会议...
[user] 添加提醒
[assistant] 已添加提醒...
... (50条消息)
```

**压缩后**:
```
[system] 你是一个任务规划专家...
[assistant] [上下文总结] 用户的主要目标是管理会议和提醒。已完成：创建会议、添加提醒。需要注意：会议时间冲突。
[user] 最近的20条消息...
```

## 四、使用方式

### 4.1 基本使用

```typescript
// 1. 创建PlanAndSolveAgent（自动生成sessionId）
const agent = new PlanAndSolveAgent(aiService, toolRegistry);

// 2. 执行任务（自动使用上下文）
const plan = await agent.execute("创建明天的会议");

// 3. 重新规划时，AI会记住之前的对话
const plan2 = await agent.execute("修改会议时间");
```

### 4.2 自定义会话ID

```typescript
// 使用自定义sessionId（用于跨任务保持上下文）
const sessionId = "user_123_session";
const agent = new PlanAndSolveAgent(aiService, toolRegistry, sessionId);

// 所有AI调用都会使用这个sessionId
const plan = await agent.execute("创建明天的会议");
```

### 4.3 手动管理上下文

```typescript
// 获取上下文管理器
const contextManager = ContextManager.getInstance();

// 创建上下文
const context = contextManager.getOrCreateContext("session_1", "系统提示词");

// 添加消息
contextManager.addMessage("session_1", {
  role: 'user',
  content: '用户输入'
});

// 获取消息历史
const messages = contextManager.getMessages("session_1");

// 手动压缩
await contextManager.compressContext("session_1", aiService);

// 清除上下文
contextManager.clearContext("session_1");
```

## 五、技术细节

### 5.1 消息格式

```typescript
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp?: string;
  toolCalls?: any[];
  toolCallId?: string;
}
```

### 5.2 上下文结构

```typescript
interface ConversationContext {
  sessionId: string;
  messages: ConversationMessage[];
  metadata?: {
    goal?: string;
    planId?: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### 5.3 Token估算

```typescript
// 简单估算：1 token ≈ 4 字符
private estimateTokens(messages: ConversationMessage[]): number {
  const totalChars = messages.reduce((sum, m) => 
    sum + (m.content?.length || 0), 0
  );
  return Math.ceil(totalChars / 4);
}
```

## 六、优势

### 6.1 智能记忆
- ✅ AI能够记住之前的对话
- ✅ 重新规划时能够参考之前的决策
- ✅ 避免重复传递上下文信息

### 6.2 自动压缩
- ✅ 自动压缩长上下文，节省token
- ✅ 保留关键信息
- ✅ 支持AI总结和规则总结两种策略

### 6.3 灵活管理
- ✅ 支持多个会话独立管理
- ✅ 可以手动控制上下文
- ✅ 提供统计和监控功能

## 七、配置参数

### 7.1 可配置项

```typescript
// 最大消息数（压缩前）
contextManager.setMaxMessages(50);

// 压缩后保留的消息数
contextManager.setMaxCompressedMessages(20);
```

### 7.2 默认值

- `maxMessages`: 50
- `maxCompressedMessages`: 20

## 八、注意事项

1. **会话ID唯一性**: 确保每个会话使用唯一的sessionId
2. **上下文生命周期**: 上下文在内存中，应用重启后会丢失
3. **压缩时机**: 压缩在消息数超过阈值时自动触发
4. **AI总结依赖**: AI总结需要AI服务可用，否则降级到简单总结

## 九、未来改进

1. **持久化**: 将上下文保存到数据库或文件
2. **更智能的压缩**: 基于重要性而非时间顺序压缩
3. **上下文检索**: 支持向量检索相关历史对话
4. **多级压缩**: 支持多次压缩，形成压缩树

---

**最后更新**: 2026-01-30
**状态**: ✅ 实现完成

