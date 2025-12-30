/**
 * 服务健康检测模块 - 功能模块化版本
 * 
 * 提供完整的服务健康状态检测功能，已按功能拆分为独立的检测模块：
 * - 网络检测 (NetworkChecker)
 * - 端口检测 (PortChecker) 
 * - HTTP检测 (HttpChecker)
 * - 系统检测 (SystemChecker)
 * - DNS检测 (DnsChecker)
 * - 证书检测 (CertificateChecker)
 * - 综合检测 (ComprehensiveHealthChecker)
 */

// ===== 核心类型定义 =====
export * from '../model/healthCheck';
export { CheckStatus } from '../model/healthCheck/checkStatus';

// ===== 按功能模块的检测器接口 =====

// 网络连接检测
export type { NetworkChecker } from './networkChecker';

// 端口状态检测  
export type { PortChecker } from './portChecker';

// HTTP/HTTPS 服务检测
export type { HttpChecker } from './httpChecker';

// 进程和系统资源检测
export type { SystemChecker } from './systemChecker';

// DNS 解析检测
export type { DnsChecker } from './dnsChecker';

// SSL/TLS 证书检测
export type { CertificateChecker } from './certificateChecker';

// 综合健康检测器
export type { ComprehensiveHealthChecker, HealthCheckerFactory } from './comprehensiveChecker';

// ===== 向后兼容导出 =====

// 原始的 ServiceHealthChecker 接口（保持向后兼容）
export type { ServiceHealthChecker } from './checker';
export type { ServiceHealthChecker as HealthCheckerInterface } from './checker';