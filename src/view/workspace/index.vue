<template>
  <div class="tool-panel">
    <!-- 涓昏鍐呭鍖哄煙 -->
    <div class="panel-content">
      <!-- 蹇€熸搷浣滃尯鍩?-->
      <div class="quick-actions">
        <h2 class="section-title">工具</h2>
        <div class="action-grid">
          <div 
            v-for="action in quickActions" 
            :key="action.id"
            class="action-card" 
            @click="handleQuickAction(action.handler)"
          >
            <el-icon class="action-icon"><component :is="iconMap[action.icon]" /></el-icon>
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.description }}</div>
          </div>
        </div>
      </div>

      <!-- 数据库连接组件 -->
      <DataConnection 
        @newConnection="emit('newConnection')"
        @connectToDatabase="handleConnectToDatabase"
      />
      
      <!-- 服务监控组件 -->
      <ServiceMonitor />

      <!-- 工具集区域 -->
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

      <!-- 系统信息区域 -->
      <div class="system-info">
        <h2 class="section-title">系统信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <el-icon><Folder /></el-icon>
            <span class="info-label">工作目录:</span>
            <span class="info-value">{{ systemInfo.workingDirectory }}</span>
          </div>
          <div class="info-item">
            <el-icon><Timer /></el-icon>
            <span class="info-label">进程ID:</span>
            <span class="info-value">{{ systemInfo.processId }}</span>
          </div>
          <div class="info-item">
            <el-icon><Clock /></el-icon>
            <span class="info-label">运行时间:</span>
            <span class="info-value">{{ systemInfo.uptime }}</span>
          </div>
          <div class="info-item">
            <el-icon><Monitor /></el-icon>
            <span class="info-label">版本:</span>
            <span class="info-value">{{ systemInfo.version }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Monitor, Refresh, Download, Upload, Connection, CircleCheck, CircleClose, 
  Tools, ArrowRight, CopyDocument, Edit, PieChart, InfoFilled, Cpu, 
  Folder, Timer, Clock, Grid, View, Document
} from '@element-plus/icons-vue'

import { useConnectionStore } from '@/stores/connection'
import DataConnection from '../dataConnection/index.vue'
import ServiceMonitor from '../serviceMonitor/index.vue'
import type { TreeNode } from '../../../electron/model/database'

// Props
interface Props {
  mainPanelRef?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  openTerminal: []
  newConnection: []
  createPanel: [type: any, title: string, content: any]
}>()

// Store
const connectionStore = useConnectionStore()

// 图标组件映射
const iconMap = {
  ArrowRight,
  Tools,
  PieChart,
  Upload
}

// 快速操作数据配置
const quickActions = ref([
  {
    id: 'enter-database',
    title: '进入数据库',
    description: '管理数据库连接、查询和对象',
    icon: 'ArrowRight',
    handler: 'handleEnterDatabase'
  },
  {
    id: 'open-terminal',
    title: '终端控制台',
    description: '执行SQL命令和脚本',
    icon: 'Tools',
    handler: 'handleOpenTerminal'
  },
  {
    id: 'service-monitor',
    title: '服务监控',
    description: '监控系统状态',
    icon: 'PieChart',
    handler: 'handleServiceMonitor'
  },
  {
    id: 'import-data',
    title: '导入、导出数据',
    description: '从文件导入数据',
    icon: 'Upload',
    handler: 'handleImportData'
  }
])

// 统一处理快速操作点击事件
const handleQuickAction = (handler: string) => {
  const handlerMap: Record<string, () => void> = {
    handleEnterDatabase,
    handleOpenTerminal,
    handleServiceMonitor,
    handleImportData
  }
  
  const actionHandler = handlerMap[handler]
  if (actionHandler) {
    actionHandler()
  }
}



// 连接统计数据 - 优化性能，一次性遍历计算
const connectionStats = computed(() => {
  const connections = connectionStore.connections
  let connected = 0
  let disconnected = 0
  
  // 一次性遍历，避免多次filter
  for (const conn of connections) {
    if (conn.status === 'connected') {
      connected++
    } else {
      disconnected++
    }
  }
  
  const total = connections.length
  const connectionRate = total > 0 ? Math.round((connected / total) * 100) : 0
  
  return {
    total,
    connected,
    disconnected,
    connectionRate
  }
})

// 最近使用的连接（取前5个）
const recentConnections = computed(() => {
  return connectionStore.connections
    .slice()
    .sort((a, b) => new Date(b.lastUsed || 0).getTime() - new Date(a.lastUsed || 0).getTime())
    .slice(0, 5)
})

// 系统信息
const systemInfo = computed(() => {
  // 在浏览器环境中，process 不可用，使用更兼容的获取方式
  const now = new Date()
  
  // 更兼容的时间获取方式
  let startTime: number
  try {
    startTime = performance.timeOrigin || Date.now()
  } catch {
    startTime = Date.now()
  }
  
  const uptime = Math.floor((now.getTime() - startTime) / 1000)
  
  // 尝试从多种来源获取系统信息
  const getSystemInfo = () => {
    // 获取工作目录
    let workingDir = '未知'
    try {
      if (typeof window !== 'undefined') {
        workingDir = window.location.pathname || '浏览器环境'
      }
    } catch {
      workingDir = '浏览器环境'
    }
    
    // 获取进程信息
    let processId = 'N/A'
    try {
      // 尝试从全局对象获取进程信息（electron环境）
      if (typeof window !== 'undefined' && (window as any).process) {
        processId = (window as any).process.pid?.toString() || 'N/A'
      }
    } catch {
      // 忽略错误，使用默认值
    }
    
    // 获取版本信息
    let version = '1.0.0'
    try {
      // 尝试从全局对象获取版本信息
      if (typeof window !== 'undefined' && (window as any).appVersion) {
        version = (window as any).appVersion
      }
    } catch {
      // 闈欓粯澶辫触锛屼娇鐢ㄩ粯璁ゅ€?
    }
    
    return {
      workingDirectory: workingDir,
      processId,
      uptime: formatUptime(uptime),
      version
    }
  }
  
  return getSystemInfo()
})

// 响应式数据
const lastRefreshTime = ref(new Date())

// 获取连接率颜色
const getRateColor = (rate: number) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

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

// 格式化运行时间
const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 事件处理函数
const handleEnterDatabase = () => {
  emit('createPanel', 'database', '数据库管理', null)
}

const handleNewConnection = () => {
  emit('newConnection')
}

const handleRefresh = () => {
  lastRefreshTime.value = new Date()
  connectionStore.initializeConnections()
  CTMessage.success('已刷新连接状态')
}

const handleOpenTerminal = () => {
  emit('openTerminal')
}



const handleServiceMonitor = () => {
  CTMessage.info('服务监控功能开发中...')
}

const handleImportData = () => {
  CTMessage.info('数据导入功能开发中...')
}

const handleConnectToDatabase = async (connection: TreeNode) => {
  try {
    await connectionStore.setActiveConnection(connection.id)
    CTMessage.success(`已连接到: ${connection.name}`)
  } catch (error) {
    CTMessage.error('连接失败: ' + (error as Error).message)
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



// 数据库连接相关处理函数


// 组件加载时初始化
onMounted(() => {
  connectionStore.initializeConnections()
})
</script>

<style scoped>
.tool-panel {
  height: 100vh;
  background: #f5f5f5;
  overflow-y: auto;
}





.panel-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.subsection-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 0 0 12px 0;
}

/* 快速操作区域 */
.quick-actions {
  margin-bottom: 32px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.action-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 12px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #909399;
}



/* 服务监控区域 */
.service-monitor {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.service-monitoring {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.monitoring-table-container {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.service-table {
  border-radius: 6px;
  width: 100%;
}

.service-table .el-table__header {
  background-color: #fafafa;
}

.service-table .el-table__header th {
  background-color: #fafafa;
  color: #303133;
  font-weight: 600;
}

.service-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  color: #409eff;
  font-size: 16px;
}

.port-number {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #606266;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

/* 工具集区域 */
.tool-sets {
  margin-bottom: 32px;
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

/* 系统信息区域 */
.system-info {
  margin-bottom: 24px;
}

.info-grid {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-item .el-icon {
  color: #409eff;
  font-size: 16px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 响应式设置 */
@media (max-width: 768px) {
  
  .panel-content {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .section-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 服务监控样式 */
.service-monitor {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.monitoring-table-container {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.service-table {
  width: 100%;
}

.service-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  color: #409eff;
}

.port-number {
  font-family: 'Courier New', Courier, monospace;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
