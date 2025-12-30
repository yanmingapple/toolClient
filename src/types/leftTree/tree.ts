import { ConnectionType } from '../../../electron/model/database'

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

/**
 * 图标名称类型
 * 用于标识树节点显示的图标
 */
export type IconName = string

/**
 * 数据库对象接口
 * 表示树形结构中的数据库对象（如连接、数据库、表等）
 */
export interface DatabaseObject {
  /** 对象唯一标识符 */
  id: string;
  /** 对象名称 */
  name: string;
  /** 对象类型，对应 TreeNodeType 枚举 */
  type: TreeNodeType;
  /** 数据库连接类型 */
  connectionType: ConnectionType;
  /** 父节点 ID，根节点为 null */
  parentId: string | null;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 树节点接口
 * 表示树形结构中的单个节点
 */
export interface TreeNode {
  /** 节点唯一键值，用于 el-tree 的 node-key */
  key: string;
  /** 节点显示标题 */
  title: string;
  /** 节点值 */
  value: string;
  /** 节点类型，对应 TreeNodeType 枚举 */
  type: TreeNodeType;
  /** 关联的数据库对象 */
  data: DatabaseObject;
  /** 子节点列表 */
  children?: TreeNode[];
  /** 是否为叶子节点 */
  isLeaf?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 节点图标名称 */
  icon?: IconName;
  /** 节点展开时图标名称 */
  expandedIcon?: IconName;
}

/**
 * 树状态接口
 * 记录树组件的展开、选中状态
 */
export interface TreeState {
  /** 已展开的节点键列表 */
  expandedKeys: string[];
  /** 已选中的节点键列表 */
  selectedKeys: string[];
  /** 已加载的节点键列表 */
  loadedKeys: string[];
}
