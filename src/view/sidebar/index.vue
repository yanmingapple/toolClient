<template>
  <div 
    class="sidebar-container" 
    :class="{ expanded: isExpanded }" 
    ref="sidebarRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 左侧控制条 -->
    <div class="sidebar-handle" @click="handleToggleExpand">
      <el-icon class="toggle-icon" :class="{ expanded: isExpanded }"><ArrowRight /></el-icon>
    </div>
    
    <!-- 主内容区 -->
    <div class="sidebar-content">
      <!-- 时间显示 -->
      <div class="time-section">
        <div class="current-time">{{ currentTime }}</div>
        <div class="current-date">{{ currentDate }}</div>
      </div>
      
      <!-- 快捷工具 -->
      <div class="tools-section">
        <div class="tool-row">
          <div class="tool-item" @click="handleOpenCalendar">
            <el-icon><Calendar /></el-icon>
            <span>日历提醒</span>
          </div>
          <div class="tool-item" @click="handleOpenCreditCard">
            <el-icon><Money /></el-icon>
            <span>信用卡提醒</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, Money, Cpu, Monitor, ArrowRight } from '@element-plus/icons-vue'
import { getSystemResources, expandSidebar, collapseSidebar, openCalendarReminder, openCreditCardReminder } from '@/utils/electronUtils'

const sidebarRef = ref<HTMLElement | null>(null)
const currentTime = ref('')
const currentDate = ref('')
const systemInfo = ref({ cpu: '0%', memory: '0%' })
const isExpanded = ref(false)
let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

const updateSystemInfo = async () => {
  try {
    const result = await getSystemResources()
    if (result.success && result.data) {
      systemInfo.value = {
        cpu: result.data.cpu,
        memory: result.data.memory
      }
    }
  } catch (error) {
    console.error('Failed to get system resources:', error)
  }
}

const handleOpenCalendar = () => {
  try {
    openCalendarReminder()
    handleToggleExpand()
  } catch (error) {
    console.error('Failed to open calendar:', error)
  }
}

const handleOpenCreditCard = () => {
  try {
    openCreditCardReminder()
    handleToggleExpand()
  } catch (error) {
    console.error('Failed to open credit card reminder:', error)
  }
}

const handleMouseEnter = () => {
  isExpanded.value = true
  try {
    expandSidebar()
  } catch (error) {
    console.error('Failed to expand sidebar on mouse enter:', error)
  }
}

const handleMouseLeave = () => {
  isExpanded.value = false
  try {
    collapseSidebar()
  } catch (error) {
    console.error('Failed to collapse sidebar on mouse leave:', error)
  }
}

const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value
  try {
    if (isExpanded.value) {
      expandSidebar()
    } else {
      collapseSidebar()
    }
  } catch (error) {
    console.error('Failed to toggle sidebar:', error)
  }
}

onMounted(() => {
  updateTime()
  updateSystemInfo()
  timer = window.setInterval(() => {
    updateTime()
    updateSystemInfo()
  }, 100)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  user-select: none;
  -webkit-app-region: drag;
  cursor: pointer;
  position: relative;
}

// 左侧控制条
.sidebar-handle {
  width: 16px;
  height: 100%;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-app-region: no-drag;
  position: relative;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(102, 126, 234, 0.3);
  
  &:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.4) 0%, rgba(102, 126, 234, 0.2) 100%);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 80px;
    background: linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.8) 50%, transparent 100%);
    border-radius: 2px;
  }
}

.toggle-icon {
  font-size: 16px;
  color: rgba(102, 126, 234, 0.9);
  transition: all 0.3s ease;
  z-index: 1;
  text-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.sidebar-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  overflow: hidden;
}

.time-section {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.current-time {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.current-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.tools-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.tool-row {
  display: flex;
  gap: 12px;
}

.tool-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-app-region: no-drag;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  .el-icon {
    font-size: 24px;
    color: #667eea;
  }
  
  span {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
  }
}

.system-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.system-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  
  .el-icon {
    font-size: 14px;
  }
}
</style>