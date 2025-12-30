/**
 * 检测结果接口
 * 定义了服务健康检测结果的完整数据结构
 */

import { CheckStatus } from './checkStatus';

export interface CheckResult {
    /** 检测项目名称 */
    name: string;
    /** 检测状态 */
    status: CheckStatus;
    /** 响应时间（毫秒） */
    responseTime?: number;
    /** 错误信息 */
    error?: string;
    /** 检测时间戳 */
    timestamp: Date;
    /** 附加信息 */
    details?: any;
}