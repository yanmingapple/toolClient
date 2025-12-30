/**
 * 检测结果状态枚举
 * 定义了服务健康检测的各种可能状态
 */

export enum CheckStatus {
    HEALTHY = 'healthy',        // 健康
    UNHEALTHY = 'unhealthy',    // 不健康
    WARNING = 'warning',        // 警告
    UNKNOWN = 'unknown',        // 未知
    TIMEOUT = 'timeout'         // 超时
}