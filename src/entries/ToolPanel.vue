<template>
  <div class="app-container toolpanel-app-container">
    <ToolPanel
      :main-panel-ref="mainPanelRef"
      @open-terminal="handleOpenTerminal"
      @new-connection="handleNewConnection"
      @create-panel="handleCreatePanel"
    />
    <!-- 恢复提醒对话框 -->
    <InterruptionReminderDialog
      v-model="reminderDialogVisible"
      :interruption="currentReminder"
      @mark-handled="handleReminderMarkHandled"
      @continue="handleReminderContinue"
    />
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolPanel from '../view/home/index.vue'
import InterruptionReminderDialog from '../components/InterruptionReminderDialog.vue'
import { useConnectionStore } from '../stores/connection'
import type { TreeNode } from '../../electron/model/database'
import { useIpcCommunication as ipcUtils } from '../composables/useIpcCommunication'
import { createWindow, openConnectionDialog, openCommandResultDialog, openTerminalDialog, openEventReminderDialog, openCreditCardDialog } from '../utils/electronUtils'

const reminderDialogVisible = ref(false)
const currentReminder = ref<any>(null)

const mainPanelRef = ref<any>(null)
const connectionStore = useConnectionStore()

const handleNewConnection = async () => {
  await openConnectionDialog()
}

const handleEditConnection = async (connection: TreeNode) => {
  await openConnectionDialog(connection)
}

const handleOpenTerminal = async () => {
  await openTerminalDialog()
}

// 创建面板方法 - 改为打开新窗口
const handleCreatePanel = async (type: any, title: string, content: any) => {
  if (type === 'database') {
    await createWindow({
      page: 'workspace',
      title: '数据库工作区'
    })
    return
  }
  
}

// 应用启动时从SQLite数据库加载连接数据
import { onMounted } from 'vue'
onMounted(async () => {
  await connectionStore.initializeConnections()
})

const handleInterruptionReminder = (data: any) => {
  if (data && data.interruption) {
    currentReminder.value = data.interruption
    reminderDialogVisible.value = true
  }
}

const handleReminderMarkHandled = (interruptionId: string) => {
  currentReminder.value = null
}

const handleReminderContinue = (interruption: any) => {
  // 可以在这里添加继续任务的逻辑，比如打开相关的事件或任务
  console.log('继续任务:', interruption)
  currentReminder.value = null
}

ipcUtils({
  onOpenNewConnectionDialog: handleNewConnection,
  onOpenTerminalConsole: () => {
    openTerminalDialog()
  },
  onTerminalResult: (data) => {
    openCommandResultDialog(data.title, data.result)
  },
  onSidebarOpenCalendar: () => {
    openEventReminderDialog()
  },
  onSidebarOpenCreditCard: () => {
    openCreditCardDialog()
  },
  onInterruptionReminderTriggered: handleInterruptionReminder
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>

