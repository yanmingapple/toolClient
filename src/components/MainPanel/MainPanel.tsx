import React, { forwardRef, useImperativeHandle } from 'react'
import { Tabs, Layout } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { usePanelManagement } from '../../hooks/usePanelManagement'
import { PropertiesObject } from '../PropertiesPanel'

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

// 定义组件引用类型
export interface MainPanelRef {
  createPanel: (type: PanelType, title: string, content: React.ReactNode) => void
  updatePanelContent: (panelId: string, content: React.ReactNode) => void
}

interface MainPanelProps {
  /**
   * 右侧属性面板内容
   */
  propertiesContent?: React.ReactNode
  /**
   * 当前选中的对象
   */
  selectedObject?: PropertiesObject | null
}

/**
 * 主操作区面板组件
 */
const MainPanel = forwardRef<MainPanelRef, MainPanelProps>(({
  propertiesContent,
  selectedObject: _selectedObject
}, ref) => {
  // 使用自定义hook管理面板状态
  const {
    panels,
    activePanelId,
    createPanel,
    updatePanelContent,
    handleClosePanel,
    handleSwitchPanel
  } = usePanelManagement()
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
                handleClosePanel(panel.id)
              }}
              style={{ marginLeft: '8px', cursor: 'pointer' }}
            />
          )}
        </span>
      ),
      children: panel.content
    }))
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    createPanel,
    updatePanelContent
  }))

  return (
    <Layout style={{ height: '100%' }}>
      <Content style={{ padding: 0, overflow: 'auto', height: '100%' }}>
        <Tabs
          activeKey={activePanelId}
          items={renderTabs()}
          onChange={handleSwitchPanel}
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
})

// 设置组件的displayName
MainPanel.displayName = 'MainPanel'

export default MainPanel