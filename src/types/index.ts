// 模块导出
export * from './objectPanel'
export * from './leftTree'
export * from './headerBar'

// 服务监控相关枚举
/**
 * 服务健康检查状态枚举
 */
export enum ServiceHealthStatus {
    /** 健康 */
    HEALTHY = 'healthy',
    /** 不健康 */
    UNHEALTHY = 'unhealthy',
    /** 警告 */
    WARNING = 'warning',
    /** 未知 */
    UNKNOWN = 'unknown',
    /** 超时 */
    TIMEOUT = 'timeout'
}

/**
 * 服务监控状态映射
 */
export enum ServiceMonitorStatus {
    /** 运行中 */
    RUNNING = '运行中',
    /** 已停止 */
    STOPPED = '已停止',
    /** 启动中 */
    STARTING = '启动中',
    /** 停止中 */
    STOPPING = '停止中'
}
