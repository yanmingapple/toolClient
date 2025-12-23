import React from 'react'
import { Tabs, Layout } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { Content, Sider } = Layout

// 定义面板类型
export type PanelType = 'query' | 'function' | 'table' | 'view' | 'backup' | 'model' | 'bi' | 'object'

// 面板项接口
export interface PanelItem {
  id: string
  type: PanelType
  title: string
  content: React.ReactNode
}

interface MainPanelProps {
  /**
   * 当前激活的面板ID
   */
  activePanelId?: string
  /**
   * 面板列表
   */
  panels: PanelItem[]
  /**
   * 关闭面板的回调
   */
  onClosePanel: (panelId: string) => void
  /**
   * 切换面板的回调
   */
  onSwitchPanel: (panelId: string) => void
  /**
   * 右侧属性面板内容
   */
  propertiesContent?: React.ReactNode
}

/**
 * 主操作区面板组件
 */
const MainPanel = ({
  activePanelId,
  panels,
  onClosePanel,
  onSwitchPanel,
  propertiesContent
}: MainPanelProps) => {
  // 渲染标签页
  const renderTabs = () => {
    return panels.map(panel => ({
      key: panel.id,
      label: (
        <span>
          {panel.title}
          {/* 默认的"对象"面板不显示关闭按钮 */}
          {panel.id !== 'object-0' && (
            <CloseOutlined
              onClick={(e) => {
                e.stopPropagation()
                onClosePanel(panel.id)
              }}
              style={{ marginLeft: '8px', cursor: 'pointer' }}
            />
          )}
        </span>
      ),
      children: panel.content
    }))
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Content style={{ padding: 0, overflow: 'auto', height: '100%' }}>
        <Tabs
          activeKey={activePanelId}
          items={renderTabs()}
          onChange={onSwitchPanel}
          style={{ height: '100%' }}
          tabBarStyle={{ borderBottom: '1px solid #f0f0f0', paddingLeft: '16px' }}
        />
      </Content>
      <Sider 
        width={280} 
        style={{ 
          borderLeft: '1px solid #f0f0f0', 
          background: '#fff',
          overflowY: 'auto'
        }}
        theme="light"
      >
        {propertiesContent || (
          <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>属性</h3>
            <p>选择一个对象查看其属性</p>
          </div>
        )}
      </Sider>
    </Layout>
  )
}

export default MainPanel