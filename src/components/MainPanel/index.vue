<template>
  <el-container class="main-panel">
    <el-main style="padding: 0; overflow: auto; height: 100%">
      <el-tabs
        v-model="activePanelId"
        @onTabChange="handleSwitchPanel"
        :style="{ height: '100%' }"
      >
        <el-tab-pane
          v-for="panel in panels"
          :key="panel.id"
          :name="panel.id"
        >
          <template #label>
            <span>
              {{ panel.title }}
              <el-icon
                v-if="panel.id !== 'object-0'"
                class="close-icon"
                @click.stop="handleClosePanel(panel.id)"
              >
                <Close />
              </el-icon>
            </span>
          </template>
          <component :is="panel.content" />
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <el-aside
      width="280px"
      style="border-left: 1px solid #f0f0f0; background: #fff; overflow-y: auto"
    >
      <slot name="properties">
        <div style="padding: 16px">
          <el-text tag="h3" style="margin-bottom: 16px; font-size: 14px; font-weight: bold">属性</el-text>
          <el-text type="info">选择一个对象查看其属性</el-text>
        </div>
      </slot>
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { usePanelManagement } from '../../composables/usePanelManagement'
import type { PropertiesObject } from '../PropertiesPanel'

export type PanelType = 'query' | 'function' | 'table' | 'view' | 'backup' | 'model' | 'bi' | 'object'

export interface PanelItem {
  id: string
  type: PanelType
  title: string
  content: any
}

export interface MainPanelRef {
  createPanel: (type: PanelType, title: string, content: any) => void
  updatePanelContent: (panelId: string, content: any) => void
}

interface MainPanelProps {
  propertiesContent?: any
  selectedObject?: PropertiesObject | null
}

const props = defineProps<MainPanelProps>()

const {
  panels,
  activePanelId,
  createPanel: _createPanel,
  updatePanelContent: _updatePanelContent,
  handleClosePanel: _handleClosePanel,
  handleSwitchPanel: _handleSwitchPanel
} = usePanelManagement()

const createPanel = (type: PanelType, title: string, content: any) => {
  _createPanel(type, title, content)
}

const updatePanelContent = (panelId: string, content: any) => {
  _updatePanelContent(panelId, content)
}

const handleClosePanel = (panelId: string) => {
  _handleClosePanel(panelId)
}

const handleSwitchPanel = (panelId: string) => {
  _handleSwitchPanel(panelId)
}

defineExpose({
  createPanel,
  updatePanelContent
})
</script>

<style scoped>
.main-panel {
  height: 100%;
}

.close-icon {
  margin-left: 8px;
  cursor: pointer;
}

.close-icon:hover {
  color: #f56c6c;
}
</style>
