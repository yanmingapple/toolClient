import React, { useState, forwardRef, useImperativeHandle } from 'react'
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
}

/**
 * 主操作区面板组件
 */
const MainPanel = forwardRef<MainPanelRef, MainPanelProps>(({
  propertiesContent
}, ref) => {
  // 面板状态
  const [panels, setPanels] = useState<PanelItem[]>([
    {
      id: 'object-0',
      type: 'table',
      title: '对象',
      content: <div>默认对象面板内容</div>
    }
  ])
  const [activePanelId, setActivePanelId] = useState<string | undefined>('object-0')

  // 创建新面板
  const createPanel = (type: PanelType, title: string, content: React.ReactNode) => {
    const panelId = `${type}-${Date.now()}`
    const newPanel: PanelItem = {
      id: panelId,
      type,
      title,
      content
    }
    
    const updatedPanels = [...panels, newPanel]
    setPanels(updatedPanels)
    setActivePanelId(panelId)
  }

  // 更新面板内容
  const updatePanelContent = (panelId: string, content: React.ReactNode) => {
    const updatedPanels = panels.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          content
        }
      }
      return panel
    })
    setPanels(updatedPanels)
  }

  // 关闭面板
  const handleClosePanel = (panelId: string) => {
    // 防止删除默认的"对象"面板
    if (panelId === 'object-0') {
      return
    }
    
    const updatedPanels = panels.filter(panel => panel.id !== panelId)
    setPanels(updatedPanels)
    
    // 如果关闭的是当前激活的面板，激活最后一个面板
    if (panelId === activePanelId) {
      setActivePanelId(updatedPanels[updatedPanels.length - 1]?.id)
    }
  }

  // 切换面板
  const handleSwitchPanel = (panelId: string) => {
    setActivePanelId(panelId)
  }

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