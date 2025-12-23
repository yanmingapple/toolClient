/**
 * 选中状态管理相关Hook
 */
import { useState, useRef } from 'react'
import { TreeNodeType } from '../types/tree'
import { ConnectionStatus } from '../types/connection'
import { TableData } from '../components/ObjectPanel'
import { TableObject } from '../components/PropertiesPanel'
import { MainPanelRef } from '../components/MainPanel/MainPanel'

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
  const [selectedObject, setSelectedObject] = useState<TableObject | null>(null)

  // 清除选中状态
  const clearSelection = () => {
    setSelectedTables([])
    setSelectedNode({})
    setSelectedObject(null)
  }

  // 更新选中的节点
  const updateSelectedNode = (node: { type?: TreeNodeType; name?: string }) => {
    setSelectedNode(node)
  }

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
    hasSelectedTables,
    hasSelectedNode,
    
    // 操作函数
    setSelectedTables,
    setCurrentConnectionStatus,
    setSelectedNode: updateSelectedNode,
    setSelectedObject,
    clearSelection
  }
}
