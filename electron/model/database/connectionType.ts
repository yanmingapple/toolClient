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