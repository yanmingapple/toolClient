import React from 'react'
import { Layout, Menu, Button, Space, Typography } from 'antd'
import { DatabaseOutlined, PlusOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={3} style={{ margin: 0, color: '#262626' }}>DBManager Pro</Title>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>新建连接</Button>
          <Button icon={<SettingOutlined />}>设置</Button>
          <Button icon={<UserOutlined />}>用户</Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<DatabaseOutlined />}>
              连接管理
            </Menu.Item>
            <Menu.Item key="2" icon={<DatabaseOutlined />}>
              MySQL
            </Menu.Item>
            <Menu.Item key="3" icon={<DatabaseOutlined />}>
              PostgreSQL
            </Menu.Item>
            <Menu.Item key="4" icon={<DatabaseOutlined />}>
              MongoDB
            </Menu.Item>
            <Menu.Item key="5" icon={<DatabaseOutlined />}>
              Redis
            </Menu.Item>
            <Menu.Item key="6" icon={<DatabaseOutlined />}>
              SQL Server
            </Menu.Item>
            <Menu.Item key="7" icon={<DatabaseOutlined />}>
              SQLite
            </Menu.Item>
          </Menu>
        </Sider>
        <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <DatabaseOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
            <Title level={2} style={{ marginBottom: '16px' }}>欢迎使用 DBManager Pro</Title>
            <Typography.Paragraph style={{ fontSize: '16px', color: '#666' }}>
              一款功能强大的数据库管理工具，支持多种数据库类型
            </Typography.Paragraph>
            <Button type="primary" size="large" icon={<PlusOutlined />} style={{ marginTop: '24px' }}>
              新建数据库连接
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App