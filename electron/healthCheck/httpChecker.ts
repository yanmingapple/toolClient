/**
 * HTTP/HTTPS 服务检测功能
 * 提供 Web 服务健康状态检测功能
 */

import { EventEmitter } from 'events';
import {
    CheckResult,
    HttpHealthCheckConfig
} from '../model/healthCheck';

/**
 * HTTP 服务检测器接口
 * 专门负责 Web 服务和 API 的健康状态检测
 */
export interface HttpChecker extends EventEmitter {
    
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
    
    /**
     * HTTP 响应时间测试
     * @param url 目标 URL
     * @param method HTTP 方法
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    testResponseTime(url: string, method?: 'GET' | 'POST', timeout?: number): Promise<CheckResult>;
    
    /**
     * HTTP 内容验证检测
     * @param url 目标 URL
     * @param expectedContent 期望的响应内容
     * @param method HTTP 方法
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    validateContent(url: string, expectedContent: string, method?: 'GET' | 'POST', timeout?: number): Promise<CheckResult>;

    // ===== 事件监听 =====
    /**
     * HTTP 检测进度事件
     */
    on(event: 'http_progress', listener: (current: number, total: number, currentUrl: string) => void): this;
    
    /**
     * HTTP 检测完成事件
     */
    on(event: 'http_completed', listener: (results: CheckResult[]) => void): this;
}