<template>
  <div class="view-panel">
    <div class="panel-header">
      <el-space :size="8">
        <el-button type="primary" link @click="handleOpenView">
          打开视图
        </el-button>
        <el-button type="danger" link @click="handleDesignView" :disabled="selectedObjects.length === 0">
          设计视图
        </el-button>
        <el-button type="primary" link @click="onNewObject">
          新建视图
        </el-button>
        <el-button type="danger" link @click="handleDeleteView" :disabled="selectedObjects.length === 0">
          删除视图
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
        placeholder="搜索视图"
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
          <span class="view-name" @click="handleNameClick(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createDate" label="创建日期" width="150" />
      <el-table-column prop="modifyDate" label="修改日期" width="150" />
      <el-table-column prop="comment" label="注释" show-overflow-tooltip />

      <template #empty>
        <el-empty description="当前没有视图数据" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { ViewData } from '../../../types'
import type { TreeNodeType } from '../../../types/leftTree/tree'

interface ViewPanelProps {
  dataSource?: ViewData[]
  selectedObjects?: ViewData[]
  selectedNodeName?: string
  connectionId?: string
  databaseName?: string
  onOpenObject?: (record: ViewData) => void
  onDesignObject?: (record: ViewData) => void
  onNewObject?: () => void
  onDeleteObject?: (records: ViewData[]) => void
  onImportWizard?: () => void
  onExportWizard?: () => void
  onSearch?: (keyword: string) => void
  onSelectObjects?: (records: ViewData[]) => void
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: any) => void
}

const props = withDefaults(defineProps<ViewPanelProps>(), {
  dataSource: () => [],
  selectedObjects: () => []
})

const emit = defineEmits<{
  (e: 'openObject', record: ViewData): void
  (e: 'designObject', record: ViewData): void
  (e: 'newObject'): void
  (e: 'deleteObject', records: ViewData[]): void
  (e: 'importWizard'): void
  (e: 'exportWizard'): void
  (e: 'search', keyword: string): void
  (e: 'selectObjects', records: ViewData[]): void
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

const handleRowClick = (row: ViewData) => {
  emit('selectObjects', [row])
  emit('openObject', row)
}

const handleNameClick = (record: ViewData) => {
  emit('selectObjects', [record])
  emit('openObject', record)
}

const handleOpenView = () => {
  const objectToOpen = props.selectedObjects.length > 0
    ? props.selectedObjects[0]
    : (props.dataSource.length > 0 ? props.dataSource[0] : undefined)
  
  if (objectToOpen) {
    emit('openObject', objectToOpen)
  }
}

const handleDesignView = () => {
  if (props.selectedObjects.length > 0) {
    emit('designObject', props.selectedObjects[0])
  }
}

const handleDeleteView = () => {
  emit('deleteObject', props.selectedObjects)
}
</script>

<style scoped>
.view-panel {
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

.view-name {
  cursor: pointer;
  color: #000000;
}

.view-name:hover {
  text-decoration: underline;
}
</style>
