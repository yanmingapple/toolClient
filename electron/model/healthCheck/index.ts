/**
 * 健康检测模块类型定义导出
 * 统一导出所有健康检测相关的类型和枚举
 */

// ===== 枚举导出 =====
export { CheckStatus } from './checkStatus';

// ===== 接口导出 =====
export type { CheckResult } from './checkResult';
export type { PingConfig } from './pingConfig';
export type { PortCheckConfig } from './portCheckConfig';
export type { HttpHealthCheckConfig } from './httpHealthCheckConfig';
export type { ProcessCheckConfig } from './processCheckConfig';
export type { SystemResourceCheckConfig } from './systemResourceCheckConfig';
export type { DnsCheckConfig } from './dnsCheckConfig';
export type { CertificateCheckConfig } from './certificateCheckConfig';
export type { HealthCheckerOptions } from './healthCheckerOptions';
export type { CheckHistoryRecord } from './checkHistoryRecord';
export type { CheckStatistics } from './checkStatistics';