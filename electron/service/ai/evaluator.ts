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

    // 检查结果格式
    if (typeof result === 'object' && result.success === false) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: result.message || 'Step execution failed'
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
   */
  async evaluateError(
    step: TaskStep,
    error: Error,
    context: ExecutionContext
  ): Promise<EvaluationResult> {
    const errorMessage = error.message.toLowerCase();
    
    // 根据错误类型决定行动
    if (errorMessage.includes('not found') || errorMessage.includes('不存在') || errorMessage.includes('未找到')) {
      return {
        success: false,
        shouldReplan: true,
        shouldStop: false,
        shouldRetry: false,
        reason: 'Resource not found, need to replan'
      };
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('网络') || errorMessage.includes('connection')) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: false,
        shouldRetry: true,
        reason: 'Network error, retry'
      };
    }

    if (errorMessage.includes('permission') || errorMessage.includes('权限') || errorMessage.includes('denied')) {
      return {
        success: false,
        shouldReplan: false,
        shouldStop: true,
        shouldRetry: false,
        reason: 'Permission denied'
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

