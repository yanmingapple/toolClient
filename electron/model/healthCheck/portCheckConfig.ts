/**
 * 端口检测配置接口
 * 定义了网络端口状态检测的配置参数
 */

export interface PortCheckConfig {
    /** 目标主机地址 */
    host: string;
    /** 端口号（netstat 模式下可为空） */
    port?: number;
    /** 连接超时时间（毫秒） */
    timeout?: number;
    /** 协议类型 */
    protocol?: 'tcp' | 'udp' | 'netstat';
    /** 期望的连接状态 */
    expectedStatus?: 'open' | 'closed';
}