<template>
  <div class="tool-sets">
    <h2 class="section-title">工具集</h2>
    <div class="tools-grid">
      <div 
        v-for="category in toolCategories" 
        :key="category.title"
        class="tool-category"
      >
        <h3 class="tool-category-title">{{ category.title }}</h3>
        <div class="tool-items">
          <div 
            v-for="item in category.items" 
            :key="item.id"
            class="tool-item" 
            @click="handleToolClick(item.handler)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { CopyDocument, Upload, Refresh, Grid, Download, Document, Edit, View, PieChart, CircleCheck, InfoFilled, Cpu, MagicStick } from '@element-plus/icons-vue'
import { ElMessage as CTMessage } from 'element-plus'

const emit = defineEmits(['open-ocr']) 

// 工具集配置
const toolCategories = ref([
  {
    title: '数据管理',
    items: [
      { id: 'backup', label: '数据备份', icon: CopyDocument, handler: 'handleBackup' },
      { id: 'restore', label: '数据恢复', icon: Upload, handler: 'handleRestore' },
      { id: 'sync', label: '数据同步', icon: Refresh, handler: 'handleSync' }
    ]
  },
  {
    title: '导入导出',
    items: [
      { id: 'excel-import', label: 'Excel导入', icon: Grid, handler: 'handleExcelImport' },
      { id: 'excel-export', label: 'Excel导出', icon: Download, handler: 'handleExcelExport' },
      { id: 'csv-export', label: 'CSV导出', icon: Document, handler: 'handleCsvExport' }
    ]
  },
  {
    title: '开发工具',
    items: [
      { id: 'schema-designer', label: '结构设计', icon: Edit, handler: 'handleSchemaDesigner' },
      { id: 'query-builder', label: '查询构建器', icon: View, handler: 'handleQueryBuilder' },
      { id: 'performance', label: '性能分析', icon: PieChart, handler: 'handlePerformance' }
    ]
  },
  {
    title: '系统监控',
    items: [
      { id: 'health-check', label: '健康检查', icon: CircleCheck, handler: 'handleHealthCheck' },
      { id: 'system-info', label: '系统信息', icon: InfoFilled, handler: 'handleSystemInfo' },
      { id: 'resource-monitor', label: '资源监控', icon: Cpu, handler: 'handleResourceMonitor' }
    ]
  },
  {
    title: 'AI工具',
    items: [
      { id: 'ocr', label: '文字识别', icon: MagicStick, handler: 'handleOCR' }
    ]
  }
])

// 处理工具点击事件
const handleToolClick = (handler: string) => {
  const handlerMap: Record<string, () => void> = {
    handleBackup: handleBackup,
    handleRestore: handleRestore,
    handleSync: handleSync,
    handleExcelImport: handleExcelImport,
    handleExcelExport: handleExcelExport,
    handleCsvExport: handleCsvExport,
    handleSchemaDesigner: handleSchemaDesigner,
    handleQueryBuilder: handleQueryBuilder,
    handlePerformance: handlePerformance,
    handleHealthCheck: handleHealthCheck,
    handleSystemInfo: handleSystemInfo,
    handleResourceMonitor: handleResourceMonitor
  }
  
  const toolHandler = handlerMap[handler]
  if (toolHandler) {
    toolHandler()
  }
}

const handleBackup = () => {
  CTMessage.info('数据备份功能开发中...')
}

const handleRestore = () => {
  CTMessage.info('数据恢复功能开发中...')
}

const handleSync = () => {
  CTMessage.info('数据同步功能开发中...')
}

const handleExcelImport = () => {
  CTMessage.info('Excel导入功能开发中...')
}

const handleExcelExport = () => {
  CTMessage.info('Excel导出功能开发中...')
}

const handleCsvExport = () => {
  CTMessage.info('CSV导出功能开发中...')
}

const handleSchemaDesigner = () => {
  CTMessage.info('结构设计工具开发中...')
}

const handleQueryBuilder = () => {
  CTMessage.info('查询构建器开发中...')
}

const handlePerformance = () => {
  CTMessage.info('性能分析工具开发中...')
}

const handleHealthCheck = () => {
  CTMessage.info('健康检查功能开发中...')
}

const handleSystemInfo = () => {
  CTMessage.info('系统信息功能开发中...')
}

const handleResourceMonitor = () => {
  CTMessage.info('资源监控功能开发中...')
}

const handleOCR = () => {
  // 触发事件通知父组件打开OCR页面
  emit('open-ocr')
  CTMessage.success('正在打开文字识别工具...')
}
</script>

<style scoped>
.tool-sets {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tool-category {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.tool-category-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.tool-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.tool-item:hover {
  background: #f0f9ff;
  color: #409eff;
}
</style>