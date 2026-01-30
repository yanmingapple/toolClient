<template>
  <div class="dashboard-container" ref="mainPanelRef">
    <!-- 紧凑的顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-section">
          <el-icon class="logo-icon"><Grid /></el-icon>
          <h1 class="dashboard-title">工具集</h1>
        </div>
        <div class="header-events" @click="handleOpenEventReminder">
          <el-icon><Bell /></el-icon>
          <span class="events-label">事件</span>
          <span class="events-count" :class="{ 'has-events': upcomingEvents.length > 0 }">{{ upcomingEvents.length }}</span>
        </div>
      </div>
      <div class="header-right">
        <DigitalClock />
      </div>
    </header>

    <!-- 主内容区 - 紧凑网格布局 -->
    <main class="dashboard-main">
      <!-- 工具集卡片（合并了快速操作） -->
      <section class="card tools-card">
        <div class="card-header">
          <el-icon class="card-icon"><Tools /></el-icon>
          <span class="card-title">工具集</span>
        </div>
        <ToolSets 
          @open-event-reminder="handleOpenEventReminder"
          @create-panel="handleCreatePanel" 
          @open-terminal="handleOpenTerminal"
          @open-dbgate="handleOpenDbgate"
        />
      </section>

      <!-- AI智能助手卡片 -->
      <section class="card ai-assistant-card">
        <div class="card-header">
          <el-icon class="card-icon"><MagicStick /></el-icon>
          <span class="card-title">AI智能助手</span>
        </div>
        <AIAssistant 
          @event-created="handleEventCreated"
          @todo-created="handleTodoCreated"
          @refresh="handleRefreshAI"
        />
      </section>

      <!-- AI智能推荐卡片 -->
      <section class="card ai-card">
        <div class="card-header">
          <el-icon class="card-icon"><MagicStick /></el-icon>
          <span class="card-title">AI智能推荐</span>
          <el-button type="primary" size="small" text @click="handleRefreshAI">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <AISuggestionsPanel :events="allEvents" />
      </section>

      <!-- Plan-and-Solve 执行过程展示 -->
      <section class="card plan-execution-card">
        <div class="card-header">
          <el-icon class="card-icon"><List /></el-icon>
          <span class="card-title">AI执行过程</span>
        </div>
        <PlanExecutionViewer />
      </section>

      <!-- 服务监控卡片 -->
      <section class="card monitor-card">
        <div class="card-header">
          <el-icon class="card-icon"><Monitor /></el-icon>
          <span class="card-title">服务监控</span>
          <el-button type="primary" size="small" text @click="handleRefreshMonitor">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <ServiceMonitor />
      </section>
    </main>

    <!-- AI配置对话框 -->
    <AIConfigDialog v-model="showAIConfig" @saved="handleAIConfigSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Monitor, Refresh,
  Tools, Grid, Bell, MagicStick, List
} from '@element-plus/icons-vue'

// import { useConnectionStore } from '@/stores/connection'
import ServiceMonitor from '../monitor/index.vue'
import ToolSets from './components/ToolSets.vue'
import DigitalClock from './components/DigitalClock.vue'
import AIConfigDialog from './components/AIConfigDialog.vue'
import AISuggestionsPanel from './components/AISuggestionsPanel.vue'
import AIAssistant from './components/AIAssistant.vue'
import PlanExecutionViewer from './components/PlanExecutionViewer.vue'
import { openEventReminderDialog } from '../../utils/electronUtils'

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

// 导入 ElMessage
import { ElMessage } from 'element-plus'

// Store (保留以备将来使用)
// const connectionStore = useConnectionStore()

// State
const events = ref<any[]>([])
const showAIConfig = ref(false)
const allEvents = ref<any[]>([])

// Computed
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
const loadEvents = async () => {
  // 从数据库加载事件
  try {
    const result = await (window as any).electronAPI.event.getAll()
    if (result.success && result.data) {
      allEvents.value = result.data
      events.value = result.data
    } else {
      allEvents.value = []
      events.value = []
    }
  } catch (e) {
    console.error('Failed to load events:', e)
    allEvents.value = []
    events.value = []
  }
}

const handleRefreshAI = () => {
  // 刷新AI建议
  loadEvents()
  ElMessage.success('AI建议已刷新')
}

const handleEventCreated = () => {
  // 事件创建后刷新
  loadEvents()
}

const handleTodoCreated = () => {
  // 代办创建后刷新
  loadEvents()
}

// Methods
const handleCreatePanel = (type: string, title: string, content: any) => {
  emit('createPanel', type, title, content)
}

const handleOpenTerminal = () => {
  emit('openTerminal')
}

const handleOpenDbgate = async () => {
  try {
    // 使用 electronUtils 中的安全方法
    const { getSafeIpcRenderer } = await import('../../utils/electronUtils')
    const electronAPI = getSafeIpcRenderer()
    
    if (electronAPI?.dbgate) {
      const result = await electronAPI.dbgate.open()
      if (!result.success) {
        ElMessage.error(result.error || '打开 DbGate 失败')
      } else {
        ElMessage.success('DbGate 已打开')
      }
    } else {
      ElMessage.warning('DbGate 功能在当前环境中不可用')
    }
  } catch (error) {
    console.error('Failed to open dbgate:', error)
    ElMessage.error('打开 DbGate 时发生错误')
  }
}

const handleOpenEventReminder = async () => {
  await openEventReminderDialog()
}

const handleRefreshMonitor = () => {
  // 刷新监控数据
  console.log('刷新监控数据')
}

const handleAIConfigSaved = () => {
  ElMessage.success('AI配置已保存')
}

// 监听来自主进程的打开AI配置对话框事件
onMounted(() => {
  console.log('Dashboard mounted')
  loadEvents()
  
  // 监听菜单触发的AI配置对话框打开事件
  if (window.electronAPI?.onOpenAIConfig) {
    window.electronAPI.onOpenAIConfig(() => {
      showAIConfig.value = true
    })
  }
})

onMounted(() => {
  console.log('Dashboard mounted')
  loadEvents()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-height: 100vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

// 紧凑的顶部标题栏
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
  font-size: 20px;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.header-events {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }

  .el-icon {
    font-size: 16px;
  }
}

.events-label {
  font-size: 13px;
  font-weight: 500;
}

.events-count {
  font-size: 14px;
  font-weight: 700;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  min-width: 24px;
  text-align: center;
  
  &.has-events {
    background: #4ade80;
    color: #166534;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 主内容区 - 紧凑网格布局
.dashboard-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 12px;
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 紧凑的卡片样式
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  flex: 1;
}

// 特定卡片布局
.quick-actions-card {
  min-height: 200px;
}

.monitor-card {
  min-height: 300px;
}

.tools-card {
  min-height: 250px;
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px;
  }

  .dashboard-header {
    padding: 10px 16px;
    flex-direction: column;
    gap: 12px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .header-events {
    width: 100%;
    justify-content: center;
  }

  .dashboard-title {
    font-size: 18px;
  }

  .card {
    padding: 12px;
  }

  .card-title {
    font-size: 14px;
  }
}
</style>
