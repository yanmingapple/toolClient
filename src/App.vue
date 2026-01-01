<template>
  <AppLayout
    :active-connection-id="activeConnectionId"
    @new-connection="handleNewConnection"
    @edit-connection="handleEditConnection"
  >
    <template v-if="activeConnectionId">
      <QueryEditor />
    </template>
    <template v-if="showTerminalConsole">
      <TerminalConsole />
    </template>
  </AppLayout>

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from './components/AppLayout/AppLayout.vue'
import QueryEditor from './components/QueryEditor.vue'
import TerminalConsole from './components/TerminalConsole.vue'
import ConnectionDialog from './components/ConnectionDialog.vue'
import CommandResult from './components/CommandResult.vue'
import { useConnectionStore } from './stores/connection'
import type { ConnectionConfig, TreeNode } from '../electron/model/database'
import { useIpcCommunication } from './composables/useIpcCommunication'

const connectionDialogVisible = ref(false)
const editingConnection = ref<TreeNode | null>(null)
const showTerminalConsole = ref(false)
const commandResultVisible = ref(false)
const commandResultTitle = ref('')
const commandResult = ref(null)

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
</style>
