import React from 'react'

// 树形结构节点类型
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

// 数据库对象类型
export interface DatabaseObject {
  id: string;
  name: string;
  type: TreeNodeType;
  parentId: string | null;
  metadata?: Record<string, any>; // 存储额外信息，如表结构、索引等
}

// 树形节点类型
export interface TreeNode {
  key: string;
  title: string | React.ReactNode;
  value: string;
  type: TreeNodeType;
  data: DatabaseObject;
  children?: TreeNode[];
  isLeaf?: boolean;
  loading?: boolean;
}

// 树形结构状态
export interface TreeState {
  expandedKeys: string[];
  selectedKeys: string[];
  loadedKeys: string[]; // 已加载子节点的键
}
