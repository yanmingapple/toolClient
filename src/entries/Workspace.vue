<template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { useConnectionStore } from '../stores/connection'
import type { TreeNode } from '../../electron/model/database'
import { openConnectionDialog } from '../utils/electronUtils'
import { switchMenuType } from '../utils/electronUtils'

// 动态引入组件，实现懒加载
const AppLayout = defineAsyncComponent(() => import('../view/database/index.vue'))
const QueryEditor = defineAsyncComponent(() => import('../clientComponents/QueryEditor/index.vue'))

const isWorkspaceLoading = ref(false)
const appLayoutRef = ref<any>(null)

const connectionStore = useConnectionStore()
const activeConnectionId = computed(() => connectionStore.activeConnectionId)

const handleNewConnection = async () => {
  await openConnectionDialog()
}

const handleEditConnection = async (connection: TreeNode) => {
  await openConnectionDialog(connection)
}

onMounted(async () => {
  await connectionStore.initializeConnections()
  
  isWorkspaceLoading.value = true
  // 切换到数据库菜单
  await switchMenuType('database')
  
  // 模拟加载时间，让用户看到加载效果
  setTimeout(() => {
    isWorkspaceLoading.value = false
  }, 100)
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

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
</style>

