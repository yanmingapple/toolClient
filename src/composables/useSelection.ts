import { ref, watch, computed } from 'vue'
import { TreeNodeType } from '../types/leftTree/tree'
import { ConnectionStatus } from '../enum/database'
import type { ConnectionConfig } from '../types/leftTree/connection'
import type { TableData } from '../types/objectPanel'
import type { PropertiesObject } from '../components/PropertiesPanel'
import type { MainPanelRef } from '../components/MainPanel/index.vue'
import type { DatabaseObject } from '../types/leftTree/tree'
import type { ObjectPanelType } from '../types/headerBar/headerBar'

export const useSelection = () => {
  const selectedTables = ref<TableData[]>([])
  const currentConnectionStatus = ref<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const selectedNode = ref<{ type?: TreeNodeType; name?: string; id?: string; parentId?: string }>({})
  const mainPanelRef = ref<MainPanelRef | null>(null)
  const selectedObject = ref<PropertiesObject | null>(null)
  const objectPanelType = ref<ObjectPanelType | null>(null)
  const selectedConnection = ref<ConnectionConfig | null>(null)
  const selectedDatabase = ref<DatabaseObject | null>(null)
  const selectedTable = ref<TableData | null>(null)

  const clearSelection = () => {
    selectedTables.value = []
    selectedNode.value = {}
    selectedObject.value = null
    objectPanelType.value = null
    selectedConnection.value = null
    selectedDatabase.value = null
    selectedTable.value = null
  }

  const updateStateIfIdChanged = <T extends { id: string } | null>(
    currentState: T,
    newValue: T | undefined,
    setState: (value: T | null) => void
  ) => {
    if (newValue && currentState && currentState.id !== newValue.id) {
      setState(newValue)
    } else if (newValue && !currentState) {
      setState(newValue)
    } else if (!newValue) {
      setState(null)
    }
  }

  const updateSelectedNode = (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: ConnectionConfig, database?: DatabaseObject, table?: TableData) => {
    selectedNode.value = node
    let panelType: ObjectPanelType | null = null
    if (node.type) {
      switch (node.type) {
        case TreeNodeType.CONNECTION:
        case TreeNodeType.DATABASE:
        case TreeNodeType.TABLE:
          panelType = 'table'
          break
        case TreeNodeType.VIEW:
          panelType = 'view'
          break
        case TreeNodeType.FUNCTION:
        case TreeNodeType.PROCEDURE:
          panelType = 'function'
          break
        case TreeNodeType.USER:
        case TreeNodeType.ROLE:
          panelType = 'user'
          break
        case TreeNodeType.INDEX:
        case TreeNodeType.TRIGGER:
        case TreeNodeType.SCHEMA:
        case TreeNodeType.CATALOG:
          panelType = 'other'
          break
        default:
          panelType = null
      }
    }
    objectPanelType.value = panelType
    if (node.type === TreeNodeType.CONNECTION && connection) {
      updateStateIfIdChanged(selectedConnection.value, connection, (val) => { selectedConnection.value = val })
      selectedDatabase.value = null
      selectedTable.value = null
    } else if (node.type === TreeNodeType.DATABASE && database) {
      updateStateIfIdChanged(selectedConnection.value, connection, (val) => { selectedConnection.value = val })
      updateStateIfIdChanged(selectedDatabase.value, database, (val) => { selectedDatabase.value = val })
      selectedTable.value = null
    } else if (node.type === TreeNodeType.TABLE && table) {
      updateStateIfIdChanged(selectedDatabase.value, database, (val) => { selectedDatabase.value = val })
      updateStateIfIdChanged(selectedConnection.value, connection, (val) => { selectedConnection.value = val })
      updateStateIfIdChanged(selectedTable.value, table, (val) => { selectedTable.value = val })
    }
  }

  watch([selectedConnection, selectedDatabase, selectedTable], () => {
    if (selectedTable.value) {
      const tableObject: PropertiesObject = {
        name: selectedTable.value.name,
        type: 'table',
        engine: selectedTable.value.engine,
        rows: selectedTable.value.rows,
        dataLength: selectedTable.value.dataLength,
        createTime: selectedTable.value.createTime || '',
        updateTime: selectedTable.value.modifyDate || '',
        collation: selectedTable.value.collation || '',
        autoIncrement: selectedTable.value.autoIncrement || null,
        rowFormat: selectedTable.value.rowFormat || '',
        checkTime: selectedTable.value.checkTime || null,
        indexLength: selectedTable.value.indexLength || '0 KB',
        maxDataLength: selectedTable.value.maxDataLength || '0 KB',
        dataFree: selectedTable.value.dataFree || '0 KB',
        comment: selectedTable.value.comment
      }
      selectedObject.value = tableObject
      objectPanelType.value = 'table'
    } else if (selectedDatabase.value) {
      const databaseObject: PropertiesObject = {
        name: selectedDatabase.value.name,
        type: 'database',
        collation: selectedDatabase.value.metadata?.collation || '',
        charset: selectedDatabase.value.metadata?.charset || '',
        createTime: selectedDatabase.value.metadata?.createTime || '',
        comment: selectedDatabase.value.metadata?.comment || ''
      }
      selectedObject.value = databaseObject
      objectPanelType.value = 'table'
    } else if (selectedConnection.value) {
      const connectionObject: PropertiesObject = {
        name: selectedConnection.value.name,
        type: 'connection',
        host: selectedConnection.value.host,
        port: selectedConnection.value.port,
        user: selectedConnection.value.username,
        database: selectedConnection.value.database || '',
        charset: selectedConnection.value.charset || '',
        connectTimeout: selectedConnection.value.timeout || 10000
      }
      selectedObject.value = connectionObject
      objectPanelType.value = 'table'
    } else {
      selectedObject.value = null
      objectPanelType.value = null
    }
  }, { deep: true })

  const hasSelectedTables = computed(() => selectedTables.value.length > 0)
  const hasSelectedNode = computed(() => !!selectedNode.value.type && !!selectedNode.value.name)

  return {
    selectedTables,
    currentConnectionStatus,
    selectedNode,
    mainPanelRef,
    selectedObject,
    objectPanelType,
    selectedConnection,
    selectedDatabase,
    selectedTable,
    hasSelectedTables,
    hasSelectedNode,
    setSelectedTables: (val: TableData[]) => { selectedTables.value = val },
    setCurrentConnectionStatus: (val: ConnectionStatus) => { currentConnectionStatus.value = val },
    setSelectedNode: updateSelectedNode,
    setSelectedObject: (val: PropertiesObject | null) => { selectedObject.value = val },
    setObjectPanelType: (type: ObjectPanelType | null) => { objectPanelType.value = type },
    setSelectedConnection: (val: ConnectionConfig | null) => { selectedConnection.value = val },
    setSelectedDatabase: (val: DatabaseObject | null) => { selectedDatabase.value = val },
    setSelectedTable: (val: TableData | null) => { selectedTable.value = val },
    clearSelection
  }
}
