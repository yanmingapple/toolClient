/**
 * 检测器选项配置接口
 * 定义了健康检测器的全局配置参数
 */

export interface HealthCheckerOptions {
    /** 默认超时时间（毫秒） */
    defaultTimeout?: number;
    /** 重试次数 */
    retryCount?: number;
    /** 重试间隔（毫秒） */
    retryInterval?: number;
    /** 并发检测数量限制 */
    concurrencyLimit?: number;
    /** 是否启用详细日志 */
    verboseLogging?: boolean;
    /** 自定义 ping 命令参数 */
    pingOptions?: string[];
    /** 是否检查 ICMP 权限（在某些系统上需要管理员权限） */
    requireIcmpPermission?: boolean;
}