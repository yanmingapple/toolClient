/**
 * 面板管理相关Hook
 */
import React, { useState } from 'react'
import { PanelType, PanelItem } from '../components/MainPanel/MainPanel'

/**
 * 面板管理Hook
 * @returns 面板管理相关的状态和操作函数
 */
export const usePanelManagement = () => {
  // 面板状态
  const [panels, setPanels] = useState<PanelItem[]>([
    {
      id: 'object-0',
      type: 'table',
      title: '对象',
      content: "默认对象面板内容"
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

  return {
    // 状态
    panels,
    activePanelId,
    
    // 操作函数
    createPanel,
    updatePanelContent,
    handleClosePanel,
    handleSwitchPanel
  }
}