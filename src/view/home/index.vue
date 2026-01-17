<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">数据库管理中心</h1>
        <div class="header-actions">
          <DigitalClock />
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="dashboard-main">
      <!-- 主要工具面板 -->
      <section class="main-tools-panel">
        <div class="panel-header">
          <h2 class="panel-title">核心功能</h2>
          <span class="panel-subtitle">数据库管理工具集合</span>
        </div>
        <QuickActions />
      </section>

      <!-- 服务监控面板 -->
      <section class="monitor-panel">
        <div class="panel-header">
          <h2 class="panel-title">服务监控</h2>
        </div>
        <ServiceMonitor />
      </section>

      <!-- 系统信息面板 -->
      <section class="system-info-panel">
        <div class="panel-header">
          <h2 class="panel-title">系统信息</h2>
        </div>
        <SystemInfo />
      </section>
    </main>
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
import ServiceMonitor from '../monitor/index.vue'
import QuickActions from './components/QuickActions.vue'
import ToolSets from './components/ToolSets.vue'
import SystemInfo from './components/SystemInfo.vue'
import DigitalClock from './components/DigitalClock.vue'
import type { TreeNode } from '../../../electron/model/database'

// Props
interface Props {
  mainPanelRef?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  openTerminal: []
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





// 响应式数据
const lastRefreshTime = ref(new Date())

// 获取连接率颜色
const getRateColor = (rate: number) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 事件处理函数
const handleNewConnection = () => {
  emit('newConnection')
}

const handleRefresh = () => {
  lastRefreshTime.value = new Date()
  connectionStore.initializeConnections()
  CTMessage.success('已刷新连接状态')
}



// 数据库连接相关处理函数


// 组件加载时初始化
onMounted(() => {
  connectionStore.initializeConnections()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 顶部标题栏 */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 主内容区 */
.dashboard-main {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 主要工具面板 */
.main-tools-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 服务监控面板 */
.monitor-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 系统信息面板 */
.system-info-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 面板头部 */
.panel-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.panel-subtitle {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 400;
}

/* 面板内容容器 */
.panel-content {
  width: 100%;
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
