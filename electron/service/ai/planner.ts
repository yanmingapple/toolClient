import { AIService } from '../aiService';
import { ToolRegistry } from './toolRegistry';
import { TaskPlan, TaskStep } from './types';

/**
 * 规划器（Planner）
 * 负责将用户目标分解为可执行步骤
 */
export class Planner {
  private aiService: AIService;
  private toolRegistry: ToolRegistry;
  private sessionId: string;

  constructor(aiService: AIService, toolRegistry: ToolRegistry, sessionId?: string) {
    this.aiService = aiService;
    this.toolRegistry = toolRegistry;
    this.sessionId = sessionId || `plan_${Date.now()}`;
  }

  /**
   * 设置会话ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * 创建任务计划
   */
  async createPlan(goal: string, context?: any): Promise<TaskPlan> {
    // 1. 获取所有可用工具
    const tools = this.toolRegistry.getToolsForAI();
    
    // 2. 初始化上下文（如果是第一次规划）
    await this.initializeContext(goal, tools, context);
    
    // 3. 构建规划提示词
    const prompt = this.buildPlanningPrompt(goal, tools, context);
    
    // 4. 调用 AI 进行规划（使用上下文）
    const provider = await this.aiService.getCurrentProvider();
    if (!provider) {
      throw new Error('AI provider not configured');
    }
    
    const response = await this.aiService.callAI(prompt, provider, false, this.sessionId);
    
    // 5. 解析规划结果
    const plan = this.parsePlanResponse(response, goal);
    
    return plan;
  }

  /**
   * 初始化上下文
   */
  private async initializeContext(goal: string, tools: any[], context?: any): Promise<void> {
    const { ContextManager } = await import('./contextManager');
    const contextManager = ContextManager.getInstance();
    
    // 检查是否已有上下文
    const existingContext = contextManager.getOrCreateContext(this.sessionId);
    if (existingContext.messages.length > 0) {
      return; // 已有上下文，不需要重新初始化
    }

    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(tools, context);
    
    // 创建上下文
    contextManager.getOrCreateContext(this.sessionId, systemPrompt);
    
    // 更新元数据
    const ctx = contextManager.getOrCreateContext(this.sessionId);
    if (ctx.metadata) {
      ctx.metadata.goal = goal;
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(tools: any[], context?: any): string {
    // 详细展示每个工具的参数定义，确保 AI 理解参数名称
    const toolDescriptions = tools.map(t => {
      const params = t.function.parameters;
      const paramDetails = params?.properties 
        ? Object.entries(params.properties).map(([name, prop]: [string, any]) => {
            const required = params.required?.includes(name) ? ' (必需)' : ' (可选)';
            return `    - ${name}${required}: ${prop.description || prop.type || '无描述'}`;
          }).join('\n')
        : '    无参数';
      
      return `- ${t.function.name}: ${t.function.description}
${paramDetails}`;
    }).join('\n\n');

    // 使用本地时区获取当前日期
    const getLocalDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const currentDate = context?.currentDate || getLocalDate();

    return `你是一个任务规划专家，擅长将复杂目标分解为可执行的步骤。

## 可用工具
${toolDescriptions}

## 规划原则
1. 将目标分解为1-10个可执行的步骤
2. 每个步骤应该：
   - 有明确的描述（说明要做什么）
   - 指定使用的工具（从可用工具列表中选择）
   - 定义工具参数（**必须严格按照工具定义中的参数名称，不能自行修改或猜测参数名**）
   - 标识依赖关系（如果步骤需要前面步骤的结果，在dependencies中列出步骤ID）
3. 步骤应该按逻辑顺序排列
4. 考虑错误处理和重试机制
5. 如果步骤需要使用前面步骤的结果，在parameters中使用 \${step_id.result} 格式引用

**重要：工具参数名称必须完全匹配工具定义中的参数名称，不能使用其他名称（如不能将 days 写成 offset，不能将 baseDate 写成 base_date 等）**

## 当前上下文
- 当前日期：${currentDate}
${context ? `- 其他上下文：${JSON.stringify(context, null, 2)}` : ''}

## 输出格式
请只返回JSON格式，包含steps数组，每个step包含id、order、description、tool、parameters、dependencies字段。`;
  }

  /**
   * 构建规划提示词
   */
  private buildPlanningPrompt(goal: string, tools: any[], context?: any): string {
    // 详细展示每个工具的参数定义，确保 AI 理解参数名称
    const toolDescriptions = tools.map(t => {
      const params = t.function.parameters;
      const paramDetails = params?.properties 
        ? Object.entries(params.properties).map(([name, prop]: [string, any]) => {
            const required = params.required?.includes(name) ? ' (必需)' : ' (可选)';
            return `    - ${name}${required}: ${prop.description || prop.type || '无描述'}`;
          }).join('\n')
        : '    无参数';
      
      return `- ${t.function.name}: ${t.function.description}
${paramDetails}`;
    }).join('\n\n');

    // 使用本地时区获取当前日期
    const getLocalDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const currentDate = context?.currentDate || getLocalDate();

    return `你是一个任务规划专家。请将以下目标分解为一系列可执行步骤。

## 用户目标
${goal}

## 当前上下文
- 当前日期：${currentDate}
${context ? `- 其他上下文：${JSON.stringify(context, null, 2)}` : ''}

## 可用工具
${toolDescriptions}

## 规划要求
1. 将目标分解为1-10个可执行的步骤
2. 每个步骤应该：
   - 有明确的描述（说明要做什么）
   - 指定使用的工具（从可用工具列表中选择）
   - 定义工具参数（**必须严格按照工具定义中的参数名称，不能自行修改或猜测参数名**）
   - 标识依赖关系（如果步骤需要前面步骤的结果，在dependencies中列出步骤ID）
3. 步骤应该按逻辑顺序排列
4. 考虑错误处理和重试机制
5. 如果步骤需要使用前面步骤的结果，在parameters中使用 \${step_id.result} 格式引用

**重要：工具参数名称必须完全匹配工具定义中的参数名称，不能使用其他名称（如不能将 days 写成 offset，不能将 baseDate 写成 base_date 等）**

## 输出格式（JSON）
{
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "description": "步骤描述（说明要做什么）",
      "tool": "工具名称（必须从可用工具列表中选择）",
      "parameters": {
        "param1": "value1"
      },
      "dependencies": []
    },
    {
      "id": "step_2",
      "order": 2,
      "description": "使用步骤1的结果",
      "tool": "create_event",
      "parameters": {
        "title": "\${step_1.result.title}",
        "date": "\${step_1.result.date}"
      },
      "dependencies": ["step_1"]
    }
  ]
}

## 注意事项
- 工具名称必须完全匹配可用工具列表中的名称
- 参数必须符合工具的参数定义
- 如果步骤需要前面步骤的结果，必须在dependencies中声明依赖
- 步骤ID使用 step_1, step_2 格式

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

