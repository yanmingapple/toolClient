/**
 * 顶部导航栏组件
 */
import React from 'react'
import { Layout } from 'antd'
import { PlusOutlined, EyeOutlined, FunctionOutlined, UserOutlined, SearchOutlined, CloudDownloadOutlined, SyncOutlined, LayoutOutlined, PieChartOutlined } from '@ant-design/icons'
import { Icon } from '../../icons'
import type { IconName } from '../../icons/types'

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
 * 导航项数据结构
 */
interface NavItem {
  /**
   * 导航项唯一标识
   */
  key: string
  /**
   * 导航项标签
   */
  label: string
  /**
   * 图标类型 - 自定义Icon或antd Icon组件
   */
  iconType: 'custom' | 'antd'
  /**
   * 图标组件
   */
  icon?: React.ElementType
  /**
   * 图标名称（仅自定义Icon使用）
   */
  iconName?: IconName
  /**
   * 图标属性
   */
  iconProps?: Record<string, any>
  /**
   * 点击事件处理函数
   */
  onClick: () => void
}

/**
 * 顶部导航栏组件
 */
const HeaderBar = ({
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
}: HeaderBarProps) => {
  // 导航项数据数组
  const navItems: NavItem[] = [
    {
      key: 'connect',
      label: '连接',
      iconType: 'custom',
      iconName: 'database',
      iconProps: { size: 24, style: { height: '24px' } },
      onClick: onConnect || (() => {})
    },
    {
      key: 'newQuery',
      label: '新建查询',
      iconType: 'antd',
      icon: PlusOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onNewQuery || (() => {})
    },
    {
      key: 'table',
      label: '表',
      iconType: 'custom',
      iconName: 'table',
      iconProps: { size: 24, style: { height: '24px' } },
      onClick: onTable || (() => {})
    },
    {
      key: 'view',
      label: '视图',
      iconType: 'antd',
      icon: EyeOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onView || (() => {})
    },
    {
      key: 'function',
      label: '函数',
      iconType: 'antd',
      icon: FunctionOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onFunction || (() => {})
    },
    {
      key: 'user',
      label: '用户',
      iconType: 'antd',
      icon: UserOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onUser || (() => {})
    },
    {
      key: 'other',
      label: '其他',
      iconType: 'custom',
      iconProps: { height: '24px' },
      onClick: onOther || (() => {})
    },
    {
      key: 'search',
      label: '查询',
      iconType: 'antd',
      icon: SearchOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onSearch || (() => {})
    },
    {
      key: 'backup',
      label: '备份',
      iconType: 'antd',
      icon: CloudDownloadOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onBackup || (() => {})
    },
    {
      key: 'autoRun',
      label: '自动运行',
      iconType: 'antd',
      icon: SyncOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onAutoRun || (() => {})
    },
    {
      key: 'model',
      label: '模型',
      iconType: 'antd',
      icon: LayoutOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onModel || (() => {})
    },
    {
      key: 'bi',
      label: 'BI',
      iconType: 'antd',
      icon: PieChartOutlined,
      iconProps: { style: { height: '24px' } },
      onClick: onBI || (() => {})
    }
  ]

  // 渲染图标组件
  const renderIcon = (item: NavItem) => {
    if (item.key === 'other') {
      // 特殊处理"其他"按钮的三点图标
      return (
        <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
          <span style={{ marginRight: '2px' }}>⋮</span>
          <span style={{ marginRight: '2px' }}>⋮</span>
          <span>⋮</span>
        </div>
      )
    }
    
    if (item.iconType === 'custom' && item.iconName) {
      return <Icon name={item.iconName} {...item.iconProps} />
    }
    
    if (item.iconType === 'antd' && item.icon) {
      const IconComponent = item.icon
      return <IconComponent {...item.iconProps} />
    }
    
    return null
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px', background: '#fff', borderBottom: '1px solid #e8e8e8', height: '70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '16px' }}>
        {navItems.map(item => (
          <div 
            key={item.key}
            onClick={item.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '4px',
              minHeight: '60px',
              gap: '4px',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
          >
            {renderIcon(item)}
            <span style={{ fontSize: '12px', lineHeight: 'normal' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </Header>
  )
}

export default HeaderBar
