import { ref, computed, watch } from 'vue'
import { TreeNode, TreeNodeType, DatabaseObject } from '../types/leftTree/tree'
import { useConnectionStore } from '../stores/connection'
import { DatabaseStatus, ConnectionStatus, ConnectionType } from '../../electron/model/database'
import type { ConnectionConfig } from '../types/leftTree/connection'

/** 图标名称类型定义 */
type IconName = string

/**
 * 获取连接节点的图标名称
 * 根据连接类型和当前状态返回对应的图标名称
 * @param connectionConfig 连接配置信息
 * @param status 当前连接状态，可选
 * @returns 图标名称字符串
 */
const getConnectionIconName = (connectionConfig: ConnectionConfig, status?: ConnectionStatus): IconName => {
  const connectionType = connectionConfig.type;

  if (connectionType === ConnectionType.MySQL) {
    if (status === ConnectionStatus.CONNECTED) return 'mysql-filled'
    return 'mysql'
  }
  if (connectionType === ConnectionType.PostgreSQL) {
    if (status === ConnectionStatus.CONNECTED) return 'postgresql-filled'
    return 'postgresql'
  }
  if (connectionType === ConnectionType.SQLite) {
    if (status === ConnectionStatus.CONNECTED) return 'sqlite-filled'
    return 'sqlite'
  }
  if (connectionType === ConnectionType.SQLServer) {
    if (status === ConnectionStatus.CONNECTED) return 'sqlserver-filled'
    return 'sqlserver'
  }

  return 'database'
}

/**
 * 获取数据库节点的图标名称
 * 根据数据库加载状态返回对应的图标
 * @param dbState 数据库当前状态，可选
 * @returns 图标名称字符串
 */
const getDatabaseIconName = (dbState?: DatabaseStatus): IconName => {
  if (dbState === DatabaseStatus.LOADED) return 'database-filled'
  return 'database'
}

/** 获取数据库节点展开时的图标 */
const getDatabaseExpandedIconName = (): IconName => 'folder-open'

/** 获取表节点的图标 */
const getTableIconName = (): IconName => 'table'

/** 获取视图节点的图标 */
const getViewIconName = (): IconName => 'file-text-filled'

/** 获取函数节点的图标 */
const getFunctionIconName = (): IconName => 'settings'

/**
 * 生成树形结构数据
 * 将连接、数据库、表等数据转换为 el-tree 所需的树节点格式
 * @param connections 所有连接配置列表
 * @param connectionStates 所有连接状态映射
 * @param databases 所有数据库对象映射
 * @param tables 所有表对象映射
 * @param databaseStates 所有数据库状态映射
 * @returns 树节点数组
 */
const generateTreeData = (
  connections: ConnectionConfig[],
  connectionStates: Map<string, any>,
  databases: Map<string, DatabaseObject>,
  tables: Map<string, DatabaseObject>,
  databaseStates: Map<string, DatabaseStatus>
): TreeNode[] => {
  const treeData: TreeNode[] = []

  connections.forEach((conn) => {
    const connectionState = connectionStates.get(conn.id) || ConnectionStatus.DISCONNECTED
    const connectionTitle = typeof conn.name === 'string' ? conn.name : String(conn.name || '')

    const databaseNodes: TreeNode[] = []

    databases.forEach((db) => {
      if (db.parentId === conn.id) {
        const dbState = databaseStates.get(db.id) || DatabaseStatus.DISCONNECTED
        const tableNodes: TreeNode[] = []

        tables.forEach((table) => {
          if (table.parentId === db.id) {
            const tableTitle = typeof table.name === 'string' ? table.name : String(table.name || '')
            tableNodes.push({
              key: table.id,
              title: tableTitle,
              value: `table-${table.id}`,
              type: 'table' as TreeNodeType,
              data: table,
              isLeaf: true,
              icon: getTableIconName()
            })
          }
        })

        const dbTitle = typeof db.name === 'string' ? db.name : String(db.name || '')

        databaseNodes.push({
          key: db.id,
          title: dbTitle,
          value: `database-${db.id}`,
          type: 'database' as TreeNodeType,
          data: db,
          children: tableNodes.length > 0 ? tableNodes : undefined,
          isLeaf: tableNodes.length === 0,
          loading: dbState === DatabaseStatus.LOADING,
          icon: getDatabaseIconName(dbState),
        })
      }
    })

    const connectionNode: TreeNode = {
      key: conn.id,
      title: connectionTitle,
      value: `connection-${conn.id}`,
      type: 'connection' as TreeNodeType,
      data: {
        id: conn.id,
        name: conn.name,
        type: TreeNodeType.CONNECTION,
        connectionType: conn.type,
        parentId: null,
        metadata: {
          connection: conn,
          state: connectionState
        }
      },
      children: databaseNodes.length > 0 ? databaseNodes : undefined,
      isLeaf: databaseNodes.length === 0,
      icon: getConnectionIconName(conn, connectionState)
    }

    treeData.push(connectionNode)
  })

  return treeData
}

/** 树数据配置选项接口 */
export interface UseTreeDataOptions {
  /** 节点选中时的回调函数 */
  onSelect?: (node: TreeNode, info: any) => void
  /** 更新选中节点的回调函数 */
  updateSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

/**
 * 树数据管理组合式函数
 * 负责生成和管理连接树的数据、展开状态、选中状态等
 * @param options 配置选项，包括节点选择回调和更新选中节点回调
 * @returns 树数据管理相关的状态和方法
 */
export const useTreeData = (options: UseTreeDataOptions = {}) => {
  const { onSelect, updateSelectedNode } = options

  const connectionStore = useConnectionStore()

  /**
   * 计算属性：生成树形数据
   * 监听 store 中的数据变化，自动更新树数据
   */
  const treeData = computed(() => {
    return generateTreeData(
      connectionStore.connections,
      connectionStore.connectionStates,
      connectionStore.databases,
      connectionStore.tables,
      connectionStore.databaseStates
    )
  })

  /** 当前展开的节点键列表 */
  const expandedKeys = ref<string[]>([])
  /** 当前选中的节点键列表 */
  const selectedKeys = ref<string[]>([])

  /**
   * 处理节点展开事件
   * 当展开数据库节点时，异步加载该数据库下的表列表
   * @param keys 已展开的节点键列表
   * @param info 展开事件相关信息
   */
  const handleExpand = async (keys: string[], info: any) => {
    const node = info as TreeNode

    if (node.type === TreeNodeType.DATABASE && node.isLeaf) {
      const databaseId = node.key
      const databaseName = node.data?.name || ''
      const connectionId = node.data?.parentId || ''

      if (connectionId && databaseId && databaseName) {
        try {
          connectionStore.setDatabaseStatus(databaseId, DatabaseStatus.LOADING)
          await connectionStore.getTableList(connectionId, databaseName, databaseId)
          // 加载成功后自动将数据库节点添加到展开状态
          if (!expandedKeys.value.includes(databaseId)) {
            expandedKeys.value.push(databaseId)
          }
        } catch (error) {
          console.error('Failed to load tables:', error)
          connectionStore.setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
        }
      }
    }
  }

  /**
   * 处理节点选择事件
   * 根据选中节点类型，收集关联的连接、数据库、表信息
   * @param keys 已选中的节点键列表
   * @param info 选择事件相关信息
   */
  const handleSelect = (keys: string[], info: any) => {
    console.log('Selected node:', keys, info)

    if (info && updateSelectedNode) {
      const node = info.node as TreeNode
      const nodeName = typeof node.title === 'string' ? node.title : undefined

      let connectionConfig: any = null
      let databaseObj: DatabaseObject | null = null
      let tableObj: DatabaseObject | null = null

      if (node.type === TreeNodeType.CONNECTION) {
        connectionConfig = node.data?.metadata?.connection || null
      } else if (node.type === TreeNodeType.DATABASE) {
        databaseObj = connectionStore.databases.get(node.key) || null
        if (databaseObj?.parentId) {
          const connection = connectionStore.connections.find(conn => conn.id === databaseObj?.parentId) || null
          if (connection) {
            connectionConfig = connection
          }
        }
      } else if (node.type === TreeNodeType.TABLE) {
        tableObj = connectionStore.tables.get(node.key) || null

        if (tableObj?.parentId) {
          databaseObj = connectionStore.databases.get(tableObj.parentId) || null

          if (databaseObj?.parentId) {
            const connection = connectionStore.connections.find(conn => conn.id === databaseObj?.parentId) || null
            if (connection) {
              connectionConfig = connection
            }
          }
        }
      }

      updateSelectedNode({
        type: node.type,
        name: nodeName,
        id: node.key,
        parentId: node.data?.parentId || undefined
      }, connectionConfig, databaseObj, tableObj)
    }

    if (onSelect && info) {
      const node = info.node ?? info
      onSelect(node as TreeNode, info)
    }
  }

  /**
   * 处理树节点展开（包装函数）
   * 同步更新展开状态后执行展开处理逻辑
   * @param keys 已展开的节点键列表
   * @param info 展开事件相关信息
   */
  const handleTreeExpand = async (keys: string[], info: any) => {
    expandedKeys.value = keys
    await handleExpand(keys, info)
  }

  /**
   * 处理树节点选择（包装函数）
   * 同步更新选中状态后执行选择处理逻辑
   * @param keys 已选中的节点键列表
   * @param info 选择事件相关信息
   */
  const handleTreeSelect = (keys: string[], info: any) => {
    selectedKeys.value = keys
    handleSelect(keys, info)
  }

  /**
   * 处理树节点双击事件
   * 根据节点类型执行相应的操作（连接数据库或展开节点）
   * @param event 双击事件对象
   * @param info 节点相关信息
   */
  const handleTreeDoubleClick = async (event: MouseEvent, info: any) => {
    if (!info) return

    const node = info.node ? info.node as unknown as TreeNode : info as unknown as TreeNode

    if (node.type === TreeNodeType.CONNECTION) {
      const connection = node.data?.metadata?.connection
      if (connection) {
        expandedKeys.value = [node.key]
      }
    }

    if (node.type === TreeNodeType.DATABASE) {
      await handleExpand([], info)
      expandedKeys.value = [node.key]
    }
  }

  /**
   * 设置展开状态
   * @param keys 要设置为展开状态的节点键数组
   */
  const setExpandedKeys = (keys: string[]) => {
    expandedKeys.value = keys
  }

  /**
   * 设置选中状态
   * @param keys 要设置为选中状态的节点键数组
   */
  const setSelectedKeys = (keys: string[]) => {
    selectedKeys.value = keys
  }

  return {
    treeData,
    expandedKeys,
    setExpandedKeys,
    selectedKeys,
    setSelectedKeys,
    handleExpand: handleTreeExpand,
    handleSelect: handleTreeSelect,
    handleDoubleClick: handleTreeDoubleClick
  }
}
