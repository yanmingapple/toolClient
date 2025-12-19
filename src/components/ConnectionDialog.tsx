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

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({ visible, onCancel, connection }) => {
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
      form.setFieldsValue({ type: DatabaseType.MYSQL, port: defaultPorts[DatabaseType.MYSQL] })
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

  // 根据数据库类型显示不同的字段
  const getDatabaseSpecificFields = (type: DatabaseType) => {
    const fields = []
    
    switch (type) {
      case DatabaseType.SQLITE:
        fields.push(
          <Form.Item key="host" name="host" label="数据库文件路径" rules={[{ required: true, message: '请输入数据库文件路径' }]}>
            <Input placeholder="例如: C:\\databases\\mydb.sqlite" />
          </Form.Item>
        )
        break
      default:
        fields.push(
          <Form.Item key="host" name="host" label="主机名" rules={[{ required: true, message: '请输入主机名' }]}>
            <Input placeholder="例如: localhost 或 127.0.0.1" />
          </Form.Item>,
          <Form.Item key="port" name="port" label="端口" rules={[{ required: true, message: '请输入端口号' }]}>
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>,
          <Form.Item key="username" name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="数据库用户名" />
          </Form.Item>,
          <Form.Item key="password" name="password" label="密码">
            <Input.Password placeholder="数据库密码" />
          </Form.Item>,
          <Form.Item key="database" name="database" label="数据库名">
            <Input placeholder="默认数据库" />
          </Form.Item>
        )
    }
    
    return fields
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
        layout="vertical"
        initialValues={{ type: DatabaseType.MYSQL, port: defaultPorts[DatabaseType.MYSQL] }}
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

            {/* 根据数据库类型显示不同的字段 */}
            {getDatabaseSpecificFields(form.getFieldValue('type') || DatabaseType.MYSQL)}
          </TabPane>
          
          <TabPane tab="高级配置" key="advanced">
            <Card type="inner" title="SSL配置" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="ssl" label="启用SSL">
                <Switch />
              </Form.Item>
            </Card>
            
            <Card type="inner" title="SSH隧道" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="ssh" label="启用SSH隧道">
                <Switch />
              </Form.Item>
              
              <Form.Item name="sshHost" label="SSH主机名">
                <Input placeholder="SSH服务器地址" />
              </Form.Item>
              
              <Form.Item name="sshPort" label="SSH端口">
                <InputNumber min={1} max={65535} defaultValue={22} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item name="sshUsername" label="SSH用户名">
                <Input placeholder="SSH用户名" />
              </Form.Item>
              
              <Form.Item name="sshPassword" label="SSH密码">
                <Input.Password placeholder="SSH密码" />
              </Form.Item>
              
              <Form.Item name="sshPrivateKey" label="SSH私钥">
                <Input.TextArea rows={4} placeholder="SSH私钥内容" />
              </Form.Item>
              
              <Form.Item name="sshPassphrase" label="SSH私钥密码">
                <Input.Password placeholder="SSH私钥密码" />
              </Form.Item>
            </Card>
            
            <Card type="inner" title="连接选项" size="small">
              <Form.Item name="timeout" label="连接超时(秒)">
                <InputNumber min={1} max={300} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item name="charset" label="字符集">
                <Input placeholder="例如: utf8mb4" />
              </Form.Item>
              
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