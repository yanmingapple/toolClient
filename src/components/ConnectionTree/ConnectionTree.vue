<template>
  <div class="connection-tree">
    <div class="tree-header">
      <el-text size="large" tag="h4" style="margin: 0;">我的连接</el-text>
      <div class="header-actions">
        <el-button type="primary" link @click="emit('newConnection')">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
      </div>
    </div>

    <el-tree
      ref="treeRef"
      :data="treeData"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      node-key="key"
      highlight-current
      default-expand-all
      @node-expand="handleExpand"
      @node-click="handleSelect"
      @node-dblclick="onDoubleClick"
  
      :props="treeProps"
    >
      <template #default="{ node, data }">
        <div class="tree-node" :class="{ 'is-connection': data.type === TreeNodeType.CONNECTION }">
         <Icon :name="data.icon" :size="16" class="node-icon default-icon" />

          <span class="node-label">{{ node.label }}</span>

          <el-icon v-if="data.type === TreeNodeType.CONNECTION" class="status-icon" :class="getConnectionStatusClass(data)">
            <component :is="getStatusIcon(data)" />
          </el-icon>
        </div>
      </template>
    </el-tree>

    <el-empty v-if="treeData.length === 0" description="暂无数据库连接">
      <el-button type="primary" @click="emit('newConnection')">新建连接</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Plus,
  Check,
  Close,
  Loading,
  Remove
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Icon from '../../icons/Icon.vue'
import { useTreeData } from '../../composables/useTreeData'
import { useConnection } from '../../composables/useConnection'
import { TreeNodeType } from '../../types/leftTree/tree'
import type { TreeNode } from '../../types/leftTree/tree'
import { ConnectionStatus } from '../../enum/database'

interface ConnectionTreeProps {
  onNewConnection?: () => void
  onNodeSelect?: (node: TreeNode, info: any) => void
  updateSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

const props = withDefaults(defineProps<ConnectionTreeProps>(), {
  onNewConnection: () => {},
  onNodeSelect: () => {},
  updateSelectedNode: () => {}
})

const emit = defineEmits<{
  (e: 'newConnection'): void
  (e: 'nodeSelect', node: TreeNode, info: any): void
}>()

const treeRef = ref()

const {
  treeData,
  expandedKeys,
  setExpandedKeys,
  selectedKeys,
  handleExpand,
  handleSelect,
  handleDoubleClick: hookHandleDoubleClick
} = useTreeData((node: TreeNode, info: any) => emit('nodeSelect', node, info), props.updateSelectedNode)

const { handleConnectAndLoadDatabases, connectionStates } = useConnection()

const treeProps = {
  label: 'title',
  children: 'children'
}

const isExpanded = (node: any) => {
  return expandedKeys.value?.includes(node.key)
}

const isConnected = (data: TreeNode) => {
  if (data.type !== TreeNodeType.CONNECTION) return false
  const connectionId = data.key
  const status = connectionStates.value?.get(connectionId)
  return status === ConnectionStatus.CONNECTED
}

const getStatusIcon = (data: TreeNode) => {
  const connectionId = data.key
  const status = connectionStates.value?.get(connectionId)
  if (status === ConnectionStatus.CONNECTED) return Check
  if (status === ConnectionStatus.CONNECTING) return Loading
  if (status === ConnectionStatus.ERROR) return Close
  return Remove
}

const getConnectionStatusClass = (data: TreeNode) => {
  const connectionId = data.key
  const status = connectionStates.value?.get(connectionId)
  return {
    'status-success': status === ConnectionStatus.CONNECTED,
    'status-loading': status === ConnectionStatus.CONNECTING,
    'status-error': status === ConnectionStatus.ERROR,
    'status-disconnected': status === ConnectionStatus.DISCONNECTED
  }
}

const onLoadData = (_treeNode: any, _resolve: (data: any[]) => void) => {
  return Promise.resolve()
}

const onDoubleClick = async (_event: MouseEvent, info: any) => {
  if (!info) return

  const node = info.node ? info.node : info
  const treeNode = node as TreeNode

  if (treeNode.type === TreeNodeType.CONNECTION) {
    const connection = treeNode.data?.metadata?.connection
    if (connection) {
      await handleConnectAndLoadDatabases(connection)
      setExpandedKeys([...(expandedKeys.value || []), treeNode.key])
    }
  }

  if (treeNode.type === TreeNodeType.DATABASE) {
    await hookHandleDoubleClick(_event, info)
    setTimeout(() => {
      handleSelect([treeNode.key], info)
    }, 2000)
  } else {
    await hookHandleDoubleClick(_event, info)
  }
}

defineExpose({
  treeRef
})
</script>

<style scoped>
.connection-tree {
  padding: 0;
  height: calc(100vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 36px;
  padding-left: 8px !important;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f4ff;
}

:deep(.el-tree-node__expand-icon) {
  padding: 6px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding-right: 12px;
  height: 100%;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.connection-icon {
  color: #409eff;
}

.connection-icon.connected {
  color: #67c23a;
}

.database-icon {
  color: #e6a23c;
}

.table-icon {
  color: #909399;
}

.view-icon {
  color: #909399;
}

.function-icon {
  color: #9c27b0;
}

.default-icon {
  color: #909399;
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.status-success {
  color: #67c23a;
}

.status-loading {
  color: #409eff;
}

.status-error {
  color: #f56c6c;
}

.status-disconnected {
  color: #909399;
}

:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
