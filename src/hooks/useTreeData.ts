/**
 * 树形数据处理相关Hook
 */
import { useCallback, useMemo, useState } from 'react'
import type { Key } from 'rc-tree/lib/interface'

import { useConnectionStore } from '../store/connectionStore'
import { TreeNode, TreeNodeType, DatabaseObject } from '../types/leftTree/tree'
import { generateTreeData } from '../utils/treeUtils'
import { DatabaseStatus } from '../types/leftTree/connection'

/**
 * 树形数据管理Hook
 * @param onSelect 节点选择回调函数
 * @param updateSelectedNode 更新选中节点的函数
 * @returns 树形数据相关的状态和操作函数
 */
export const useTreeData = (onSelect?: (node: TreeNode, info: any) => void, updateSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void) => {
  // 从store获取树形数据相关的状态
  const connections = useConnectionStore((state) => state.connections)
  const connectionStates = useConnectionStore((state) => state.connectionStates)
  const databases = useConnectionStore((state) => state.databases)
  const tables = useConnectionStore((state) => state.tables)
  const databaseStates = useConnectionStore((state) => state.databaseStates)

  // 从store获取树形数据相关的操作
  const getTableList = useConnectionStore((state) => state.getTableList)
  const setDatabaseStatus = useConnectionStore((state) => state.setDatabaseStatus)

  /**
   * 生成树形菜单数据
   */
  const treeData = useMemo(() => {
    return generateTreeData(
      connections,
      connectionStates,
      databases,
      tables,
      databaseStates
    )
  }, [connections, connectionStates, databases, tables, databaseStates])

  /**
   * 处理节点展开
   * @param expandedKeys 展开的节点key数组
   * @param info 展开信息
   */
  const handleExpand = useCallback(async (_expandedKeys: Key[], info: any) => {
    const node = info as TreeNode

    // 如果展开的是数据库节点且没有加载过表
    if (node.type === TreeNodeType.DATABASE && node.isLeaf) {
      const databaseId = node.key
      const databaseName = node.data?.name || ''
      const connectionId = node.data?.parentId || ''

      // 确保所有相关信息都存在
      if (connectionId && databaseId && databaseName) {
        try {
          // 设置数据库状态为加载中
          setDatabaseStatus(databaseId, DatabaseStatus.LOADING)

          // 加载表列表
          await getTableList(connectionId, databaseName, databaseId)

          // 设置数据库状态为已加载（实际状态会在getTableList内部设置）
        } catch (error) {
          console.error('Failed to load tables:', error)
          // 设置数据库状态为错误
          setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
        }
      }
    }
  }, [getTableList, setDatabaseStatus])

  /**
   * 处理节点选择
   * @param selectedKeys 选中的节点key数组
   * @param info 选择信息
   */
  const handleSelect = useCallback((selectedKeys: Key[], info: any) => {
    // 可以在这里添加节点选择后的处理逻辑
    // 例如：显示选中节点的详情、执行相关操作等
    console.log('Selected node:', selectedKeys, info)

    // 这里赋值选择对象
    if (info && updateSelectedNode) {
      const node = info.node as TreeNode;
      const nodeName = typeof node.title === 'string' ? node.title : undefined;

      // 初始化变量
      let connectionConfig: any = null;
      let databaseObj: DatabaseObject | null = null;
      let tableObj: DatabaseObject | null = null;

      // 根据节点类型获取对应的对象
      if (node.type === TreeNodeType.CONNECTION) {
        // 获取连接配置
        connectionConfig = node.data?.metadata?.connection || null;
      } else if (node.type === TreeNodeType.DATABASE) {
        // 获取数据库对象
        databaseObj = databases.get(node.key) || null;
        if (databaseObj?.parentId) {
          // 获取数据库所属的连接
          if (databaseObj?.parentId) {
            const connection = connections.find(conn => conn.id === databaseObj?.parentId) || null;
            if (connection) {
              connectionConfig = connection;
            }
          }

        }
      } else if (node.type === TreeNodeType.TABLE) {
        // 获取表对象
        tableObj = tables.get(node.key) || null;

        // 获取表所属的数据库
        if (tableObj?.parentId) {
          databaseObj = databases.get(tableObj.parentId) || null;

          // 获取数据库所属的连接
          if (databaseObj?.parentId) {
            const connection = connections.find(conn => conn.id === databaseObj?.parentId) || null;
            if (connection) {
              connectionConfig = connection;
            }
          }
        }
      }

      // 更新选中节点状态
      updateSelectedNode({
        type: node.type,
        name: nodeName,
        id: node.key,
        parentId: node.data?.parentId || undefined
      }, connectionConfig, databaseObj, tableObj);
    }

    // 调用外部传入的选择回调
    if (onSelect && info) {
      const node = info.node ?? info;
      onSelect(node as TreeNode, info);
    }
  }, [onSelect, updateSelectedNode, databases, tables])

  // 展开的节点keys
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
  // 选中的节点keys
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])

  // 处理节点展开事件（包含状态更新）
  const handleTreeExpand = useCallback(async (keys: Key[], info: any) => {
    setExpandedKeys(keys)
    await handleExpand(keys, info)
  }, [handleExpand])

  // 处理节点选择事件（包含状态更新）
  const handleTreeSelect = useCallback((keys: Key[], info: any) => {
    setSelectedKeys(keys)
    handleSelect(keys, info)
  }, [handleSelect])

  // 处理节点双击事件
  const handleTreeDoubleClick = useCallback(async (_e: React.MouseEvent, info: any) => {
    if (!info) return

    // 根据Tree组件事件类型确定节点获取方式
    const node = info.node ? info.node as unknown as TreeNode : info as unknown as TreeNode

    // 如果双击的是连接节点且未连接，则连接并加载数据库
    if (node.type === TreeNodeType.CONNECTION) {
      const connection = node.data?.metadata?.connection
      if (connection) {
        // 连接数据库的逻辑应该由外部处理
        // 这里只处理展开逻辑
        setExpandedKeys(prev => [...prev, node.key])
      }
    }

    // 如果双击的是数据库节点，则加载表并展开
    if (node.type === TreeNodeType.DATABASE) {
      // 调用handleExpand来加载表
      await handleExpand([], info)
      // 数据库加载成功后自动展开
      setExpandedKeys(prev => [...prev, node.key])
    }
  }, [handleExpand])

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
