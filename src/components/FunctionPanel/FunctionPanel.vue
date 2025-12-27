<template>
  <div class="function-panel">
    <div class="function-toolbar">
      <el-space>
        <el-button type="default" @click="onNewFunction">
          <el-icon><Plus /></el-icon>
          新建函数
        </el-button>
        <el-button type="default" danger :disabled="!selectedFunction" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除函数
        </el-button>
        <el-button type="default" :disabled="!selectedFunction" @click="handleRun">
          <el-icon><VideoPlay /></el-icon>
          运行函数
        </el-button>
      </el-space>
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索函数"
        clearable
        style="width: 200px"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
    
    <el-table
      :data="filteredDataSource"
      row-key="name"
      border
      stripe
      style="width: 100%"
      max-height="calc(100vh - 280px)"
      @row-click="handleRowClick"
      :row-class-name="getRowClassName"
    >
      <el-table-column prop="name" label="名称" width="200">
        <template #default="{ row }">
          <span class="function-name" @click="onDesignFunction?.(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="modifyDate" label="修改日期" width="150" />
      <el-table-column prop="functionType" label="函数类型" width="120" />
      <el-table-column prop="deterministic" label="具有确定性" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.deterministic" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="注释" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-tooltip content="运行函数" placement="top">
            <el-button
              type="success"
              link
              :icon="VideoPlay"
              @click.stop="onRunFunction?.(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, VideoPlay, Search } from '@element-plus/icons-vue'

export interface FunctionData {
  name: string
  modifyDate: string
  functionType: string
  deterministic: boolean
  comment: string
  [key: string]: any
}

interface FunctionPanelProps {
  dataSource?: FunctionData[]
  onDesignFunction?: (record: FunctionData) => void
  onNewFunction?: () => void
  onDeleteFunction?: (record: FunctionData) => void
  onRunFunction?: (record: FunctionData) => void
  onSearch?: (keyword: string) => void
}

const props = withDefaults(defineProps<FunctionPanelProps>(), {
  dataSource: () => []
})

const selectedFunction = ref<FunctionData | null>(null)
const searchKeyword = ref('')

const filteredDataSource = computed(() => {
  if (!searchKeyword.value) return props.dataSource
  const keyword = searchKeyword.value.toLowerCase()
  return props.dataSource.filter(fn => 
    fn.name.toLowerCase().includes(keyword) ||
    fn.functionType.toLowerCase().includes(keyword) ||
    fn.comment.toLowerCase().includes(keyword)
  )
})

const getRowClassName = ({ row }: { row: FunctionData }) => {
  return selectedFunction.value?.name === row.name ? 'selected-row' : ''
}

const handleRowClick = (row: FunctionData) => {
  selectedFunction.value = row
}

const handleDelete = () => {
  if (selectedFunction.value) {
    props.onDeleteFunction?.(selectedFunction.value)
  }
}

const handleRun = () => {
  if (selectedFunction.value) {
    props.onRunFunction?.(selectedFunction.value)
  }
}

const handleSearch = () => {
  props.onSearch?.(searchKeyword.value)
}
</script>

<style scoped>
.function-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.function-toolbar {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.function-name {
  cursor: pointer;
  color: #409eff;
}

.function-name:hover {
  text-decoration: underline;
}

:deep(.selected-row) {
  background-color: #ecf5ff !important;
}

:deep(.el-table) {
  flex: 1;
}
</style>
