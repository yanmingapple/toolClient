/**
 * DNS 解析检测功能
 * 提供域名解析验证和 DNS 服务器可用性检测
 */

import { EventEmitter } from 'events';
import {
    CheckResult,
    DnsCheckConfig
} from '../model/healthCheck';

/**
 * DNS 解析检测器接口
 * 专门负责域名解析功能验证和 DNS 服务器状态检测
 */
export interface DnsChecker extends EventEmitter {

    /**
     * DNS 解析检测
     * @param config DNS 检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkDns(config: DnsCheckConfig): Promise<CheckResult>;

    /**
     * 批量 DNS 检测
     * @param configs DNS 检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkDnsBatch(configs: DnsCheckConfig[]): Promise<CheckResult[]>;

    /**
     * DNS 服务器可用性检测
     * @param dnsServer DNS 服务器地址
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    checkDnsServer(dnsServer: string, timeout?: number): Promise<CheckResult>;

    /**
     * 反向 DNS 解析（IP 到域名）
     * @param ip IP 地址
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    reverseDns(ip: string, timeout?: number): Promise<CheckResult>;

    /**
     * DNS 记录类型检测
     * @param domain 域名
     * @param recordType 记录类型（A, AAAA, MX, TXT, CNAME, NS等）
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    checkDnsRecord(domain: string, recordType: string, timeout?: number): Promise<CheckResult>;

    // ===== 事件监听 =====
    /**
     * DNS 检测进度事件
     */
    on(event: 'dns_progress', listener: (current: number, total: number, currentDomain: string) => void): this;

    /**
     * DNS 检测完成事件
     */
    on(event: 'dns_completed', listener: (results: CheckResult[]) => void): this;
}