/**
 * DNS 解析检测配置接口
 * 定义了 DNS 解析健康检测的配置参数
 */

export interface DnsCheckConfig {
    /** 域名 */
    domain: string;
    /** 期望解析到的 IP 地址列表 */
    expectedIps?: string[];
    /** DNS 服务器地址（可选） */
    dnsServer?: string;
    /** 超时时间（毫秒） */
    timeout?: number;
}