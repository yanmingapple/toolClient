import { ConnectionType } from '../../enum/database'
/**
 * 数据库连接配置接口
 * 定义建立数据库连接所需的所有参数
 */
export interface ConnectionConfig {
  /** 连接唯一标识符 */
  id: string;
  /** 连接名称，用于显示和识别 */
  name: string;
  /** 数据库类型，对应 ConnectionType 枚举 */
  type: ConnectionType;
  /** 数据库服务器地址 */
  host: string;
  /** 数据库服务器端口 */
  port: number;
  /** 数据库用户名 */
  username: string;
  /** 数据库密码 */
  password: string;
  /** 默认数据库名称（可选） */
  database?: string;
  /** 是否使用 SSL 连接（可选） */
  ssl?: boolean;
  /** 是否使用 SSH 隧道（可选） */
  ssh?: boolean;
  /** SSH 服务器地址（可选） */
  sshHost?: string;
  /** SSH 服务器端口（可选） */
  sshPort?: number;
  /** SSH 用户名（可选） */
  sshUsername?: string;
  /** SSH 密码（可选） */
  sshPassword?: string;
  /** SSH 私钥内容（可选） */
  sshPrivateKey?: string;
  /** SSH 私钥密码短语（可选） */
  sshPassphrase?: string;
  /** 连接超时时间（毫秒，可选） */
  timeout?: number;
  /** 字符集（可选） */
  charset?: string;
  /** 最大连接数（可选） */
  maxConnections?: number;
}

/**
 * 连接状态接口
 * 描述单个连接的当前状态信息
 */
export interface ConnectionState {
  /** 连接 ID */
  id: string;
  /** 当前连接状态 */
  status: ConnectionStatus;
  /** 错误信息（仅在错误状态下存在） */
  error?: string;
  /** 连接建立时间（可选） */
  connectedAt?: Date;
}

/**
 * 查询结果接口
 * 描述数据库查询的执行结果
 */
export interface QueryResult {
  /** 结果集列名列表 */
  columns: string[];
  /** 结果集数据行 */
  rows: any[];
  /** 受影响的行数（用于 INSERT、UPDATE、DELETE） */
  affectedRows?: number;
  /** 插入操作的自动生成 ID */
  insertId?: number;
  /** 查询执行时间（毫秒） */
  executionTime?: number;
}

/**
 * 查询历史接口
 * 记录已执行的查询历史信息
 */
export interface QueryHistory {
  /** 历史记录唯一 ID */
  id: string;
  /** 关联的连接 ID */
  connectionId: string;
  /** 执行的数据库名称（可选） */
  database?: string;
  /** SQL 查询语句 */
  query: string;
  /** 执行时间 */
  executedAt: Date;
  /** 执行时间（毫秒，可选） */
  executionTime?: number;
  /** 错误信息（仅在执行失败时存在，可选） */
  error?: string;
}