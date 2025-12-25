/**
 * 树节点类型枚举
 * 定义数据库树形结构中各种节点的类型
 */
export enum TreeNodeType {
  CONNECTION = 'connection',
  DATABASE = 'database',
  TABLE = 'table',
  VIEW = 'view',
  FUNCTION = 'function',
  PROCEDURE = 'procedure',
  INDEX = 'index',
  TRIGGER = 'trigger',
  USER = 'user',
  ROLE = 'role',
  SCHEMA = 'schema',
  CATALOG = 'catalog',
}
