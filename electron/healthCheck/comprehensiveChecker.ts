/**
 * 综合服务健康检测器
 * 整合所有功能模块，提供统一的健康检测入口
 */

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

// 导入所有功能检测器接口
import {
    NetworkChecker
} from './networkChecker';

import {
    PortChecker
} from './portChecker';

import {
    HttpChecker
} from './httpChecker';

import {
    SystemChecker
} from './systemChecker';

import {
    DnsChecker
} from './dnsChecker';

import {
    CertificateChecker
} from './certificateChecker';

/**
 * 综合服务健康检测器接口
 * 整合所有检测功能，提供统一的健康检测入口
 * 使用组合模式而非继承，避免复杂的多重继承问题
 */
export interface ComprehensiveHealthChecker {

    // ===== 组合的检测器实例 =====
    /** 网络连接检测器 */
    networkChecker: NetworkChecker;

    /** 端口状态检测器 */
    portChecker: PortChecker;

    /** HTTP/HTTPS 服务检测器 */
    httpChecker: HttpChecker;

    /** 系统资源检测器 */
    systemChecker: SystemChecker;

    /** DNS 解析检测器 */
    dnsChecker: DnsChecker;

    /** SSL/TLS 证书检测器 */
    certificateChecker: CertificateChecker;

    // ===== 事件监听接口 =====
    /**
     * 全局检测进度事件
     */
    on(event: 'global_progress', listener: (current: number, total: number, currentCheck: string) => void): this;

    /**
     * 全局检测完成事件
     */
    on(event: 'global_completed', listener: (results: CheckResult[]) => void): this;

    /**
     * 检测序列完成事件
     */
    on(event: 'sequence_completed', listener: (sequenceName: string, results: CheckResult[]) => void): this;

    /**
     * 移除事件监听器
     */
    off(event: string, listener: (...args: any[]) => void): this;

    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event?: string): this;

    // ===== 复合检测方法 =====
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

    /**
     * 快速健康检测（核心功能）
     * @param target 目标主机或服务
     * @param type 检测类型（'basic', 'full', 'custom'）
     * @returns Promise<CheckResult> 检测结果
     */
    quickHealthCheck(target: string, type?: 'basic' | 'full' | 'custom'): Promise<CheckResult>;

    /**
     * 自定义检测流程
     * @param checkSequence 检测序列配置
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    customCheckSequence(checkSequence: Array<{
        type: 'ping' | 'port' | 'http' | 'process' | 'system' | 'dns' | 'certificate';
        config: any;
        name: string;
    }>): Promise<CheckResult[]>;


}

/**
 * 健康检测器工厂接口
 * 用于创建不同类型的健康检测器实例
 */
export interface HealthCheckerFactory {

    /**
     * 创建网络检测器
     * @returns NetworkChecker 网络检测器实例
     */
    createNetworkChecker(): NetworkChecker;

    /**
     * 创建端口检测器
     * @returns PortChecker 端口检测器实例
     */
    createPortChecker(): PortChecker;

    /**
     * 创建 HTTP 检测器
     * @returns HttpChecker HTTP 检测器实例
     */
    createHttpChecker(): HttpChecker;

    /**
     * 创建系统检测器
     * @returns SystemChecker 系统检测器实例
     */
    createSystemChecker(): SystemChecker;

    /**
     * 创建 DNS 检测器
     * @returns DnsChecker DNS 检测器实例
     */
    createDnsChecker(): DnsChecker;

    /**
     * 创建证书检测器
     * @returns CertificateChecker 证书检测器实例
     */
    createCertificateChecker(): CertificateChecker;

    /**
     * 创建综合健康检测器
     * @returns ComprehensiveHealthChecker 综合健康检测器实例
     */
    createComprehensiveChecker(): ComprehensiveHealthChecker;
}