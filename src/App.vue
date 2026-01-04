<template>
  <div class="app-container">
    <!-- 工具面板模式 -->
    <div v-if="currentPage === 'toolpanel'" class="toolpanel-mode">
      <ToolPanel
        :main-panel-ref="mainPanelRef"
        @open-terminal="handleOpenTerminal"
        @new-connection="handleNewConnection"
        @create-panel="handleCreatePanel"
      />
    </div>
    
    <!-- 工作面板模式 -->
    <div v-else class="workspace-mode">
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
        <span>返回主工作区</span>
      </div>
    </div>

    <!-- 原有对话框组件 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { ArrowLeft, Monitor } from '@element-plus/icons-vue'
import ToolPanel from './view/workspace/index.vue'
import TerminalConsole from './components/TerminalConsole/index.vue'
import ConnectionDialog from './components/ConnectionDialog/index.vue'
import CommandResult from './components/CommandResult/index.vue'
import { useConnectionStore } from './stores/connection'
import type { ConnectionConfig, TreeNode } from '../electron/model/database'
import { useIpcCommunication } from './composables/useIpcCommunication'
import { switchMenuType } from './utils/electronUtils'

// 动态引入组件，实现懒加载
const AppLayout = defineAsyncComponent(() => import('./view/database/index.vue'))
const QueryEditor = defineAsyncComponent(() => import('./components/QueryEditor/index.vue'))

const connectionDialogVisible = ref(false)
const editingConnection = ref<TreeNode | null>(null)
const showTerminalConsole = ref(false)
const commandResultVisible = ref(false)
const commandResultTitle = ref('')
const commandResult = ref(null)

// 页面状态管理
const currentPage = ref<'toolpanel' | 'workspace'>('toolpanel') // 默认显示工具面板
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
  
  if (appLayoutRef.value && appLayoutRef.value.createPanel) {
    appLayoutRef.value.createPanel(type, title, content)
    switchToWorkspace()
  }
}

// 应用启动时从SQLite数据库加载连接数据
onMounted(async () => {
  await connectionStore.initializeConnections()
})

useIpcCommunication({
  onOpenNewConnectionDialog: handleNewConnection,
  onOpenTerminalConsole: () => {
    showTerminalConsole.value = true
  },
  onTerminalResult: (data) => {
    commandResultTitle.value = data.title
    commandResult.value = data.result
    commandResultVisible.value = true
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
.workspace-mode {
  width: 100%;
  height: 100%;
  position: relative;
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
