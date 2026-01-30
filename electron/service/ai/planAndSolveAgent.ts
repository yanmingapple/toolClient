import { AIService } from '../aiService';
import { ToolRegistry } from './toolRegistry';
import { Planner } from './planner';
import { Executor } from './executor';
import { Observer } from './observer';
import { Evaluator } from './evaluator';
import { TaskPlan } from './types';

/**
 * Plan-and-Solve Agent
 * 整合 Planner、Executor、Observer、Evaluator 的完整智能体
 */
export class PlanAndSolveAgent {
  private planner: Planner;
  private executor: Executor;
  private observer: Observer;
  private evaluator: Evaluator;
  private toolRegistry: ToolRegistry;
  private sessionId: string;
  private contextManager: any = null;

  constructor(
    aiService: AIService,
    toolRegistry: ToolRegistry,
    sessionId?: string,
    ipcSender?: (channel: string, data: any) => void
  ) {
    this.toolRegistry = toolRegistry;
    this.sessionId = sessionId || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.observer = new Observer();
    // 设置IPC发送器（如果提供）
    if (ipcSender) {
      this.observer.setIpcSender(ipcSender);
    }
    this.evaluator = new Evaluator(aiService, this.sessionId);
    this.planner = new Planner(aiService, toolRegistry, this.sessionId);
    this.executor = new Executor(toolRegistry, this.observer, this.evaluator);
  }

  /**
   * 获取会话ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * 获取上下文管理器
   */
  async getContextManager(): Promise<any> {
    if (!this.contextManager) {
      const { ContextManager } = await import('./contextManager');
      this.contextManager = ContextManager.getInstance();
    }
    return this.contextManager;
  }

  /**
   * 清除上下文
   */
  async clearContext(): Promise<void> {
    const contextManager = await this.getContextManager();
    contextManager.clearContext(this.sessionId);
  }

  /**
   * 执行任务（Plan-and-Solve 模式）
   * @param goal 用户目标（自然语言描述）
   * @param context 上下文信息
   * @param maxReplans 最大重新规划次数（默认3次）
   */
  async execute(
    goal: string,
    context?: any,
    maxReplans: number = 3
  ): Promise<TaskPlan> {
    let plan: TaskPlan | null = null;
    let replanCount = 0;

    while (replanCount < maxReplans) {
      try {
        // 1. 规划阶段
        if (replanCount === 0) {
          plan = await this.planner.createPlan(goal, context);
          // 设置计划ID到Observer（必须在onPlanStart之前设置）
          if (plan) {
            this.observer.setPlanId(plan.id);
            // 通知Observer计划开始（这会触发plan_start事件）
            this.observer.onPlanStart(plan);
          }
        } else {
          // 重新规划（基于之前的执行历史）
          if (!plan) {
            throw new Error('Cannot replan: previous plan is null');
          }
          const previousContext = {
            ...context,
            previousPlan: plan,
            failedSteps: plan.steps.filter(s => s.status === 'failed'),
            executionHistory: this.observer.getExecutionHistory(plan.id)
          };
          const newPlan = await this.planner.createPlan(goal, previousContext);
          if (newPlan) {
            this.observer.setPlanId(newPlan.id);
            this.observer.onPlanStart(newPlan);
            plan = newPlan;
          }
        }

        if (!plan) {
          throw new Error('Failed to create plan');
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
          console.log(`[Replan] Attempt ${replanCount + 1}/${maxReplans}`);
          continue;
        }

        return plan;

      } catch (error: any) {
        console.error(`[PlanAndSolveAgent] 执行错误:`, error);
        if (error.message && error.message.includes('Replan needed') && replanCount < maxReplans - 1) {
          replanCount++;
          console.log(`[Replan] Attempt ${replanCount + 1}/${maxReplans} - ${error.message}`);
          continue;
        }
        // 确保错误被正确记录
        if (plan) {
          this.observer.onPlanError(plan, error);
        }
        throw error;
      }
    }

    if (!plan) {
      throw new Error('Failed to create plan after all replan attempts');
    }
    return plan;
  }

  /**
   * 获取观察器（用于监听执行事件）
   */
  getObserver(): Observer {
    return this.observer;
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(planId?: string) {
    return this.observer.getExecutionHistory(planId);
  }
}

