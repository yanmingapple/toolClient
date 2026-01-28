<template>
  <div class="dialog-container">
    <ConnectionDialog
      v-model:visible="dialogVisible"
      :connection="connection"
      @cancel="handleClose"
      @success="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ConnectionDialog from '../clientComponents/ConnectionDialog/index.vue'
import type { TreeNode } from '../../electron/model/database'
import { closeCurrentWindow } from '../utils/electronUtils'

const dialogVisible = ref(true)
const connection = ref<TreeNode | null>(null)

// 从 URL 参数中获取连接数据
onMounted(() => {
  const hash = window.location.hash
  const hashParts = hash.split('?')
  if (hashParts.length > 1) {
    const urlParams = new URLSearchParams(hashParts[1])
    const connectionData = urlParams.get('connection')
    if (connectionData) {
      try {
        connection.value = JSON.parse(decodeURIComponent(connectionData))
      } catch (e) {
        console.error('Failed to parse connection data:', e)
      }
    }
  }
})

const handleClose = () => {
  closeCurrentWindow()
}
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
</style>

