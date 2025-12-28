<template>
  <div class="table-panel">
    <div class="panel-header">
      <el-space :size="8">
        <el-button type="primary" link @click="handleOpenTable">
          打开表
        </el-button>
        <el-button type="danger" link @click="handleDesignTable" :disabled="selectedObjects.length === 0">
          设计表
        </el-button>
        <el-button type="primary" link @click="onNewObject">
          新建表
        </el-button>
        <el-button type="danger" link @click="handleDeleteTable" :disabled="selectedObjects.length === 0">
          删除表
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
        placeholder="搜索表"
        clearable
        :prefix-icon="Search"
        style="width: 200px"
        @clear="handleSearch"
        @input="handleSearchInput"
      />
    </div>

    <el-table
      :data="filteredDataSource"
      :columns="columns"
      row-key="name"
      border
      style="width: 100%; height: calc(100vh - 180px);"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="名称" min-width="250">
        <template #default="{ row }">
          <span class="table-name" @click="handleNameClick(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="rows" label="行" width="100" align="right" />
      <el-table-column prop="dataLength" label="数据长度" width="120" align="right" />
      <el-table-column prop="engine" label="引擎" width="120" />
      <el-table-column prop="modifyDate" label="修改日期" width="150" />
      <el-table-column prop="comment" label="注释" min-width="150" show-overflow-tooltip />

      <template #empty>
        <el-empty description="当前没有表数据" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { TableColumn, TableData } from '../../../types'
import { TreeNodeType } from '../../../types/leftTree/tree'

interface TablePanelProps {
  dataSource?: TableData[]
  selectedObjects?: TableData[]
  selectedNodeName?: string
  connectionId?: string
  databaseName?: string
  onOpenObject?: (record: TableData) => void
  onDesignObject?: (record: TableData) => void
  onNewObject?: () => void
  onDeleteObject?: (records: TableData[]) => void
  onImportWizard?: () => void
  onExportWizard?: () => void
  onSearch?: (keyword: string) => void
  onSelectObjects?: (records: TableData[]) => void
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: TableData) => void
}

const props = withDefaults(defineProps<TablePanelProps>(), {
  dataSource: () => [],
  selectedObjects: () => []
})

const emit = defineEmits<{
  (e: 'openObject', record: TableData): void
  (e: 'designObject', record: TableData): void
  (e: 'newObject'): void
  (e: 'deleteObject', records: TableData[]): void
  (e: 'importWizard'): void
  (e: 'exportWizard'): void
  (e: 'search', keyword: string): void
  (e: 'selectObjects', records: TableData[]): void
}>()

const searchKeyword = ref('')

const filteredDataSource = computed(() => {
  if (!searchKeyword.value) {
    return props.dataSource
  }
  return props.dataSource.filter(obj =>
    obj.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const columns: TableColumn[] = [
  { title: '行', dataIndex: 'rows', key: 'rows', width: 150, align: 'right' },
  { title: '数据长度', dataIndex: 'dataLength', key: 'dataLength', width: 150, align: 'right' },
  { title: '引擎', dataIndex: 'engine', key: 'engine', width: 150 },
  { title: '修改日期', dataIndex: 'modifyDate', key: 'modifyDate', width: 150 },
  { title: '注释', dataIndex: 'comment', key: 'comment', ellipsis: true }
]

const handleSearch = () => {
  emit('search', searchKeyword.value)
}

const handleSearchInput = () => {
  emit('search', searchKeyword.value)
}

const handleRowClick = (row: TableData) => {
  emit('selectObjects', [row])
  emit('openObject', row)
  if (props.setSelectedNode) {
    props.setSelectedNode(
      { type: TreeNodeType.TABLE, name: row.name, id: row.name },
      null,
      null,
      row
    )
  }
}

const handleNameClick = (record: TableData) => {
  emit('selectObjects', [record])
  emit('openObject', record)
  if (props.setSelectedNode) {
    props.setSelectedNode(
      { type: TreeNodeType.TABLE, name: record.name, id: record.name },
      null,
      null,
      record
    )
  }
}

const handleOpenTable = () => {
  const objectToOpen = props.selectedObjects.length > 0
    ? props.selectedObjects[0]
    : (props.dataSource.length > 0 ? props.dataSource[0] : undefined)
  
  if (objectToOpen) {
    emit('openObject', objectToOpen)
  }
}

const handleDesignTable = () => {
  if (props.selectedObjects.length > 0) {
    emit('designObject', props.selectedObjects[0])
  }
}

const handleDeleteTable = () => {
  emit('deleteObject', props.selectedObjects)
}
</script>

<style scoped>
.table-panel {
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

.table-name {
  cursor: pointer;
  color: #000000;
}

.table-name:hover {
  text-decoration: underline;
}
</style>
