<template>
  <div class="app-container toolpanel-app-container">
    <ToolPanel
      :main-panel-ref="mainPanelRef"
      @open-terminal="handleOpenTerminal"
      @new-connection="handleNewConnection"
      @create-panel="handleCreatePanel"
    />
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolPanel from '../view/home/index.vue'
import { useConnectionStore } from '../stores/connection'
import type { TreeNode } from '../../electron/model/database'
import { useIpcCommunication as ipcUtils } from '../composables/useIpcCommunication'
import { createWindow, openConnectionDialog, openCommandResultDialog, openTerminalDialog, openEventReminderDialog, openCreditCardDialog } from '../utils/electronUtils'

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
  }
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>

