<template>
  <template v-if="currentPage === 'sidebar'">
    <div class="app-container sidebar-app-container">
      <SidebarPanel />
    </div>
  </template>
  
  <template v-else-if="currentPage === 'toolpanel'">
    <div class="app-container toolpanel-app-container">
      <ToolPanel
        :main-panel-ref="mainPanelRef"
        @open-terminal="handleOpenTerminal"
        @new-connection="handleNewConnection"
        @create-panel="handleCreatePanel"
      />
    </div>
  </template>
  
  <template v-else-if="currentPage === 'ocr'">
    <div class="app-container ocr-app-container">
      <!-- 顶部导航栏 -->
      <header class="ocr-header">
        <div class="header-content">
          <div class="header-back" @click="switchToToolPanel">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </div>
          <h1 class="header-title">{{ ocrPageTitle }}</h1>
          <div class="header-spacer"></div>
        </div>
      </header>
      
      <!-- OCR内容区域 -->
      <div class="ocr-content">
        <component :is="ocrPageComponent" />
      </div>
    </div>
  </template>
  
  <template v-else>
    <div class="app-container workspace-app-container">
      <!-- 工作区加载状态 -->
      <div v-if="isWorkspaceLoading" class="workspace-loading">
        <el-icon class="loading-icon" :size="32">
          <Monitor />
        </el-icon>
        <p>正在加载工作区...</p>
      </div>
      
      <!-- 工作区内容 -->
      <AppLayout
        v-else
        ref="appLayoutRef"
        :active-connection-id="activeConnectionId"
        @new-connection="handleNewConnection"
        @edit-connection="handleEditConnection"
      >
        <template v-if="activeConnectionId">
          <QueryEditor />
        </template>
      </AppLayout>
      
      <div class="back-to-toolpanel" @click="switchToToolPanel">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
    </div>
  </template>
  
  <!-- 全局对话框组件 -->
  <ConnectionDialog
    v-model:visible="connectionDialogVisible"
    :connection="editingConnection"
    @cancel="handleCancelDialog"
  />

  <CommandResult
    v-model:visible="commandResultVisible"
    :title="commandResultTitle"
    :result="commandResult"
  />

  <TerminalConsole 
    v-model="showTerminalConsole" 
    @close="handleTerminalClose" 
  />

  <!-- 日历提醒对话框 -->
  <EventReminder v-model="showEventReminder" />
  
  <!-- 信用卡提醒对话框 -->
  <CreditCardReminder v-model="showCreditCardReminder" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import ToolPanel from './view/home/index.vue'
import TerminalConsole from './clientComponents/TerminalConsole/index.vue'
import ConnectionDialog from './clientComponents/ConnectionDialog/index.vue'
import CommandResult from './clientComponents/CommandResult/index.vue'
import SidebarPanel from './view/sidebar/index.vue'
import EventReminder from './view/home/components/EventReminder.vue'
import CreditCardReminder from './view/home/components/CreditCardReminder.vue'
import { useConnectionStore } from './stores/connection'
import type { ConnectionConfig, TreeNode } from '../electron/model/database'
import { useIpcCommunication as ipcUtils } from './composables/useIpcCommunication'
import { switchMenuType } from './utils/electronUtils'

// 动态引入组件，实现懒加载
const AppLayout = defineAsyncComponent(() => import('./view/database/index.vue'))
const QueryEditor = defineAsyncComponent(() => import('./clientComponents/QueryEditor/index.vue'))
const OCRPage = defineAsyncComponent(() => import('./view/orc/index.vue'))
const TesseractPage = defineAsyncComponent(() => import('./view/orc/tesseract.vue'))
const PaddleOCRPage = defineAsyncComponent(() => import('./view/orc/paddleocr.vue'))
const DeepSeekPage = defineAsyncComponent(() => import('./view/orc/deepseek.vue'))
const Qwen3VLPage = defineAsyncComponent(() => import('./view/orc/qwen3vl.vue'))

const connectionDialogVisible = ref(false)
const editingConnection = ref<TreeNode | null>(null)
const showTerminalConsole = ref(false)
const showEventReminder = ref(false)
const showCreditCardReminder = ref(false)

// OCR页面状态
const ocrPageComponent = ref<any>(OCRPage)
const ocrPageTitle = ref('智能文字识别')
const commandResultVisible = ref(false)
const commandResultTitle = ref('')
const commandResult = ref(null)

// 页面状态管理
const currentPage = ref<'sidebar' | 'toolpanel' | 'workspace'>('toolpanel') // 默认显示工具面板
const appLayoutRef = ref<any>(null)
const mainPanelRef = ref<any>(null)
const isWorkspaceLoading = ref(false) // 工作区加载状态

const connectionStore = useConnectionStore()
const activeConnectionId = computed(() => connectionStore.activeConnectionId)

const handleNewConnection = () => {
  editingConnection.value = null
  connectionDialogVisible.value = true
}

const handleEditConnection = (connection: TreeNode) => {
  editingConnection.value = connection??null;
  connectionDialogVisible.value = true
}

const handleCancelDialog = () => {
  connectionDialogVisible.value = false
  editingConnection.value = null
}

const handleTerminalClose = () => {
  showTerminalConsole.value = false
}

const handleOpenTerminal = () => {
  showTerminalConsole.value = true
}

// 页面切换方法
const switchToToolPanel = async () => {
  currentPage.value = 'toolpanel'
  // 切换到简化的工作区菜单
  await switchMenuType('workspace')
}

const switchToWorkspace = async () => {
  if (currentPage.value === 'workspace') return
  
  isWorkspaceLoading.value = true
  currentPage.value = 'workspace'
  
  // 切换到数据库菜单
  await switchMenuType('database')
  
  // 模拟加载时间，让用户看到加载效果
  setTimeout(() => {
    isWorkspaceLoading.value = false
  }, 100)
}

// 创建面板方法
const handleCreatePanel = (type: any, title: string, content: any) => {
  if (type === 'database') {
    // 数据库入口 - 直接切换到数据库管理页面
    switchToWorkspace()
    return
  }
  
  if (type === 'ocr') {
    // OCR页面 - 切换到OCR模式
    switchToOCR()
    return
  }
  
  // 特定OCR引擎页面
  if (type === 'ocr-tesseract') {
    switchToOCRWithEngine('tesseract', title)
    return
  }
  
  if (type === 'ocr-paddleocr') {
    switchToOCRWithEngine('paddleocr', title)
    return
  }
  
  if (type === 'ocr-deepseek') {
    switchToOCRWithEngine('deepseek', title)
    return
  }
  
  if (type === 'ocr-qwen3vl') {
    switchToOCRWithEngine('qwen3vl', title)
    return
  }
  
  if (appLayoutRef.value && appLayoutRef.value.createPanel) {
    appLayoutRef.value.createPanel(type, title, content)
    switchToWorkspace()
  }
}

// 切换到OCR页面
const switchToOCR = async () => {
  currentPage.value = 'ocr'
  ocrPageComponent.value = OCRPage
  ocrPageTitle.value = '智能文字识别'
}

// 切换到特定OCR引擎页面
const switchToOCRWithEngine = async (engine: string, title: string) => {
  currentPage.value = 'ocr'
  ocrPageTitle.value = title
  
  switch (engine) {
    case 'tesseract':
      ocrPageComponent.value = TesseractPage
      break
    case 'paddleocr':
      ocrPageComponent.value = PaddleOCRPage
      break
    case 'deepseek':
      ocrPageComponent.value = DeepSeekPage
      break
    case 'qwen3vl':
      ocrPageComponent.value = Qwen3VLPage
      break
    default:
      ocrPageComponent.value = OCRPage
  }
}

// 监听打开OCR页面的事件
const handleOpenOCRPage = () => {
  switchToOCR()
}

// 应用启动时从SQLite数据库加载连接数据
onMounted(async () => {
  await connectionStore.initializeConnections()
  
  // 监听打开OCR页面的事件
  window.addEventListener('open-ocr-page', handleOpenOCRPage)
  
  // 监听侧边栏打开OCR页面事件
  window.addEventListener('sidebar-open-ocr', (event: any) => {
    const { engine } = event.detail
    if (engine) {
      switchToOCRWithEngine(engine, getOCRTitle(engine))
    }
  })
  

  
  // 检查是否为侧边栏窗口
  if (window.location.pathname === '/sidebar' || window.location.hash === '#sidebar') {
    currentPage.value = 'sidebar'
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('open-ocr-page', handleOpenOCRPage)
  window.removeEventListener('sidebar-open-ocr', () => {})
})

ipcUtils({
  onOpenNewConnectionDialog: handleNewConnection,
  onOpenTerminalConsole: () => {
    showTerminalConsole.value = true
  },
  onTerminalResult: (data) => {
    commandResultTitle.value = data.title
    commandResult.value = data.result
    commandResultVisible.value = true
  },
  onSidebarOpenCalendar: () => {
    debugger
    showEventReminder.value = true
  },
  onSidebarOpenCreditCard: () => {
    debugger
    showCreditCardReminder.value = true
  }
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}

.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.toolpanel-mode,
.workspace-mode,
.ocr-mode {
  width: 100%;
  height: 100%;
  position: relative;
}

.ocr-mode {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ocr-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.header-back:hover {
  background: #f0f9ff;
  color: #409eff;
}

.header-back .el-icon {
  font-size: 16px;
}

.header-back span {
  font-size: 14px;
  font-weight: 500;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-spacer {
  width: 80px; /* 与返回按钮宽度保持一致，使标题居中 */
}

.ocr-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* 工作区加载状态样式 */
.workspace-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
}

.workspace-loading .loading-icon {
  color: #409eff;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.workspace-loading p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.back-to-toolpanel {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0,0,0.1);
  z-index: 1000;
}

.back-to-toolpanel:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.back-to-toolpanel .el-icon {
  color: #409eff;
  font-size: 16px;
}

.back-to-toolpanel span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.back-to-toolpanel:hover span {
  color: #409eff;
}
</style>
