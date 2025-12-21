/**
 * 顶部导航栏组件
 */
import React from 'react'
import { Layout, Button, Space } from 'antd'
import { PlusOutlined, EyeOutlined, FunctionOutlined, UserOutlined, SearchOutlined, CloudDownloadOutlined, SyncOutlined, LayoutOutlined, PieChartOutlined } from '@ant-design/icons'
import { Icon } from '../../icons'

const { Header } = Layout

interface HeaderBarProps {
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
}

/**
 * 顶部导航栏组件
 */
const HeaderBar: React.FC<HeaderBarProps> = ({
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
  onBI
}) => {
  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
      <Space>
        <Button icon={<Icon name="database" size={16} />} onClick={onConnect}>连接</Button>
        <Button icon={<PlusOutlined />} onClick={onNewQuery}>新建查询</Button>
        <Button icon={<Icon name="table" size={16} />} onClick={onTable}>表</Button>
        <Button icon={<EyeOutlined />} onClick={onView}>视图</Button>
        <Button icon={<FunctionOutlined />} onClick={onFunction}>函数</Button>
        <Button icon={<UserOutlined />} onClick={onUser}>用户</Button>
        <Button onClick={onOther}>其他 ▼</Button>
        <Button icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
        <Button icon={<CloudDownloadOutlined />} onClick={onBackup}>备份</Button>
        <Button icon={<SyncOutlined />} onClick={onAutoRun}>自动运行</Button>
        <Button icon={<LayoutOutlined />} onClick={onModel}>模型</Button>
        <Button icon={<PieChartOutlined />} onClick={onBI}>BI</Button>
      </Space>
    </Header>
  )
}

export default HeaderBar
