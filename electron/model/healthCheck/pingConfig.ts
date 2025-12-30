/**
 * Ping 检测配置接口
 * 定义了网络连通性检测的配置参数
 */

export interface PingConfig {
    /** 目标主机地址 */
    host: string;
    /** ping 次数 */
    count?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 期望响应时间上限（毫秒） */
    maxResponseTime?: number;
}