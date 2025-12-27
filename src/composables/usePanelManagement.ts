import { ref, shallowRef } from 'vue'
import type { PanelType, PanelItem } from '../components/MainPanel/MainPanel'

export const usePanelManagement = () => {
  const panels = ref<PanelItem[]>([
    {
      id: 'object-0',
      type: 'table',
      title: '对象',
      content: shallowRef('默认对象面板内容')
    }
  ])
  const activePanelId = ref<string | undefined>('object-0')

  const createPanel = (type: PanelType, title: string, content: any) => {
    const panelId = `${type}-${Date.now()}`
    const newPanel: PanelItem = {
      id: panelId,
      type,
      title,
      content: shallowRef(content)
    }

    panels.value = [...panels.value, newPanel]
    activePanelId.value = panelId
  }

  const updatePanelContent = (panelId: string, content: any) => {
    panels.value = panels.value.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          content: shallowRef(content)
        }
      }
      return panel
    })
  }

  const handleClosePanel = (panelId: string) => {
    if (panelId === 'object-0') {
      return
    }

    const updatedPanels = panels.value.filter(panel => panel.id !== panelId)
    panels.value = updatedPanels

    if (panelId === activePanelId.value) {
      activePanelId.value = updatedPanels[updatedPanels.length - 1]?.id
    }
  }

  const handleSwitchPanel = (panelId: string) => {
    activePanelId.value = panelId
  }

  return {
    panels,
    activePanelId,
    createPanel,
    updatePanelContent,
    handleClosePanel,
    handleSwitchPanel
  }
}
