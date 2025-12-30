/**
 * SSL/TLS 证书检测功能
 * 提供 SSL 证书有效期和状态检测
 */

import { EventEmitter } from 'events';
import {
    CheckResult,
    CertificateCheckConfig
} from '../model/healthCheck';

/**
 * SSL/TLS 证书检测器接口
 * 专门负责 SSL/TLS 证书的有效性检查和状态监控
 */
export interface CertificateChecker extends EventEmitter {
    
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
    
    /**
     * 证书链验证
     * @param hostname 主机名
     * @param port 端口号
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    validateCertificateChain(hostname: string, port?: number, timeout?: number): Promise<CheckResult>;
    
    /**
     * 证书颁发机构验证
     * @param hostname 主机名
     * @param port 端口号
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    checkCertificateAuthority(hostname: string, port?: number, timeout?: number): Promise<CheckResult>;
    
    /**
     * 获取证书详细信息
     * @param hostname 主机名
     * @param port 端口号
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    getCertificateDetails(hostname: string, port?: number, timeout?: number): Promise<CheckResult>;

    // ===== 事件监听 =====
    /**
     * 证书检测进度事件
     */
    on(event: 'certificate_progress', listener: (current: number, total: number, currentHostname: string) => void): this;
    
    /**
     * 证书检测完成事件
     */
    on(event: 'certificate_completed', listener: (results: CheckResult[]) => void): this;
}