# Plan-and-Solve 架构集成方案

## 一、当前框架分析

### 当前工具调用框架的特点

✅ **已实现**：
- 工具注册表（ToolRegistry）：自动发现和注册所有工具
- Function Calling 支持：AI 可以调用工具
- 动态系统提示词：基于可用工具生成
- 递归工具调用：支持多轮工具调用

❌ **缺失**：
- **规划阶段**：缺少先规划后执行的机制
- **步骤管理**：没有任务步骤的显式管理
- **执行监控**：缺少执行过程的观察和评估
- **动态调整**：无法根据执行结果重新规划

### 与 Plan-and-Solve 的对比

| 特性 | 当前框架 | Plan-and-Solve | 差距 |
|------|---------|----------------|------|
| 工具调用 | ✅ 支持 | ✅ 支持 | 无 |
| 任务规划 | ❌ 无 | ✅ Planner | **需要添加** |
| 步骤执行 | ⚠️ 隐式 | ✅ Executor | **需要显式化** |
| 执行监控 | ❌ 无 | ✅ Observer | **需要添加** |
| 结果评估 | ❌ 无 | ✅ Evaluator | **需要添加** |
| 动态调整 | ❌ 无 | ✅ Replan | **需要添加** |

## 二、集成方案设计

### 2.1 架构设计

```
┌─────────────────────────────────────────┐
│      Plan-and-Solve Agent                │
│  ┌───────────────────────────────────┐  │
│  │  Planner (规划器)                  │  │
│  │  - 分解任务为步骤                  │  │
│  │  - 识别步骤依赖                    │  │
│  │  - 选择所需工具                    │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │  Executor (执行器)                │  │
│  │  - 按步骤执行任务                  │  │
│  │  - 调用工具                        │  │
│  │  - 管理执行状态                    │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │  Observer (观察器)                │  │
│  │  - 监控执行结果                    │  │
│  │  - 记录执行历史                    │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │  Evaluator (评估器)               │  │
│  │  - 评估步骤成功/失败               │  │
│  │  - 决定下一步行动                 │  │
│  │  - 触发重新规划                   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│      ToolRegistry (工具注册表)          │
│  - 所有可用工具                         │
│  - 工具描述和参数                       │
└─────────────────────────────────────────┘
```

### 2.2 核心组件设计

#### 1. Planner（规划器）

**职责**：
- 将用户目标分解为可执行步骤
- 识别步骤之间的依赖关系
- 为每个步骤选择合适的工具
- 生成结构化任务计划

**实现方式**：
- 使用 LLM（通过工具调用）进行规划
- 提供规划提示词模板
- 返回 JSON 格式的任务计划

#### 2. Executor（执行器）

**职责**：
- 按顺序执行任务步骤
- 调用相应的工具
- 管理执行状态（pending、running、success、failed）
- 处理步骤依赖

**实现方式**：
- 基于 ToolRegistry 执行工具
- 维护执行上下文
- 支持并行执行（如果步骤无依赖）

#### 3. Observer（观察器）

**职责**：
- 监控每个步骤的执行结果
- 记录执行历史
- 收集错误信息
- 提供执行进度

**实现方式**：
- 监听 Executor 的执行事件
- 存储执行历史到数据库
- 提供实时状态更新

#### 4. Evaluator（评估器）

**职责**：
- 评估步骤执行是否成功
- 判断是否需要重新规划
- 决定下一步行动（继续、重试、跳过、终止）
- 触发重新规划

**实现方式**：
- 基于规则评估（简单场景）
- 使用 LLM 评估（复杂场景）
- 返回评估结果和决策

## 三、实现方案

### 3.1 数据结构定义

```typescript
// 任务步骤
interface TaskStep {
  id: string;
  order: number;              // 执行顺序
  description: string;         // 步骤描述
  tool: string;               // 使用的工具
  parameters: any;             // 工具参数
  dependencies: string[];      // 依赖的步骤ID
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  result?: any;               // 执行结果
  error?: string;             // 错误信息
  startTime?: string;
  endTime?: string;
}

// 任务计划
interface TaskPlan {
  id: string;
  goal: string;                // 用户目标
  steps: TaskStep[];          // 任务步骤列表
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 执行上下文
interface ExecutionContext {
  plan: TaskPlan;
  currentStepIndex: number;
  stepResults: Map<string, any>;  // 步骤ID -> 执行结果
  variables: Map<string, any>;     // 变量存储（用于步骤间传递数据）
}
```

### 3.2 Planner 实现

```typescript
// electron/service/ai/planner.ts

export class Planner {
  private aiService: AIService;
  private toolRegistry: ToolRegistry;

  constructor(aiService: AIService, toolRegistry: ToolRegistry) {
    this.aiService = aiService;
    this.toolRegistry = toolRegistry;
  }

  /**
   * 创建任务计划
   */
  async createPlan(goal: string, context?: any): Promise<TaskPlan> {
    // 1. 获取所有可用工具
    const tools = this.toolRegistry.getToolsForAI();
    
    // 2. 构建规划提示词
    const prompt = this.buildPlanningPrompt(goal, tools, context);
    
    // 3. 调用 AI 进行规划
    const provider = await this.aiService.getCurrentProvider();
    if (!provider) {
      throw new Error('AI provider not configured');
    }
    
    const response = await this.aiService.callAI(prompt, provider, false);
    
    // 4. 解析规划结果
    const plan = this.parsePlanResponse(response, goal);
    
    return plan;
  }

  /**
   * 构建规划提示词
   */
  private buildPlanningPrompt(goal: string, tools: any[], context?: any): string {
    const toolDescriptions = tools.map(t => 
      `- ${t.function.name}: ${t.function.description}`
    ).join('\n');

    return `你是一个任务规划专家。请将以下目标分解为一系列可执行步骤。

## 用户目标
${goal}

## 可用工具
${toolDescriptions}

## 当前上下文
${context ? JSON.stringify(context, null, 2) : '无'}

## 规划要求
1. 将目标分解为3-10个可执行的步骤
2. 每个步骤应该：
   - 有明确的描述
   - 指定使用的工具
   - 定义工具参数
   - 标识依赖关系（如果有）
3. 步骤应该按逻辑顺序排列
4. 考虑错误处理和重试机制

## 输出格式（JSON）
{
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "description": "步骤描述",
      "tool": "工具名称",
      "parameters": {
        "param1": "value1"
      },
      "dependencies": []
    }
  ]
}

请只返回JSON，不要包含其他内容。`;
  }

  /**
   * 解析规划响应
   */
  private parsePlanResponse(response: string, goal: string): TaskPlan {
    try {
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const data = JSON.parse(jsonStr);
      const crypto = require('crypto');
      
      const plan: TaskPlan = {
        id: crypto.randomUUID(),
        goal: goal,
        steps: data.steps.map((step: any, index: number) => ({
          id: step.id || `step_${index + 1}`,
          order: step.order || index + 1,
          description: step.description,
          tool: step.tool,
          parameters: step.parameters || {},
          dependencies: step.dependencies || [],
          status: 'pending'
        })),
        status: 'planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return plan;
    } catch (error: any) {
      throw new Error(`Failed to parse plan: ${error.message}`);
    }
  }
}
```

### 3.3 Executor 实现

```typescript
// electron/service/ai/executor.ts

export class Executor {
  private toolRegistry: ToolRegistry;
  private observer: Observer;
  private evaluator: Evaluator;

  constructor(
    toolRegistry: ToolRegistry,
    observer: Observer,
    evaluator: Evaluator
  ) {
    this.toolRegistry = toolRegistry;
    this.observer = observer;
    this.evaluator = evaluator;
  }

  /**
   * 执行任务计划
   */
  async executePlan(plan: TaskPlan): Promise<TaskPlan> {
    const context: ExecutionContext = {
      plan: plan,
      currentStepIndex: 0,
      stepResults: new Map(),
      variables: new Map()
    };

    plan.status = 'executing';
    this.observer.onPlanStart(plan);

    // 按顺序执行步骤
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      
      // 检查依赖
      if (!this.checkDependencies(step, context)) {
        step.status = 'skipped';
        step.error = 'Dependencies not met';
        continue;
      }

      // 执行步骤
      context.currentStepIndex = i;
      step.status = 'running';
      step.startTime = new Date().toISOString();
      
      this.observer.onStepStart(step);

      try {
        // 替换参数中的变量引用
        const resolvedParams = this.resolveParameters(step.parameters, context);
        
        // 执行工具
        const result = await this.toolRegistry.executeTool(step.tool, resolvedParams);
        
        step.status = 'success';
        step.result = result;
        step.endTime = new Date().toISOString();
        
        // 存储结果到上下文
        context.stepResults.set(step.id, result);
        
        this.observer.onStepComplete(step, result);
        
        // 评估步骤结果
        const evaluation = await this.evaluator.evaluateStep(step, result, context);
        
        if (evaluation.shouldReplan) {
          // 需要重新规划
          this.observer.onReplanNeeded(plan, step, evaluation.reason);
          throw new Error(`Replan needed: ${evaluation.reason}`);
        }
        
        if (evaluation.shouldStop) {
          // 需要停止执行
          plan.status = 'cancelled';
          this.observer.onPlanStop(plan, evaluation.reason);
          break;
        }
        
      } catch (error: any) {
        step.status = 'failed';
        step.error = error.message;
        step.endTime = new Date().toISOString();
        
        this.observer.onStepError(step, error);
        
        // 评估错误
        const evaluation = await this.evaluator.evaluateError(step, error, context);
        
        if (evaluation.shouldRetry) {
          // 重试步骤
          i--; // 回退一步，重新执行
          continue;
        }
        
        if (evaluation.shouldReplan) {
          // 需要重新规划
          throw new Error(`Replan needed: ${evaluation.reason}`);
        }
        
        if (evaluation.shouldStop) {
          // 停止执行
          plan.status = 'failed';
          this.observer.onPlanError(plan, error);
          break;
        }
      }
    }

    if (plan.status === 'executing') {
      plan.status = 'completed';
      this.observer.onPlanComplete(plan);
    }

    plan.updatedAt = new Date().toISOString();
    return plan;
  }

  /**
   * 检查步骤依赖
   */
  private checkDependencies(step: TaskStep, context: ExecutionContext): boolean {
    for (const depId of step.dependencies) {
      const depStep = context.plan.steps.find(s => s.id === depId);
      if (!depStep || depStep.status !== 'success') {
        return false;
      }
    }
    return true;
  }

  /**
   * 解析参数中的变量引用
   */
  private resolveParameters(parameters: any, context: ExecutionContext): any {
    if (typeof parameters === 'string') {
      // 替换 ${step_id.result} 格式的变量引用
      return parameters.replace(/\$\{(\w+)\.(\w+)\}/g, (match, stepId, key) => {
        const stepResult = context.stepResults.get(stepId);
        return stepResult?.[key] || match;
      });
    }
    
    if (Array.isArray(parameters)) {
      return parameters.map(p => this.resolveParameters(p, context));
    }
    
    if (typeof parameters === 'object' && parameters !== null) {
      const resolved: any = {};
      for (const [key, value] of Object.entries(parameters)) {
        resolved[key] = this.resolveParameters(value, context);
      }
      return resolved;
    }
    
    return parameters;
  }
}
```

### 3.4 Observer 实现

```typescript
// electron/service/ai/observer.ts

export class Observer {
  private executionHistory: ExecutionHistory[] = [];

  /**
   * 计划开始
   */
  onPlanStart(plan: TaskPlan): void {
    console.log(`[Plan Start] ${plan.goal}`);
    this.executionHistory.push({
      type: 'plan_start',
      planId: plan.id,
      timestamp: new Date().toISOString(),
      data: plan
    });
  }

  /**
   * 步骤开始
   */
  onStepStart(step: TaskStep): void {
    console.log(`[Step Start] ${step.description}`);
    // 可以发送事件到前端，更新UI
  }

  /**
   * 步骤完成
   */
  onStepComplete(step: TaskStep, result: any): void {
    console.log(`[Step Complete] ${step.description}`, result);
    // 记录执行历史
  }

  /**
   * 步骤错误
   */
  onStepError(step: TaskStep, error: Error): void {
    console.error(`[Step Error] ${step.description}`, error);
    // 记录错误
  }

  /**
   * 计划完成
   */
  onPlanComplete(plan: TaskPlan): void {
    console.log(`[Plan Complete] ${plan.goal}`);
    // 保存执行历史到数据库
  }

  /**
   * 需要重新规划
   */
  onReplanNeeded(plan: TaskPlan, step: TaskStep, reason: string): void {
    console.log(`[Replan Needed] ${reason}`);
  }
}
```

### 3.5 Evaluator 实现

```typescript
// electron/service/ai/evaluator.ts

export class Evaluator {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * 评估步骤执行结果
   */
  async evaluateStep(
    step: TaskStep,
    result: any,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    // 简单评估：检查结果是否为空或错误
    if (result === null || result === undefined) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Step returned empty result'
      };
    }

    if (result.error) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: result.error
      };
    }

    // 复杂评估：使用 AI 评估
    if (step.description.includes('分析') || step.description.includes('判断')) {
      return await this.evaluateWithAI(step, result, context);
    }

    return {
      success: true,
      shouldReplan: false,
      shouldStop: false,
      shouldRetry: false
    };
  }

  /**
   * 使用 AI 评估
   */
  private async evaluateWithAI(
    step: TaskStep,
    result: any,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    const prompt = `评估以下步骤的执行结果：

步骤：${step.description}
结果：${JSON.stringify(result, null, 2)}

请判断：
1. 步骤是否成功完成？
2. 结果是否符合预期？
3. 是否需要重新规划？
4. 是否需要停止执行？

返回JSON格式：
{
  "success": true/false,
  "shouldReplan": true/false,
  "shouldStop": true/false,
  "reason": "评估原因"
}`;

    const provider = await this.aiService.getCurrentProvider();
    if (!provider) {
      // 降级到简单评估
      return {
        success: true,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: false
      };
    }

    const response = await this.aiService.callAI(prompt, provider, false);
    const evaluation = JSON.parse(response);
    
    return {
      success: evaluation.success,
      shouldReplan: evaluation.shouldReplan,
      shouldStop: evaluation.shouldStop,
      shouldRetry: false,
      reason: evaluation.reason
    };
  }

  /**
   * 评估错误
   */
  async evaluateError(
    step: TaskStep,
    error: Error,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    // 根据错误类型决定行动
    if (error.message.includes('not found') || error.message.includes('不存在')) {
      return {
        success: false,
        shouldReplan: true,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Resource not found, need to replan'
      };
    }

    if (error.message.includes('timeout') || error.message.includes('网络')) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: 'Network error, retry'
      };
    }

    return {
      success: false,
      shouldReplan: false,
      shouldStop: true,
      shouldRetry: false,
      reason: error.message
    };
  }
}

interface EvaluationResult {
  success: boolean;
  shouldReplan: boolean;
  shouldStop: boolean;
  shouldRetry: boolean;
  reason?: string;
}
```

### 3.6 Plan-and-Solve Agent 整合

```typescript
// electron/service/ai/planAndSolveAgent.ts

export class PlanAndSolveAgent {
  private planner: Planner;
  private executor: Executor;
  private observer: Observer;
  private evaluator: Evaluator;

  constructor(
    aiService: AIService,
    toolRegistry: ToolRegistry
  ) {
    this.observer = new Observer();
    this.evaluator = new Evaluator(aiService);
    this.planner = new Planner(aiService, toolRegistry);
    this.executor = new Executor(toolRegistry, this.observer, this.evaluator);
  }

  /**
   * 执行任务（Plan-and-Solve 模式）
   */
  async execute(goal: string, context?: any): Promise<TaskPlan> {
    let plan: TaskPlan;
    let maxReplans = 3;
    let replanCount = 0;

    while (replanCount < maxReplans) {
      try {
        // 1. 规划阶段
        if (replanCount === 0) {
          plan = await this.planner.createPlan(goal, context);
        } else {
          // 重新规划（基于之前的执行历史）
          const previousContext = {
            ...context,
            previousPlan: plan,
            failedSteps: plan.steps.filter(s => s.status === 'failed')
          };
          plan = await this.planner.createPlan(goal, previousContext);
        }

        // 2. 执行阶段
        plan = await this.executor.executePlan(plan);

        // 3. 如果执行成功，返回结果
        if (plan.status === 'completed') {
          return plan;
        }

        // 4. 如果需要重新规划
        if (plan.status === 'failed' && replanCount < maxReplans - 1) {
          replanCount++;
          continue;
        }

        return plan;

      } catch (error: any) {
        if (error.message.includes('Replan needed') && replanCount < maxReplans - 1) {
          replanCount++;
          continue;
        }
        throw error;
      }
    }

    return plan!;
  }
}
```

## 四、集成到现有系统

### 4.1 修改 AIService

```typescript
// 在 AIService 中添加 Plan-and-Solve 方法

public async parseNaturalLanguageWithPlanAndSolve(
  text: string,
  context?: any
): Promise<ServiceResult<NaturalLanguageParseResult>> {
  try {
    const toolRegistry = await this.getToolRegistry();
    const { PlanAndSolveAgent } = await import('./ai/planAndSolveAgent');
    
    const agent = new PlanAndSolveAgent(this, toolRegistry);
    const plan = await agent.execute(text, context);
    
    // 将计划结果转换为 NaturalLanguageParseResult
    return this.convertPlanToResult(plan);
  } catch (error: any) {
    // 降级到传统模式
    return await this.parseNaturalLanguage(text, context);
  }
}
```

### 4.2 使用场景

**场景1：复杂任务分解**

用户输入："分析本季度销售数据并生成报告"

Plan-and-Solve 执行：
1. **规划**：分解为 5 个步骤
   - 步骤1：读取销售数据文件
   - 步骤2：清洗数据
   - 步骤3：计算关键指标
   - 步骤4：生成图表
   - 步骤5：生成报告

2. **执行**：按步骤执行，每个步骤调用相应工具

3. **监控**：实时显示执行进度

4. **评估**：如果某个步骤失败，自动重新规划

**场景2：多步骤查询**

用户输入："查找明天的工作安排，并检查是否有冲突"

Plan-and-Solve 执行：
1. 获取当前日期
2. 计算明天日期
3. 查询明天的事件
4. 检查时间冲突
5. 返回结果和建议

## 五、优势总结

### 5.1 相比当前框架的优势

1. **结构化执行**：显式的任务分解和执行流程
2. **错误恢复**：自动重试和重新规划
3. **可追溯性**：完整的执行历史记录
4. **智能调整**：根据执行结果动态调整计划

### 5.2 与 TaskPilot 的对比

| 特性 | TaskPilot | 我们的方案 | 状态 |
|------|-----------|-----------|------|
| Plan-and-Solve | ✅ | ✅ | **可集成** |
| 工具调用 | ✅ MCP | ✅ ToolRegistry | **已实现** |
| 记忆系统 | ✅ 向量数据库 | ✅ Markdown + SQLite | **已实现** |
| 本地LLM | ✅ Ollama | ⚠️ 可选 | **可添加** |
| 多智能体 | ✅ | ⚠️ 单智能体 | **可扩展** |

## 六、实施建议

### 阶段1：基础实现（1-2周）
1. 实现 Planner、Executor、Observer、Evaluator
2. 集成到 AIService
3. 添加执行历史存储

### 阶段2：优化（1周）
1. 支持并行执行（无依赖步骤）
2. 优化重新规划逻辑
3. 添加执行进度UI

### 阶段3：高级功能（1-2周）
1. 支持多智能体协作
2. 集成本地LLM（Ollama）
3. 添加任务模板

---

**总结**：Plan-and-Solve 架构可以完美集成到现有的工具调用框架中，提供更强大的任务规划和执行能力，同时保持框架的通用性和可扩展性。

