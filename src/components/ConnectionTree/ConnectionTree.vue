<template>
  <div class="connection-tree">
    <div class="tree-header">
      <el-text size="large" tag="h4" style="margin: 0;">我的连接</el-text>
      <div class="header-actions">
        <el-button type="primary" link @click="props.onNewConnection?.()">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
      </div>
    </div>

    <el-tree
      ref="treeRef"
      :data="treeData"
      :expanded-keys="localExpandedKeys"
      node-key="key"
      highlight-current
      :expand-on-click-node="false"
      @node-contextmenu="handleContextMenu"
      @node-expand="handleNodeExpand"
      @expand="handleTreeExpand"
      :props="treeProps"
    >
      <template #default="{ node, data }">
        <div class="tree-node" @dblclick="onDoubleClick(node, data)" :class="{ 'is-connection': data.type === TreeNodeType.CONNECTION }">
         <Icon :name="data.icon" :size="16" class="node-icon default-icon" />

          <span class="node-label">{{ node.label }}</span>

          <el-icon v-if="data.type === TreeNodeType.CONNECTION" class="status-icon" :class="getConnectionStatusClass(data)">
            <component :is="getStatusIcon(data)" />
          </el-icon>
        </div>
      </template>
    </el-tree>

    <el-empty v-if="treeData.length === 0" description="暂无数据库连接">
      <el-button type="primary" @click="emit('newConnection')">新建连接</el-button>
    </el-empty>

    <ContextMenu
      v-model:visible="contextMenuVisible"
      :position="contextMenuPosition"
      :node="contextMenuNode"
      :connection-states="connectionStates"
      @menu-click="handleMenuClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  Plus,
  Check,
  Close,
  Loading,
  Remove
} from '@element-plus/icons-vue'
import Icon from '../../icons/Icon.vue'
import { useTreeData } from '../../composables/useTreeData'
import { useConnection } from '../../composables/useConnection'
import { useConnectionStore } from '../../stores/connection'
import { TreeNodeType } from '../../types/leftTree/tree'
import type { TreeNode } from '../../types/leftTree/tree'
import { ConnectionStatus } from '../../enum/database'
import ContextMenu from './ContextMenu.vue'

interface ConnectionTreeProps {
  onNewConnection?: () => void
  onEditConnection?: (connection: any) => void
  onNodeSelect?: (node: TreeNode, info: any) => void
  updateSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

const props = withDefaults(defineProps<ConnectionTreeProps>(), {
  onNewConnection: () => {},
  onEditConnection: () => {},
  onNodeSelect: () => {},
  updateSelectedNode: () => {}
})

const emit = defineEmits<{
  (e: 'nodeSelect', node: TreeNode, info: any): void
  (e: 'connect', connection: any): void
  (e: 'disconnect', connection: any): void
  (e: 'openConnection', connection: any): void
  (e: 'closeConnection', connection: any): void
  (e: 'editConnection', connection: any): void
  (e: 'deleteConnection', connection: any): void
  (e: 'newQuery', database: any): void
  (e: 'refresh', node: TreeNode): void
  (e: 'deleteDatabase', database: any): void
  (e: 'viewStructure', table: any): void
  (e: 'viewData', table: any): void
  (e: 'deleteTable', table: any): void
  (e: 'viewView', view: any): void
  (e: 'deleteView', view: any): void
  (e: 'execute', func: any): void
  (e: 'deleteFunction', func: any): void
  (e: 'closeDatabase', database: any): void
}>()

const treeRef = ref()

const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuNode = ref<TreeNode | null>(null)

const {
  treeData,
  expandedKeys,
  setExpandedKeys,
  handleDoubleClick: hookHandleDoubleClick
} = useTreeData((node: TreeNode, info: any) => emit('nodeSelect', node, info), props.updateSelectedNode)

const localExpandedKeys = ref<string[]>([])

// 标记是否正在程序化更新展开状态，避免 watch 覆盖
const isProgrammaticUpdate = ref(false)

watch(expandedKeys, (newVal) => {
  // 如果正在程序化更新，跳过 watch，避免覆盖
  if (isProgrammaticUpdate.value) {
    return
  }
  
  // 只有当新值和当前值不同时才更新，避免循环更新
  // 使用 Set 来比较，忽略顺序
  const currentSet = new Set(localExpandedKeys.value)
  const newSet = new Set(newVal)
  if (currentSet.size !== newSet.size || ![...currentSet].every(key => newSet.has(key))) {
    localExpandedKeys.value = [...newVal]
  }
}, { immediate: true })

const handleTreeExpand = (keys: string[], info: any) => {
  // 如果正在程序化更新，跳过处理，避免覆盖
  if (isProgrammaticUpdate.value) {
    return
  }
  // 用户手动展开/折叠节点时，同步更新状态
  localExpandedKeys.value = [...keys]
  setExpandedKeys([...keys])
}

const { handleConnectAndLoadDatabases, connectionStates, handleDisconnect, getDatabaseList, removeConnection, activeConnectionId, openConnection, openDatabase } = useConnection()

const connectionStore = useConnectionStore()

watch(() => activeConnectionId.value, async (newId) => {
  if (!newId) return
  
  let attempts = 0
  const maxAttempts = 30 // 增加重试次数，等待数据库列表加载完成
  
  const checkAndExpand = async () => {
    await nextTick()
    
    const connectionNode = treeData.value.find((node: any) => node.key === newId)
    
    // 等待数据库列表加载完成
    if (!connectionNode || !connectionNode.children || connectionNode.children.length === 0) {
      attempts++
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        checkAndExpand()
      }
      return
    }
    
    // 展开连接节点及其所有数据库节点
    await expandConnectionAndDatabases(newId)
  }
  
  await checkAndExpand()
}, { immediate: true })

// 监听连接状态变化，当连接断开时自动折叠该连接的节点
watch(
  () => {
    // 将 Map 转换为数组，以便 watch 能够正确检测变化
    return Array.from(connectionStates.value.entries())
  },
  (newEntries, oldEntries) => {
    if (!oldEntries || !newEntries) return
    
    const oldStatesMap = new Map(oldEntries)
    const newStatesMap = new Map(newEntries)
    
    // 检查哪些连接从 CONNECTED 变为 DISCONNECTED
    newStatesMap.forEach((newStatus, connectionId) => {
      const oldStatus = oldStatesMap.get(connectionId)
      if (oldStatus === ConnectionStatus.CONNECTED && newStatus === ConnectionStatus.DISCONNECTED) {
        // 连接已断开，折叠该连接的节点
        collapseConnectionNodes(connectionId)
      }
    })
  }
)

// 监听表数据变化，当表加载完成后自动展开对应的数据库节点
watch(
  () => Array.from(connectionStore.tables.entries()),
  async (newTables, oldTables) => {
    debugger
    if (!oldTables || !newTables) return
    
    // 检查是否有新的表数据添加
    const newTableIds = new Set(newTables.map(([, t]) => t.id))
    const oldTableIds = new Set(oldTables.map(([, t]) => t.id))
    
    // 找出新增的表
    const addedTableIds = [...newTableIds].filter(id => !oldTableIds.has(id))
    
    if (addedTableIds.length > 0) {
      // 获取新增表所属的数据库
      const addedTables = newTables.filter(([, t]) => addedTableIds.includes(t.id))
      const databaseIds = [...new Set(addedTables.map(([, t]) => t.parentId))]
      
      // 对于每个数据库，如果它已经在展开状态中，重新触发展开
      for (const dbId of databaseIds) {
        if (localExpandedKeys.value.includes(dbId)) {
          await nextTick()
          
          // 直接操作 store 确保节点展开
          if (treeRef.value?.store?.nodesMap) {
            try {
              const node = treeRef.value.store.nodesMap[dbId]
              if (node) {
                node.expanded = true
                node.loaded = true
              }
            } catch (e) {
              console.log('Error re-expanding database node:', e)
            }
          }
        }
      }
    }
  },
  { deep: false }
)

const handleNodeExpand = (nodeData: any, node: any, tree: any) => {
  // 如果正在程序化更新，跳过处理，避免覆盖
  if (isProgrammaticUpdate.value) {
    return
  }
  // 用户手动展开节点时，同步更新状态
  // 使用 localExpandedKeys 而不是 expandedKeys，确保状态一致
  const keys = [...localExpandedKeys.value]
  if (!keys.includes(nodeData.key)) {
    keys.push(nodeData.key)
    localExpandedKeys.value = keys
    setExpandedKeys(keys)
  }
}

const treeProps = {
  label: 'title',
  children: 'children'
}

const handleContextMenu = (event: MouseEvent, data: TreeNode, node: any, tree: any) => {
  event.preventDefault()
  event.stopPropagation()
  
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuNode.value = data
  contextMenuVisible.value = true
}

const handleMenuClick = async (action: string, node: TreeNode | null) => {
  if (!node) return
  
  switch (action) {
    case 'newConnection':
      if (props.onNewConnection) {
        props.onNewConnection()
      }
      break
    case 'connect':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          emit('connect', connection)
          handleConnectAndLoadDatabases(connection)
        }
      }
      break
    case 'disconnect':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          emit('disconnect', connection)
          handleDisconnect(connection)
          // 折叠当前连接及其所有子节点的展开状态
          collapseConnectionNodes(connection.id)
        }
      }
      break
    case 'openConnection':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          emit('openConnection', connection)
          await openConnection(connection)
          // 等待数据库列表加载完成后再展开连接节点
          await nextTick()
          // 等待数据库列表加载，最多等待2秒
          let attempts = 0
          const maxAttempts = 20
          while (attempts < maxAttempts) {
            await nextTick()
            const connectionNode = treeData.value.find((n: any) => n.key === connection.id)
            if (connectionNode && connectionNode.children && connectionNode.children.length > 0) {
              // 数据库列表已加载，展开连接节点及其所有数据库节点
              debugger
              // await expandConnectionAndDatabases(connection.id)
              break
            }
            attempts++
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } else if (node.type === TreeNodeType.DATABASE) {
        // 如果点击的是数据库节点，打开其父连接
        const databaseObj = connectionStore.databases.get(node.key)
        if (databaseObj?.parentId) {
          const connection = connectionStore.connections.find(conn => conn.id === databaseObj.parentId)
          if (connection) {
            emit('openConnection', connection)
            await openConnection(connection)
            // 等待数据库列表加载完成后再展开
            await nextTick()
            let attempts = 0
            const maxAttempts = 20
            while (attempts < maxAttempts) {
              await nextTick()
              const connectionNode = treeData.value.find((n: any) => n.key === databaseObj.parentId)
              if (connectionNode && connectionNode.children && connectionNode.children.length > 0) {
                debugger
                // 数据库列表已加载，展开连接节点及其所有数据库节点
                await expandConnectionAndDatabases(databaseObj.parentId)
                break
              }
              attempts++
              await new Promise(resolve => setTimeout(resolve, 100))
            }
          }
        }
      }
      break
    case 'openDatabase':
      debugger
      if (node.type === TreeNodeType.DATABASE) {
        const databaseObj = connectionStore.databases.get(node.key)
        if (databaseObj) {
          const databaseName = databaseObj.name
          const connectionId = databaseObj.parentId
          
          if (connectionId && databaseName) {
            const connection = connectionStore.connections.find(conn => conn.id === connectionId)
            if (connection) {
              const connectionStatus = connectionStates.value?.get(connectionId)
              if (connectionStatus !== ConnectionStatus.CONNECTED) {
                await openConnection(connection)
                await expandConnectionAndDatabases(connectionId)
              }
              await openDatabase(connectionId, databaseName, node.key)
              await expandDatabaseAndTables(connectionId, node.key)
            }
          }
        }
      }
      break
    case 'closeConnection':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        emit('closeConnection', connection)
      }
      break
    case 'closeDatabase':
      if (node.type === TreeNodeType.DATABASE) {
        const databaseObj = connectionStore.databases.get(node.key)
        if (databaseObj) {
          emit('closeDatabase', databaseObj)
          if (databaseObj.parentId) {
            await expandConnectionAndDatabases(databaseObj.parentId)
          }
        }
      }
      break
    case 'editConnection':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          if (isNodeConnected(connection.id)) {
            handleDisconnect(connection)
            // 折叠当前连接及其所有子节点的展开状态
            collapseConnectionNodes(connection.id)
          }
          if (props.onEditConnection) {
            props.onEditConnection(connection)
          }
          emit('editConnection', connection)
        }
      }
      break
    case 'deleteConnection':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          emit('deleteConnection', connection)
          removeConnection(connection.id)
        }
      }
      break
    case 'newQuery':
      if (node.type === TreeNodeType.DATABASE) {
        const database = node.data?.metadata?.database
        emit('newQuery', database)
      } else if (node.type === TreeNodeType.TABLE) {
        const table = node.data?.metadata?.table
        const database = node.data?.metadata?.database
        emit('newQuery', database)
      }
      break
    case 'refresh':
      emit('refresh', node)
      break
    case 'refreshDatabase':
      if (node.type === TreeNodeType.CONNECTION) {
        const connection = node.data?.metadata?.connection
        if (connection) {
          getDatabaseList(connection.id)
        }
      }
      break
    case 'deleteDatabase':
      if (node.type === TreeNodeType.DATABASE) {
        const database = node.data?.metadata?.database
        emit('deleteDatabase', database)
      }
      break
    case 'viewStructure':
      if (node.type === TreeNodeType.TABLE) {
        const table = node.data?.metadata?.table
        emit('viewStructure', table)
      }
      break
    case 'viewData':
      if (node.type === TreeNodeType.TABLE) {
        const table = node.data?.metadata?.table
        emit('viewData', table)
      }
      break
    case 'deleteTable':
      if (node.type === TreeNodeType.TABLE) {
        const table = node.data?.metadata?.table
        emit('deleteTable', table)
      }
      break
    case 'viewView':
      if (node.type === TreeNodeType.VIEW) {
        const view = node.data?.metadata?.view
        emit('viewView', view)
      }
      break
    case 'deleteView':
      if (node.type === TreeNodeType.VIEW) {
        const view = node.data?.metadata?.view
        emit('deleteView', view)
      }
      break
    case 'execute':
      if (node.type === TreeNodeType.FUNCTION) {
        const func = node.data?.metadata?.function
        emit('execute', func)
      }
      break
    case 'deleteFunction':
      if (node.type === TreeNodeType.FUNCTION) {
        const func = node.data?.metadata?.function
        emit('deleteFunction', func)
      }
      break
  }
}

const getStatusIcon = (data: TreeNode) => {
  const connectionId = data.key
  const status = connectionStates.value?.get(connectionId)
  if (status === ConnectionStatus.CONNECTED) return Check
  if (status === ConnectionStatus.CONNECTING) return Loading
  if (status === ConnectionStatus.ERROR) return Close
  return Remove
}

const getConnectionStatusClass = (data: TreeNode) => {
  const connectionId = data.key
  const status = connectionStates.value?.get(connectionId)
  return {
    'status-success': status === ConnectionStatus.CONNECTED,
    'status-loading': status === ConnectionStatus.CONNECTING,
    'status-error': status === ConnectionStatus.ERROR,
    'status-disconnected': status === ConnectionStatus.DISCONNECTED
  }
}

/**
 * 折叠指定连接及其所有子节点的展开状态
 * 只移除当前连接相关的展开节点，保留其他连接的展开状态
 * @param connectionId 要折叠的连接 ID
 */
const collapseConnectionNodes = (connectionId: string) => {
  // 获取当前连接下的所有数据库节点 ID
  const databaseIds: string[] = []
  connectionStore.databases.forEach((db) => {
    if (db.parentId === connectionId) {
      databaseIds.push(db.id)
    }
  })

  // 获取这些数据库下的所有表节点 ID
  const tableIds: string[] = []
  connectionStore.tables.forEach((table) => {
    if (databaseIds.includes(table.parentId)) {
      tableIds.push(table.id)
    }
  })

  // 需要移除的节点键列表：连接节点 + 数据库节点 + 表节点
  const keysToRemove = [connectionId, ...databaseIds, ...tableIds]

  // 从展开状态中移除这些节点，保留其他节点的展开状态
  const newExpandedKeys = localExpandedKeys.value.filter(
    (key) => !keysToRemove.includes(key)
  )

  // 标记正在程序化更新
  isProgrammaticUpdate.value = true
  localExpandedKeys.value = newExpandedKeys
  setExpandedKeys(newExpandedKeys)
  // 等待下一个 tick 后重置标记
  nextTick().then(() => {
    isProgrammaticUpdate.value = false
  })
}


const isNodeConnected = (connectionId: string) => {
  return connectionStates.value?.get(connectionId) === ConnectionStatus.CONNECTED
}

/**
 * 展开连接节点及其所有数据库节点
 * @param connectionId 连接 ID
 */
const expandConnectionAndDatabases = async (connectionId: string) => {
  await nextTick()
  
  // 等待数据库列表加载完成
  let attempts = 0
  const maxAttempts = 30
  while (attempts < maxAttempts) {
    await nextTick()
    const connectionNode = treeData.value.find((n: any) => n.key === connectionId)
    
    if (connectionNode && connectionNode.children && connectionNode.children.length > 0) {
      // 数据库列表已加载，展开连接节点和所有数据库节点
      const keysToExpand: string[] = [connectionId]
      connectionNode.children.forEach((child: any) => {
        keysToExpand.push(child.key)
      })
      
      const newExpandedKeys = [...new Set([...localExpandedKeys.value, ...keysToExpand])]
      
      // 标记正在程序化更新
      isProgrammaticUpdate.value = true
      // 直接更新 localExpandedKeys（el-tree 绑定的是这个）
      localExpandedKeys.value = newExpandedKeys
      // 同步更新 expandedKeys（用于状态管理）
      setExpandedKeys(newExpandedKeys)
      // 等待下一个 tick 后重置标记
      await nextTick()
      isProgrammaticUpdate.value = false
      
      // 等待 DOM 更新
      await nextTick()
      await nextTick()
      
      // 确保 el-tree 的节点状态正确
      if (treeRef.value && treeRef.value.store && treeRef.value.store.nodesMap) {
        try {
          keysToExpand.forEach(key => {
            const node = treeRef.value.store.nodesMap[key]
            if (node) {
              node.expanded = true
              node.loaded = true
            }
          })
        } catch (e) {
          console.log('Error expanding nodes:', e)
        }
      }
      break
    }
    
    attempts++
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

/**
 * 展开数据库节点及其所有表节点，同时确保连接节点也展开
 * @param connectionId 连接 ID
 * @param databaseKey 数据库节点 key
 */
const expandDatabaseAndTables = async (connectionId: string, databaseKey: string) => {
  await nextTick()
  debugger
  // 等待表列表加载完成
  let attempts = 0
  const maxAttempts = 30
  while (attempts < maxAttempts) {
    // 直接检查 store 中的 tables 数据
    const tables = Array.from(connectionStore.tables.values())
    const databaseTables = tables.filter(table => table.parentId === databaseKey)
    
    if (databaseTables.length > 0) {
      // 表列表已加载，展开连接节点和数据库节点
      const newExpandedKeys = [...new Set([...localExpandedKeys.value, connectionId, databaseKey])]
      
      // 标记正在程序化更新
      isProgrammaticUpdate.value = true
      localExpandedKeys.value = newExpandedKeys
      setExpandedKeys(newExpandedKeys)
      await nextTick()
      isProgrammaticUpdate.value = false
      
      // 等待 DOM 更新
      await nextTick()
      await nextTick()
      
      // 确保 el-tree 的节点状态正确
      if (treeRef.value?.store?.nodesMap) {
        try {
          const connNode = treeRef.value.store.nodesMap[connectionId]
          if (connNode) {
            connNode.expanded = true
            connNode.loaded = true
          }
          const dbNode = treeRef.value.store.nodesMap[databaseKey]
          if (dbNode) {
            dbNode.expanded = true
            dbNode.loaded = true
          }
        } catch (e) {
          console.log('Error expanding nodes:', e)
        }
      }
      break
    }
    
    await nextTick()
    attempts++
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

const onDoubleClick = async (_event: MouseEvent, data: TreeNode) => {
  if (!data) return
  if (data.type === TreeNodeType.CONNECTION) {
    const connectionStatus = connectionStates.value?.get(data.key)
    if (connectionStatus === ConnectionStatus.DISCONNECTED) {
      const connection = data.data?.metadata?.connection
      if (connection) {
        await handleMenuClick('openConnection', data)
      }
    }
  } else if (data.type === TreeNodeType.DATABASE) {
    const isConnected = data.children && data.children.length > 0
    if (!isConnected) {
      await handleMenuClick('openDatabase', data)
    }
  }
}

defineExpose({
  treeRef
})
</script>

<style scoped>
.connection-tree {
  padding: 0;
  height: calc(100vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 36px;
  padding-left: 8px !important;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f4ff;
}

:deep(.el-tree-node__expand-icon) {
  padding: 6px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding-right: 12px;
  height: 100%;
  user-select: none;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.connection-icon {
  color: #409eff;
}

.connection-icon.connected {
  color: #67c23a;
}

.database-icon {
  color: #e6a23c;
}

.table-icon {
  color: #909399;
}

.view-icon {
  color: #909399;
}

.function-icon {
  color: #9c27b0;
}

.default-icon {
  color: #909399;
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.status-success {
  color: #67c23a;
}

.status-loading {
  color: #409eff;
}

.status-error {
  color: #f56c6c;
}

.status-disconnected {
  color: #909399;
}

:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
