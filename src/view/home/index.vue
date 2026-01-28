<template>
  <div class="dashboard-container" ref="mainPanelRef">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon><Grid /></el-icon>
            </div>
            <h1 class="dashboard-title">工具集</h1>
          </div>
          <div class="header-events" @click="handleOpenEventReminder">
            <div class="events-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="events-info">
              <div class="events-label">最近事件</div>
              <div class="events-count" :class="{ 'has-events': upcomingEvents.length > 0 }">{{ upcomingEvents.length }}</div>
            </div>
            <div class="events-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        <div class="header-right">
          <DigitalClock />
        </div>
      </div>
    </header>
    

    <!-- 主内容区 -->
    <main class="dashboard-main">
      <!-- 顶部快速操作和AI工具 -->
      <div class="top-section">
        <!-- 主要工具面板 -->
        <section class="panel main-tools-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <el-icon><Tools /></el-icon>
            </div>
            <h2 class="panel-title">工具集合</h2>
          </div>
          <QuickActions @create-panel="handleCreatePanel" @open-terminal="handleOpenTerminal" />
        </section>

        <!-- AI识别工具面板 -->
        <section class="panel ai-tools-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <el-icon><MagicStick /></el-icon>
            </div>
            <h2 class="panel-title">AI工具</h2>
          </div>
          <div class="ai-tool-items">
            <div class="ai-tool-item" @click="handleOpenOCR('tesseract')">
              <div class="ai-tool-icon tesseract">
                <el-icon><MagicStick /></el-icon>
              </div>
              <div class="ai-tool-info">
                <div class="ai-tool-title">Tesseract</div>
                <div class="ai-tool-desc">经典开源OCR引擎</div>
              </div>
              <div class="ai-tool-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="ai-tool-item" @click="handleOpenOCR('paddleocr')">
              <div class="ai-tool-icon paddleocr">
                <el-icon><Document /></el-icon>
              </div>
              <div class="ai-tool-info">
                <div class="ai-tool-title">PaddleOCR</div>
                <div class="ai-tool-desc">轻量级中文识别</div>
              </div>
              <div class="ai-tool-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="ai-tool-item" @click="handleOpenOCR('deepseek')">
              <div class="ai-tool-icon deepseek">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="ai-tool-info">
                <div class="ai-tool-title">DeepSeek</div>
                <div class="ai-tool-desc">多模态AI识别</div>
              </div>
              <div class="ai-tool-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="ai-tool-item" @click="handleOpenOCR('qwen3vl')">
              <div class="ai-tool-icon qwen3vl">
                <el-icon><Picture /></el-icon>
              </div>
              <div class="ai-tool-info">
                <div class="ai-tool-title">Qwen3-VL</div>
                <div class="ai-tool-desc">视觉语言模型</div>
              </div>
              <div class="ai-tool-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 服务监控面板 -->
      <section class="panel monitor-panel">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <h2 class="panel-title">服务监控</h2>
          <el-button type="primary" size="small" @click="handleRefreshMonitor">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <ServiceMonitor />
      </section>

      <!-- 系统信息面板 -->
      <section class="panel system-info-panel">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <h2 class="panel-title">系统信息</h2>
        </div>
        <SystemInfo />
      </section>

      <!-- 工具集面板 -->
      <section class="panel tools-panel">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <h2 class="panel-title">工具集</h2>
        </div>
        <ToolSets 
  @open-ocr="handleOpenOCR" 
  @open-event-reminder="handleOpenEventReminder"
  @open-paddleocr="() => handleOpenOCR('paddleocr')"
  @open-deepseek="() => handleOpenOCR('deepseek')"
  @open-qwen3vl="() => handleOpenOCR('qwen3vl')"
  @open-tesseract="() => handleOpenOCR('tesseract')"
/>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Monitor, Refresh, Download, Upload, Connection, CircleCheck, CircleClose,
  Tools, ArrowRight, CopyDocument, Edit, PieChart, InfoFilled, Cpu,
  Folder, Timer, Clock, Grid, View, Document, MagicStick, UserFilled
} from '@element-plus/icons-vue'

import { useConnectionStore } from '@/stores/connection'
import ServiceMonitor from '../monitor/index.vue'
import QuickActions from './components/QuickActions.vue'
import ToolSets from './components/ToolSets.vue'
import SystemInfo from './components/SystemInfo.vue'
import DigitalClock from './components/DigitalClock.vue'
import { openEventReminderDialog } from '../../utils/electronUtils'
import type { TreeNode } from '../../../electron/model/database'

// Props
interface Props {
  mainPanelRef?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  openTerminal: []
  createPanel: [type: any, title: string, content: any]
}>()

// Store
const connectionStore = useConnectionStore()

// State
const events = ref<any[]>([])

// Computed
const activeConnections = computed(() => {
  return connectionStore.connections.filter(c => c.status === 'connected').length
})

const upcomingEvents = computed(() => {
  return events.value
    .filter(event => {
      const eventTime = new Date(`${event.date} ${event.time}`).getTime()
      return eventTime > Date.now()
    })
    .sort((a, b) => {
      const timeA = new Date(`${a.date} ${a.time}`).getTime()
      const timeB = new Date(`${b.date} ${b.time}`).getTime()
      return timeA - timeB
    })
    .slice(0, 5)
})

// Methods
const loadEvents = () => {
  const stored = localStorage.getItem('calendar_events')
  if (stored) {
    try {
      events.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load events:', e)
      events.value = []
    }
  }
}

// Methods
const handleOpenOCR = (engine: string) => {
  const titles: Record<string, string> = {
    'tesseract': 'Tesseract OCR 识别',
    'paddleocr': 'PaddleOCR 识别',
    'deepseek': 'DeepSeek 识别',
    'qwen3vl': 'Qwen3-VL 识别'
  }
  emit('createPanel', `ocr-${engine}`, titles[engine] || '文字识别', { engine })
}

const handleCreatePanel = (type: string, title: string, content: any) => {
  emit('createPanel', type, title, content)
}

const handleOpenTerminal = () => {
  emit('openTerminal')
}

const handleOpenEventReminder = async () => {
  await openEventReminderDialog()
}

const handleRefreshMonitor = () => {
  // 刷新监控数据
  console.log('刷新监控数据')
}

onMounted(() => {
  console.log('Dashboard mounted')
  loadEvents()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-height: 100vh;
  overflow-y: auto;
  padding-right: 12px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 30px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.header-events {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

.event-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.event-count {
  font-size: 24px;
  font-weight: 700;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-width: 40px;
  text-align: center;
  
  &.has-events {
    background: #4ade80;
    color: #166534;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}



.dashboard-main {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.top-section {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.panel-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  flex: 1;
}

.main-tools-panel {
  grid-column: 1 / 9;
}

.ai-tools-panel {
  grid-column: 9 / -1;
}

.ai-tool-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.ai-tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 72px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
}

.ai-tool-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 80px;

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
}

.ai-tool-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.ai-tool-icon.tesseract {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai-tool-icon.paddleocr {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.ai-tool-icon.deepseek {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.ai-tool-icon.qwen3vl {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.ai-tool-info {
  flex: 1;
  min-width: 0;
}

.ai-tool-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-tool-desc {
  font-size: 12px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-tool-arrow {
  font-size: 16px;
  opacity: 0.8;
  flex-shrink: 0;
}

.monitor-panel {
  grid-column: 1 / 9;
}

.system-info-panel {
  grid-column: 9 / -1;
}

.tools-panel {
  grid-column: 1 / -1;
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-main {
    grid-template-columns: repeat(6, 1fr);
  }

  .main-tools-panel,
  .ai-tools-panel,
  .monitor-panel,
  .system-info-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
    padding-right: 8px;
  }

  .dashboard-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 16px;
  }

  .dashboard-title {
    font-size: 22px;
  }

  .panel {
    padding: 16px;
  }

  .panel-title {
    font-size: 18px;
  }

  .ai-tool-items {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
