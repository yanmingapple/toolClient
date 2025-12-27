<template>
  <div class="query-editor-container">
    <div class="query-tabs">
      <el-tabs
        v-model="activeTabId"
        type="card"
        closable
        @tab-remove="handleRemoveTab"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :label="getTabLabel(tab)"
          :name="tab.id"
        />
      </el-tabs>
      <el-button type="primary" link @click="handleAddTab">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <div v-if="activeTab" class="query-content">
      <div class="query-toolbar">
        <el-space>
          <el-tooltip content="执行查询" placement="top">
            <el-button
              type="primary"
              :loading="queryExecutionInProgress"
              @click="handleExecuteQuery"
            >
              <el-icon><VideoPlay /></el-icon>
              执行
            </el-button>
          </el-tooltip>
          <el-tooltip content="保存查询" placement="top">
            <el-button @click="handleSaveQuery">
              <el-icon><Download /></el-icon>
              保存
            </el-button>
          </el-tooltip>
          <el-tooltip content="清除查询" placement="top">
            <el-button @click="handleClearQuery">
              <el-icon><Delete /></el-icon>
              清除
            </el-button>
          </el-tooltip>
          <el-tooltip content="重新加载" placement="top">
            <el-button @click="handleReload">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-tooltip>

          <el-dropdown trigger="click" @command="handleEditMenuClick">
            <el-button>
              编辑<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="set-empty">设置为空白字符串</el-dropdown-item>
                <el-dropdown-item command="set-null">设置为NULL</el-dropdown-item>
                <el-dropdown-item command="set-uuid">设置为UUID</el-dropdown-item>
                <el-dropdown-item divided command="delete-record">删除记录</el-dropdown-item>
                <el-dropdown-item divided command="copy">复制</el-dropdown-item>
                <el-dropdown-item command="paste">粘贴</el-dropdown-item>
                <el-dropdown-item divided command="save-data">保存数据为...</el-dropdown-item>
                <el-dropdown-item divided command="find">查找</el-dropdown-item>
                <el-dropdown-item command="find-next">查找下一个</el-dropdown-item>
                <el-dropdown-item command="replace">替换</el-dropdown-item>
                <el-dropdown-item divided command="go-to-record">前往记录...</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-space>
      </div>

      <div class="query-editor">
        <vue-monaco-editor
          v-model:value="activeTab.query"
          :language="getEditorLanguage(activeTab.connectionId)"
          :options="editorOptions"
          @mount="handleEditorMount"
        />
      </div>

      <el-divider />

      <div v-loading="queryExecutionInProgress" class="query-result-container">
        <div v-if="currentResult" class="result-header">
          <el-space>
            <span>行数: {{ currentResult.rows.length }}</span>
            <span v-if="currentResult.affectedRows !== undefined">影响行数: {{ currentResult.affectedRows }}</span>
            <span v-if="currentResult.executionTime !== undefined">执行时间: {{ currentResult.executionTime }}ms</span>
          </el-space>
        </div>
        <el-divider v-if="currentResult" />
        <el-table
          v-if="currentResult"
          :data="currentResult.rows"
          stripe
          border
          style="width: 100%"
          max-height="400"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            v-for="col in currentResult.columns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="150"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-card>
        <el-space direction="vertical" :size="20" style="align-items: center">
          <h3>没有打开的查询标签</h3>
          <p>点击上方的 "+" 按钮创建新的查询标签</p>
          <el-button type="primary" @click="handleAddTab">创建查询标签</el-button>
        </el-space>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  VideoPlay,
  Download,
  Delete,
  Refresh,
  ArrowDown
} from '@element-plus/icons-vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { useQueryStore } from '../stores/query'
import { useConnectionStore } from '../stores/connection'
import type { QueryResult } from '../types/leftTree/connection'
import { generateUUID } from '../utils/formatUtils'

const queryStore = useQueryStore()
const connectionStore = useConnectionStore()

const editorRef = ref<any>(null)
const selectedRowKeys = ref<number[]>([])

const tabs = computed(() => queryStore.tabs)
const activeTabId = computed({
  get: () => queryStore.activeTabId || '',
  set: (val) => queryStore.setActiveTab(val)
})

const queryExecutionInProgress = computed(() => queryStore.queryExecutionInProgress)

const currentResult = computed(() => {
  if (!activeTabId.value) return null
  return queryStore.queryResults.get(activeTabId.value)
})

const editorOptions = {
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  automaticLayout: true
}

const getTabLabel = (tab: { id: string; title: string; connectionId: string }) => {
  const connection = connectionStore.connections.find(c => c.id === tab.connectionId)
  return connection ? `${tab.title} (${connection.name})` : tab.title
}

const getDatabaseType = (connectionId: string): string => {
  const connection = connectionStore.connections.find(c => c.id === connectionId)
  return connection?.type || 'sql'
}

const getEditorLanguage = (databaseType: string): string => {
  switch (databaseType) {
    case 'mysql':
    case 'sqlserver':
    case 'sqlite':
      return 'sql'
    case 'postgresql':
      return 'pgsql'
    case 'mongodb':
      return 'javascript'
    case 'redis':
      return 'redis'
    default:
      return 'sql'
  }
}

const handleAddTab = () => {
  if (connectionStore.connections.length === 0) {
    ElMessage.warning('请先添加数据库连接')
    return
  }
  const connectionId = connectionStore.activeConnectionId || connectionStore.connections[0].id
  const newTabId = queryStore.addTab(connectionId)
  queryStore.setActiveTab(newTabId)
}

const handleRemoveTab = (tabId: string) => {
  queryStore.removeTab(tabId)
}

const handleTabClick = (tab: { props: { name: string } }) => {
  queryStore.setActiveTab(tab.props.name)
}

const handleExecuteQuery = async () => {
  if (!activeTabId.value) return
  try {
    await queryStore.executeQuery(activeTabId.value, queryStore.tabs.find(t => t.id === activeTabId.value)?.query || '')
    ElMessage.success('查询执行成功')
  } catch (error) {
    ElMessage.error('查询执行失败: ' + (error as Error).message)
  }
}

const handleSaveQuery = () => {
  ElMessage.info('保存查询功能待实现')
}

const handleClearQuery = () => {
  if (!activeTabId.value) return
  const tab = queryStore.tabs.find(t => t.id === activeTabId.value)
  if (tab) {
    queryStore.updateQuery(activeTabId.value, '')
  }
}

const handleReload = () => {
  ElMessage.info('刷新功能待实现')
}

const handleEditorMount = (editor: any) => {
  editorRef.value = editor
}

const handleSelectionChange = (selection: any[]) => {
  selectedRowKeys.value = selection.map((_, index) => index)
}

const handleEditMenuClick = async (command: string) => {
  if (!activeTabId.value) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  switch (command) {
    case 'set-empty':
      handleSetEmptyString()
      break
    case 'set-null':
      handleSetNull()
      break
    case 'set-uuid':
      handleSetUUID()
      break
    case 'delete-record':
      handleDeleteRecord()
      break
    case 'copy':
      handleCopy()
      break
    case 'paste':
      await handlePaste()
      break
    case 'save-data':
      handleSaveData()
      break
    case 'find':
      handleFind()
      break
    case 'find-next':
      handleFindNext()
      break
    case 'replace':
      handleReplace()
      break
    case 'go-to-record':
      handleGoToRecord()
      break
  }
}

const handleSetEmptyString = () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  const updatedRows = result.rows.map((row, index) => {
    if (selectedRowKeys.value.includes(index)) {
      const updatedRow: Record<string, any> = { ...row }
      result.columns.forEach(col => {
        updatedRow[col] = ''
      })
      return updatedRow
    }
    return row
  })

  queryStore.queryResults.set(activeTabId.value, { ...result, rows: updatedRows })
  ElMessage.success('已将选中行设置为空白字符串')
}

const handleSetNull = () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  const updatedRows = result.rows.map((row, index) => {
    if (selectedRowKeys.value.includes(index)) {
      const updatedRow: Record<string, any> = { ...row }
      result.columns.forEach(col => {
        updatedRow[col] = null
      })
      return updatedRow
    }
    return row
  })

  queryStore.queryResults.set(activeTabId.value, { ...result, rows: updatedRows })
  ElMessage.success('已将选中行设置为NULL')
}

const handleSetUUID = () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  const updatedRows = result.rows.map((row, index) => {
    if (selectedRowKeys.value.includes(index)) {
      const updatedRow: Record<string, any> = { ...row }
      result.columns.forEach(col => {
        updatedRow[col] = generateUUID()
      })
      return updatedRow
    }
    return row
  })

  queryStore.queryResults.set(activeTabId.value, { ...result, rows: updatedRows })
  ElMessage.success('已将选中行设置为UUID')
}

const handleDeleteRecord = async () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = queryStore.queryResults.get(activeTabId.value)
    if (!result) return

    const updatedRows = result.rows.filter((_, index) => !selectedRowKeys.value.includes(index))
    queryStore.queryResults.set(activeTabId.value, { ...result, rows: updatedRows })
    selectedRowKeys.value = []
    ElMessage.success(`已删除 ${selectedRowKeys.value.length} 条记录`)
  } catch {
    // 用户取消
  }
}

const handleCopy = async () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  const selectedRows = result.rows.filter((_, index) => selectedRowKeys.value.includes(index))
  const csvContent = result.columns.join(',') + '\n' +
    selectedRows.map(row =>
      result.columns.map(col => {
        const cell = row[col]
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell === null || cell === undefined ? '' : cell
      }).join(',')
    ).join('\n')

  try {
    await navigator.clipboard.writeText(csvContent)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请重试')
  }
}

const handlePaste = async () => {
  if (!activeTabId.value || selectedRowKeys.value.length === 0) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  try {
    const clipboardText = await navigator.clipboard.readText()
    const pastedRows = clipboardText.split('\n')
      .filter(row => row.trim())
      .map(row => row.split(/,(?=(?:[^"]*"[^"]*")*(?![^"]*"))/))

    if (pastedRows.length === 0) return

    const updatedRows = [...result.rows]
    selectedRowKeys.value.forEach((key, index) => {
      const rowIndex = key
      if (rowIndex < updatedRows.length && index < pastedRows.length) {
        const updatedRow: Record<string, any> = { ...updatedRows[rowIndex] }
        result.columns.forEach((col, colIndex) => {
          if (colIndex < pastedRows[index].length) {
            let cellValue = pastedRows[index][colIndex]
            if (cellValue.startsWith('"') && cellValue.endsWith('"')) {
              cellValue = cellValue.slice(1, -1).replace(/""/g, '"')
            }
            updatedRow[col] = cellValue === '' ? null : cellValue
          }
        })
        updatedRows[rowIndex] = updatedRow
      }
    })

    queryStore.queryResults.set(activeTabId.value, { ...result, rows: updatedRows })
    ElMessage.success('已粘贴数据')
  } catch {
    ElMessage.error('粘贴失败，请重试')
  }
}

const handleSaveData = () => {
  if (!activeTabId.value) return
  const result = queryStore.queryResults.get(activeTabId.value)
  if (!result) return

  const csvContent = 'data:text/csv;charset=utf-8,' +
    result.columns.join(',') + '\n' +
    result.rows.map(row =>
      result.columns.map(col => {
        const cell = row[col]
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell === null || cell === undefined ? '' : cell
      }).join(',')
    ).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `query_result_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('数据已保存为CSV格式')
}

const handleFind = () => {
  if (!editorRef.value) return
  editorRef.value.focus()
  editorRef.value.getAction('actions.find').run()
}

const handleFindNext = () => {
  if (!editorRef.value) return
  editorRef.value.getAction('actions.findNext').run()
}

const handleReplace = () => {
  if (!editorRef.value) return
  editorRef.value.focus()
  editorRef.value.getAction('actions.replace').run()
}

const handleGoToRecord = () => {
  ElMessageBox.prompt('请输入记录号:', '前往记录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[1-9]\d*$/,
    inputErrorMessage: '请输入有效的记录号'
  }).then(({ value }) => {
    const index = parseInt(value) - 1
    const tableBody = document.querySelector('.query-result-container .el-table__body-wrapper')
    if (tableBody && index >= 0) {
      const rowHeight = 48
      tableBody.scrollTop = index * rowHeight
    }
    ElMessage.success(`已定位到记录 ${value}`)
  }).catch(() => {})
}
</script>

<style scoped>
.query-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.query-tabs {
  display: flex;
  align-items: center;
  padding: 8px 16px 0;
  background: #f5f7fa;
}

.query-tabs :deep(.el-tabs) {
  flex: 1;
}

.query-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.query-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  overflow: hidden;
}

.query-toolbar {
  margin-bottom: 8px;
}

.query-editor {
  flex: 1;
  min-height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.query-result-container {
  flex: 1;
  overflow: auto;
  margin-top: 8px;
  min-height: 200px;
}

.result-header {
  font-size: 14px;
  color: #606266;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #303133;
}

.empty-state p {
  margin: 0;
  color: #909399;
}
</style>
