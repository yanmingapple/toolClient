import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Switch, InputNumber, Button, message, Space, Card, Tabs } from 'antd'
import { DatabaseOutlined, CheckCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { ConnectionConfig, DatabaseType } from '../types/connection'
import { useConnectionStore } from '../store/connectionStore'

interface ConnectionDialogProps {
  visible: boolean
  onCancel: () => void
  connection?: ConnectionConfig | null
}

const { Option } = Select
const { TabPane } = Tabs

const ConnectionDialog = ({ visible, onCancel, connection }: ConnectionDialogProps) => {
  const [form] = Form.useForm<Omit<ConnectionConfig, 'id'>>()
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const addConnection = useConnectionStore((state) => state.addConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const testConnection = useConnectionStore((state) => state.testConnection)

  // 数据库默认端口映射
  const defaultPorts: Record<DatabaseType, number> = {
    [DatabaseType.MYSQL]: 3306,
    [DatabaseType.POSTGRESQL]: 5432,
    [DatabaseType.MONGODB]: 27017,
    [DatabaseType.REDIS]: 6379,
    [DatabaseType.SQLSERVER]: 1433,
    [DatabaseType.SQLITE]: 0
  }

  // 当连接变化时更新表单
  useEffect(() => {
    if (connection) {
      form.setFieldsValue({
        ...connection,
        type: connection.type,
        port: connection.port || defaultPorts[connection.type]
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ host: '127.0.0.1', username: 'root', password: '123456', type: DatabaseType.MYSQL, port: defaultPorts[DatabaseType.MYSQL] })
    }
  }, [connection, form])

  // 处理数据库类型变化，更新默认端口
  const handleTypeChange = (type: DatabaseType) => {
    form.setFieldsValue({ port: defaultPorts[type] })
  }

  // 测试连接
  const handleTestConnection = async () => {
    try {
      setTestLoading(true)
      const values = await form.validateFields()
      const testConfig: ConnectionConfig = {
        ...values,
        id: 'test-connection',
        password: values.password || ''
      }
      
      const success = await testConnection(testConfig)
      if (success) {
        message.success('连接测试成功！')
      } else {
        message.error('连接测试失败，请检查配置')
      }
    } catch (error) {
      message.error('表单验证失败，请检查输入')
    } finally {
      setTestLoading(false)
    }
  }

  // 保存连接
  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      if (connection) {
        // 更新现有连接
        updateConnection(connection.id, values)
        message.success('连接更新成功！')
      } else {
        // 添加新连接
        addConnection(values)
        message.success('连接添加成功！')
      }
      
      onCancel()
    } catch (error) {
      message.error('保存失败，请检查输入')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Modal
      title={connection ? '编辑数据库连接' : '新建数据库连接'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        initialValues={{ type: DatabaseType.MYSQL, port: defaultPorts[DatabaseType.MYSQL] }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本配置" key="basic">
            <Form.Item name="name" label="连接名称" rules={[{ required: true, message: '请输入连接名称' }]}>
              <Input placeholder="例如: 本地MySQL" />
            </Form.Item>
            
            <Form.Item name="type" label="数据库类型" rules={[{ required: true, message: '请选择数据库类型' }]}>
              <Select onChange={handleTypeChange}>
                <Option value={DatabaseType.MYSQL}>
                  <Space>
                    <DatabaseOutlined />
                    MySQL
                  </Space>
                </Option>
                <Option value={DatabaseType.POSTGRESQL}>
                  <Space>
                    <DatabaseOutlined />
                    PostgreSQL
                  </Space>
                </Option>
                <Option value={DatabaseType.MONGODB}>
                  <Space>
                    <DatabaseOutlined />
                    MongoDB
                  </Space>
                </Option>
                <Option value={DatabaseType.REDIS}>
                  <Space>
                    <DatabaseOutlined />
                    Redis
                  </Space>
                </Option>
                <Option value={DatabaseType.SQLSERVER}>
                  <Space>
                    <DatabaseOutlined />
                    SQL Server
                  </Space>
                </Option>
                <Option value={DatabaseType.SQLITE}>
                  <Space>
                    <DatabaseOutlined />
                    SQLite
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            {/* 主机和端口在同一行 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <Form.Item 
                name="host" 
                label="主机名" 
                rules={[{ required: true, message: '请输入主机名' }]}
                style={{ flex: 1, marginBottom: 0 }}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Input placeholder="localhost" />
              </Form.Item>
              <Form.Item 
                name="port" 
                label="端口" 
                rules={[{ required: true, message: '请输入端口号' }]}
                style={{ flex: 1, marginBottom: 0 }}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 用户名和密码在同一行 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <Form.Item 
                name="username" 
                label="用户名" 
                rules={[{ required: true, message: '请输入用户名' }]}
                style={{ flex: 1, marginBottom: 0 }}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Input placeholder="root" />
              </Form.Item>
              <Form.Item 
                name="password" 
                label="密码"
                style={{ flex: 1, marginBottom: 0 }}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Input.Password placeholder="" />
              </Form.Item>
            </div>

            {/* 数据库名 */}
            <Form.Item name="database" label="数据库名">
              <Input placeholder="默认数据库" />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="高级配置" key="advanced">
            <Card type="inner" title="SSL配置" style={{ marginBottom: 16 }}>
              <Form.Item name="ssl" label="启用SSL">
                <Switch />
              </Form.Item>
            </Card>
            
            <Card type="inner" title="SSH隧道" style={{ marginBottom: 16 }}>
              <Form.Item name="ssh" label="启用SSH隧道">
                <Switch />
              </Form.Item>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Form.Item 
                  name="sshHost" 
                  label="SSH主机名"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Input placeholder="SSH服务器地址" />
                </Form.Item>
                <Form.Item 
                  name="sshPort" 
                  label="SSH端口"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <InputNumber min={1} max={65535} defaultValue={22} style={{ width: '100%' }} />
                </Form.Item>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Form.Item 
                  name="sshUsername" 
                  label="SSH用户名"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Input placeholder="SSH用户名" />
                </Form.Item>
                <Form.Item 
                  name="sshPassword" 
                  label="SSH密码"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Input.Password placeholder="SSH密码" />
                </Form.Item>
              </div>
              
              <Form.Item name="sshPrivateKey" label="SSH私钥">
                <Input.TextArea rows={4} placeholder="SSH私钥内容" />
              </Form.Item>
              
              <Form.Item name="sshPassphrase" label="SSH私钥密码">
                <Input.Password placeholder="SSH私钥密码" />
              </Form.Item>
            </Card>
            
            <Card type="inner" title="连接选项">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Form.Item 
                  name="timeout" 
                  label="连接超时(秒)"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <InputNumber min={1} max={300} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item 
                  name="charset" 
                  label="字符集"
                  style={{ flex: 1, marginBottom: 0 }}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Input placeholder="例如: utf8mb4" />
                </Form.Item>
              </div>
              
              <Form.Item name="maxConnections" label="最大连接数">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>
        
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={handleTestConnection}
            loading={testLoading}
          >
            测试连接
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            {connection ? '更新' : '保存'}
          </Button>
        </Space>
      </Form>
    </Modal>
  )
}

export default ConnectionDialog