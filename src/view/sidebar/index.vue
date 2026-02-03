<template>
  <div 
    class="sidebar-container" 
    :class="{ expanded: isExpanded }" 
    ref="sidebarRef"
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
          <div class="tool-item" @click="handleOpenIdeaNotebook">
            <el-icon><EditPen /></el-icon>
            <span>想法记事本</span>
          </div>
        </div>
      </div>
      
      <!-- 今日概览 -->
      <div class="overview-section">
        <div class="overview-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>今日概览</span>
        </div>
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-value">{{ todayStats.completedTasks }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ todayStats.totalTasks }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${todayStats.completionRate}%` }"
          ></div>
        </div>
      </div>

      <!-- 可滚动内容区域 -->
      <div class="scrollable-content">
        <!-- 当前焦点任务 -->
        <div class="focus-section" v-if="focusTask">
          <div class="section-header">
            <el-icon><Aim /></el-icon>
            <span>当前焦点</span>
          </div>
          <div class="focus-task" @click="handleOpenCalendar">
            <div class="task-title">{{ focusTask.title }}</div>
            <div class="task-time" v-if="focusTask.time">
              {{ focusTask.time }}
              <span v-if="focusTask.endTime"> - {{ focusTask.endTime }}</span>
            </div>
          </div>
        </div>

        <!-- 下一个会议 -->
        <div class="next-meeting-section" v-if="nextMeeting">
          <div class="section-header">
            <el-icon><VideoCamera /></el-icon>
            <span>下一个会议</span>
          </div>
          <div class="meeting-info" @click="handleOpenCalendar">
            <div class="meeting-title">{{ nextMeeting.title }}</div>
            <div class="meeting-time">{{ formatMeetingTime(nextMeeting) }}</div>
          </div>
        </div>

        <!-- AI建议 -->
        <div class="ai-suggestions-section" v-if="aiSuggestions.length > 0">
          <div class="section-header">
            <el-icon><MagicStick /></el-icon>
            <span>AI建议</span>
          </div>
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, index) in aiSuggestions" 
              :key="index"
              class="suggestion-item"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Calendar, 
  Money, 
  ArrowRight, 
  EditPen, 
  DataAnalysis, 
  Aim, 
  VideoCamera, 
  MagicStick 
} from '@element-plus/icons-vue'
import { expandSidebar, collapseSidebar, openCalendarReminder, openCreditCardReminder, openIdeaNotebook } from '@/utils/electronUtils'

interface TodayStats {
  completedTasks: number
  totalTasks: number
  completionRate: number
}

interface Task {
  id: string
  title: string
  time?: string
  endTime?: string
  date: string
  type?: string
  done?: boolean
  isEvent?: boolean
}

// const sidebarRef = ref<HTMLElement | null>(null) // 暂时未使用
const currentTime = ref('')
const currentDate = ref('')
const isExpanded = ref(false)
const todayStats = ref<TodayStats>({
  completedTasks: 0,
  totalTasks: 0,
  completionRate: 0
})
const todayEvents = ref<Task[]>([])
const todayTodos = ref<Task[]>([])
const focusTask = ref<Task | null>(null)
const nextMeeting = ref<Task | null>(null)
const aiSuggestions = ref<string[]>([])
let timer: number | null = null
let expandTimeout: number | null = null
let collapseTimeout: number | null = null
let dataRefreshTimer: number | null = null

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

const handleOpenCalendar = async () => {
  try {
    await openCalendarReminder()
    handleToggleExpand()
  } catch (error) {
    console.error('Failed to open calendar:', error)
  }
}

const handleOpenCreditCard = async () => {
  try {
    await openCreditCardReminder()
    handleToggleExpand()
  } catch (error) {
    console.error('Failed to open credit card reminder:', error)
  }
}

const handleOpenIdeaNotebook = async () => {
  try {
    await openIdeaNotebook()
    handleToggleExpand()
  } catch (error) {
    console.error('Failed to open idea notebook:', error)
  }
}

// handleMouseEnter 暂时未使用
// const handleMouseEnter = () => {
//   // 清除可能存在的收起定时器
//   if (collapseTimeout) {
//     clearTimeout(collapseTimeout)
//     collapseTimeout = null
//   }
//   
//   // 如果已经展开，直接返回
//   if (isExpanded.value) {
//     return
//   }
//   
//   isExpanded.value = true
//   try {
//     expandSidebar()
//   } catch (error) {
//     console.error('Failed to expand sidebar on mouse enter:', error)
//   }
// }


const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value
  try {
    if (isExpanded.value) {
      expandSidebar()
      // 展开时加载数据
      loadTodayData()
    } else {
      collapseSidebar()
    }
  } catch (error) {
    console.error('Failed to toggle sidebar:', error)
  }
}

// 加载今日数据
const loadTodayData = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 加载今日事件
    const eventsResult = await (window as any).electronAPI.event.getByDate(today)
    if (eventsResult.success && eventsResult.data) {
      todayEvents.value = eventsResult.data.map((e: { id: string; title: string; time: string; date: string; type: string; endTime?: string }) => ({
        id: e.id,
        title: e.title,
        time: e.time,
        date: e.date,
        type: e.type,
        endTime: e.endTime
      }))
    }

    // 加载今日代办
    const todosResult = await (window as any).electronAPI.todo.getByDate(today)
    if (todosResult.success && todosResult.data) {
      todayTodos.value = todosResult.data.map((t: { id: string; text: string; date: string; done: boolean }) => ({
        id: t.id,
        title: t.text,
        date: t.date,
        done: t.done
      }))
    }

    // 计算统计数据
    const completedTodos = todayTodos.value.filter((t: Task) => t.done).length
    const totalTasks = todayEvents.value.length + todayTodos.value.length
    const completedTasks = completedTodos + todayEvents.value.filter((e: Task) => {
      // 如果事件有结束时间且已过，视为完成
      if (e.time) {
        const eventDateTime = new Date(`${e.date} ${e.time}`)
        return eventDateTime < new Date()
      }
      return false
    }).length

    todayStats.value = {
      completedTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }

    // 查找当前焦点任务（最近的任务）
    findFocusTask()
    
    // 查找下一个会议
    findNextMeeting()

    // 加载AI建议
    loadAISuggestions()
  } catch (error) {
    console.error('Failed to load today data:', error)
  }
}

// 查找当前焦点任务
const findFocusTask = () => {
  const now = new Date()
  const allTasks = [
    ...todayEvents.value.map((e: Task) => ({
      ...e,
      isEvent: true
    })),
    ...todayTodos.value.filter((t: Task) => !t.done).map((t: Task) => ({
      ...t,
      isEvent: false
    }))
  ]

  // 找到最近的任务（时间最接近当前时间）
  const upcomingTasks = allTasks.filter((task: Task) => {
    if (task.isEvent && task.time) {
      const taskDateTime = new Date(`${task.date} ${task.time}`)
      return taskDateTime >= now
    }
    return true // 代办事项总是显示
  })

  if (upcomingTasks.length > 0) {
    // 按时间排序，取第一个
    upcomingTasks.sort((a: Task, b: Task) => {
      if (a.isEvent && a.time && b.isEvent && b.time) {
        const timeA = new Date(`${a.date} ${a.time}`).getTime()
        const timeB = new Date(`${b.date} ${b.time}`).getTime()
        return timeA - timeB
      }
      return 0
    })
    focusTask.value = upcomingTasks[0]
  } else {
    focusTask.value = null
  }
}

// 查找下一个会议
const findNextMeeting = () => {
  const now = new Date()
  const meetings = todayEvents.value.filter((e: Task) => {
    if (e.type === '会议' && e.time) {
      const eventDateTime = new Date(`${e.date} ${e.time}`)
      return eventDateTime >= now
    }
    return false
  })

  if (meetings.length > 0) {
    meetings.sort((a: Task, b: Task) => {
      const timeA = new Date(`${a.date} ${a.time}`).getTime()
      const timeB = new Date(`${b.date} ${b.time}`).getTime()
      return timeA - timeB
    })
    nextMeeting.value = meetings[0]
  } else {
    nextMeeting.value = null
  }
}

// 格式化会议时间
const formatMeetingTime = (meeting: Task): string => {
  if (!meeting.time) return ''
  const meetingDateTime = new Date(`${meeting.date} ${meeting.time}`)
  const now = new Date()
  const diff = meetingDateTime.getTime() - now.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 0) return '已开始'
  if (minutes < 60) return `${minutes}分钟后`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时后`
}

// 加载AI建议
const loadAISuggestions = async () => {
  try {
    // 基于今日任务生成建议
    if (todayEvents.value.length === 0 && todayTodos.value.length === 0) {
      aiSuggestions.value = ['今天还没有任务，可以规划一下今天的工作']
      return
    }

    const suggestions: string[] = []
    
    // 检查是否有未完成的代办
    const undoneTodos = todayTodos.value.filter((t: Task) => !t.done)
    if (undoneTodos.length > 0) {
      suggestions.push(`还有 ${undoneTodos.length} 个待办事项未完成`)
    }

    // 检查下一个会议
    if (nextMeeting.value) {
      const meetingTime = formatMeetingTime(nextMeeting.value)
      suggestions.push(`下一个会议：${nextMeeting.value.title}（${meetingTime}）`)
    }

    // 检查完成率
    if (todayStats.value.completionRate < 50 && todayStats.value.totalTasks > 0) {
      suggestions.push('今日完成率较低，建议优先处理重要任务')
    } else if (todayStats.value.completionRate >= 80) {
      suggestions.push('今日任务完成情况良好，继续保持！')
    }

    aiSuggestions.value = suggestions.slice(0, 3) // 最多显示3条建议
  } catch (error) {
    console.error('Failed to load AI suggestions:', error)
    aiSuggestions.value = []
  }
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(() => {
    updateTime()
  }, 1000)

  // 初始加载数据
  loadTodayData()

  // 每5分钟刷新一次数据
  dataRefreshTimer = window.setInterval(() => {
    if (isExpanded.value) {
      loadTodayData()
    }
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (expandTimeout) {
    clearTimeout(expandTimeout)
  }
  if (collapseTimeout) {
    clearTimeout(collapseTimeout)
  }
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
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
  min-height: 0;
}

/* 可滚动内容区域 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-right: 4px;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 2px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.7);
    }
  }
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

.overview-section,
.focus-section,
.next-meeting-section,
.ai-suggestions-section {
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  -webkit-app-region: no-drag;
}

.overview-section {
  margin-bottom: 10px;
  padding: 8px;
}

.overview-header,
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);

  .el-icon {
    font-size: 16px;
    color: #667eea;
  }
}

.overview-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 6px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.focus-task,
.meeting-info {
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateX(4px);
  }
}

.task-title,
.meeting-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.task-time,
.meeting-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}


.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
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
</style>