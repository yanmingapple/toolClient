/**
 * 统计信息接口
 * 定义了健康检测统计信息的数据结构
 */

export interface CheckStatistics {
    /** 总检测次数 */
    totalChecks: number;
    /** 健康状态次数 */
    healthyCount: number;
    /** 不健康状态次数 */
    unhealthyCount: number;
    /** 警告状态次数 */
    warningCount: number;
    /** 未知状态次数 */
    unknownCount: number;
    /** 超时次数 */
    timeoutCount: number;
    /** 平均响应时间（毫秒） */
    averageResponseTime: number;
    /** 最小响应时间（毫秒） */
    minResponseTime: number;
    /** 最大响应时间（毫秒） */
    maxResponseTime: number;
}