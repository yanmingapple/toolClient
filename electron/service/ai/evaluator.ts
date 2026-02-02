import { AIService } from '../aiService';
import { TaskStep, ExecutionContext, EvaluationResult } from './types';

/**
 * 评估器（Evaluator）
 * 负责评估步骤执行结果，决定下一步行动
 */
export class Evaluator {
  private aiService: AIService;
  private sessionId: string;

  constructor(aiService: AIService, sessionId?: string) {
    this.aiService = aiService;
    this.sessionId = sessionId || `eval_${Date.now()}`;
  }

  /**
   * 设置会话ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * 评估步骤执行结果
   */
  async evaluateStep(
    step: TaskStep,
    result: any,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    // 增强：更详细的结果验证
    const validation = this.validateStepResult(step, result);
    if (!validation.valid) {
      return {
        success: false,
        shouldReplan: validation.needsReplan || false,
        shouldStop: validation.shouldStop || false,
        shouldRetry: validation.shouldRetry || false,
        reason: validation.reason || 'Step result validation failed'
      };
    }

    // 增强：检查结果是否符合步骤预期
    const meetsExpectation = await this.checkResultExpectation(step, result, context);
    if (!meetsExpectation.met) {
      return {
        success: false,
        shouldReplan: meetsExpectation.needsReplan || false,
        shouldStop: false,
        shouldRetry: meetsExpectation.shouldRetry || false,
        reason: meetsExpectation.reason || 'Result does not meet expectation'
      };
    }

    // 复杂评估：使用 AI 评估（对于需要判断的场景）
    if (this.needsAIEvaluation(step)) {
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
   * 验证步骤结果
   */
  private validateStepResult(step: TaskStep, result: any): {
    valid: boolean;
    needsReplan?: boolean;
    shouldStop?: boolean;
    shouldRetry?: boolean;
    reason?: string;
  } {
    // 空结果检查
    if (result === null || result === undefined) {
      return {
        valid: false,
        shouldRetry: true,
        reason: '步骤返回空结果'
      };
    }

    // 错误结果检查
    if (result && typeof result === 'object' && result.error) {
      return {
        valid: false,
        shouldRetry: true,
        reason: result.error
      };
    }

    // 检查结果格式
    if (typeof result === 'object' && result.success === false) {
      return {
        valid: false,
        shouldRetry: true,
        reason: result.message || '步骤执行失败'
      };
    }

    // 数组结果检查（如果步骤期望返回数组）
    // 排除日期范围相关的步骤（这些应该返回对象）
    const isDateRangeStep = step.description.includes('起始日期') || 
                           step.description.includes('结束日期') || 
                           step.description.includes('日期范围') ||
                           step.description.includes('月份') && (step.description.includes('起始') || step.description.includes('结束'));
    
    if (!isDateRangeStep && (step.description.includes('列表') || step.description.includes('数组') || step.description.includes('所有'))) {
      // 进一步检查：如果描述中包含"所有"但同时也包含"日期"、"查询"等，可能是查询条件，不强制要求数组
      const isQueryCondition = step.description.includes('用于') || 
                               step.description.includes('查询') ||
                               step.description.includes('条件');
      
      if (!isQueryCondition && !Array.isArray(result)) {
        return {
          valid: false,
          needsReplan: true,
          reason: '步骤期望返回数组，但实际返回了其他类型'
        };
      }
      // 验证数组不为空（如果步骤描述暗示应该有数据）
      if (Array.isArray(result) && step.description.includes('获取') && result.length === 0) {
        console.warn(`步骤 ${step.id} 返回空数组，可能没有找到数据`);
      }
    }

    // 对象结果检查（如果步骤期望返回对象）
    if (step.description.includes('对象') || step.description.includes('详情') || step.description.includes('信息')) {
      if (typeof result !== 'object' || Array.isArray(result)) {
        return {
          valid: false,
          needsReplan: true,
          reason: '步骤期望返回对象，但实际返回了其他类型'
        };
      }
    }

    return { valid: true };
  }

  /**
   * 检查结果是否符合预期（使用 AI 判断）
   */
  private async checkResultExpectation(
    step: TaskStep,
    result: any,
    context: ExecutionContext
  ): Promise<{
    met: boolean;
    needsReplan?: boolean;
    shouldRetry?: boolean;
    reason?: string;
  }> {
    // 对于关键步骤，使用 AI 评估结果是否符合预期
    const criticalKeywords = ['创建', '更新', '删除', '保存', '重要', '关键'];
    if (criticalKeywords.some(keyword => step.description.includes(keyword))) {
      try {
        const evaluation = await this.evaluateWithAI(step, result, context);
        return {
          met: evaluation.success,
          needsReplan: evaluation.shouldReplan,
          shouldRetry: evaluation.shouldRetry,
          reason: evaluation.reason
        };
      } catch (error) {
        // AI 评估失败，降级到简单检查
        console.warn(`[Evaluator] AI 评估失败，使用简单检查:`, error);
        return { met: true };
      }
    }

    return { met: true };
  }

  /**
   * 判断是否需要AI评估
   */
  private needsAIEvaluation(step: TaskStep): boolean {
    const aiKeywords = ['分析', '判断', '评估', '检查', '验证', '确认'];
    return aiKeywords.some(keyword => step.description.includes(keyword));
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

步骤描述：${step.description}
执行结果：${JSON.stringify(result, null, 2)}

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

    try {
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

      const response = await this.aiService.callAI(prompt, provider, false, this.sessionId);
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const evaluation = JSON.parse(jsonStr);
      
      return {
        success: evaluation.success !== false,
        shouldReplan: evaluation.shouldReplan === true,
        shouldStop: evaluation.shouldStop === true,
        shouldRetry: false,
        reason: evaluation.reason
      };
    } catch (error: any) {
      console.error('AI evaluation failed:', error);
      // 降级到简单评估
      return {
        success: true,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: false
      };
    }
  }

  /**
   * 评估错误
   * 使用 AI 框架智能判断错误处理策略，而不是硬编码规则
   */
  async evaluateError(
    step: TaskStep,
    error: Error,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    const errorMessage = error.message.toLowerCase();
    
    // 特殊错误处理：工具名为 null（逻辑整合步骤，应该跳过）
    if (errorMessage.includes('tool null not found') || errorMessage.includes('tool null')) {
      return {
        success: true, // 标记为成功，因为这是预期的（逻辑步骤不需要工具）
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Logical step, no tool needed'
      };
    }

    // 网络错误：重试
    if (errorMessage.includes('timeout') || errorMessage.includes('网络') || errorMessage.includes('connection') || errorMessage.includes('econnrefused')) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: 'Network error, retry'
      };
    }

    // 权限错误：停止执行
    if (errorMessage.includes('permission') || errorMessage.includes('权限') || errorMessage.includes('denied') || errorMessage.includes('eacces')) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: true,
        shouldRetry: false,
        reason: 'Permission denied'
      };
    }

    // 对于 "not found" 错误，使用 AI 判断是否需要 replan
    // 不是所有 "not found" 都需要 replan（比如可选文件不存在）
    if (errorMessage.includes('not found') || errorMessage.includes('不存在') || errorMessage.includes('未找到')) {
      // 检查是否是可选资源（如配置文件、日志文件等）
      const optionalResources = ['work-patterns', 'best-times', 'task-preferences', 'log', 'config', 'preference'];
      const isOptional = optionalResources.some(resource => 
        step.description.toLowerCase().includes(resource) || 
        errorMessage.includes(resource)
      );

      if (isOptional) {
        // 可选资源不存在，跳过该步骤
        console.log(`[Evaluator] 可选资源不存在，跳过步骤: ${step.description}`);
        return {
          success: true, // 标记为成功，因为可选资源不存在不影响整体流程
          shouldReplan: false,
          shouldStop: false,
          shouldRetry: false,
          reason: 'Optional resource not found, skip step'
        };
      }

      // 关键资源不存在，需要 replan
      return {
        success: false,
        shouldReplan: true,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Critical resource not found, need to replan'
      };
    }

    // 其他错误：先尝试重试，如果重试失败再考虑 replan
    // 检查是否已经重试过
    const retryCount = (step as any).retryCount || 0;
    if (retryCount < 2) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: `Error occurred, retry (${retryCount + 1}/2): ${error.message}`
      };
    }

    // 重试次数已用完，判断是否需要 replan
    // 如果是工具执行错误，可能需要 replan（工具可能不存在或参数错误）
    if (errorMessage.includes('tool') || errorMessage.includes('工具')) {
      return {
        success: false,
        shouldReplan: true,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Tool execution failed after retries, need to replan'
      };
    }

    // 默认：停止执行
    return {
      success: false,
      shouldReplan: false,
      shouldStop: true,
      shouldRetry: false,
      reason: error.message
    };
  }
}

