import React from 'react'
import { TreeNodeType } from '../../enum'

export interface DatabaseObject {
  id: string;
  name: string;
  type: TreeNodeType;
  parentId: string | null;
  metadata?: Record<string, any>;
}

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

export interface TreeState {
  expandedKeys: string[];
  selectedKeys: string[];
  loadedKeys: string[];
}

export { TreeNodeType }
