import { ToolRegistry } from './toolRegistry';
import { Observer } from './observer';
import { Evaluator } from './evaluator';
import { TaskPlan, TaskStep, ExecutionContext, EvaluationResult } from './types';

/**
 * 执行器（Executor）
 * 负责按步骤执行任务计划
 */
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
    // onPlanStart 已经在 PlanAndSolveAgent 中调用，这里不需要重复调用

    // 按顺序执行步骤
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      
      // 检查依赖
      if (!this.checkDependencies(step, context)) {
        step.status = 'skipped';
        step.error = 'Dependencies not met';
        this.observer.onStepError(step, new Error('Dependencies not met'), plan.id);
        continue;
      }

      // 执行步骤
      context.currentStepIndex = i;
      step.status = 'running';
      step.startTime = new Date().toISOString();
      
      this.observer.onStepStart(step, plan.id);

      try {
        // 替换参数中的变量引用
        const resolvedParams = this.resolveParameters(step.parameters, context);
        
        // 调试日志：显示参数解析结果
        if (JSON.stringify(step.parameters) !== JSON.stringify(resolvedParams)) {
          console.log(`[Executor] 步骤 ${step.id} 参数解析:`, {
            original: step.parameters,
            resolved: resolvedParams,
            stepResults: Array.from(context.stepResults.entries()).map(([id, result]) => ({ id, result: typeof result === 'string' ? result : JSON.stringify(result).substring(0, 100) }))
          });
        }
        
        // 执行工具
        let result: any;
        try {
          result = await this.toolRegistry.executeTool(step.tool, resolvedParams);
        } catch (toolError: any) {
          console.error(`[Executor] 工具执行失败 (${step.tool}):`, toolError);
          throw toolError; // 重新抛出，让外层 catch 处理
        }
        
        step.status = 'success';
        step.result = result;
        step.endTime = new Date().toISOString();
        
        // 存储结果到上下文
        context.stepResults.set(step.id, result);
        
        this.observer.onStepComplete(step, result, plan.id);
        
        // 评估步骤结果
        const evaluation = await this.evaluator.evaluateStep(step, result, context);
        
        if (evaluation.shouldReplan) {
          // 需要重新规划
          this.observer.onReplanNeeded(plan, step, evaluation.reason || 'Evaluation suggests replan');
          throw new Error(`Replan needed: ${evaluation.reason}`);
        }
        
        if (evaluation.shouldStop) {
          // 需要停止执行
          plan.status = 'cancelled';
          this.observer.onPlanStop(plan, evaluation.reason || 'Evaluation suggests stop');
          break;
        }
        
      } catch (error: any) {
        step.status = 'failed';
        step.error = error.message;
        step.endTime = new Date().toISOString();
        
        this.observer.onStepError(step, error, plan.id);
        
        // 评估错误
        const evaluation = await this.evaluator.evaluateError(step, error, context);
        
        if (evaluation.shouldRetry) {
          // 重试步骤（最多重试3次）
          const retryCount = (step as any).retryCount || 0;
          if (retryCount < 3) {
            (step as any).retryCount = retryCount + 1;
            step.status = 'pending';
            i--; // 回退一步，重新执行
            continue;
          }
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
   * 支持 ${step_id.result} 和 ${step_id.result.key} 格式
   * 注意：当引用 ${step_id.result} 时，stepResult 本身就是结果值，不需要再访问 .result 属性
   */
  private resolveParameters(parameters: any, context: ExecutionContext): any {
    if (typeof parameters === 'string') {
      // 替换 ${step_id.result} 或 ${step_id.result.key} 格式的变量引用
      // 支持 step_1, step_2 等格式（包含下划线和数字）
      return parameters.replace(/\$\{([\w_]+)(?:\.(\w+))?(?:\.(\w+))?\}/g, (match, stepId, key1, key2) => {
        // 首先尝试从 stepResults 中获取
        let stepResult = context.stepResults.get(stepId);
        
        // 如果 stepResults 中没有，尝试从步骤对象中获取
        if (stepResult === undefined) {
          const step = context.plan.steps.find(s => s.id === stepId);
          if (step && step.result !== undefined) {
            stepResult = step.result;
          }
        }
        
        if (stepResult === undefined) {
          console.warn(`[Executor] 变量 ${stepId} 未找到，保持原样: ${match}`);
          return match; // 如果步骤结果不存在，保持原样
        }
        
        // 处理 ${step_id.result} 格式
        // 如果 key1 是 'result'，说明是 ${step_id.result}，直接返回 stepResult
        if (key1 === 'result') {
          if (key2) {
            // ${step_id.result.key2} 格式：从结果对象中获取 key2
            const value = (stepResult && typeof stepResult === 'object' && stepResult[key2]) || match;
            return value !== undefined && value !== null ? String(value) : match;
          }
          // ${step_id.result} 格式：直接返回结果
          // 如果结果是字符串或数字，直接返回
          if (typeof stepResult === 'string' || typeof stepResult === 'number' || typeof stepResult === 'boolean') {
            return String(stepResult);
          }
          // 如果是对象，转换为JSON字符串（但通常我们期望的是直接值）
          return String(stepResult);
        }
        
        // 处理 ${step_id.key1} 格式（直接访问步骤结果的属性）
        if (key1 && key1 !== 'result') {
          if (key2) {
            // ${step_id.key1.key2} 格式
            const value = (stepResult && typeof stepResult === 'object' && stepResult[key1]?.[key2]) || match;
            return value !== undefined && value !== null ? String(value) : match;
          }
          // ${step_id.key1} 格式
          const value = (stepResult && typeof stepResult === 'object' && stepResult[key1]) || match;
          return value !== undefined && value !== null ? String(value) : match;
        }
        
        // ${step_id} 格式：直接返回结果
        if (typeof stepResult === 'string' || typeof stepResult === 'number' || typeof stepResult === 'boolean') {
          return String(stepResult);
        }
        
        // 如果是对象，转换为字符串
        return String(stepResult);
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

