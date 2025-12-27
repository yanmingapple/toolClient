<template>
  <div class="function-panel">
    <div class="panel-header">
      <el-space :size="8">
        <el-button type="primary" link @click="handleOpenFunction">
          打开函数
        </el-button>
        <el-button type="primary" link @click="onNewObject">
          新建函数
        </el-button>
        <el-button type="danger" link @click="handleDeleteFunction" :disabled="selectedObjects.length === 0">
          删除函数
        </el-button>
        <el-button type="primary" link @click="onImportWizard">
          导入向导
        </el-button>
        <el-button type="primary" link @click="onExportWizard">
          导出向导
        </el-button>
      </el-space>

      <el-input
        v-model="searchKeyword"
        placeholder="搜索函数"
        clearable
        :prefix-icon="Search"
        style="width: 200px"
        @clear="handleSearch"
        @input="handleSearchInput"
      />
    </div>

    <el-table
      :data="filteredDataSource"
      row-key="name"
      border
      style="width: 100%"
      :max-height="tableHeight"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="名称" width="200">
        <template #default="{ row }">
          <span class="function-name" @click="handleNameClick(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="parameterCount" label="参数数量" width="100" align="right" />
      <el-table-column prop="returnType" label="返回类型" width="150" />
      <el-table-column prop="createDate" label="创建日期" width="150" />
      <el-table-column prop="comment" label="注释" show-overflow-tooltip />

      <template #empty>
        <el-empty description="当前没有函数数据" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { FunctionData } from '../../../types'
import type { TreeNodeType } from '../../../types/leftTree/tree'

interface FunctionPanelProps {
  dataSource?: FunctionData[]
  selectedObjects?: FunctionData[]
  selectedNodeName?: string
  connectionId?: string
  databaseName?: string
  onOpenObject?: (record: FunctionData) => void
  onNewObject?: () => void
  onDeleteObject?: (records: FunctionData[]) => void
  onImportWizard?: () => void
  onExportWizard?: () => void
  onSearch?: (keyword: string) => void
  onSelectObjects?: (records: FunctionData[]) => void
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

const props = withDefaults(defineProps<FunctionPanelProps>(), {
  dataSource: () => [],
  selectedObjects: () => []
})

const emit = defineEmits<{
  (e: 'openObject', record: FunctionData): void
  (e: 'newObject'): void
  (e: 'deleteObject', records: FunctionData[]): void
  (e: 'importWizard'): void
  (e: 'exportWizard'): void
  (e: 'search', keyword: string): void
  (e: 'selectObjects', records: FunctionData[]): void
}>()

const searchKeyword = ref('')
const tableHeight = computed(() => {
  const baseHeight = 280
  return `calc(100vh - ${baseHeight}px)`
})

const filteredDataSource = computed(() => {
  if (!searchKeyword.value) {
    return props.dataSource
  }
  return props.dataSource.filter(obj =>
    obj.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const handleSearch = () => {
  emit('search', searchKeyword.value)
}

const handleSearchInput = () => {
  emit('search', searchKeyword.value)
}

const handleRowClick = (row: FunctionData) => {
  emit('selectObjects', [row])
  emit('openObject', row)
}

const handleNameClick = (record: FunctionData) => {
  emit('selectObjects', [record])
  emit('openObject', record)
}

const handleOpenFunction = () => {
  const objectToOpen = props.selectedObjects.length > 0
    ? props.selectedObjects[0]
    : (props.dataSource.length > 0 ? props.dataSource[0] : undefined)
  
  if (objectToOpen) {
    emit('openObject', objectToOpen)
  }
}

const handleDeleteFunction = () => {
  emit('deleteObject', props.selectedObjects)
}
</script>

<style scoped>
.function-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.function-name {
  cursor: pointer;
  color: #409eff;
}

.function-name:hover {
  text-decoration: underline;
}
</style>
