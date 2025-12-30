/**
 * 数据库模块统一导出
 * 统一导出所有数据库相关的枚举、接口和类型
 */

// ===== 接口导出 =====
export type { ConnectionConfig } from './Connection';
export type { ConnectionInfo } from './ConnectionInfo';

// ===== 枚举导出 =====
export { ConnectionType } from './connectionType';
export { ConnectionStatus } from './connectionStatus';
export { DatabaseStatus } from './databaseStatus';