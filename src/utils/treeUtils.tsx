/**
 * 树形数据处理相关工具函数
 */
import { TreeNode, TreeNodeType } from '../types/leftTree/tree'
import { ConnectionConfig, ConnectionStatus, DatabaseStatus } from '../types/leftTree/connection'
import { Icon } from '../icons'
import { getDatabaseIcon } from './connectionUtils'
import { Tag } from 'antd'

/**
 * 生成树形菜单数据
 * @param connections 连接配置列表
 * @param connectionStates 连接状态
 * @param databases 数据库对象
 * @param tables 表对象
 * @param databaseStates 数据库状态
 * @returns 树形菜单数据
 */
export const generateTreeData = (
  connections: ConnectionConfig[],
  connectionStates: Map<string, ConnectionStatus> | Array<[string, ConnectionStatus]> | any,
  databases: Map<string, any>,
  tables: Map<string, any>,
  databaseStates: Map<string, DatabaseStatus>
): TreeNode[] => {
  const treeNodes: TreeNode[] = []

  // 确保connectionStates是Map类型
  let safeConnectionStates: Map<string, ConnectionStatus>
  if (connectionStates instanceof Map) {
    safeConnectionStates = connectionStates
  } else if (Array.isArray(connectionStates)) {
    safeConnectionStates = new Map(connectionStates as Array<[string, ConnectionStatus]>)
  } else {
    safeConnectionStates = new Map()
  }

  // 生成连接节点
  connections.forEach(connection => {
    const status = safeConnectionStates.get(connection.id) || ConnectionStatus.DISCONNECTED
    const isConnected = status === ConnectionStatus.CONNECTED

    // 连接节点
    const connectionNode: TreeNode = {
      key: connection.id,
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {getDatabaseIcon(connection.type, isConnected)} {connection.name}
          </span>
          <Tag color={status === ConnectionStatus.CONNECTED ? 'success' : status === ConnectionStatus.CONNECTING ? 'processing' : status === ConnectionStatus.ERROR ? 'error' : 'default'} style={{ marginLeft: '8px' }}>
            {status === ConnectionStatus.CONNECTED ? '已连接' : status === ConnectionStatus.CONNECTING ? '连接中' : status === ConnectionStatus.ERROR ? '错误' : '未连接'}
          </Tag>
        </div>
      ),
      value: connection.id,
      type: TreeNodeType.CONNECTION,
      data: {
        id: connection.id,
        name: connection.name,
        type: TreeNodeType.CONNECTION,
        parentId: null,
        metadata: { connection }
      },
      // 默认未连接时不显示子节点
      children: undefined,
      // 默认未连接时为叶子节点
      isLeaf: !isConnected
    }

    // 如果已连接且有数据库对象，添加数据库节点
    if (isConnected && databases instanceof Map && tables instanceof Map) {
      // 获取该连接下的所有数据库
      const connectionDatabases = Array.from(databases.values()).filter(obj =>
        obj.parentId === connection.id
      )

      // 如果有数据库，则设置children并将isLeaf设为false
      if (connectionDatabases.length > 0) {
        connectionNode.children = connectionDatabases.map(database => {
          // 获取该数据库下的所有表
          const databaseTables = Array.from(tables.values()).filter(obj =>
            obj.parentId === database.id
          )

          // 检查是否已加载表
          const hasTables = databaseTables.length > 0

          // 获取数据库状态
          let safeDatabaseStates: Map<string, DatabaseStatus>
          if (databaseStates instanceof Map) {
            safeDatabaseStates = databaseStates
          } else if (Array.isArray(databaseStates)) {
            safeDatabaseStates = new Map(databaseStates as Array<[string, DatabaseStatus]>)
          } else {
            safeDatabaseStates = new Map()
          }
          const databaseStatus = safeDatabaseStates.get(database.id) || DatabaseStatus.LOADING

          // 数据库节点
          const databaseNode: TreeNode = {
            key: database.id,
            title: (
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                {getDatabaseNodeIcon(databaseStatus)}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{database.name}</span>
              </div>
            ),
            value: database.id,
            type: TreeNodeType.DATABASE,
            data: database,
            // 加载表后显示表节点
            children: hasTables ? databaseTables.map(table => ({
              key: table.id,
              title: (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                  <Icon name="table" size={16} style={{ marginRight: '8px', color: '#52c41a' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{table.name}</span>
                </div>
              ),
              value: table.id,
              type: TreeNodeType.TABLE,
              data: table,
              isLeaf: true
            })) : undefined,
            // 如果没有表，则根据是否加载过来决定是否为叶子节点
            isLeaf: !hasTables
          }

          return databaseNode
        })
      } else {
        // 如果没有数据库，则设为叶子节点
        connectionNode.isLeaf = true
        connectionNode.children = undefined
      }
    }

    treeNodes.push(connectionNode)
  })

  return treeNodes
}

/**
 * 根据数据库状态获取图标
 * @param status 数据库状态
 * @returns React组件
 */
export const getDatabaseNodeIcon = (status: DatabaseStatus) => {
  switch (status) {
    case DatabaseStatus.DISCONNECTED:
      return <Icon name="database" size={16} color='#d9d9d9' style={{ marginRight: '8px' }} />
    case DatabaseStatus.LOADING:
      return <Icon name="database" size={16} color='#1890ff' style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
    case DatabaseStatus.LOADED:
      return <Icon name="database" size={16} color='#52c41a' style={{ marginRight: '8px' }} />
    case DatabaseStatus.ERROR:
      return <Icon name="error" size={16} color='#ff4d4f' style={{ marginRight: '8px' }} />
    case DatabaseStatus.EMPTY:
      return <Icon name="database" size={16} color='#faad14' style={{ marginRight: '8px' }} />
    default:
      return <Icon name="database" size={16} color='#d9d9d9' style={{ marginRight: '8px' }} />
  }
}
