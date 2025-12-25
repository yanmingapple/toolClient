/**
 * 选中状态管理相关Hook
 */
import { useState, useRef, useEffect } from 'react'
import { TreeNodeType } from '../types/leftTree/tree'
import { ConnectionStatus, ConnectionConfig } from '../types/leftTree/connection'
import { TableData } from '../components/ObjectPanel'
import { PropertiesObject } from '../components/PropertiesPanel'
import { MainPanelRef } from '../components/MainPanel/MainPanel'
import { DatabaseObject } from '../types/leftTree/tree'
import { ObjectPanelType } from '../types/headerBar/headerBar'

/**
 * 选中状态管理Hook
 * @returns 选中状态相关的状态和操作函数
 */
export const useSelection = () => {
  // 选中表状态
  const [selectedTables, setSelectedTables] = useState<TableData[]>([])
  // 当前连接状态
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  // 当前选中的节点信息
  const [selectedNode, setSelectedNode] = useState<{ type?: TreeNodeType; name?: string }>({})
  // MainPanel的引用
  const mainPanelRef = useRef<MainPanelRef>(null)
  // 当前选中的对象
  const [selectedObject, setSelectedObject] = useState<PropertiesObject | null>(null)
  // 对象面板类型 - 控制对象面板显示内容的类型
  const [objectPanelType, setObjectPanelType] = useState<ObjectPanelType | null>(null)
  // 当前选中的连接配置对象
  const [selectedConnection, setSelectedConnection] = useState<ConnectionConfig | null>(null)
  // 当前选中的数据库对象
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseObject | null>(null)
  // 当前选中的表对象
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)

  // 清除选中状态
  const clearSelection = () => {
    setSelectedTables([])
    setSelectedNode({})
    setSelectedObject(null)
    setObjectPanelType(null)
    setSelectedConnection(null)
    setSelectedDatabase(null)
    setSelectedTable(null)
  }

  // 通用状态更新辅助函数：仅当值变化时更新状态
  const updateStateIfIdChanged = <T extends Record<string, any> | null | undefined>(
    currentState: T | null,
    newValue: T | undefined,
    setState: (value: T) => void
  ) => {
    if (newValue) {
      // 检查是否为对象
      if (typeof newValue === 'object' && newValue !== null) {
        // 如果对象有id属性，根据id比较
        if ('id' in newValue && typeof newValue.id === 'string' && currentState && 'id' in currentState && typeof currentState.id === 'string') {
          if (currentState.id !== newValue.id) {
            setState(newValue)
          }
        } else {
          // 否则直接更新（如TableData类型没有id属性）
          setState(newValue)
        }
      } else {
        // 非对象类型直接更新
        setState(newValue)
      }
    }
  }

  // 更新选中的节点
  const updateSelectedNode = (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: ConnectionConfig, database?: DatabaseObject, table?: TableData) => {
    setSelectedNode(node)
    // 更新对象面板类型
    let panelType: ObjectPanelType | null = null
    if (node.type) {
      // 根据节点类型映射到对象面板类型
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
    setObjectPanelType(panelType)
    // 根据节点类型设置相应的选中状态
    if (node.type === TreeNodeType.CONNECTION && connection) {
      updateStateIfIdChanged(selectedConnection, connection, setSelectedConnection)
      setSelectedDatabase(null)
      setSelectedTable(null)
    } else if (node.type === TreeNodeType.DATABASE && database) {
      updateStateIfIdChanged(selectedConnection, connection, setSelectedConnection)
      updateStateIfIdChanged(selectedDatabase, database, setSelectedDatabase)
      setSelectedTable(null)
    } else if (node.type === TreeNodeType.TABLE && table) {
      updateStateIfIdChanged(selectedDatabase, database, setSelectedDatabase)
      updateStateIfIdChanged(selectedConnection, connection, setSelectedConnection)
      updateStateIfIdChanged(selectedTable, table, setSelectedTable)
    }
  }

  // 确保selectedObject与层级选择状态保持同步
  useEffect(() => {
    if (selectedTable) {
      // 如果有选中的表，设置selectedObject为表对象
      const tableObject: any = {
        name: selectedTable.name,
        type: 'table', // 使用字符串字面量类型匹配PropertiesPanel期望的类型
        engine: selectedTable.engine,
        rows: selectedTable.rows,
        dataLength: selectedTable.dataLength,
        createTime: selectedTable.createTime || '',
        updateTime: selectedTable.modifyDate || '',
        collation: selectedTable.collation || '',
        autoIncrement: selectedTable.autoIncrement || null,
        rowFormat: selectedTable.rowFormat || '',
        checkTime: selectedTable.checkTime || null,
        indexLength: selectedTable.indexLength || '0 KB',
        maxDataLength: selectedTable.maxDataLength || '0 KB',
        dataFree: selectedTable.dataFree || '0 KB',
        comment: selectedTable.comment
      }
      setSelectedObject(tableObject)
      setObjectPanelType('table')
    } else if (selectedDatabase) {
      // 如果有选中的数据库，设置selectedObject为数据库对象
      const databaseObject: any = {
        name: selectedDatabase.name,
        type: 'database', // 使用字符串字面量类型匹配PropertiesPanel期望的类型
        collation: selectedDatabase.metadata?.collation || '',
        charset: selectedDatabase.metadata?.charset || '',
        createTime: selectedDatabase.metadata?.createTime || '',
        comment: selectedDatabase.metadata?.comment || ''
      }
      setSelectedObject(databaseObject)
      setObjectPanelType('table')
    } else if (selectedConnection) {
      // 如果有选中的连接，设置selectedObject为连接对象
      const connectionObject: any = {
        name: selectedConnection.name,
        type: 'connection', // 使用字符串字面量类型匹配PropertiesPanel期望的类型
        host: selectedConnection.host,
        port: selectedConnection.port,
        user: selectedConnection.username,
        database: selectedConnection.database || '',
        charset: selectedConnection.charset || '',
        connectTimeout: selectedConnection.timeout || 10000
      }
      setSelectedObject(connectionObject)
      setObjectPanelType('table')
    } else {
      // 如果没有选中任何对象，设置selectedObject为null
      setSelectedObject(null)
      setObjectPanelType(null)
    }
  }, [selectedConnection, selectedDatabase, selectedTable])

  // 检查是否有表被选中
  const hasSelectedTables = selectedTables.length > 0

  // 检查是否有节点被选中
  const hasSelectedNode = !!selectedNode.type && !!selectedNode.name

  return {
    // 状态
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

    // 操作函数
    setSelectedTables,
    setCurrentConnectionStatus,
    setSelectedNode: updateSelectedNode,
    setSelectedObject,
    setObjectPanelType: (type: ObjectPanelType | null) => setObjectPanelType(type),
    setSelectedConnection,
    setSelectedDatabase,
    setSelectedTable,
    clearSelection
  }
}
