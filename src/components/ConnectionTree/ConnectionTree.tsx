/**
 * 连接树形菜单组件
 */
import React, { useState, useCallback } from 'react'
import { Tree, Button, Empty, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTreeData } from '../../hooks/useTreeData'
import { useConnection } from '../../hooks/useConnection'
import { TreeNode } from '../../types/tree'

const { Title, Paragraph } = Typography

interface ConnectionTreeProps {
  /**
   * 处理新建连接按钮点击
   */
  onNewConnection?: () => void
  /**
   * 处理节点双击事件
   */
  onNodeDoubleClick?: (node: TreeNode) => void
}

/**
 * 连接树形菜单组件
 */
const ConnectionTree: React.FC<ConnectionTreeProps> = ({
  onNewConnection,
  onNodeDoubleClick
}) => {
  // 使用自定义hooks获取树形数据和操作
  const { treeData, handleExpand, handleSelect } = useTreeData()
  const { handleConnectAndLoadDatabases } = useConnection()
  
  // 本地状态
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  
  /**
   * 处理节点展开事件
   */
  const onExpand = useCallback(async (keys: string[], info: any) => {
    setExpandedKeys(keys)
    await handleExpand(keys, info)
  }, [handleExpand])
  
  /**
   * 处理节点选择事件
   */
  const onSelect = useCallback((keys: string[], info: any) => {
    setSelectedKeys(keys)
    handleSelect(keys, info)
  }, [handleSelect])
  
  /**
   * 处理节点双击事件
   */
  const onDoubleClick = useCallback(async (e: React.MouseEvent, info: any) => {
    const node = info.node as TreeNode
    
    // 如果双击的是连接节点且未连接，则连接并加载数据库
    if (node.type === 'connection') {
      const connection = info.node.data.metadata.connection
      await handleConnectAndLoadDatabases(connection)
    }
    
    // 调用外部传入的双击处理函数
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node)
    }
  }, [handleConnectAndLoadDatabases, onNodeDoubleClick])
  
  /**
   * 处理数据加载
   */
  const onLoadData = useCallback((treeNode: any) => {
    // 加载数据的逻辑已经在handleExpand中处理
    return Promise.resolve()
  }, [])
  
  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 64px)', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>我的连接</Title>
      
      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onExpand={onExpand}
        onSelect={onSelect}
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
