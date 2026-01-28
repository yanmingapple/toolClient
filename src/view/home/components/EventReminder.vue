<template>
  <div class="event-reminder">
    <!-- 顶部标题栏 -->
    <div class="dialog-title">
      <div class="title-wrapper">
        <el-icon class="title-icon"><Calendar /></el-icon>
        <span class="title-text">日历事件提醒</span>
      </div>
      <div class="calendar-nav">
        <el-button type="primary" size="small" @click="prevMonth">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="calendar-title-wrapper">
          <div class="calendar-title">
            {{ currentYear }}年{{ currentMonth }}月
          </div>
        </div>
        <el-button type="primary" size="small" @click="nextMonth">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
            <el-button type="success" size="small" @click="today">
              <el-icon><Clock /></el-icon>
              今天
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              :class="{ 'has-unread': unreadReminders > 0 }"
            >
              <el-icon><Bell /></el-icon>
              <span class="unread-count" v-if="unreadReminders > 0">{{ unreadReminders }}</span>
            </el-button>
      </div>
    </div>
    
    <div class="event-reminder-content">
        <!-- 日历视图 -->
        <div class="calendar-view">
          <!-- 日历头部 -->
          <div class="calendar-header">
            <!-- 星期标题 -->
            <div class="calendar-weekdays">
              <div class="weekday" v-for="day in weekdays" :key="day">
                {{ day }}
              </div>
            </div>
          </div>
          
          <!-- 日历格子 -->
          <div class="calendar-grid">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="calendar-day"
              :class="{
                'other-month': day.isOtherMonth,
                'today': day.isToday,
                'selected': day.date === selectedDate,
                'has-events': day.events.length > 0
              }"
              @click="selectDay(day)"
            >
              <div class="day-number" :class="{ 'today-number': day.isToday }">
                {{ day.day }}
              </div>
              <div class="day-events" v-if="day.events.length > 0">
                <div
                  v-for="(event, index) in day.events.slice(0, 2)"
                  :key="index"
                  class="event-dot"
                  :class="event.type"
                  :title="event.title"
                ></div>
                <div class="event-more" v-if="day.events.length > 2">
                  {{ getEventTypesSummary(day.events) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧事件面板 -->
        <div class="events-panel">
          <div class="panel-header">
            <div class="header-content">
              <div class="header-date">{{ selectedDateText }}</div>
              <div class="header-subline">
                <div class="header-weekday">{{ getWeekdayText(selectedDate.value) }}</div>
                <div class="header-lunar">{{ selectedLunarDate }}</div>
              </div>
            </div>
            <el-button type="primary" size="small" @click="showAddEventDialog">
              <el-icon><Plus /></el-icon>
              添加事件
            </el-button>
          </div>
          
          <!-- 当天事件列表 -->
          <div class="panel-events">
            <div
              v-for="event in selectedDayEvents"
              :key="event.id"
              class="panel-event-item"
              :class="{ 'event-past': isEventPast(event) }"
            >
              <div class="event-time-badge" :class="{ 'past-time': isEventPast(event) }">
                {{ event.time }}
              </div>
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-type" :class="event.type">{{ event.type }}</div>
                <div class="event-description" v-if="event.description">
                  {{ event.description }}
                </div>
              </div>
              <div class="event-actions">
                <el-button type="text" size="small" @click="editEvent(event)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="deleteEvent(event.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div v-if="selectedDayEvents.length === 0" class="no-events">
              <el-icon><Calendar /></el-icon>
              <p>当天暂无事件</p>
            </div>
          </div>
          
          <!-- 即将到来的事件 -->

        </div>
      </div>
      
      <!-- 添加/编辑事件对话框 -->
      <el-drawer
        v-model="addEventVisible"
        :title="editingEvent ? '编辑事件' : '添加事件'"
        size="600px"
        :close-on-click-modal="false"
      >
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" class="event-form">
          <el-form-item label="事件标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入事件标题" />
          </el-form-item>
          <el-form-item label="事件类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择事件类型">
              <el-option label="工作" value="工作" />
              <el-option label="会议" value="会议" />
              <el-option label="生日" value="生日" />
              <el-option label="纪念日" value="纪念日" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="提醒时间" prop="remindBefore">
            <el-select v-model="formData.remindBefore" placeholder="选择提醒时间">
              <el-option label="不提醒" :value="0" />
              <el-option label="提前5分钟" :value="5" />
              <el-option label="提前15分钟" :value="15" />
              <el-option label="提前30分钟" :value="30" />
              <el-option label="提前1小时" :value="60" />
              <el-option label="提前1天" :value="1440" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="formData.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="时间" prop="time">
            <el-time-picker
              v-model="formData.time"
              placeholder="选择时间"
              format="HH:mm"
              value-format="HH:mm"
            />
          </el-form-item>
          <el-form-item label="事件描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入事件描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addEventVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEvent">保存</el-button>
        </template>
      </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Calendar, Clock, ArrowLeft, ArrowRight, Bell } from '@element-plus/icons-vue'
import { Solar } from 'lunar-javascript'

interface Event {
  id: string
  title: string
  type: string
  date: string
  time: string
  description: string
  remindBefore: number
  createdAt: number
}

interface CalendarDay {
  date: string
  day: number
  month: number
  year: number
  isToday: boolean
  isOtherMonth: boolean
  events: Event[]
}

interface FormData {
  title: string
  type: string
  date: string
  time: string
  description: string
  remindBefore: number
}

// 移除 props 和 emit，因为现在是在独立窗口中显示

// 日历状态
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref('')
const events = ref<Event[]>([])

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 表单状态
const addEventVisible = ref(false)
const editingEvent = ref<Event | null>(null)
const formRef = ref<FormInstance>()
const formData = ref<FormData>({
  title: '',
  type: '其他',
  date: '',
  time: '09:00',
  description: '',
  remindBefore: 15
})

const rules = ref<FormRules>({
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择事件类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择时间', trigger: 'change' }
  ],
  remindBefore: [
    { required: true, message: '请选择提醒时间', trigger: 'change' }
  ]
})

// 计算日历日期
const calendarDays = computed<CalendarDay[]>(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value - 1, 0)
  
  const firstDayOfWeek = firstDay.getDay()
  const lastDayDate = lastDay.getDate()
  const prevLastDayDate = prevLastDay.getDate()
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // 添加上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDayDate - i
    const date = `${currentYear.value}-${String(currentMonth.value - 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      date,
      day,
      month: currentMonth.value - 1,
      year: currentYear.value,
      isToday: false,
      isOtherMonth: true,
      events: getEventsForDate(date)
    })
  }
  
  // 添加当月的日期
  for (let day = 1; day <= lastDayDate; day++) {
    const date = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      date,
      day,
      month: currentMonth.value,
      year: currentYear.value,
      isToday: date === todayStr,
      isOtherMonth: false,
      events: getEventsForDate(date)
    })
  }
  
  // 添加下个月的日期
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      date,
      day,
      month: currentMonth.value + 1,
      year: currentYear.value,
      isToday: false,
      isOtherMonth: true,
      events: getEventsForDate(date)
    })
  }
  
  return days
})

const selectedDateText = computed(() => {
  if (!selectedDate.value) {
    const today = new Date()
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  return `${year}年${month}月${day}日`
})

const selectedLunarDate = computed(() => {
  if (!selectedDate.value) {
    const today = new Date()
    const solar = Solar.fromDate(today)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  }
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
})

const unreadReminders = computed(() => {
  const now = Date.now()
  return events.value.filter(event => {
    const eventTime = new Date(`${event.date} ${event.time}`).getTime()
    const remindTime = eventTime - event.remindBefore * 60 * 1000
    const reminded = localStorage.getItem(`reminded_${event.id}`)
    return event.remindBefore > 0 && now >= remindTime && now < eventTime && !reminded
  }).length
})

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return []
  return events.value.filter(e => e.date === selectedDate.value)
})

const upcomingEvents = computed(() => {
  return events.value
    .filter(event => {
      const eventTime = new Date(`${event.date} ${event.time}`).getTime()
      return eventTime > Date.now()
    })
    .sort((a, b) => {
      const timeA = new Date(`${a.date} ${a.time}`).getTime()
      const timeB = new Date(`${b.date} ${b.time}`).getTime()
      return timeA - timeB
    })
    .slice(0, 5)
})

const getEventsForDate = (date: string): Event[] => {
  return events.value.filter(e => e.date === date)
}

// 日历操作
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const today = () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth() + 1
  selectedDate.value = now.toISOString().split('T')[0]
}

const selectDay = (day: CalendarDay) => {
  selectedDate.value = day.date
}

const selectDate = (date: string) => {
  selectedDate.value = date
  const [year, month] = date.split('-').map(Number)
  currentYear.value = year
  currentMonth.value = month
}

// 事件操作
const loadEvents = () => {
  const stored = localStorage.getItem('calendar_events')
  if (stored) {
    try {
      events.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load events:', e)
      events.value = []
    }
  }
}

const saveEvents = () => {
  localStorage.setItem('calendar_events', JSON.stringify(events.value))
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const showAddEventDialog = () => {
  editingEvent.value = null
  formData.value = {
    title: '',
    type: '其他',
    date: selectedDate.value || new Date().toISOString().split('T')[0],
    time: '09:00',
    description: '',
    remindBefore: 15
  }
  addEventVisible.value = true
}

const editEvent = (event: Event) => {
  editingEvent.value = event
  formData.value = {
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    description: event.description,
    remindBefore: event.remindBefore
  }
  addEventVisible.value = true
}

const deleteEvent = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个事件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    events.value = events.value.filter(e => e.id !== id)
    saveEvents()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const submitEvent = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      if (editingEvent.value) {
        // 编辑事件
        const index = events.value.findIndex(e => e.id === editingEvent.value!.id)
        if (index !== -1) {
          events.value[index] = {
            ...editingEvent.value,
            title: formData.value.title,
            type: formData.value.type,
            date: formData.value.date,
            time: formData.value.time,
            description: formData.value.description,
            remindBefore: formData.value.remindBefore
          }
        }
        ElMessage.success('更新成功')
      } else {
        // 添加新事件
        const newEvent: Event = {
          id: generateId(),
          title: formData.value.title,
          type: formData.value.type,
          date: formData.value.date,
          time: formData.value.time,
          description: formData.value.description,
          remindBefore: formData.value.remindBefore,
          createdAt: Date.now()
        }
        events.value.push(newEvent)
        ElMessage.success('添加成功')
      }
      saveEvents()
      addEventVisible.value = false
    }
  })
}

const isEventPast = (event: Event) => {
  const eventTime = new Date(`${event.date} ${event.time}`).getTime()
  return eventTime < Date.now()
}

const formatUpcomingDate = (event: Event) => {
  const date = new Date(event.date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

const getCountdown = (event: Event) => {
  const eventTime = new Date(`${event.date} ${event.time}`).getTime()
  const now = Date.now()
  const diff = eventTime - now
  
  if (diff <= 0) {
    return '已过期'
  }
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  
  if (days > 0) {
    return `${days}天${hours}小时后`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟后`
  } else {
    return `${minutes}分钟后`
  }
}

const getEventTypesSummary = (events: Event[]) => {
  const typeCount: Record<string, number> = {}
  events.forEach(event => {
    typeCount[event.type] = (typeCount[event.type] || 0) + 1
  })
  
  const types = Object.keys(typeCount)
  if (types.length === 1) {
    return `${types[0]}(${typeCount[types[0]]})`
  } else if (types.length === 2) {
    return `${types[0]}(${typeCount[types[0]]}) ${types[1]}(${typeCount[types[1]]})`
  } else {
    const firstType = types[0]
    const otherCount = events.length - typeCount[firstType]
    return `${firstType}(${typeCount[firstType]}) 其他(${otherCount})`
  }
}

const getWeekdayText = (dateStr: string) => {
  if (!dateStr) {
    const today = new Date()
    return weekdays[today.getDay() === 0 ? 6 : today.getDay() - 1]
  }
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  return weekdays[dayOfWeek === 0 ? 6 : dayOfWeek - 1]
}

const handleTypeChange = (type: string) => {
  // 类型改变时的回调
}

const setMorningTime = () => {
  formData.value.time = '09:00'
}

const setAfternoonTime = () => {
  formData.value.time = '14:00'
}

const setEveningTime = () => {
  formData.value.time = '19:00'
}

const setAllDay = () => {
  formData.value.time = '00:00'
  formData.value.remindBefore = 1440
}

const checkReminders = () => {
  const now = Date.now()
  events.value.forEach(event => {
    const eventTime = new Date(`${event.date} ${event.time}`).getTime()
    const remindTime = eventTime - event.remindBefore * 60 * 1000
    
    if (event.remindBefore > 0 && now >= remindTime && now < eventTime) {
      // 检查是否已经提醒过
      const reminded = localStorage.getItem(`reminded_${event.id}`)
      if (!reminded) {
        ElMessage({
          message: `📅 事件提醒：${event.title}`,
          type: 'warning',
          duration: 0,
          showClose: true
        })
        localStorage.setItem(`reminded_${event.id}`, 'true')
      }
    }
  })
}

let reminderTimer: number | null = null

const startReminderCheck = () => {
  reminderTimer = window.setInterval(checkReminders, 60 * 1000)
}

const stopReminderCheck = () => {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

onMounted(() => {
  loadEvents()
  today()
  startReminderCheck()
})

onUnmounted(() => {
  stopReminderCheck()
})

// 组件挂载时加载事件
onMounted(() => {
  loadEvents()
})

defineExpose({
  loadEvents
})
</script>

<style scoped>
.event-reminder {
  font-family: 'Microsoft YaHei', sans-serif;
}

.event-reminder-content {
  display: flex;
  height: calc(84vh - 20px);
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: hidden;
}

/* Dialog Title */
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  flex-shrink: 0;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.title-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-nav .el-button {
  color: white;
  font-size: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.calendar-nav .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.calendar-nav .el-button--primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
}

.calendar-nav .el-button--primary:hover {
  background: linear-gradient(135deg, #ee7494 0%, #e63946 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.calendar-nav .el-button--success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
}

.calendar-nav .el-button--success:hover {
  background: linear-gradient(135deg, #3a86ff 0%, #00d4ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.calendar-nav .el-button--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 14px;
  position: relative;
}

.calendar-nav .el-button--warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.calendar-nav .el-button--warning.has-unread {
  animation: pulse-ring 2s infinite;
}

.calendar-nav .el-button--warning.has-unread::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.unread-count {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 700;
}

.calendar-title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.calendar-title {
  font-size: 18px;
  font-weight: 700;
  min-width: 140px;
  text-align: center;
  letter-spacing: 1px;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.calendar-today-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 日历视图 */
.calendar-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.calendar-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #e2e8f0;
  color: #374151;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #e5e7eb;
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.weekday {
  text-align: center;
  padding: 12px 8px;
  font-weight: 600;
  font-size: 14px;
  background: white;
  color: #6b7280;
  transition: all 0.3s ease;
}

.weekday:hover {
  background: #f3f4f6;
  color: #374151;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 12px;
  flex: 1;
  overflow: hidden;
  background: #e5e7eb;
  min-height: 0;
}

.calendar-day {
  min-height: 0;
  height: 100%;
  padding: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 8px;
  border: 1px solid transparent;
}

.calendar-day:hover {
  z-index: 1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  background: #f8fafc;
}

.calendar-day:not(.today):hover {
  background: #f8fafc;
}

.calendar-day.other-month {
  background: #f9fafb;
  opacity: 0.6;
}

.calendar-day.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.calendar-day.selected {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 16px rgba(245, 87, 108, 0.3);
}

.calendar-day.has-events {
  border: 2px solid #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.day-number {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  padding: 4px 8px;
  align-self: flex-start;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  color: #374151;
}

.calendar-day.today .day-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 700;
}

.calendar-day.selected .day-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.calendar-day:hover .day-number {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.calendar-day.today:hover .day-number {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 6px;
  flex: 1;
  overflow: hidden;
  align-items: flex-start;
}

.event-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.event-dot:hover {
  transform: scale(1.3);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.event-dot.工作 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.event-dot.会议 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.event-dot.生日 {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.event-dot.纪念日 {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.event-dot.其他 {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.event-more {
  font-size: 10px;
  color: #6b7280;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  flex-shrink: 0;
  font-weight: 600;
  margin-left: 4px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.calendar-day.today .event-more {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
}

.calendar-day:hover .event-more {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

/* 右侧事件面板 */
.events-panel {
  width: 420px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: 20px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-date {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}

.header-subline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-weekday {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.header-lunar {
  font-size: 12px;
  opacity: 0.85;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.panel-events {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.panel-event-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.panel-event-item:hover {
  background: #f8fafc;
  transform: translateX(8px);
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.panel-event-item.event-past {
  opacity: 0.7;
  filter: grayscale(30%);
}

.event-time-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.event-time-badge.past-time {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  box-shadow: 0 4px 12px rgba(156, 163, 175, 0.3);
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-content .event-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.panel-event-item:hover .event-title {
  color: #667eea;
}

.event-content .event-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.event-type.工作 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.event-type.会议 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.event-type.生日 {
  background: #10b981;
}

.event-type.纪念日 {
  background: #6b7280;
}

.event-type.其他 {
  background: #ef4444;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-actions {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.event-actions .el-button {
  padding: 4px 6px;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.no-events el-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.no-events p {
  margin: 0;
  font-size: 15px;
}

.upcoming-section {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.upcoming-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #111827;
  font-weight: 700;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upcoming-item {
  padding: 14px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f3f4f6;
}

.upcoming-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.upcoming-date {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
  font-weight: 500;
}

.upcoming-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  line-height: 1.4;
}

.upcoming-countdown {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.no-upcoming {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 10px;
  color: #9ca3af;
}

.no-upcoming el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.no-upcoming p {
  margin: 0;
  font-size: 14px;
}

/* 添加事件对话框样式 */
.event-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px 32px;
    border-radius: 16px 16px 0 0;
  }
  
  .el-dialog__title {
    color: white;
    font-size: 24px;
    font-weight: 700;
  }
  
  .el-dialog__close {
    color: white;
    font-size: 24px;
  }
  
  .el-dialog__body {
    padding: 32px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
  
  .el-dialog__footer {
    padding: 20px 32px;
    background: white;
    border-radius: 0 0 16px 16px;
  }
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.header-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-icon-wrapper.工作 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.header-icon-wrapper.会议 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.header-icon-wrapper.生日 {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.header-icon-wrapper.纪念日 {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.header-icon-wrapper.其他 {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.header-icon {
  font-size: 28px;
  color: white;
}

.header-title-wrapper {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.header-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* 表单样式 */
.event-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 28px;
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.form-row {
  display: flex;
  gap: 24px;
}

.form-item-full {
  flex: 1;
}

.form-item-half {
  flex: 1;
}

.quick-section {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #7dd3fc;
}

.form-input-large {
  font-size: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.form-select {
  font-size: 15px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.form-datepicker,
.form-timepicker {
  font-size: 15px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.form-textarea {
  font-size: 15px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  resize: vertical;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

/* 快捷操作区域 */
.quick-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.quick-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.quick-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-buttons .el-button {
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* 对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.footer-btn {
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-btn-cancel {
  color: #6b7280;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
  }
}

.footer-btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
}

/* 表单标签样式 */
.event-form .el-form-item__label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* 表单验证错误提示 */
.event-form .el-form-item__error {
  font-size: 12px;
  color: #ef4444;
}

/* 移除抽屉样式，因为现在是在独立窗口中显示 */

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-item-half {
    width: 100%;
  }
  
  .dialog-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-title {
    font-size: 20px;
  }
}
</style>