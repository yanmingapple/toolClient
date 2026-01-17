<template>
  <div class="quick-actions">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Tools, PieChart, Upload } from '@element-plus/icons-vue'
import { ElMessage as CTMessage } from 'element-plus'

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

const handleEnterDatabase = () => {
  CTMessage.info('进入数据库功能开发中...')
}

const handleOpenTerminal = () => {
  CTMessage.info('终端控制台功能开发中...')
}

const handleServiceMonitor = () => {
  CTMessage.info('服务监控功能开发中...')
}

const handleImportData = () => {
  CTMessage.info('数据导入功能开发中...')
}
</script>

<style scoped>
.quick-actions {
  width: 100%;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.action-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px 16px;
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
</style>