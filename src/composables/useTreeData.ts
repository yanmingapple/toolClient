import { ref, computed, watch } from 'vue'
import { TreeNode, TreeNodeType, DatabaseObject } from '../types/leftTree/tree'
import { useConnectionStore } from '../stores/connection'
import { DatabaseStatus, ConnectionStatus, ConnectionType } from '../enum/database'
import type { ConnectionConfig } from '../types/leftTree/connection'

type IconName = string

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

const getDatabaseIconName = (): IconName => 'folder'

const getDatabaseExpandedIconName = (): IconName => 'folder-open'

const getTableIconName = (): IconName => 'table'

const getViewIconName = (): IconName => 'file-text-filled'

const getFunctionIconName = (): IconName => 'settings'

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
          icon: getDatabaseIconName(),
          expandedIcon: getDatabaseExpandedIconName()
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
      icon: getConnectionIconName(connectionState)
    }

    treeData.push(connectionNode)
  })

  return treeData
}

export interface UseTreeDataOptions {
  onSelect?: (node: TreeNode, info: any) => void
  updateSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

export const useTreeData = (options: UseTreeDataOptions = {}) => {
  const { onSelect, updateSelectedNode } = options

  const connectionStore = useConnectionStore()

  const treeData = computed(() => {
    return generateTreeData(
      connectionStore.connections,
      connectionStore.connectionStates,
      connectionStore.databases,
      connectionStore.tables,
      connectionStore.databaseStates
    )
  })

  const expandedKeys = ref<string[]>([])
  const selectedKeys = ref<string[]>([])

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
        } catch (error) {
          console.error('Failed to load tables:', error)
          connectionStore.setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
        }
      }
    }
  }

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

  const handleTreeExpand = async (keys: string[], info: any) => {
    expandedKeys.value = keys
    await handleExpand(keys, info)
  }

  const handleTreeSelect = (keys: string[], info: any) => {
    selectedKeys.value = keys
    handleSelect(keys, info)
  }

  const handleTreeDoubleClick = async (event: MouseEvent, info: any) => {
    if (!info) return

    const node = info.node ? info.node as unknown as TreeNode : info as unknown as TreeNode

    if (node.type === TreeNodeType.CONNECTION) {
      const connection = node.data?.metadata?.connection
      if (connection) {
        expandedKeys.value = [...expandedKeys.value, node.key]
      }
    }

    if (node.type === TreeNodeType.DATABASE) {
      await handleExpand([], info)
      expandedKeys.value = [...expandedKeys.value, node.key]
    }
  }

  const setExpandedKeys = (keys: string[]) => {
    expandedKeys.value = keys
  }

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
