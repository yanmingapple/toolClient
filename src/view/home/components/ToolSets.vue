<template>
  <div class="tool-sets">
    <!-- 快速操作网格 -->
    <div class="quick-actions-grid">
      <div 
        v-for="action in quickActions" 
        :key="action.id"
        class="quick-action-card" 
        @click="handleQuickAction(action.handler)"
      >
        <div class="action-icon-wrapper" :class="action.iconBgClass">
          <el-icon class="action-icon"><component :is="iconMap[action.icon]" /></el-icon>
        </div>
        <div class="action-title">{{ action.title }}</div>
        <div class="action-desc">{{ action.description }}</div>
      </div>
    </div>

    <!-- 工具分类 -->
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
import { Bell, Setting, Connection, DataBoard, Monitor } from '@element-plus/icons-vue'
import { ElMessage as CTMessage } from 'element-plus'

const emit = defineEmits(['open-event-reminder', 'open-ai-config', 'create-panel', 'open-terminal', 'open-dbgate', 'open-service-monitor'])

// 图标组件映射
const iconMap = {
  Connection,
  Database: DataBoard,
  Setting,
  Bell,
  Monitor
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
    id: 'event-reminder',
    title: '代办提醒',
    description: '日历提醒和代办', 
    icon: 'Bell',
    iconBgClass: 'icon-bg-purple',
    handler: 'handleEventReminderQuick'
  },
  {
    id: 'service-monitor',
    title: '服务监控',
    description: '监控和管理服务状态',
    icon: 'Monitor',
    iconBgClass: 'icon-bg-orange',
    handler: 'handleOpenServiceMonitor'
  }
])

// 处理快速操作点击事件
const handleQuickAction = (handler: string) => {
  const handlerMap: Record<string, () => void> = {
    handleEnterDatabase: handleEnterDatabase,
    handleOpenDbgate: handleOpenDbgate,
    handleOpenTerminal: handleOpenTerminal,
    handleEventReminderQuick: handleEventReminderQuick,
    handleOpenServiceMonitor: handleOpenServiceMonitor
  }
  
  const actionHandler = handlerMap[handler]
  if (actionHandler) {
    actionHandler()
  }
}

const handleEnterDatabase = () => {
  emit('create-panel', 'database', '数据库管理', null)
}

const handleOpenDbgate = () => {
  emit('open-dbgate')
}

const handleOpenTerminal = () => {
  emit('open-terminal')
}

const handleEventReminderQuick = () => {
  emit('open-event-reminder')
  CTMessage.success('正在打开事件提醒...')
}

const handleOpenServiceMonitor = () => {
  emit('open-service-monitor')
}


</script>

<style scoped>
.tool-sets {
  width: 100%;
}

/* 快速操作网格 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.quick-action-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.quick-action-card:hover .action-icon-wrapper {
  transform: scale(1.1);
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
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

.icon-bg-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.action-icon {
  font-size: 24px;
  color: white;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.action-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

</style>