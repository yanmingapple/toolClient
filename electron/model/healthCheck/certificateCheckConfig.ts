/**
 * 证书检测配置接口
 * 定义了 SSL/TLS 证书健康检测的配置参数
 */

export interface CertificateCheckConfig {
    /** 域名或主机地址 */
    hostname: string;
    /** 端口号 */
    port?: number;
    /** 证书有效期剩余天数警告阈值 */
    warningDays?: number;
    /** 证书有效期剩余天数错误阈值 */
    errorDays?: number;
}