<template>
  <AppLayout
    :active-connection-id="activeConnectionId"
    @new-connection="handleNewConnection"
    @edit-connection="handleEditConnection"
  >
    <QueryEditor v-if="activeConnectionId" />
  </AppLayout>

  <ConnectionDialog
    v-model:visible="connectionDialogVisible"
    :connection="editingConnection"
    @cancel="handleCancelDialog"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from './components/AppLayout/AppLayout.vue'
import QueryEditor from './components/QueryEditor.vue'
import ConnectionDialog from './components/ConnectionDialog.vue'
import { useConnectionStore } from './stores/connection'
import type { ConnectionConfig } from './types/leftTree/connection'
import { useIpcCommunication } from './composables/useIpcCommunication'

const connectionDialogVisible = ref(false)
const editingConnection = ref<ConnectionConfig | null>(null)

const connectionStore = useConnectionStore()
const activeConnectionId = computed(() => connectionStore.activeConnectionId)

const handleNewConnection = () => {
  editingConnection.value = null
  connectionDialogVisible.value = true
}

const handleEditConnection = (connection: ConnectionConfig) => {
  const decryptedConnection = connectionStore.decryptConnection(connection)
  editingConnection.value = decryptedConnection
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

useIpcCommunication(handleNewConnection)
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style>
