import { TaskPlan, TaskStep, ExecutionHistory } from './types';

/**
 * 观察器（Observer）
 * 负责监控执行过程，记录执行历史
 */
export class Observer {
  private executionHistory: ExecutionHistory[] = [];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private ipcSender: ((channel: string, data: any) => void) | null = null;
  private planId: string | null = null;

  /**
   * 设置IPC发送器（用于向前端发送事件）
   */
  setIpcSender(sender: (channel: string, data: any) => void): void {
    this.ipcSender = sender;
  }

  /**
   * 设置当前计划ID
   */
  setPlanId(planId: string): void {
    this.planId = planId;
  }

  /**
   * 注册事件监听器
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }

    // 通过IPC发送到前端
    if (this.ipcSender) {
      const eventData = {
        event,
        planId: this.planId || data.planId || data.id,
        data,
        timestamp: new Date().toISOString()
      };
      console.log('[Observer] 发送IPC事件:', event, eventData);
      this.ipcSender('ai:plan-execution-event', eventData);
    } else {
      console.warn('[Observer] IPC发送器未设置，事件无法发送到前端:', event);
    }
  }

  /**
   * 计划开始
   */
  onPlanStart(plan: TaskPlan): void {
    console.log(`[Plan Start] ${plan.goal}`);
    const history: ExecutionHistory = {
      type: 'plan_start',
      planId: plan.id,
      timestamp: new Date().toISOString(),
      data: plan
    };
    this.executionHistory.push(history);
    this.emit('plan_start', plan);
  }

  /**
   * 步骤开始
   */
  onStepStart(step: TaskStep, planId: string): void {
    console.log(`[Step Start] ${step.description}`);
    const history: ExecutionHistory = {
      type: 'step_start',
      planId: planId,
      stepId: step.id,
      timestamp: new Date().toISOString(),
      data: step
    };
    this.executionHistory.push(history);
    this.emit('step_start', { step, planId });
  }

  /**
   * 步骤完成
   */
  onStepComplete(step: TaskStep, result: any, planId: string): void {
    console.log(`[Step Complete] ${step.description}`, result);
    const history: ExecutionHistory = {
      type: 'step_complete',
      planId: planId,
      stepId: step.id,
      timestamp: new Date().toISOString(),
      data: { step, result }
    };
    this.executionHistory.push(history);
    this.emit('step_complete', { step, result, planId });
  }

  /**
   * 步骤错误
   */
  onStepError(step: TaskStep, error: Error, planId: string): void {
    console.error(`[Step Error] ${step.description}`, error);
    const history: ExecutionHistory = {
      type: 'step_error',
      planId: planId,
      stepId: step.id,
      timestamp: new Date().toISOString(),
      data: { step, error: error.message }
    };
    this.executionHistory.push(history);
    this.emit('step_error', { step, error, planId });
  }

  /**
   * 计划完成
   */
  onPlanComplete(plan: TaskPlan): void {
    console.log(`[Plan Complete] ${plan.goal}`);
    const history: ExecutionHistory = {
      type: 'plan_complete',
      planId: plan.id,
      timestamp: new Date().toISOString(),
      data: plan
    };
    this.executionHistory.push(history);
    this.emit('plan_complete', plan);
  }

  /**
   * 计划错误
   */
  onPlanError(plan: TaskPlan, error: Error): void {
    console.error(`[Plan Error] ${plan.goal}`, error);
    const history: ExecutionHistory = {
      type: 'plan_error',
      planId: plan.id,
      timestamp: new Date().toISOString(),
      data: { plan, error: error.message }
    };
    this.executionHistory.push(history);
    this.emit('plan_error', { plan, error });
  }

  /**
   * 需要重新规划
   */
  onReplanNeeded(plan: TaskPlan, step: TaskStep, reason: string): void {
    console.log(`[Replan Needed] ${reason}`);
    const history: ExecutionHistory = {
      type: 'replan_needed',
      planId: plan.id,
      stepId: step.id,
      timestamp: new Date().toISOString(),
      data: { plan, step, reason }
    };
    this.executionHistory.push(history);
    this.emit('replan_needed', { plan, step, reason });
  }

  /**
   * 计划停止
   */
  onPlanStop(plan: TaskPlan, reason: string): void {
    console.log(`[Plan Stop] ${reason}`);
    const history: ExecutionHistory = {
      type: 'plan_stop',
      planId: plan.id,
      timestamp: new Date().toISOString(),
      data: { plan, reason }
    };
    this.executionHistory.push(history);
    this.emit('plan_stop', { plan, reason });
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(planId?: string): ExecutionHistory[] {
    if (planId) {
      return this.executionHistory.filter(h => h.planId === planId);
    }
    return [...this.executionHistory];
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

