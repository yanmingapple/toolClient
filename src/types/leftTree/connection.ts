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