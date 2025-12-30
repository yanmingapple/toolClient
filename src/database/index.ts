import { ConnectionConfig } from '../types/leftTree/connection';
import { ConnectionType } from '../enum/database';
import { SQLiteClient } from './sqlite';

/**
 * 数据库客户端接口
 * 定义了所有数据库客户端必须实现的方法
 */
export interface DatabaseClient {
  /**
   * 连接到数据库
   */
  connect(): Promise<void>;

  /**
   * 断开数据库连接
   */
  disconnect(): Promise<void>;

  /**
   * 执行SQL查询
   * @param sql SQL查询语句
   * @param params 查询参数
   */
  execute(sql: string, params?: any[]): Promise<any>;

  /**
   * 执行多个SQL语句
   * @param sql SQL查询语句
   */
  executeBatch(sql: string): Promise<any>;

  /**
   * 获取数据库版本信息
   */
  getVersion(): Promise<string>;

  /**
   * 测试连接是否有效
   */
  ping(): Promise<boolean>;
}

/**
 * 创建数据库客户端实例
 * @param config 连接配置
 */
export function createDatabaseClient(config: ConnectionConfig): DatabaseClient {
  switch (config.type) {
    case ConnectionType.SQLite:
      return new SQLiteClient(config);
    // 其他数据库类型的处理将在这里添加
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}
