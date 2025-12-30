/**
 * 服务健康检测接口定义
 * 定义了完整的服务健康检查器接口，包括所有检测方法
 */

import { EventEmitter } from 'events';
import {
    CheckResult,
    PingConfig,
    PortCheckConfig,
    HttpHealthCheckConfig,
    ProcessCheckConfig,
    SystemResourceCheckConfig,
    DnsCheckConfig,
    CertificateCheckConfig
} from '../model/healthCheck';

/**
 * 服务健康检测器接口
 * 提供多种服务健康状态检测方法，包括网络连接、端口状态、HTTP服务等检测功能
 */
export interface ServiceHealthChecker extends EventEmitter {

    // ===== 网络连接检测 =====
    /**
     * Ping 检测
     * @param config ping 配置
     * @returns Promise<CheckResult> 检测结果
     */
    ping(config: PingConfig): Promise<CheckResult>;

    /**
     * 批量 ping 检测
     * @param configs ping 配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    pingBatch(configs: PingConfig[]): Promise<CheckResult[]>;

    // ===== 端口状态检测 =====
    /**
     * 端口连接检测
     * @param config 端口检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkPort(config: PortCheckConfig): Promise<CheckResult>;

    /**
     * 批量端口检测
     * @param configs 端口检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkPorts(configs: PortCheckConfig[]): Promise<CheckResult[]>;

    /**
     * Netstat 样式的端口监听检测
     * @param host 主机地址
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    netstat(host: string, timeout?: number): Promise<CheckResult>;

    // ===== HTTP/HTTPS 服务检测 =====
    /**
     * HTTP 健康检测
     * @param config HTTP 检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    httpHealthCheck(config: HttpHealthCheckConfig): Promise<CheckResult>;

    /**
     * 批量 HTTP 检测
     * @param configs HTTP 检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    httpBatchCheck(configs: HttpHealthCheckConfig[]): Promise<CheckResult[]>;

    // ===== 进程检测 =====
    /**
     * 服务进程检测
     * @param config 进程检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkProcess(config: ProcessCheckConfig): Promise<CheckResult>;

    /**
     * 批量进程检测
     * @param configs 进程检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkProcesses(configs: ProcessCheckConfig[]): Promise<CheckResult[]>;

    // ===== 系统资源检测 =====
    /**
     * 系统资源使用率检测
     * @param config 系统资源检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkSystemResources(config: SystemResourceCheckConfig): Promise<CheckResult>;

    // ===== DNS 检测 =====
    /**
     * DNS 解析检测
     * @param config DNS 检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkDns(config: DnsCheckConfig): Promise<CheckResult>;

    // ===== SSL/TLS 证书检测 =====
    /**
     * SSL/TLS 证书有效期检测
     * @param config 证书检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkCertificate(config: CertificateCheckConfig): Promise<CheckResult>;

    /**
     * 批量证书检测
     * @param configs 证书检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkCertificates(configs: CertificateCheckConfig[]): Promise<CheckResult[]>;

    // ===== 复合检测 =====
    /**
     * 综合健康检测
     * @param checkConfigs 各种检测配置组合
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    comprehensiveHealthCheck(checkConfigs: {
        ping?: PingConfig[];
        ports?: PortCheckConfig[];
        http?: HttpHealthCheckConfig[];
        processes?: ProcessCheckConfig[];
        system?: SystemResourceCheckConfig;
        dns?: DnsCheckConfig[];
        certificates?: CertificateCheckConfig[];
    }): Promise<CheckResult[]>;

    // ===== 事件监听 =====
    /**
     * 检测进度事件
     */
    on(event: 'progress', listener: (current: number, total: number, currentCheck: string) => void): this;

    /**
     * 检测完成事件
     */
    on(event: 'completed', listener: (results: CheckResult[]) => void): this;

    /**
     * 检测错误事件
     */
    on(event: 'error', listener: (error: Error, config: any) => void): this;
}