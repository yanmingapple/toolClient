<template>
  <div class="database-connections">
    <div class="panel-header">
      <div class="panel-icon">
        <el-icon><Connection /></el-icon>
      </div>
      <h2 class="panel-title">数据库连接</h2>
      <div class="panel-actions">
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
          :class="{ 'is-connected': connection.status === 'connected' }"
          @click="handleConnectToDatabase(connection)"
        >
          <div class="connection-info">
            <div class="connection-icon-wrapper" :class="connection.status">
              <el-icon class="connection-icon">
                <Connection v-if="connection.status === 'connected'" />
                <CircleClose v-else />
              </el-icon>
            </div>
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
.database-connections {
  margin-bottom: 32px;
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

.panel-actions {
  display: flex;
  gap: 8px;
}

.connection-list-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.connection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  &.is-connected {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #10b981;
  }
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.connection-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  &.connected {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  &.disconnected {
    background: linear-gradient(135deg, #f56c6c 0%, #e64980 100%);
    color: white;
  }
}

.connection-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.connection-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.connection-type {
  font-size: 13px;
  color: #64748b;
}

.connection-status {
  display: flex;
  align-items: center;
}
</style>
