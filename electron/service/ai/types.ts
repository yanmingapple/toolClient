/**
 * Plan-and-Solve 架构相关类型定义
 */

/**
 * 任务步骤
 */
export interface TaskStep {
  id: string;
  order: number;              // 执行顺序
  description: string;         // 步骤描述
  tool: string;               // 使用的工具
  parameters: any;            // 工具参数
  dependencies: string[];      // 依赖的步骤ID
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  result?: any;               // 执行结果
  error?: string;             // 错误信息
  startTime?: string;
  endTime?: string;
}

/**
 * 任务计划
 */
export interface TaskPlan {
  id: string;
  goal: string;                // 用户目标
  steps: TaskStep[];          // 任务步骤列表
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * 执行上下文
 */
export interface ExecutionContext {
  plan: TaskPlan;
  currentStepIndex: number;
  stepResults: Map<string, any>;  // 步骤ID -> 执行结果
  variables: Map<string, any>;     // 变量存储（用于步骤间传递数据）
}

/**
 * 评估结果
 */
export interface EvaluationResult {
  success: boolean;
  shouldReplan: boolean;
  shouldStop: boolean;
  shouldRetry: boolean;
  reason?: string;
}

/**
 * 执行历史记录
 */
export interface ExecutionHistory {
  type: 'plan_start' | 'step_start' | 'step_complete' | 'step_error' | 'plan_complete' | 'plan_error' | 'replan_needed' | 'plan_stop';
  planId: string;
  stepId?: string;
  timestamp: string;
  data: any;
}

