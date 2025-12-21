/**
 * 应用主布局组件
 */
import React from 'react'
import { Layout, Typography, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Icon } from '../../icons'
import HeaderBar from '../HeaderBar'
import ConnectionTree from '../ConnectionTree'
import { TreeNode } from '../../types/tree'

const { Sider, Content } = Layout
const { Title, Paragraph } = Typography

interface AppLayoutProps {
  /**
   * 活动连接ID
   */
  activeConnectionId?: string | null
  /**
   * 内容区域的子组件
   */
  children?: React.ReactNode
  /**
   * 处理新建连接按钮点击
   */
  onNewConnection?: () => void
  /**
   * 处理连接按钮点击
   */
  onConnect?: () => void
  /**
   * 处理新建查询按钮点击
   */
  onNewQuery?: () => void
  /**
   * 处理表按钮点击
   */
  onTable?: () => void
  /**
   * 处理视图按钮点击
   */
  onView?: () => void
  /**
   * 处理函数按钮点击
   */
  onFunction?: () => void
  /**
   * 处理用户按钮点击
   */
  onUser?: () => void
  /**
   * 处理其他按钮点击
   */
  onOther?: () => void
  /**
   * 处理查询按钮点击
   */
  onSearch?: () => void
  /**
   * 处理备份按钮点击
   */
  onBackup?: () => void
  /**
   * 处理自动运行按钮点击
   */
  onAutoRun?: () => void
  /**
   * 处理模型按钮点击
   */
  onModel?: () => void
  /**
   * 处理BI按钮点击
   */
  onBI?: () => void
  /**
   * 处理节点双击事件
   */
  onNodeDoubleClick?: (node: TreeNode) => void
}

/**
 * 应用主布局组件
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  activeConnectionId,
  children,
  onNewConnection,
  onConnect,
  onNewQuery,
  onTable,
  onView,
  onFunction,
  onUser,
  onOther,
  onSearch,
  onBackup,
  onAutoRun,
  onModel,
  onBI,
  onNodeDoubleClick
}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderBar
        onConnect={onConnect}
        onNewQuery={onNewQuery}
        onTable={onTable}
        onView={onView}
        onFunction={onFunction}
        onUser={onUser}
        onOther={onOther}
        onSearch={onSearch}
        onBackup={onBackup}
        onAutoRun={onAutoRun}
        onModel={onModel}
        onBI={onBI}
      />
      
      <Layout>
        <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflowX: 'hidden' }}>
          <ConnectionTree
            onNewConnection={onNewConnection}
            onNodeDoubleClick={onNodeDoubleClick}
          />
        </Sider>
        
        <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
          {activeConnectionId ? (
            children || <div>选择一个数据库或表开始操作</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Icon name="database" size={64} color="#1890ff" style={{ marginBottom: '24px' }} />
              <Title level={2} style={{ marginBottom: '16px' }}>欢迎使用 DBManager Pro</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                一款功能强大的数据库管理工具，支持多种数据库类型
              </Paragraph>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onNewConnection} style={{ marginTop: '24px' }}>
                新建数据库连接
              </Button>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
