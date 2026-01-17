<template>
  <div class="database-connections">
    <div class="section-header">
      <h2 class="section-title">数据库连接</h2>
      <div class="section-actions">
        <el-button size="small" @click="handleRefreshConnections">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="handleAddConnection">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>
    <div class="connection-list-container">
      <div class="connection-list">
        <div 
          v-for="connection in connectionStore.connections" 
          :key="connection.id" 
          class="connection-item"
          @click="handleConnectToDatabase(connection)"
        >
          <div class="connection-info">
            <el-icon class="connection-icon" :class="connection.status">
              <Connection v-if="connection.status === 'connected'"/>
              <CircleClose v-else />
            </el-icon>
            <div class="connection-details">
              <div class="connection-name">{{ connection.name }}</div>
              <div class="connection-type">{{ connection.type }} - {{ connection.host }}</div>
            </div>
          </div>
          <div class="connection-status">
            <el-tag 
              :type="connection.status === 'connected' ? 'success' : 'info'"
              size="small"
            >
              {{ connection.status === 'connected' ? '已连接' : '未连接' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Refresh, Plus, Connection, CircleClose } from '@element-plus/icons-vue'

import { useConnectionStore } from '@/stores/connection'
import type { TreeNode } from '../../../electron/model/database'

const emit = defineEmits<{
  newConnection: []
  connectToDatabase: [connection: TreeNode]
}>()

const connectionStore = useConnectionStore()

const handleRefreshConnections = () => {
  connectionStore.initializeConnections()
  CTMessage.success('数据库连接已刷新')
}

const handleAddConnection = () => {
  emit('newConnection')
}

const handleConnectToDatabase = async (connection: TreeNode) => {
  try {
    await connectionStore.setActiveConnection(connection.id)
    CTMessage.success(`已连接到: ${connection.name}`)
    emit('connectToDatabase', connection)
  } catch (error) {
    CTMessage.error('连接失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  connectionStore.initializeConnections()
})
</script>

<style scoped>
.database-connections { margin-bottom: 32px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 18px; font-weight: 600; color: #303133; margin: 0; padding-bottom: 8px; border-bottom: 2px solid #409eff; }
.connection-list-container { background: white; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; }
.connection-list { display: flex; flex-direction: column; gap: 12px; }
.connection-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
.connection-item:hover { background: #f0f9ff; border-color: #91d5ff; }
.connection-info { display: flex; align-items: center; gap: 12px; }
.connection-icon { font-size: 20px; }
.connection-icon.connected { color: #67c23a; }
.connection-icon.disconnected { color: #f56c6c; }
.connection-details { display: flex; flex-direction: column; gap: 2px; }
.connection-name { font-size: 14px; font-weight: 500; color: #303133; }
.connection-type { font-size: 12px; color: #909399; }
.connection-status { display: flex; align-items: center; }
</style>