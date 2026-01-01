<template>
  <div class="app-layout">
    <div class="app-header">
      <HeaderBar
        :on-connect="onConnect"
        :on-new-query="handleNewQueryClick"
        :on-table="handleTableClick"
        :on-view="handleViewClick"
        :on-function="handleFunctionClick"
        :on-user="onUser"
        :on-other="onOther"
        :on-search="onSearch"
        :on-backup="handleBackupClick"
        :on-auto-run="onAutoRun"
        :on-model="handleModelClick"
        :on-b-i="handleBIClick"
      />
    </div>

    <div class="app-body">
      <div class="layout-sider">
        <ConnectionTree
          :on-new-connection="onNewConnection"
          :on-edit-connection="onEditConnection"
          :on-node-select="handleNodeSelect"
          :update-selected-node="updateSelectedNode"
          @close-database="handleCloseDatabase"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="layout-content">
        <MainPanel
          ref="mainPanelRef"
          :properties-content="propertiesContent"
        />
      </div>
    </div>

    <div class="app-footer">
      <span>ToolClient Database Manager © 2024</span>
    </div>

    <div class="slot-content" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import type { VNode } from 'vue'
import HeaderBar from '../HeaderBar/HeaderBar.vue'
import ConnectionTree from '../ConnectionTree/ConnectionTree.vue'
import MainPanel from '../MainPanel/index.vue'
import ObjectPanel from '../ObjectPanel/ObjectPanel.vue'
import FunctionPanel from '../ObjectPanel/components/ObjectFunctionPanel.vue'
import PropertiesPanel from '../PropertiesPanel/PropertiesPanel.vue'
import { useConnectionStore } from '../../stores/connection'
import { TreeNode,TreeNodeType,ConnectionStatus } from '../../../electron/model/database'
import type { ObjectPanelType } from '../../types/headerBar/headerBar'
import type { TableData } from '../../types/objectPanel'
import type { FunctionData } from '../../types/objectPanel'
import { formatBytes } from '../../utils/formatUtils'
import type { MainPanelRef } from '../MainPanel/index.vue'

interface AppLayoutProps {
  activeConnectionId?: string | null
  onNewConnection?: () => void
  onEditConnection?: (connection: any) => void
  onConnect?: () => void
  onNewQuery?: () => void
  onTable?: () => void
  onView?: () => void
  onFunction?: () => void
  onUser?: () => void
  onOther?: () => void
  onSearch?: () => void
  onBackup?: () => void
  onAutoRun?: () => void
  onModel?: () => void
  onBI?: () => void
}

const props = withDefaults(defineProps<AppLayoutProps>(), {
  activeConnectionId: null,
  onNewConnection: () => {},
  onEditConnection: () => {}
})

const emit = defineEmits<{
  (e: 'newConnection'): void
  (e: 'editConnection', connection: any): void
}>()

const connectionStore = useConnectionStore()

const mainPanelRef = ref<MainPanelRef | null>(null)

const databases = computed(() => connectionStore.databases)
const tables = computed(() => connectionStore.tables)
const connectionStates = computed(() => connectionStore.connectionStates)
const databaseStates = computed(() => connectionStore.databaseStates)

const selectedTables = ref<TableData[]>([])
const currentConnectionStatus = ref<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
const selectedNode = ref<{ type?: TreeNodeType; name?: string; id?: string; parentId?: string }>({})
const selectedObject = ref<PropertiesObject | null>(null)

const mockFunctions: FunctionData[] = [
  { name: 'get_format', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: true, comment: 'Format a date or time value' },
  { name: 'uuid', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Generate a UUID value' },
  { name: 'version', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Return version of MySQL server' },
]

const propertiesContent = computed(() => {
  return h('div', { class: 'properties-content' }, [
    h(PropertiesPanel, { selectedObject: selectedObject.value })
  ])
})

const setSelectedTables = (records: TableData[]) => {
  selectedTables.value = records
}

const setCurrentConnectionStatus = (status: ConnectionStatus) => {
  currentConnectionStatus.value = status
}

const updateSelectedNode = (
  node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string },
  _connection?: any,
  _database?: any,
  _table?: TableData
) => {
  selectedNode.value = node
  console.log('[updateSelectedNode] node:', node)
  console.log('[updateSelectedNode] _connection:', _connection)
  console.log('[updateSelectedNode] _database:', _database)
  console.log('[updateSelectedNode] _table:', _table)

  if (node.type === TreeNodeType.TABLE && _table) {
    console.log('[updateSelectedNode] Setting table object')
    selectedObject.value = {
      name: _table.name,
      type: 'table',
      engine: _table.engine || '',
      rows: _table.rows || 0,
      dataLength: _table.dataLength || '0 KB',
      createTime: _table.createTime || '',
      updateTime: _table.modifyDate || '',
      collation: _table.collation || '',
      autoIncrement: _table.autoIncrement || null,
      rowFormat: _table.rowFormat || '',
      checkTime: _table.checkTime || null,
      indexLength: _table.indexLength || '0 KB',
      maxDataLength: _table.maxDataLength || '0 KB',
      dataFree: _table.dataFree || '0 KB',
      comment: _table.comment
    }
  } else if (node.type === TreeNodeType.DATABASE && _database) {
    selectedObject.value = {
      name: _database.name,
      type: 'database',
      charset: _database.metadata?.charset || '',
      collation: _database.metadata?.collation || '',
      createTime: _database.metadata?.createTime || '',
      comment: _database.metadata?.comment || ''
    }
  } else if (node.type === TreeNodeType.CONNECTION && _connection) {
    selectedObject.value = {
      name: _connection.name,
      type: 'connection',
      host: _connection.host,
      port: _connection.port,
      user: _connection.username,
      database: _connection.database || '',
      charset: _connection.charset || '',
      connectTimeout: _connection.timeout || 10000
    }
  } else {
    selectedObject.value = null
  }
}

const createObjectPanelContent = (
  dataSource: TableData[] = [],
  nodeType?: TreeNodeType,
  nodeName?: string,
  databaseStatus?: any
): VNode => {
  let objectPanelType: ObjectPanelType | undefined
  if (nodeType === TreeNodeType.CONNECTION || nodeType === TreeNodeType.DATABASE || nodeType === TreeNodeType.TABLE) {
    objectPanelType = 'table'
  } else if (nodeType === TreeNodeType.VIEW) {
    objectPanelType = 'view'
  } else if (nodeType === TreeNodeType.FUNCTION) {
    objectPanelType = 'function'
  } else if (nodeType === TreeNodeType.USER) {
    objectPanelType = 'user'
  }

  return h(ObjectPanel, {
    dataSource,
    selectedObjects: selectedTables.value,
    onSelectObjects: setSelectedTables,
    objectPanelType,
    selectedNodeName: nodeName,
    connectionStatus: currentConnectionStatus.value,
    databaseStatus,
    mainPanelRef: mainPanelRef.value,
    connectionId: props.activeConnectionId || undefined,
    databaseName: selectedNode.value.name,
    setSelectedNode: updateSelectedNode
  })
}

const handleTableClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('table', '表', createObjectPanelContent([], selectedNode.value.type, selectedNode.value.name))
  }
}

const onConnect = () => {
  emit('newConnection')
}

const onEditConnection = (connection: any) => {
  emit('editConnection', connection)
}

const handleCloseDatabase = (database: any) => {
  connectionStore.closeDatabase(database.id)
  if (mainPanelRef.value) {
    mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent([], undefined, undefined, undefined))
  }
  selectedObject.value = null
  selectedTables.value = []
}

const handleFunctionClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('function', '函数', h(FunctionPanel, { dataSource: mockFunctions }))
  }
}

const handleNewQueryClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('query', '查询', h('div', { style: { padding: '20px' } }, [
      h('h3', {}, '新建查询'),
      h('p', {}, '查询编辑器将在这里显示')
    ]))
  }
}

const handleViewClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('view', '视图', h('div', { style: { padding: '20px' } }, [
      h('h3', {}, '视图'),
      h('p', {}, '视图列表将在这里显示')
    ]))
  }
}

const handleBackupClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('backup', '备份', h('div', { style: { padding: '20px' } }, [
      h('h3', {}, '备份'),
      h('p', {}, '备份功能将在这里显示')
    ]))
  }
}

const handleModelClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('model', '模型', h('div', { style: { padding: '20px' } }, [
      h('h3', {}, '模型'),
      h('p', {}, '模型功能将在这里显示')
    ]))
  }
}

const handleBIClick = () => {
  if (mainPanelRef.value) {
    mainPanelRef.value.createPanel('bi', 'BI', h('div', { style: { padding: '20px' } }, [
      h('h3', {}, 'BI'),
      h('p', {}, 'BI功能将在这里显示')
    ]))
  }
}

const handleNodeSelect = (node: TreeNode) => {
  const nodeName = typeof node.title === 'string' ? node.title : undefined

  let connectionConfig = null
  let databaseObj = null
  let tableObj = null

  if (node.type === TreeNodeType.CONNECTION) {
    connectionConfig = node.data?.metadata?.connection || null
  } else if (node.type === TreeNodeType.DATABASE) {
    databaseObj = databases.value.get(node.key) || null
    if (databaseObj?.parentId) {
      const connection = databases.value.get(databaseObj.parentId)?.metadata?.connection || null
      if (connection) {
        connectionConfig = connection
      }
    }
  } else if (node.type === TreeNodeType.TABLE) {
    const tableObject = tables.value.get(node.key)
    if (tableObject) {
      tableObj = {
        name: tableObject.name,
        rows: tableObject.metadata?.rows || 0,
        dataLength: typeof tableObject.metadata?.dataLength === 'number' ? formatBytes(tableObject.metadata.dataLength) : '0 KB',
        engine: tableObject.metadata?.engine || '',
        modifyDate: tableObject.metadata?.updateTime || '--',
        collation: tableObject.metadata?.collation || '',
        rowFormat: tableObject.metadata?.rowFormat || '',
        comment: tableObject.metadata?.comment || ''
      }

      if (tableObject.parentId) {
        databaseObj = databases.value.get(tableObject.parentId) || null
        if (databaseObj?.parentId) {
          const connection = databases.value.get(databaseObj.parentId)?.metadata?.connection || null
          if (connection) {
            connectionConfig = connection
          }
        }
      }
    }
  }

  updateSelectedNode(
    { type: node.type, name: nodeName, id: node.key, parentId: node.data?.parentId || undefined },
    connectionConfig,
    databaseObj || undefined,
    tableObj || undefined
  )

  if (node.type === TreeNodeType.TABLE) {
    const tableObject = tables.value.get(node.key)
    if (tableObject) {
      const databaseId = tableObject.parentId
      const actualTables = Array.from(tables.value.values())
        .filter(obj => obj.parentId === databaseId)
        .map(obj => ({
          name: obj.name,
          rows: obj.metadata?.rows || 0,
          dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
          engine: obj.metadata?.engine || '',
          modifyDate: obj.metadata?.updateTime || '--',
          collation: obj.metadata?.collation || '',
          rowFormat: obj.metadata?.rowFormat || '',
          comment: obj.metadata?.comment || ''
        }))

      if (mainPanelRef.value) {
        mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent(
          currentConnectionStatus.value === ConnectionStatus.CONNECTED ? actualTables : [],
          node.type,
          nodeName,
          databaseId ? databaseStates.value.get(databaseId) : undefined
        ))
      }
    }
  } else if (node.type === TreeNodeType.DATABASE) {
    const actualTables = Array.from(tables.value.values())
      .filter(obj => obj.parentId === node.key)
      .map(obj => ({
        name: obj.name,
        rows: obj.metadata?.rows || 0,
        dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
        engine: obj.metadata?.engine || '',
        modifyDate: obj.metadata?.updateTime || '--',
        collation: obj.metadata?.collation || '',
        rowFormat: obj.metadata?.rowFormat || '',
        comment: obj.metadata?.comment || ''
      }))

    if (mainPanelRef.value) {
      mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent(
        currentConnectionStatus.value === ConnectionStatus.CONNECTED ? actualTables : [],
        node.type,
        nodeName,
        databaseStates.value.get(node.key)
      ))
    }
  } else if (node.type === TreeNodeType.CONNECTION) {
    if (mainPanelRef.value) {
      mainPanelRef.value.updatePanelContent('object-0', h(ObjectPanel, {
        dataSource: [],
        selectedObjects: selectedTables.value,
        onSelectObjects: setSelectedTables,
        objectPanelType: 'table',
        selectedNodeName: nodeName,
        connectionStatus: currentConnectionStatus.value,
        setSelectedNode: updateSelectedNode
      }))
    }
  } else if (node.type === TreeNodeType.FUNCTION) {
    if (mainPanelRef.value) {
      mainPanelRef.value.createPanel('function', '函数', h(FunctionPanel, { dataSource: mockFunctions }))
    }
  }
}

const handleNodeClick = (node: TreeNode) => {
  node = node.data
  const nodeName = typeof node.title === 'string' ? node.title : undefined

  let connectionConfig = null
  let databaseObj = null
  let tableObj: TableData | null = null

  if (node.type === TreeNodeType.CONNECTION) {
    connectionConfig = node.data?.metadata?.connection || null
    if (mainPanelRef.value) {
      mainPanelRef.value.updatePanelContent('object-0', h(ObjectPanel, {
        dataSource: [],
        selectedObjects: selectedTables.value,
        onSelectObjects: setSelectedTables,
        objectPanelType: 'table',
        selectedNodeName: nodeName,
        connectionStatus: currentConnectionStatus.value,
        setSelectedNode: updateSelectedNode
      }))
    }
  } else if (node.type === TreeNodeType.DATABASE) {
    databaseObj = databases.value.get(node.key) || null
    if (databaseObj?.parentId) {
      const connection = databases.value.get(databaseObj.parentId)?.metadata?.connection || null
      if (connection) {
        connectionConfig = connection
      }
    }
    const actualTables = Array.from(tables.value.values())
      .filter(obj => obj.parentId === node.key)
      .map(obj => ({
        name: obj.name,
        rows: obj.metadata?.rows || 0,
        dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
        engine: obj.metadata?.engine || '',
        modifyDate: obj.metadata?.updateTime || '--',
        collation: obj.metadata?.collation || '',
        rowFormat: obj.metadata?.rowFormat || '',
        comment: obj.metadata?.comment || ''
      }))
    if (mainPanelRef.value) {
      mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent(
        currentConnectionStatus.value === ConnectionStatus.CONNECTED ? actualTables : [],
        node.type,
        nodeName,
        databaseStates.value.get(node.key)
      ))
    }
  } else if (node.type === TreeNodeType.TABLE) {
    const tableObject = tables.value.get(node.key)
    if (tableObject) {
      const metadata = tableObject.metadata || {}
      tableObj = {
        name: tableObject.name,
        rows: metadata.rows || 0,
        dataLength: typeof metadata.dataLength === 'number' ? formatBytes(metadata.dataLength) : '0 KB',
        engine: metadata.engine || '',
        modifyDate: metadata.updateTime || '--',
        collation: metadata.collation || '',
        rowFormat: metadata.rowFormat || '',
        comment: metadata.comment || '',
        createTime: metadata.createTime || '',
        autoIncrement: metadata.autoIncrement || null,
        checkTime: metadata.checkTime || null,
        indexLength: metadata.indexLength || '0 KB',
        maxDataLength: metadata.maxDataLength || '0 KB',
        dataFree: metadata.dataFree || '0 KB'
      }

      if (tableObject.parentId) {
        databaseObj = databases.value.get(tableObject.parentId) || null
        if (databaseObj?.parentId) {
          const connection = databases.value.get(databaseObj.parentId)?.metadata?.connection || null
          if (connection) {
            connectionConfig = connection
          }
        }
      }
    }

    if (mainPanelRef.value && databaseObj) {
      const actualTables = Array.from(tables.value.values())
        .filter(obj => obj.parentId == databaseObj.id)
        .map(obj => ({
          name: obj.name,
          rows: obj.metadata?.rows || 0,
          dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
          engine: obj.metadata?.engine || '',
          modifyDate: obj.metadata?.updateTime || '--',
          collation: obj.metadata?.collation || '',
          rowFormat: obj.metadata?.rowFormat || '',
          comment: obj.metadata?.comment || ''
        }))
      mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent(
        currentConnectionStatus.value === ConnectionStatus.CONNECTED ? actualTables : [],
        TreeNodeType.DATABASE,
        databaseObj.title,
        databaseStates.value.get(databaseObj.key)
      ))
    }
  }

  updateSelectedNode(
    { type: node.type, name: nodeName, id: node.key, parentId: node.data?.parentId || undefined },
    connectionConfig,
    databaseObj || undefined,
    tableObj || undefined
  )
}

watch(
  () => [props.activeConnectionId, connectionStates.value],
  () => {
    const activeId = props.activeConnectionId
    if (activeId && connectionStates.value instanceof Map) {
      const status = connectionStates.value.get(activeId) || ConnectionStatus.DISCONNECTED
      setCurrentConnectionStatus(status)
    } else {
      setCurrentConnectionStatus(ConnectionStatus.DISCONNECTED)
    }
    if (currentConnectionStatus.value === ConnectionStatus.DISCONNECTED) {
      if (mainPanelRef.value) {
        mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent([], undefined, undefined, undefined))
      }
      selectedObject.value = null
      selectedTables.value = []
    }
  },
  { immediate: true }
)

watch(
  () => tables.value,
  (newTables) => {
    if (currentConnectionStatus.value === ConnectionStatus.CONNECTED && selectedNode.value) {
      const node = selectedNode.value
      if (node.type === TreeNodeType.DATABASE && node.id) {
        const actualTables = Array.from(newTables.values())
          .filter(obj => obj.parentId === node.id)
          .map(obj => ({
            name: obj.name,
            rows: obj.metadata?.rows || 0,
            dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
            engine: obj.metadata?.engine || '',
            modifyDate: obj.metadata?.updateTime || '--',
            collation: obj.metadata?.collation || '',
            rowFormat: obj.metadata?.rowFormat || '',
            comment: obj.metadata?.comment || ''
          }))
        if (mainPanelRef.value) {
          mainPanelRef.value.updatePanelContent('object-0', createObjectPanelContent(
            actualTables,
            node.type,
            node.name,
            databaseStates.value.get(node.id)
          ))
        }
      }
    }
  },
  { deep: true }
)
</script>

<style scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-header {
  flex-shrink: 0;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-sider {
  width: 280px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.layout-content {
  flex: 1;
  overflow: hidden;
  background-color: #fff;
}

.app-footer {
  flex-shrink: 0;
  height: 30px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 12px;
}

.slot-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  overflow: auto;
}
</style>
