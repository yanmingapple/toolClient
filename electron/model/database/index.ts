/**
 * 数据库模块统一导出
 * 统一导出所有数据库相关的枚举、接口和类型
 */
// 统一的树节点模型
export type { TreeNode, TreeNodeMetadata } from './TreeNode';

// 数据库连接配置
export type { ConnectionConfig } from './TreeNode';
export type { ParameterInfo } from './TreeNode';

// 树节点相关枚举
export { TreeNodeType, TreeNodeStatus } from './TreeNode';
export { ConnectionType, ConnectionStatus, DatabaseStatus } from './TreeNode';
// 连接信息接口
export type { ConnectionInfo } from './TreeNode';


// 工具函数导出
export { TreeNodeFactory } from './TreeNode';
export { getTreeNodeTypeDisplayName, getTreeNodeStatusInfo } from './TreeNode';