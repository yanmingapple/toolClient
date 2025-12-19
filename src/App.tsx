import React, { useState } from 'react'
import { Layout, Button, Space, Typography, List, Card, Tag, Tooltip, Popconfirm, message } from 'antd'
import { 
  DatabaseOutlined, 
  PlusOutlined, 
  UserOutlined, 
  SettingOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DisconnectOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import './App.css'
import ConnectionDialog from './components/ConnectionDialog'
import QueryEditor from './components/QueryEditor'
import { useConnectionStore } from './store/connectionStore'
import { ConnectionConfig, ConnectionStatus, DatabaseType } from './types/connection'

const { Header, Sider, Content } = Layout
const { Title, Paragraph } = Typography

const App: React.FC = () => {
  const [connectionDialogVisible, setConnectionDialogVisible] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | null>(null)

  const connections = useConnectionStore((state) => state.connections)
  const connectionStates = useConnectionStore((state) => state.connectionStates)
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)

  const removeConnection = useConnectionStore((state) => state.removeConnection)
  const setActiveConnection = useConnectionStore((state) => state.setActiveConnection)
  const setConnectionStatus = useConnectionStore((state) => state.setConnectionStatus)
  const testConnection = useConnectionStore((state) => state.testConnection)

  const handleNewConnection = () => {
    setEditingConnection(null)
    setConnectionDialogVisible(true)
  }

  const handleEditConnection = (connection: ConnectionConfig) => {
    setEditingConnection(connection)
    setConnectionDialogVisible(true)
  }

  const handleDeleteConnection = (id: string) => {
    removeConnection(id)
    if (activeConnectionId === id) {
      setActiveConnection(null)
    }
    message.success('连接已删除')
  }

  const handleConnect = async (connection: ConnectionConfig) => {
    setConnectionStatus(connection.id, ConnectionStatus.CONNECTING)
    try {
      const success = await testConnection(connection)
      if (success) {
        setConnectionStatus(connection.id, ConnectionStatus.CONNECTED)
        setActiveConnection(connection.id)
        message.success('连接成功')
      } else {
        setConnectionStatus(connection.id, ConnectionStatus.ERROR)
        message.error('连接失败')
      }
    } catch (error) {
      setConnectionStatus(connection.id, ConnectionStatus.ERROR)
      message.error('连接失败: ' + error)
    }
  }

  const handleDisconnect = (id: string) => {
    setConnectionStatus(id, ConnectionStatus.DISCONNECTED)
    if (activeConnectionId === id) {
      setActiveConnection(null)
    }
    message.success('已断开连接')
  }

  // 获取连接状态标签
  const getStatusTag = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <Tag color="success" icon={<CheckCircleOutlined />}>已连接</Tag>
      case ConnectionStatus.CONNECTING:
        return <Tag color="processing">连接中</Tag>
      case ConnectionStatus.ERROR:
        return <Tag color="error" icon={<ExclamationCircleOutlined />}>连接错误</Tag>
      default:
        return <Tag color="default">未连接</Tag>
    }
  }

  // 获取数据库类型图标
  const getDatabaseIcon = (type: DatabaseType) => {
    switch (type) {
      case DatabaseType.MYSQL:
        return 'MySQL'
      case DatabaseType.POSTGRESQL:
        return 'PostgreSQL'
      case DatabaseType.MONGODB:
        return 'MongoDB'
      case DatabaseType.REDIS:
        return 'Redis'
      case DatabaseType.SQLSERVER:
        return 'SQL Server'
      case DatabaseType.SQLITE:
        return 'SQLite'
      default:
        return 'Unknown'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={3} style={{ margin: 0, color: '#262626' }}>DBManager Pro</Title>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewConnection}>
            新建连接
          </Button>
          <Button icon={<SettingOutlined />}>设置</Button>
          <Button icon={<UserOutlined />}>用户</Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '16px' }}>
            <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>数据库连接</Title>
            
            <List
              dataSource={connections}
              renderItem={(connection) => {
                const status = connectionStates.get(connection.id) || ConnectionStatus.DISCONNECTED
                const isActive = activeConnectionId === connection.id
                
                return (
                  <Card
                    key={connection.id}
                    size="small"
                    style={{ marginBottom: '8px', borderLeft: isActive ? '4px solid #1890ff' : '4px solid transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{connection.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {getDatabaseIcon(connection.type)} - {connection.host}:{connection.port}
                        </div>
                        {getStatusTag(status)}
                      </div>
                      <Space size="small">
                        <Tooltip title={status === ConnectionStatus.CONNECTED ? '断开连接' : '连接'}>
          <Button
            type="text"
            icon={status === ConnectionStatus.CONNECTED ? <DisconnectOutlined /> : <LinkOutlined />}
            onClick={() => {
              if (status === ConnectionStatus.CONNECTED) {
                handleDisconnect(connection.id)
              } else {
                handleConnect(connection)
              }
            }}
          />
        </Tooltip>
                        <Tooltip title="编辑">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditConnection(connection)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="确定要删除这个连接吗？"
                          onConfirm={() => handleDeleteConnection(connection.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Tooltip title="删除">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>
                  </Card>
                )
              }}
              locale={{ emptyText: (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <DatabaseOutlined style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
                  <Paragraph style={{ color: '#999' }}>暂无数据库连接</Paragraph>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleNewConnection}>
                    新建连接
                  </Button>
                </div>
              )}}
            />
          </div>
        </Sider>
        <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          {activeConnectionId ? (
            <QueryEditor />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <DatabaseOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
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