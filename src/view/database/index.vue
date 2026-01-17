<template>
  <div class="database-layout">
    <div class="database-header">
      <HeaderBar
        :on-connect="onConnect"
        :on-new-query="handleNewQueryClick"
        :on-table="handleTableClick"
        :on-view="handleViewClick"
        :on-function="handleFunctionClick"
        :on-user="onUser"
        :on-other="onOther"
        :on-search="onSearch"
        :on-backup="handleBackupClick"
        :on-auto-run="onAutoRun"
        :on-model="handleModelClick"
        :on-b-i="handleBIClick"
      />
    </div>

    <div class="database-body">
      <div class="database-sidebar">
        <ConnectionTree
          :on-new-connection="onNewConnection"
          :on-edit-connection="onEditConnection"
          :on-node-select="handleNodeSelect"
          :update-selected-node="updateSelectedNode"
          @close-database="handleCloseDatabase"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="database-main">
        <MainPanel
          ref="mainPanelRef"
          :properties-content="propertiesContent"
        />
      </div>
    </div>

    <div class="database-footer">
      <span>ToolClient Database Manager © 2024</span>
    </div>

    <!-- 连接对话框 -->
    <ConnectionDialog
      v-model:visible="connectionDialogVisible"
      :connection="editingConnection"
      @cancel="handleCancelDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import HeaderBar from '@/clientComponents/HeaderBar/index.vue'
import ConnectionTree from '@/clientComponents/ConnectionTree/ConnectionTree.vue'
import MainPanel from '@/clientComponents/MainPanel/index.vue'
import ConnectionDialog from '@/clientComponents/ConnectionDialog/index.vue'
import { useConnectionStore } from '@/stores/connection'
import type { TreeNode } from '../../../electron/model/database'

const connectionStore = useConnectionStore()

const onConnect = () => {
  console.log('连接数据库')
}

const handleNewQueryClick = () => {
  console.log('新建查询')
}

const handleTableClick = () => {
  console.log('表管理')
}

const handleViewClick = () => {
  console.log('视图管理')
}

const handleFunctionClick = () => {
  console.log('函数管理')
}

const onUser = () => {
  console.log('用户管理')
}

const onOther = () => {
  console.log('其他操作')
}

const onSearch = () => {
  console.log('搜索')
}

const handleBackupClick = () => {
  console.log('备份')
}

const onAutoRun = () => {
  console.log('自动运行')
}

const handleModelClick = () => {
  console.log('模型管理')
}

const handleBIClick = () => {
  console.log('BI工具')
}

// 连接对话框相关
const connectionDialogVisible = ref(false)
const editingConnection = ref<TreeNode | null>(null)

const onNewConnection = async () => {
  console.log('onNewConnection called')
  editingConnection.value = null
  connectionDialogVisible.value = true
  await nextTick()
  console.log('connectionDialogVisible after nextTick:', connectionDialogVisible.value)
  // 检查对话框是否真的显示了
  const dialogElement = document.querySelector('.el-dialog')
  console.log('Dialog element found:', dialogElement)
}

const onEditConnection = async (node: TreeNode) => {
  console.log('onEditConnection called with node:', node)
  // ConnectionDialog 需要 TreeNode 类型
  editingConnection.value = node ?? null
  connectionDialogVisible.value = true
  await nextTick()
  console.log('connectionDialogVisible after nextTick:', connectionDialogVisible.value, 'editingConnection:', editingConnection.value)
  // 检查对话框是否真的显示了
  const dialogElement = document.querySelector('.el-dialog')
  console.log('Dialog element found:', dialogElement)
}

// 监听对话框可见性变化
watch(connectionDialogVisible, (newVal) => {
  console.log('connectionDialogVisible changed to:', newVal)
}, { immediate: true })

const handleCancelDialog = () => {
  connectionDialogVisible.value = false
  editingConnection.value = null
}

const handleNodeSelect = (node: TreeNode) => {
  console.log('节点选择:', node)
}

const updateSelectedNode = (node: TreeNode) => {
  console.log('更新选中节点:', node)
}

const handleCloseDatabase = () => {
  console.log('关闭数据库')
}

const handleNodeClick = (node: TreeNode) => {
  console.log('节点点击:', node)
}

const mainPanelRef = ref()
const propertiesContent = ref('')
</script>

<style scoped>
.database-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.database-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}

.database-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.database-sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.database-main {
  flex: 1;
  overflow: hidden;
}

.database-footer {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 8px 16px;
  text-align: center;
  font-size: 12px;
  color: #666;
}
</style>
