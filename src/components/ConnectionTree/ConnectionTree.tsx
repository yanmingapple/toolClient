/**
 * 连接树形菜单组件
 */
import React, { useCallback } from 'react'

import { Tree, Button, Empty, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTreeData } from '../../hooks/useTreeData'
import { useConnection } from '../../hooks/useConnection'
import { TreeNode, TreeNodeType } from '../../types/tree'

const { Title, Paragraph } = Typography

interface ConnectionTreeProps {
  /**
   * 处理新建连接按钮点击
   */
  onNewConnection?: () => void
  /**
   * 处理节点选择事件
   */
  onNodeSelect?: (node: TreeNode, info: any) => void
}

/**
 * 连接树形菜单组件
 */
const ConnectionTree = ({
  onNewConnection,
  onNodeSelect
}: ConnectionTreeProps) => {
  // 使用自定义hooks获取树形数据和操作
  const { 
    treeData, 
    expandedKeys, 
    setExpandedKeys,
    selectedKeys,
    handleExpand, 
    handleSelect,
    handleDoubleClick: hookHandleDoubleClick
  } = useTreeData(onNodeSelect)
  const { handleConnectAndLoadDatabases } = useConnection()
  
  /**
   * 处理节点双击事件（扩展hook提供的双击处理）
   */
  const onDoubleClick = useCallback(async (_e: React.MouseEvent, info: any) => {
    if (!info) {
      return
    }
    
    // 根据Tree组件事件类型确定节点获取方式
    const node = info.node ? info.node as TreeNode : info as TreeNode
    
    // 如果双击的是连接节点且未连接，则连接并加载数据库
    if (node.type === TreeNodeType.CONNECTION) {
      const connection = node.data?.metadata?.connection
      if (connection) {
        await handleConnectAndLoadDatabases(connection)
        // 连接成功后自动展开
        setExpandedKeys(prev => [...prev, node.key])
      }
    }
    
    // 如果双击的是数据库节点，则加载表并展开
    if (node.type === TreeNodeType.DATABASE) {
      // 调用hook提供的双击处理
      await hookHandleDoubleClick(_e, info)
      // 延迟执行handleSelect，确保树渲染完成后再更新右侧面板
      setTimeout(() => {
        // 触发节点点击事件
        handleSelect([node.key], info)
      }, 2000)
    } else {
      // 其他节点类型使用hook提供的双击处理
      await hookHandleDoubleClick(_e, info)
    }
  }, [handleConnectAndLoadDatabases, setExpandedKeys, handleSelect, hookHandleDoubleClick])
  
  /**
   * 处理数据加载
   */
  const onLoadData = useCallback((_treeNode: any) => {
    // 加载数据的逻辑已经在handleExpand中处理
    return Promise.resolve()
  }, [])
  
  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 70px)', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>我的连接</Title>
      
      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onDoubleClick={onDoubleClick}
        loadData={onLoadData}
        titleRender={(node) => node.title}
        showLine={{ showLeafIcon: false }}
        blockNode
      />
      
      {treeData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Empty
            description={<Paragraph style={{ color: '#999' }}>暂无数据库连接</Paragraph>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewConnection} style={{ marginTop: '16px' }}>
            新建连接
          </Button>
        </div>
      )}
    </div>
  )
}

export default ConnectionTree
