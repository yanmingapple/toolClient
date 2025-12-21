import React, { useState, useEffect } from 'react'
import { Layout, Button, Space, Typography, Tree, Tag, message } from 'antd'
import { 
  PlusOutlined, 
  UserOutlined, 
  EyeOutlined,
  FunctionOutlined,
  SearchOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  LayoutOutlined,
  PieChartOutlined
} from '@ant-design/icons'
import { Icon, IconName } from './icons'
import { TreeNodeType, TreeNode } from './types/tree'
import './App.css'
import ConnectionDialog from './components/ConnectionDialog'
import QueryEditor from './components/QueryEditor'
import { useConnectionStore } from './store/connectionStore'
import { ConnectionConfig, ConnectionStatus, DatabaseType, DatabaseStatus } from './types/connection'

const { Header, Sider, Content } = Layout
const { Title, Paragraph } = Typography

const App: React.FC = () => {
  const [connectionDialogVisible, setConnectionDialogVisible] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | null>(null)
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 监听来自主进程的IPC消息
  useEffect(() => {
    // 在渲染进程中安全导入electron
    let ipcRenderer: any = null
    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer' && (window as any).require) {
      try {
        const electron = (window as any).require('electron')
        ipcRenderer = electron.ipcRenderer
      } catch (error) {
        console.error('Failed to load electron.ipcRenderer:', error)
      }
    }
    
    // 确保在Electron环境中
    if (ipcRenderer) {
      // 创建事件处理函数引用
      const handleOpenNewConnectionDialog = () => {
        handleNewConnection()
      }
      
      // 监听打开新建连接对话框的消息
      ipcRenderer.on('open-new-connection-dialog', handleOpenNewConnectionDialog)
      
      // 清理函数
      return () => {
        ipcRenderer.removeListener('open-new-connection-dialog', handleOpenNewConnectionDialog)
      }
    }
  }, [])

  const connections = useConnectionStore((state) => state.connections)
  const connectionStates = useConnectionStore((state) => state.connectionStates)
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const databaseObjects = useConnectionStore((state) => state.databaseObjects)
  const databaseStates = useConnectionStore((state) => state.databaseStates)

  const setActiveConnection = useConnectionStore((state) => state.setActiveConnection)
  const setConnectionStatus = useConnectionStore((state) => state.setConnectionStatus)
  const testConnection = useConnectionStore((state) => state.testConnection)
  const getDatabaseList = useConnectionStore((state) => state.getDatabaseList)
  const getTableList = useConnectionStore((state) => state.getTableList)

  // 根据数据库类型选择图标
  const getDatabaseIcon = (type: DatabaseType, isConnected: boolean) => {
    return <Icon name={type as unknown as IconName} size={16} color={isConnected ? '#52c41a' : '#d9d9d9'} style={{ marginRight: '8px' }} />;
  };

  // 生成树形数据
  const generateTreeData = () => {
    const treeNodes: TreeNode[] = []
    
    // 生成连接节点
    connections.forEach(connection => {
      // 确保connectionStates是Map对象
      let safeConnectionStates: Map<string, ConnectionStatus> = new Map()
      try {
        if (connectionStates instanceof Map) {
          safeConnectionStates = connectionStates
        } else if (Array.isArray(connectionStates)) {
          safeConnectionStates = new Map(connectionStates as Array<[string, ConnectionStatus]>)  
        } else if (connectionStates && typeof connectionStates === 'object') {
          // 如果是普通对象，尝试转换为Map
          safeConnectionStates = new Map(Object.entries(connectionStates))
        }
      } catch (error) {
        console.error('Failed to create safeConnectionStates:', error)
        safeConnectionStates = new Map()
      }
      
      const status = safeConnectionStates.get(connection.id) || ConnectionStatus.DISCONNECTED
      const isConnected = status === ConnectionStatus.CONNECTED
      
      // 连接节点
      const connectionNode: TreeNode = {
        key: connection.id,
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {getDatabaseIcon(connection.type, isConnected)} {connection.name}
            </span>
            <Tag color={status === ConnectionStatus.CONNECTED ? 'success' : status === ConnectionStatus.CONNECTING ? 'processing' : status === ConnectionStatus.ERROR ? 'error' : 'default'} style={{ marginLeft: '8px' }}>
              {status === ConnectionStatus.CONNECTED ? '已连接' : status === ConnectionStatus.CONNECTING ? '连接中' : status === ConnectionStatus.ERROR ? '错误' : '未连接'}
            </Tag>
          </div>
        ),
        value: connection.id,
        type: TreeNodeType.CONNECTION,
        data: {
          id: connection.id,
          name: connection.name,
          type: TreeNodeType.CONNECTION,
          parentId: null,
          metadata: { connection }
        },
        // 默认未连接时不显示子节点
        children: undefined,
        // 默认未连接时为叶子节点
        isLeaf: !isConnected
      }
      
      // 如果已连接且有数据库对象，添加数据库节点
      if (isConnected && databaseObjects instanceof Map) {
        // 获取该连接下的所有数据库
        const databases = Array.from(databaseObjects.values()).filter(obj => 
          obj.parentId === connection.id && obj.type === TreeNodeType.DATABASE
        )
        
        // 如果有数据库，则设置children并将isLeaf设为false
        if (databases.length > 0) {
          connectionNode.children = databases.map(database => {
            // 获取该数据库下的所有表
            const tables = Array.from(databaseObjects.values()).filter(obj => 
              obj.parentId === database.id && obj.type === TreeNodeType.TABLE
            )
            console.log(connectionNode.children )
            // 检查是否已加载表
            const hasTables = tables.length > 0
            
            // 获取数据库状态
            let safeDatabaseStates: Map<string, DatabaseStatus>
            if (databaseStates instanceof Map) {
              safeDatabaseStates = databaseStates
            } else if (Array.isArray(databaseStates)) {
              safeDatabaseStates = new Map(databaseStates as Array<[string, DatabaseStatus]>)
            } else {
              safeDatabaseStates = new Map()
            }
            const databaseStatus = safeDatabaseStates.get(database.id) || DatabaseStatus.LOADING
            
            // 数据库节点
            const databaseNode: TreeNode = {
              key: database.id,
              title: (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                  {
                  databaseStatus === DatabaseStatus.DISCONNECTED ? (
                    <Icon name="database" size={16} color= '#d9d9d9' style={{ marginRight: '8px' }} />
                  ) 
                  : databaseStatus === DatabaseStatus.LOADING ? (
                    <Icon name="database" size={16} color= '#1890ff' style={{ marginRight: '8px',  animation: 'spin 1s linear infinite' }} />
                  ):
                  databaseStatus === DatabaseStatus.LOADED ? (
                    <Icon name="database" size={16} color= '#52c41a' style={{ marginRight: '8px' }} />
                  ) 
                  : databaseStatus === DatabaseStatus.ERROR ? (
                    <Icon name="error" size={16} color= '#ff4d4f' style={{ marginRight: '8px' }} />
                  ) 
                  : databaseStatus === DatabaseStatus.EMPTY ? (
                    <Icon name="database" size={16} color= '#faad14' style={{ marginRight: '8px' }} />
                  ) 
                  : (
                    <Icon name="database" size={16} color= '#d9d9d9' style={{ marginRight: '8px' }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{database.name}</span>
                </div>
              ),
              value: database.id,
              type: TreeNodeType.DATABASE,
              data: database,
              // 加载表后显示表节点
              children: hasTables ? tables.map(table => ({
                key: table.id,
                title: (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                    <Icon name="table" size={16} style={{ marginRight: '8px', color: '#52c41a' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{table.name}</span>
                  </div>
                ),
                value: table.id,
                type: TreeNodeType.TABLE,
                data: table,
                isLeaf: true
              })) : undefined,
              // 如果没有表，则根据是否加载过来决定是否为叶子节点
              isLeaf: !hasTables
            }
            
            return databaseNode
          })
        } else {
          // 如果没有数据库，则设为叶子节点
          connectionNode.isLeaf = true
          connectionNode.children = undefined
        }
      }
      
      treeNodes.push(connectionNode)
    })

    setTreeData(treeNodes)
  }

  // 确保所有连接都有正确的初始状态（DISCONNECTED）
  useEffect(() => {
    // 确保connectionStates是Map对象
    let safeConnectionStates: Map<string, ConnectionStatus>
    if (connectionStates instanceof Map) {
      safeConnectionStates = connectionStates
    } else if (Array.isArray(connectionStates)) {
      safeConnectionStates = new Map(connectionStates as Array<[string, ConnectionStatus]>)
    } else if (connectionStates && typeof connectionStates === 'object') {
      // 如果是普通对象，尝试转换为Map
      safeConnectionStates = new Map(Object.entries(connectionStates))
    } else {
      safeConnectionStates = new Map()
    }

    let hasChanges = false
    connections.forEach(connection => {
      // 检查连接是否有状态，或者状态是否为CONNECTING
      // 如果没有状态或状态为CONNECTING，则设置为DISCONNECTED
      const currentStatus = safeConnectionStates.get(connection.id)
      if (!currentStatus || currentStatus === ConnectionStatus.CONNECTING) {
        hasChanges = true
        setConnectionStatus(connection.id, ConnectionStatus.DISCONNECTED)
      }
    })

    // 如果没有需要更改的状态，不做任何操作
    if (!hasChanges) return
  }, [connections])

  // 当连接或数据库对象变化时，重新生成树形数据
  useEffect(() => {
    generateTreeData()
  }, [connections, connectionStates, databaseObjects])

  // 处理节点展开
  const onExpand = (expandedKeysValue: any[]) => {
    setExpandedKeys(expandedKeysValue as string[])
  }
  
  // 处理节点双击
  const onDoubleClick = (_event: any, node: any) => {
    // 确保node存在
    if (!node) return
    
    const treeNode = node as TreeNode
    
    // 确保treeNode.type存在
    if (!treeNode.type) return
    
    // 如果是连接节点，连接并加载数据库
    if (treeNode.type === TreeNodeType.CONNECTION) {
      const connection = connections.find(conn => conn.id === treeNode.key)
      if (connection) {
        handleConnectAndLoadDatabases(connection)
      }
    }
    // 如果是数据库节点，加载表列表
    else if (treeNode.type === TreeNodeType.DATABASE) {
      const connectionId = treeNode.data.parentId
      if (connectionId) {
        // 设置连接为活动连接
        setActiveConnection(connectionId)
        // 加载表列表
        getTableList(connectionId, treeNode.data.name, treeNode.key)
        // 自动展开数据库节点以显示表
        if (!expandedKeys.includes(treeNode.key)) {
          setExpandedKeys([...expandedKeys, treeNode.key])
        }
      }
    }
  }
  
  // 连接并加载数据库
  const handleConnectAndLoadDatabases = async (connection: ConnectionConfig) => {
    // 检查当前状态，如果已经连接则不重复连接
    let currentStatus = ConnectionStatus.DISCONNECTED
    try {
      if (connectionStates instanceof Map) {
        currentStatus = connectionStates.get(connection.id) || ConnectionStatus.DISCONNECTED
      }
    } catch (error) {
      console.error('Failed to get connection status:', error)
    }
    
    if (currentStatus === ConnectionStatus.CONNECTED) {
      message.info('连接已建立')
      // 加载数据库列表
      await getDatabaseList(connection.id)
      // 自动展开连接节点
      if (!expandedKeys.includes(connection.id)) {
        setExpandedKeys([...expandedKeys, connection.id])
      }
      return
    }
    
    if (currentStatus === ConnectionStatus.CONNECTING) {
      message.info('正在连接中，请稍候...')
      return
    }
    
    setConnectionStatus(connection.id, ConnectionStatus.CONNECTING)
    try {
      const success = await testConnection(connection)
      if (success) {
        setConnectionStatus(connection.id, ConnectionStatus.CONNECTED)
        setActiveConnection(connection.id)
        message.success('连接成功')
        
        // 加载数据库列表
        await getDatabaseList(connection.id)
        // 自动展开连接节点
        if (!expandedKeys.includes(connection.id)) {
          setExpandedKeys([...expandedKeys, connection.id])
        }
      } else {
        setConnectionStatus(connection.id, ConnectionStatus.ERROR)
        message.error('连接失败: 用户名或密码错误')
      }
    } catch (error) {
      setConnectionStatus(connection.id, ConnectionStatus.ERROR)
      message.error('连接失败: ' + error)
    }
  }

  // 处理节点选择
  const onSelect = (selectedKeysValue: any[], info: any) => {
    setSelectedKeys(selectedKeysValue as string[])
    
    const selectedNode = info.node
    if (selectedNode) {
      const nodeData = selectedNode as TreeNode
      
      // 确保nodeData和nodeData.type都存在
      if (nodeData && nodeData.type === TreeNodeType.CONNECTION) {
        setActiveConnection(nodeData.key)
      }
    }
  }

  // 处理加载子节点
  const onLoadData = async (treeNode: any) => {
    // 确保treeNode存在
    if (!treeNode) return Promise.resolve()
    
    // 获取节点数据（Ant Design 5.x直接使用treeNode）
    const node = treeNode as TreeNode
    
    // 确保node.type存在
    if (!node.type) return Promise.resolve()
    
    // 如果是连接节点，检查是否已连接，未连接则不加载
    if (node.type === TreeNodeType.CONNECTION) {
      try {
        // 确保connectionStates是Map对象
        let safeConnectionStates: Map<string, ConnectionStatus> = new Map()
        try {
          if (connectionStates instanceof Map) {
            safeConnectionStates = connectionStates
          } else if (Array.isArray(connectionStates)) {
            safeConnectionStates = new Map(connectionStates as Array<[string, ConnectionStatus]>)  
          } else if (connectionStates && typeof connectionStates === 'object') {
            // 如果是普通对象，尝试转换为Map
            safeConnectionStates = new Map(Object.entries(connectionStates))
          }
        } catch (error) {
          console.error('Failed to create safeConnectionStates:', error)
          safeConnectionStates = new Map()
        }
        
        const status = safeConnectionStates.get(node.key) || ConnectionStatus.DISCONNECTED
        
        // 只有已连接状态下才加载数据库
        if (status === ConnectionStatus.CONNECTED) {
          // 加载数据库列表
          await getDatabaseList(node.key)
        }
        
        return Promise.resolve()
      } catch (error) {
        console.error('Failed to load databases:', error)
        return Promise.resolve()
      }
    }
    
    // 如果是数据库节点，加载表列表
    if (node.type === TreeNodeType.DATABASE) {
      try {
        // 获取对应的连接
        const connectionId = node.data.parentId
        if (!connectionId) return Promise.resolve()
        
        // 加载表列表
        await getTableList(connectionId, node.data.name, node.key)
        
        // 自动展开数据库节点以显示表
        if (!expandedKeys.includes(node.key)) {
          setExpandedKeys([...expandedKeys, node.key])
        }
        
        return Promise.resolve()
      } catch (error) {
        console.error('Failed to load tables:', error)
        return Promise.resolve()
      }
    }
    
    return Promise.resolve()
  }

  const handleNewConnection = () => {
    setEditingConnection(null)
    setConnectionDialogVisible(true)
  }



  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <Space>
          <Button icon={<Icon name="database" size={16} />}>连接</Button>
          <Button icon={<PlusOutlined />}>新建查询</Button>
          <Button icon={<Icon name="table" size={16} />}>表</Button>
          <Button icon={<EyeOutlined />}>视图</Button>
          <Button icon={<FunctionOutlined />}>函数</Button>
          <Button icon={<UserOutlined />}>用户</Button>
          <Button>其他 ▼</Button>
          <Button icon={<SearchOutlined />}>查询</Button>
          <Button icon={<CloudDownloadOutlined />}>备份</Button>
          <Button icon={<SyncOutlined />}>自动运行</Button>
          <Button icon={<LayoutOutlined />}>模型</Button>
          <Button icon={<PieChartOutlined />}>BI</Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflowX: 'hidden' }}>
          <div style={{ padding: '16px', height: 'calc(100vh - 64px)', overflowY: 'auto', boxSizing: 'border-box' }}>
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
                <Icon name="database" size={32} color="#ccc" style={{ marginBottom: '8px' }} />
                <Paragraph style={{ color: '#999' }}>暂无数据库连接</Paragraph>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleNewConnection}>
                  新建连接
                </Button>
              </div>
            )}
          </div>
        </Sider>
        <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          {activeConnectionId ? (
            <QueryEditor />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Icon name="database" size={64} color="#1890ff" style={{ marginBottom: '24px' }} />
              <Title level={2} style={{ marginBottom: '16px' }}>欢迎使用 DBManager Pro</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                一款功能强大的数据库管理工具，支持多种数据库类型
              </Paragraph>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleNewConnection} style={{ marginTop: '24px' }}>
                新建数据库连接
              </Button>
            </div>
          )}
        </Content>
      </Layout>

      <ConnectionDialog
        visible={connectionDialogVisible}
        onCancel={() => {
          setConnectionDialogVisible(false)
          setEditingConnection(null)
        }}
        connection={editingConnection}
      />
    </Layout>
  )
}

export default App