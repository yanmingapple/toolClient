/**
 * 数据库类型枚举
 * 支持多种数据库类型的识别和连接配置
 */
export enum ConnectionType {
  MySQL = 'mysql',
  PostgreSQL = 'postgresql',
  MongoDB = 'mongodb',
  Redis = 'redis',
  SQLServer = 'sqlserver',
  SQLite = 'sqlite',
}

/**
 * 连接状态枚举
 * 描述数据库连接的当前状态
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * 数据库状态枚举
 * 描述数据库的加载和访问状态
 */
export enum DatabaseStatus {
  DISCONNECTED = 'disconnected',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  EMPTY = 'empty',
}
