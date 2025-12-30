/**
 * HTTP 健康检测配置接口
 * 定义了 HTTP/HTTPS 服务健康检测的配置参数
 */

export interface HttpHealthCheckConfig {
    /** 目标 URL */
    url: string;
    /** HTTP 方法 */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
    /** 请求超时时间（毫秒） */
    timeout?: number;
    /** 期望的状态码 */
    expectedStatusCode?: number;
    /** 期望的响应内容 */
    expectedContent?: string;
    /** 请求头 */
    headers?: Record<string, string>;
    /** 请求体 */
    body?: any;
    /** 是否检查 SSL 证书 */
    checkCertificate?: boolean;
}