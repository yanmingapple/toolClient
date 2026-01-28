<template>
  <div class="quick-actions">
    <div class="action-grid">
      <div 
        v-for="action in quickActions" 
        :key="action.id"
        class="action-card" 
        @click="handleQuickAction(action.handler)"
      >
        <div class="action-icon-wrapper" :class="action.iconBgClass">
          <el-icon class="action-icon"><component :is="iconMap[action.icon]" /></el-icon>
        </div>
        <div class="action-title">{{ action.title }}</div>
        <div class="action-desc">{{ action.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Connection, Setting, Upload, DataBoard } from '@element-plus/icons-vue'
import { ElMessage as CTMessage } from 'element-plus'

// 图标组件映射
const iconMap = {
  Connection,
  Setting,
  Upload,
  Database: DataBoard  // 使用 DataBoard 替代不存在的 Database 图标
}

// 快速操作数据配置
const quickActions = ref([
  {
    id: 'enter-database',
    title: '进入数据库',
    description: '管理数据库连接、查询和对象',
    icon: 'Connection',
    iconBgClass: 'icon-bg-blue',
    handler: 'handleEnterDatabase'
  },
  {
    id: 'open-dbgate',
    title: 'DbGate',
    description: '专业数据库管理工具',
    icon: 'Database',
    iconBgClass: 'icon-bg-dbgate',
    handler: 'handleOpenDbgate'
  },
  {
    id: 'open-terminal',
    title: '终端控制台',
    description: '执行SQL命令和脚本',
    icon: 'Setting',
    iconBgClass: 'icon-bg-green',
    handler: 'handleOpenTerminal'
  },
  {
    id: 'import-data',
    title: '导入、导出数据',
    description: '从文件导入数据',
    icon: 'Upload',
    iconBgClass: 'icon-bg-purple',
    handler: 'handleImportData'
  }
])

// 统一处理快速操作点击事件
const handleQuickAction = (handler: string) => {
  const handlerMap: Record<string, () => void> = {
    handleEnterDatabase,
    handleOpenDbgate,
    handleOpenTerminal,
    handleImportData
  }
  
  const actionHandler = handlerMap[handler]
  if (actionHandler) {
    actionHandler()
  }
}

const emit = defineEmits<{
  createPanel: [type: string, title: string, content: any]
  openTerminal: []
  openDbgate: []
}>()

const handleEnterDatabase = () => {
  emit('createPanel', 'database', '数据库管理', null)
}

const handleOpenDbgate = () => {
  emit('openDbgate')
}

const handleOpenTerminal = () => {
  emit('openTerminal')
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

.action-card:hover .action-icon-wrapper {
  transform: scale(1.1);
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.icon-bg-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-bg-green {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.icon-bg-purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.icon-bg-dbgate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon {
  font-size: 24px;
  color: white;
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