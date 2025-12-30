/**
 * 服务进程检测配置接口
 * 定义了系统进程健康检测的配置参数
 */

export interface ProcessCheckConfig {
    /** 进程名称 */
    processName: string;
    /** 期望的进程状态 */
    expectedStatus?: 'running' | 'stopped';
    /** 期望的进程ID */
    expectedPid?: number;
    /** 最小内存使用量（MB） */
    minMemoryUsage?: number;
    /** 最大内存使用量（MB） */
    maxMemoryUsage?: number;
    /** CPU 使用率上限（百分比） */
    maxCpuUsage?: number;
}