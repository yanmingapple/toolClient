/**
 * 系统资源检测配置接口
 * 定义了系统资源健康检测的配置参数
 */

export interface SystemResourceCheckConfig {
    /** CPU 使用率上限（百分比） */
    maxCpuUsage?: number;
    /** 内存使用率上限（百分比） */
    maxMemoryUsage?: number;
    /** 磁盘使用率上限（百分比） */
    maxDiskUsage?: number;
    /** 负载平均值上限（1分钟） */
    maxLoadAverage1min?: number;
}