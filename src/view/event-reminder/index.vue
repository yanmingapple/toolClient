<template>
  <div class="event-reminder">
    <!-- 顶部标题栏 -->
    <div class="dialog-title">
      <div class="calendar-nav">
        <!-- 左侧：日期切换按钮 -->
        <div class="date-nav-left">
          <el-button type="primary" size="small" @click="prevPeriod">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <div class="calendar-title-wrapper">
            <div class="calendar-title">
              {{ calendarTitle }}
            </div>
          </div>
          <el-button type="primary" size="small" @click="nextPeriod">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button type="success" size="small" @click="today">
            <el-icon><Clock /></el-icon>
            今天
          </el-button>
        </div>
        
        <!-- 右侧：视图切换和提醒按钮 -->
        <div class="nav-right">
          <!-- 视图切换按钮 -->
          <div class="view-switcher">
            <el-button-group>
              <el-button 
                size="small" 
                :type="currentView === 'dayGridMonth' ? 'primary' : 'default'"
                @click="switchView('dayGridMonth')"
              >
                月历
              </el-button>
              <el-button 
                size="small" 
                :type="currentView === 'timeGridWeek' ? 'primary' : 'default'"
                @click="switchView('timeGridWeek')"
              >
                周历
              </el-button>
              <el-button 
                size="small" 
                :type="currentView === 'timeGridDay' ? 'primary' : 'default'"
                @click="switchView('timeGridDay')"
              >
                日历
              </el-button>
              <el-button 
                size="small" 
                :type="currentView === 'listWeek' ? 'primary' : 'default'"
                @click="switchView('listWeek')"
              >
                日程列表
              </el-button>
            </el-button-group>
          </div>
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
    </div>
    
    <div class="event-reminder-content">
        <!-- FullCalendar 日历视图 -->
        <div class="calendar-view" v-if="currentView !== 'listWeek'">
          <FullCalendar
            ref="fullCalendarRef"
            :options="calendarOptions"
            class="fullcalendar-container"
          />
        </div>
        
        <!-- 日程列表视图 -->
        <div class="list-view" v-if="currentView === 'listWeek'">
          <div class="list-view-header">
            <div class="list-header-title">日程列表</div>
            <div class="list-header-date">{{ calendarTitle }}</div>
          </div>
          <div class="list-view-content">
            <div 
              v-for="event in sortedEvents" 
              :key="event.id"
              class="list-event-item"
              :class="{ 'event-past': isEventPast(event) }"
            >
              <div class="list-event-date">
                <div class="list-event-day">{{ formatEventDate(event.date) }}</div>
                <div class="list-event-time">{{ event.time }}</div>
              </div>
              <div class="list-event-content">
                <div class="list-event-title">{{ event.title }}</div>
                <div class="list-event-type" :class="event.type">{{ event.type }}</div>
                <div class="list-event-description" v-if="event.description">
                  {{ event.description }}
                </div>
              </div>
              <div class="list-event-actions">
                <el-button type="text" size="small" @click="handleCompleteEvent(event.id)" title="标记为完成">
                  <el-icon><CircleCheck /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="editEvent(event)" title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="deleteEvent(event.id)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-if="sortedEvents.length === 0" class="no-events-list">
              <el-icon><Calendar /></el-icon>
              <p>暂无日程安排</p>
            </div>
          </div>
        </div>
        
        <!-- 右侧事件面板 -->
        <div class="events-panel" v-if="currentView !== 'listWeek'">
          <div class="panel-header">
            <div class="header-content">
              <div class="header-date">{{ selectedDateText }}</div>
              <div class="header-subline">
                <div class="header-weekday">{{ getWeekdayText(selectedDate) }}</div>
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

          <!-- 代办事项 -->
          <div class="todo-section">
            <div class="todo-header">
              <div class="todo-title">代办事项</div>
              <div class="todo-input">
                <el-input
                  v-model="newTodoText"
                  placeholder="添加一条代办，例如：下午 3 点给客户回电"
                  @keyup.enter="addTodo"
                />
                <el-button
                  type="primary"
                  @click="addTodo"
                  :disabled="!newTodoText.trim()"
                >
                  添加代办
                </el-button>
              </div>
            </div>

            <div class="todo-list" v-if="selectedDateTodos.length > 0">
              <div
                v-for="todo in selectedDateTodos"
                :key="todo.id"
                class="todo-item"
              >
                <el-checkbox
                  :model-value="todo.done"
                  @change="(val: any) => toggleTodo(todo.id, !!val)"
                />
                <div
                  class="todo-text"
                  :class="{ 'todo-done': todo.done }"
                >
                  {{ todo.title }}
                </div>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteTodo(todo.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else class="todo-empty">
              <p>当前日期暂无代办事项</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加/编辑事件对话框 -->
      <el-drawer
        v-model="addEventVisible"
        :title="editingEvent ? '编辑事件' : '添加事件'"
        size="600px"
        :close-on-click-modal="true"
        :modal="false"
        modal-penetrable
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
          <el-form-item label="开始时间" prop="time">
            <el-time-picker
              v-model="formData.time"
              placeholder="选择开始时间"
              format="HH:mm"
              value-format="HH:mm"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-time-picker
              v-model="formData.endTime"
              placeholder="选择结束时间（可选）"
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

    <!-- 冲突解决对话框 -->
    <ConflictResolutionDialog
      v-model="conflictDialogVisible"
      :new-event="pendingEvent"
      :conflicts="detectedConflicts"
      @apply-solution="handleApplyConflictSolution"
      @ignore="handleIgnoreConflict"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Calendar, Clock, ArrowLeft, ArrowRight, Bell, CircleCheck } from '@element-plus/icons-vue'
import ConflictResolutionDialog from '@/components/ConflictResolutionDialog.vue'
import { Solar } from 'lunar-javascript'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type {
  CalendarOptions,
  EventClickArg,
  EventContentArg,
  DayCellContentArg,
  SlotLabelContentArg,
  DayHeaderContentArg,
} from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

interface Event {
  id: string
  title: string
  type: string
  date: string
  time: string
  endTime?: string
  description: string
  remindBefore: number
  createdAt: number
}

// CalendarDay 接口已移除，因为使用 FullCalendar

interface FormData {
  title: string
  type: string
  date: string
  time: string
  endTime?: string
  description: string
  remindBefore: number
}

interface TodoItem {
  id: string
  title: string
  date: string // YYYY-MM-DD，对应 selectedDate
  done: boolean
  createdAt: number
}

// 移除 props 和 emit，因为现在是在独立窗口中显示

// FullCalendar 引用
const fullCalendarRef = ref<any>(null)

// 日历状态
const selectedDate = ref('')
const events = ref<Event[]>([])
const currentView = ref<string>('dayGridMonth')

// 代办事项
const todos = ref<TodoItem[]>([])
const newTodoText = ref('')

// FullCalendar 事件数据（转换后的格式）
const fullCalendarEvents = computed(() => {
  const calendarEvents = events.value.map((event: Event) => {
    // 将日期和时间组合成完整的 ISO 日期时间字符串
    // event.date 格式: "2024-01-01"
    // event.time 格式: "09:00"
    const startDateTime = `${event.date}T${event.time}:00`
    const endDateTime = event.endTime ? `${event.date}T${event.endTime}:00` : undefined
    
    return {
      id: event.id,
      title: event.title,
      start: startDateTime,
      end: endDateTime,
      allDay: false,
      extendedProps: {
        type: event.type,
        time: event.time,
        endTime: event.endTime,
        description: event.description,
        remindBefore: event.remindBefore
      },
      classNames: [`event-type-${event.type}`],
      backgroundColor: getEventColor(event.type),
      borderColor: getEventColor(event.type)
    }
  })

  // 将代办事项作为全天事件显示在日历上
  const todoEvents = todos.value.map((todo: TodoItem) => ({
    id: `todo-${todo.id}`,
    title: todo.title,
    start: todo.date, // 全天事件，只需要日期
    allDay: true,
    extendedProps: {
      isTodo: true,
      done: todo.done,
    },
    classNames: ['todo-event'],
  }))

  return [...calendarEvents, ...todoEvents]
})

// 获取事件颜色
const getEventColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    '工作': '#3b82f6',
    '会议': '#f59e0b',
    '生日': '#10b981',
    '纪念日': '#6b7280',
    '其他': '#ef4444'
  }
  return colorMap[type] || '#6b7280'
}

// FullCalendar 配置
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: currentView.value,
  locale: 'zh-cn',
  headerToolbar: false, // 使用自定义头部
  height: '100%',
  events: fullCalendarEvents.value,
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 2,
  moreLinkClick: 'popover',
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  datesSet: handleDatesSet,
  eventContent: renderEventContent,
  slotLabelContent: renderSlotLabelContent,
  views: {
    dayGridMonth: {
      dayMaxEvents: 3,
      moreLinkClick: 'popover',
      // 只在月历使用自定义 dayCellContent（避免污染周历/日历的时间网格）
      dayCellContent: renderDayCellContent,
    },
    timeGridWeek: {
      slotMinTime: '00:00:00',
      slotMaxTime: '24:00:00',
      allDaySlot: false,
      height: '100%',
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false
      },
      // 周历列头：显示日期 + 农历（不影响时间网格）
      dayHeaderContent: renderDayHeaderContent,
    },
    timeGridDay: {
      slotMinTime: '00:00:00',
      slotMaxTime: '24:00:00',
      allDaySlot: false,
      height: '100%',
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false
      },
      // 日历列头：显示日期 + 农历（不影响时间网格）
      dayHeaderContent: renderDayHeaderContent,
    },
    listWeek: {
      listDayFormat: { weekday: 'long', month: 'long', day: 'numeric' },
      listDaySideFormat: false
    }
  }
}))

// 表单状态
const addEventVisible = ref(false)
const editingEvent = ref<Event | null>(null)
const formRef = ref<FormInstance>()
const formData = ref<FormData>({
  title: '',
  type: '工作',
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

// 日历标题（从 FullCalendar 获取）
const calendarTitle = ref('')

// 冲突检测相关
const conflictDialogVisible = ref(false)
const pendingEvent = ref<any>(null)
const detectedConflicts = ref<any[]>([])

const selectedDateText = computed(() => {
  if (!selectedDate.value) {
    const today = new Date()
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }
  // 确保日期格式正确
  const dateParts = selectedDate.value.split('-')
  if (dateParts.length !== 3) {
    const today = new Date()
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }
  const [year, month, day] = dateParts.map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    const today = new Date()
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }
  return `${year}年${month}月${day}日`
})

const selectedLunarDate = computed(() => {
  if (!selectedDate.value) {
    const today = new Date()
    const solar = Solar.fromDate(today)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  }
  // 确保日期格式正确
  const dateParts = selectedDate.value.split('-')
  if (dateParts.length !== 3) {
    const today = new Date()
    const solar = Solar.fromDate(today)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  }
  const [year, month, day] = dateParts.map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    const today = new Date()
    const solar = Solar.fromDate(today)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  }
  const date = new Date(year, month - 1, day)
  // 验证日期是否有效
  if (isNaN(date.getTime())) {
    const today = new Date()
    const solar = Solar.fromDate(today)
    const lunar = solar.getLunar()
    return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  }
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
})

const unreadReminders = computed(() => {
  const now = Date.now()
  return events.value.filter((event: Event) => {
    const eventTime = new Date(`${event.date} ${event.time}`).getTime()
    const remindTime = eventTime - event.remindBefore * 60 * 1000
    const reminded = localStorage.getItem(`reminded_${event.id}`)
    return event.remindBefore > 0 && now >= remindTime && now < eventTime && !reminded
  }).length
})

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return []
  return events.value.filter((e: Event) => e.date === selectedDate.value)
})

// 当前日期对应的代办事项列表
const selectedDateTodos = computed(() => {
  if (!selectedDate.value) {
    return []
  }
  return todos.value
    .filter((t: TodoItem) => t.date === selectedDate.value)
    .sort((a: TodoItem, b: TodoItem) => a.createdAt - b.createdAt)
})

// 移除未使用的 upcomingEvents，保留以备将来使用

// 移除未使用的 getEventsForDate，FullCalendar 会自动处理
// const getEventsForDate = (date: string): Event[] => {
//   return events.value.filter((e: Event) => e.date === date)
// }

// FullCalendar 事件处理
const handleDateClick = (arg: DateClickArg) => {
  // 确保日期格式正确 (YYYY-MM-DD)
  let dateStr = arg.dateStr
  
  // 如果 dateStr 包含时间部分，只取日期部分
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0]
  }
  
  // 如果 dateStr 格式不正确，使用 arg.date 对象格式化
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const date = arg.date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dateStr = `${year}-${month}-${day}`
  }
  
  selectedDate.value = dateStr
  // 如果点击日期，可以打开添加事件对话框
  // showAddEventDialog()
}

const handleEventClick = (arg: EventClickArg) => {
  const eventId = arg.event.id
  const event = events.value.find((e: Event) => e.id === eventId) as Event | undefined
  if (event) {
    // 显示事件操作菜单
    showEventContextMenu(event, arg.jsEvent)
  }
}

// 显示事件上下文菜单
const showEventContextMenu = (event: Event, _mouseEvent: MouseEvent) => {
  ElMessageBox({
    title: event.title,
    message: `选择操作：`,
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: '标记为完成',
    cancelButtonText: '编辑',
    distinguishCancelAndClose: true,
    type: 'info',
    beforeClose: (action: string, _instance: any, done: () => void) => {
      if (action === 'confirm') {
        handleCompleteEvent(event.id)
        done()
      } else if (action === 'cancel') {
        editEvent(event)
        done()
      } else {
        done()
      }
    }
  }).catch(() => {
    // 用户取消
  })
}

// 完成事件
const handleCompleteEvent = async (eventId: string) => {
  try {
    // 显示完成信息输入对话框
    const { value: completionInfo } = await ElMessageBox.prompt(
      '请输入完成信息（可选）',
      '标记为完成',
      {
        confirmButtonText: '完成',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '实际耗时（分钟）、打断次数、备注等，例如：\n实际耗时: 60分钟\n打断次数: 2\n备注: 顺利完成',
        inputValidator: () => true
      }
    )

    // 解析完成信息
    const options: any = {}
    if (completionInfo) {
      const lines = completionInfo.split('\n')
      lines.forEach((line: string) => {
        if (line.includes('实际耗时') || line.includes('耗时')) {
          const match = line.match(/(\d+)/)
          if (match) options.actualMinutes = parseInt(match[1])
        }
        if (line.includes('打断次数') || line.includes('打断')) {
          const match = line.match(/(\d+)/)
          if (match) options.interruptionCount = parseInt(match[1])
        }
        if (line.includes('备注') || line.includes('说明')) {
          const match = line.match(/备注[：:]\s*(.+)/) || line.match(/说明[：:]\s*(.+)/)
          if (match) options.notes = match[1]
        }
      })
    }

    const result = await (window as any).electronAPI.event.complete(eventId, options)
    if (result.success) {
      ElMessage.success('事件已标记为完成，工作日志已自动生成')
      await loadEvents()
      refreshCalendarEvents()
    } else {
      ElMessage.error(result.message || '标记完成失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('完成事件失败:', error)
      ElMessage.error('完成事件失败')
    }
  }
}

const handleDatesSet = (arg: { start: Date; end: Date; view: any }) => {
  // 更新日历标题
  const view = arg.view
  const start = arg.start
  const end = arg.end
  
  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  if (view.type === 'dayGridMonth') {
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    calendarTitle.value = `${year}年${month}月`
    // 月历视图：如果当前选中的日期不在显示的月份内，则更新为今天或月份第一天
    const today = new Date()
    const todayStr = formatDate(today)
    if (start <= today && today <= new Date(start.getFullYear(), start.getMonth() + 1, 0)) {
      // 今天在显示的月份内，更新为今天
      if (!selectedDate.value || !isDateInMonth(selectedDate.value, start)) {
        selectedDate.value = todayStr
      }
    } else {
      // 今天不在显示的月份内，更新为月份第一天
      if (!selectedDate.value || !isDateInMonth(selectedDate.value, start)) {
        selectedDate.value = formatDate(start)
      }
    }
  } else if (view.type === 'timeGridWeek') {
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    const day = start.getDate()
    const endMonth = end.getMonth() + 1
    const endDay = end.getDate()
    if (month === endMonth) {
      calendarTitle.value = `${year}年${month}月${day}日 - ${endDay}日`
    } else {
      calendarTitle.value = `${year}年${month}月${day}日 - ${endMonth}月${endDay}日`
    }
    // 周历视图：更新为周的第一天（确保日期格式正确）
    const formattedDate = formatDate(start)
    if (!selectedDate.value || !isDateInWeek(selectedDate.value, start, end)) {
      selectedDate.value = formattedDate
    }
  } else if (view.type === 'timeGridDay') {
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    const day = start.getDate()
    calendarTitle.value = `${year}年${month}月${day}日`
    // 日历视图：更新为当前显示的日期
    selectedDate.value = formatDate(start)
  } else if (view.type === 'listWeek') {
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    const day = start.getDate()
    const endMonth = end.getMonth() + 1
    const endDay = end.getDate()
    if (month === endMonth) {
      calendarTitle.value = `${year}年${month}月${day}日 - ${endDay}日`
    } else {
      calendarTitle.value = `${year}年${month}月${day}日 - ${endMonth}月${endDay}日`
    }
  }
}

// 辅助函数：检查日期是否在指定月份内
const isDateInMonth = (dateStr: string, monthStart: Date): boolean => {
  const date = new Date(dateStr)
  return date.getFullYear() === monthStart.getFullYear() && 
         date.getMonth() === monthStart.getMonth()
}

// 辅助函数：检查日期是否在指定周内
const isDateInWeek = (dateStr: string, weekStart: Date, weekEnd: Date): boolean => {
  const date = new Date(dateStr)
  return date >= weekStart && date <= weekEnd
}

// 自定义事件内容渲染
const renderEventContent = (arg: EventContentArg) => {
  const event = arg.event
  const ext = event.extendedProps as any

  // 如果是代办事项，在日历上以简洁样式显示
  if (ext && ext.isTodo) {
    const done = !!ext.done
    const title = event.title || ''
    return {
      html: `
        <div class="fc-todo-event ${done ? 'fc-todo-done' : ''}">
          <span class="fc-todo-dot"></span>
          <span class="fc-todo-text">${title}</span>
        </div>
      `,
    }
  }

  const time = ext?.time || ''
  
  return {
    html: `
      <div class="fc-event-main-frame">
        <div class="fc-event-time">${time}</div>
        <div class="fc-event-title-container">
          <div class="fc-event-title">${event.title}</div>
        </div>
      </div>
    `
  }
}

// 自定义日期单元格内容（添加农历显示）
const renderDayCellContent = (arg: DayCellContentArg) => {
  const date = arg.date
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const lunarText = `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
  
  return {
    html: `
      <div class="fc-daygrid-day-number">${date.getDate()}</div>
      <div class="fc-daygrid-lunar">${lunarText}</div>
    `
  }
}

// 自定义周历/日历列头（日期 + 农历）
const renderDayHeaderContent = (arg: DayHeaderContentArg) => {
  const date = arg.date
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]

  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const lunarText = `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`

  return {
    html: `
      <div class="fc-col-header-main">
        <div class="fc-col-header-date">${month}/${day}${weekday}</div>
        <div class="fc-col-header-lunar">${lunarText}</div>
      </div>
    `,
  }
}

// 自定义时间轴标签内容（只显示时间，不显示日期和农历）
const renderSlotLabelContent = (arg: SlotLabelContentArg) => {
  const date = arg.date
  const hour = date.getHours()
  // 只返回时间，格式为 "X时"
  return {
    html: `${hour}时`
  }
}

// 视图切换
const switchView = (view: string) => {
  currentView.value = view
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.changeView(view)
  }
}

// 日历操作
const prevPeriod = () => {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.prev()
  }
}

const nextPeriod = () => {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.next()
  }
}

const today = () => {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.today()
    const today = new Date()
    // 使用 formatDate 函数统一格式化日期
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    selectedDate.value = formatDate(today)
  }
}

// 日程列表相关
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`).getTime()
    const dateB = new Date(`${b.date} ${b.time}`).getTime()
    return dateA - dateB
  })
})

const formatEventDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

// 移除未使用的 selectDate，使用 handleDateClick 代替
// const selectDate = (date: string) => {
//   selectedDate.value = date
//   if (fullCalendarRef.value) {
//     const calendarApi = fullCalendarRef.value.getApi()
//     calendarApi.gotoDate(date)
//   }
// }

// 事件操作
const loadEvents = async () => {
  try {
    const result = await (window as any).electronAPI.event.getAll()
    if (result.success && result.data) {
      // 将数据库中的 Event 转换为组件中的 Event
      events.value = result.data.map((dbEvent: any) => ({
        id: dbEvent.id,
        title: dbEvent.title,
        type: dbEvent.type,
        date: dbEvent.date,
        time: dbEvent.time,
        endTime: dbEvent.endTime || undefined,
        description: dbEvent.description || '', // 数据库中的 description 字段
        remindBefore: dbEvent.reminder || 0, // reminder 转换为 remindBefore
        createdAt: dbEvent.createTime ? new Date(dbEvent.createTime).getTime() : Date.now()
      }))
    } else {
      events.value = []
    }
  } catch (e) {
    console.error('Failed to load events:', e)
    events.value = []
  }
}

const saveEvents = async () => {
  // 保存所有事件到数据库
  try {
    for (const event of events.value) {
      const dbEvent = {
        id: event.id,
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        reminder: event.remindBefore || 0,
        createTime: event.createdAt ? new Date(event.createdAt).toISOString() : undefined
      }
      await (window as any).electronAPI.event.save(dbEvent)
    }
  } catch (e) {
    console.error('Failed to save events:', e)
  }
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
    endTime: undefined,
    description: '',
    remindBefore: 15
  }
  addEventVisible.value = true
}


// 刷新 FullCalendar 事件
const refreshCalendarEvents = () => {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.refetchEvents()
  }
}

const editEvent = (event: Event) => {
  editingEvent.value = event
  formData.value = {
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    endTime: event.endTime,
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
    const result = await (window as any).electronAPI.event.delete(id)
    if (result.success) {
      events.value = events.value.filter((e: Event) => e.id !== id)
      refreshCalendarEvents()
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error('Failed to delete event:', e)
      ElMessage.error('删除失败')
    }
  }
}

const submitEvent = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 构建事件对象
        const eventToSave: any = editingEvent.value
          ? {
              id: editingEvent.value.id,
              title: formData.value.title,
              type: formData.value.type,
              date: formData.value.date,
              time: formData.value.time,
              endTime: formData.value.endTime,
              description: formData.value.description,
              remindBefore: formData.value.remindBefore
            }
          : {
              id: generateId(),
              title: formData.value.title,
              type: formData.value.type,
              date: formData.value.date,
              time: formData.value.time,
              endTime: formData.value.endTime,
              description: formData.value.description,
              remindBefore: formData.value.remindBefore,
              createdAt: Date.now()
            }

        // 检测冲突（排除当前编辑的事件）
        const otherEvents = events.value
          .filter((e: Event) => editingEvent.value ? e.id !== editingEvent.value.id : true)
          .map((e: Event) => ({
            id: e.id,
            title: e.title,
            type: e.type,
            date: e.date,
            time: e.time,
            endTime: e.endTime
          }))

        if (window.electronAPI?.ai) {
          const conflictResult = await window.electronAPI.ai.detectConflicts(eventToSave, otherEvents)
          
          if (conflictResult.success && conflictResult.data?.hasConflict && conflictResult.data.conflicts.length > 0) {
            // 有冲突，显示冲突解决对话框
            pendingEvent.value = eventToSave
            detectedConflicts.value = conflictResult.data.conflicts
            conflictDialogVisible.value = true
            return // 等待用户选择解决方案
          }
        }

        // 没有冲突，直接保存
        await saveEventDirectly(eventToSave, editingEvent.value !== null)
      } catch (e) {
        console.error('Failed to save event:', e)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 直接保存事件（不检测冲突）
const saveEventDirectly = async (eventToSave: any, isEdit: boolean) => {
  try {
    const dbEvent = {
      id: eventToSave.id,
      title: eventToSave.title,
      type: eventToSave.type,
      date: eventToSave.date,
      time: eventToSave.time,
      endTime: eventToSave.endTime,
      description: eventToSave.description,
      reminder: eventToSave.remindBefore || 0,
      createTime: eventToSave.createdAt ? new Date(eventToSave.createdAt).toISOString() : undefined
    }

    const result = await (window as any).electronAPI.event.save(dbEvent)
    if (result.success) {
      if (isEdit) {
        const index = events.value.findIndex((e: Event) => e.id === eventToSave.id)
        if (index !== -1) {
          events.value[index] = eventToSave as Event
        }
        ElMessage.success('更新成功')
      } else {
        events.value.push(eventToSave as Event)
        ElMessage.success('添加成功')
      }
      addEventVisible.value = false
      refreshCalendarEvents()
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (e) {
    console.error('Failed to save event:', e)
    ElMessage.error('保存失败')
  }
}

// 处理冲突解决方案
const handleApplyConflictSolution = async (solution: { type: string; adjustedTime?: string; conflictIds?: string[] }) => {
  if (!pendingEvent.value) return

  try {
    switch (solution.type) {
      case 'adjust-time':
        // 调整新事件时间
        if (solution.adjustedTime) {
          pendingEvent.value.time = solution.adjustedTime
          // 重新检测冲突
          const otherEvents = events.value
            .filter((e: Event) => editingEvent.value ? e.id !== editingEvent.value.id : true)
            .map((e: Event) => ({
              id: e.id,
              title: e.title,
              type: e.type,
              date: e.date,
              time: e.time,
              endTime: e.endTime
            }))
          
          if (window.electronAPI?.ai) {
            const conflictResult = await window.electronAPI.ai.detectConflicts(pendingEvent.value, otherEvents)
            if (conflictResult.success && conflictResult.data?.hasConflict && conflictResult.data.conflicts.length > 0) {
              ElMessage.warning('调整后的时间仍有冲突，请重新选择')
              detectedConflicts.value = conflictResult.data.conflicts
              return
            }
          }
        }
        await saveEventDirectly(pendingEvent.value, editingEvent.value !== null)
        break

      case 'cancel-existing':
        // 取消冲突事件
        if (solution.conflictIds && solution.conflictIds.length > 0) {
          for (const conflictId of solution.conflictIds) {
            await (window as any).electronAPI.event.delete(conflictId)
            events.value = events.value.filter((e: Event) => e.id !== conflictId)
          }
          ElMessage.success(`已取消 ${solution.conflictIds.length} 个冲突事件`)
        }
        await saveEventDirectly(pendingEvent.value, editingEvent.value !== null)
        break

      case 'merge':
        // 合并事件（将新事件合并到第一个冲突事件）
        if (solution.conflictIds && solution.conflictIds.length > 0) {
          const firstConflictId = solution.conflictIds[0]
          const conflictEvent = events.value.find((e: Event) => e.id === firstConflictId)
          
          if (conflictEvent) {
            // 合并标题和描述
            const mergedEvent = {
              ...conflictEvent,
              title: `${conflictEvent.title} / ${pendingEvent.value.title}`,
              description: `${conflictEvent.description || ''}\n${pendingEvent.value.description || ''}`.trim()
            }
            
            const dbEvent = {
              id: mergedEvent.id,
              title: mergedEvent.title,
              type: mergedEvent.type,
              date: mergedEvent.date,
              time: mergedEvent.time,
              endTime: mergedEvent.endTime,
              description: mergedEvent.description,
              reminder: mergedEvent.remindBefore || 0,
              createTime: mergedEvent.createdAt ? new Date(mergedEvent.createdAt).toISOString() : undefined
            }

            await (window as any).electronAPI.event.save(dbEvent)
            const index = events.value.findIndex((e: Event) => e.id === mergedEvent.id)
            if (index !== -1) {
              events.value[index] = mergedEvent
            }
            ElMessage.success('事件已合并')
          }
        }
        addEventVisible.value = false
        refreshCalendarEvents()
        break

      case 'ignore':
        // 忽略冲突，直接保存
        await saveEventDirectly(pendingEvent.value, editingEvent.value !== null)
        break
    }
  } catch (e) {
    console.error('Failed to apply conflict solution:', e)
    ElMessage.error('应用解决方案失败')
  }
}

// 忽略冲突
const handleIgnoreConflict = async () => {
  if (pendingEvent.value) {
    await saveEventDirectly(pendingEvent.value, editingEvent.value !== null)
  }
}

// ==================== 代办事项操作 ====================

const TODO_STORAGE_KEY = 'calendar_todos'

const loadTodos = async () => {
  try {
    const result = await (window as any).electronAPI.todo.getAll()
    if (result.success && result.data) {
      // 将数据库中的 Todo 转换为组件中的 TodoItem
      todos.value = result.data.map((dbTodo: any) => ({
        id: dbTodo.id,
        title: dbTodo.text, // 数据库中是 text，组件中是 title
        date: dbTodo.date,
        done: dbTodo.done,
        createdAt: dbTodo.createTime ? new Date(dbTodo.createTime).getTime() : Date.now()
      }))
    } else {
      todos.value = []
    }
  } catch (e) {
    console.error('Failed to load todos:', e)
    todos.value = []
  }
}

const saveTodos = async () => {
  // 保存所有代办事项到数据库
  try {
    for (const todo of todos.value) {
      const dbTodo = {
        id: todo.id,
        text: todo.title, // 组件中是 title，数据库中是 text
        date: todo.date,
        done: todo.done,
        createTime: todo.createdAt ? new Date(todo.createdAt).toISOString() : undefined
      }
      await (window as any).electronAPI.todo.save(dbTodo)
    }
  } catch (e) {
    console.error('Failed to save todos:', e)
  }
}

const addTodo = async () => {
  const title = newTodoText.value.trim()
  if (!title) return
  // 如果还没有选中日期，默认使用今天
  const dateStr =
    selectedDate.value ||
    new Date().toISOString().split('T')[0]

  const todo: TodoItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    title,
    date: dateStr,
    done: false,
    createdAt: Date.now(),
  }

  try {
    const dbTodo = {
      id: todo.id,
      text: todo.title,
      date: todo.date,
      done: todo.done,
      createTime: new Date(todo.createdAt).toISOString()
    }
    
    const result = await (window as any).electronAPI.todo.save(dbTodo)
    if (result.success) {
      todos.value.push(todo)
      newTodoText.value = ''
      refreshCalendarEvents()
    } else {
      ElMessage.error(result.error || '添加失败')
    }
  } catch (e) {
    console.error('Failed to add todo:', e)
    ElMessage.error('添加失败')
  }
}

const toggleTodo = async (todoId: string, done: boolean) => {
  const idx = todos.value.findIndex((t: TodoItem) => t.id === todoId)
  if (idx !== -1) {
    try {
      const todo = todos.value[idx]
      todos.value[idx] = { ...todo, done }
      
      const dbTodo = {
        id: todo.id,
        text: todo.title,
        date: todo.date,
        done: done,
        createTime: todo.createdAt ? new Date(todo.createdAt).toISOString() : undefined
      }
      
      await (window as any).electronAPI.todo.save(dbTodo)
      refreshCalendarEvents()
    } catch (e) {
      console.error('Failed to toggle todo:', e)
      // 回滚状态
      todos.value[idx] = { ...todos.value[idx], done: !done }
    }
  }
}

const deleteTodo = async (todoId: string) => {
  try {
    const result = await (window as any).electronAPI.todo.delete(todoId)
    if (result.success) {
      todos.value = todos.value.filter((t: TodoItem) => t.id !== todoId)
      refreshCalendarEvents()
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (e) {
    console.error('Failed to delete todo:', e)
    ElMessage.error('删除失败')
  }
}

const isEventPast = (event: Event) => {
  const eventTime = new Date(`${event.date} ${event.time}`).getTime()
  return eventTime < Date.now()
}

// 移除未使用的辅助函数，保留以备将来使用
// const formatUpcomingDate = (event: Event) => { ... }
// const getCountdown = (event: Event) => { ... }

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const getWeekdayText = (dateStr: string) => {
  if (!dateStr) {
    const today = new Date()
    return weekdays[today.getDay() === 0 ? 6 : today.getDay() - 1]
  }
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  return weekdays[dayOfWeek === 0 ? 6 : dayOfWeek - 1]
}

const checkReminders = () => {
  const now = Date.now()
  events.value.forEach((event: Event) => {
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

onMounted(async () => {
  await loadEvents()
  today()
  await loadTodos()
  startReminderCheck()
  refreshCalendarEvents()
})

onUnmounted(() => {
  stopReminderCheck()
})

defineExpose({
  loadEvents
})
</script>

<style lang="scss" scoped>

.event-reminder {
  font-family: 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.event-reminder-content {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: hidden;
  min-height: 0;
}

/* 日程列表视图 */
.list-view {
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

.list-view-header {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.list-header-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.list-header-date {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.list-view-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.list-event-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.list-event-item:hover {
  background: #f8fafc;
  transform: translateX(8px);
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.list-event-item.event-past {
  opacity: 0.7;
  filter: grayscale(30%);
}

.list-event-date {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.list-event-day {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.list-event-time {
  font-size: 18px;
  font-weight: 700;
}

.list-event-content {
  flex: 1;
  min-width: 0;
}

.list-event-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
  line-height: 1.5;
}

.list-event-type {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  color: white;
  margin-bottom: 10px;
  font-weight: 600;
}

.list-event-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.list-event-actions {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.list-event-actions .el-button {
  padding: 4px 6px;
}

.no-events-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.no-events-list .el-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-events-list p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
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
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.date-nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-switcher {
  margin-right: 0;
}

.view-switcher .el-button-group {
  display: flex;
}

.view-switcher .el-button {
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-switcher .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.view-switcher .el-button--default {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.view-switcher .el-button--default:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
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

/* FullCalendar 日历视图 */
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
  padding: 16px;
  min-height: 0;
}

.fullcalendar-container {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* FullCalendar 自定义样式 */
:deep(.fc) {
  font-family: 'Microsoft YaHei', sans-serif;
  height: 100%;
}

/* 确保周历和日历视图可以滚动 */
:deep(.fc-timegrid-body) {
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.fc-scroller) {
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

:deep(.fc-header-toolbar) {
  display: none;
}

/* 隐藏 all-day 文字，保留列布局 */
:deep(.fc-all-day-cell .fc-col-header-cell-cushion) {
  font-size: 0;
  line-height: 0;
  visibility: hidden;
}

:deep(.fc-all-day-cell .fc-col-header-cell-cushion::after) {
  content: '';
  display: none;
}

:deep(.fc-daygrid-day) {
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.fc-daygrid-day:hover) {
  background-color: #f8fafc;
}

:deep(.fc-day-today) {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

:deep(.fc-daygrid-day-number) {
  font-weight: 700;
  font-size: 14px;
  padding: 4px 8px;
}

:deep(.fc-daygrid-lunar) {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

:deep(.fc-event) {
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
}

:deep(.fc-event-main-frame) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.fc-event-time) {
  font-weight: 600;
  font-size: 11px;
}

:deep(.fc-event-title) {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 事件类型颜色 */
:deep(.event-type-工作) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

:deep(.event-type-会议) {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

:deep(.event-type-生日) {
  background-color: #10b981 !important;
  border-color: #10b981 !important;
}

:deep(.event-type-纪念日) {
  background-color: #6b7280 !important;
  border-color: #6b7280 !important;
}

:deep(.event-type-其他) {
  background-color: #ef4444 !important;
  border-color: #ef4444 !important;
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
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* 代办事项区域 */
.todo-section {
  border-top: 1px solid #e5e7eb;
  padding: 12px 20px 16px;
  background: #f9fafb;
}

.todo-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.todo-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.todo-input {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.todo-input .el-input {
  flex: 1;
}

.todo-input :deep(.el-input__wrapper) {
  padding: 6px 10px;
  font-size: 14px;
}

.todo-input :deep(.el-button) {
  padding: 8px 16px;
  font-size: 13px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.todo-text {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.todo-text.todo-done {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-empty {
  font-size: 13px;
  color: #9ca3af;
}

.panel-event-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.panel-event-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.panel-event-item.event-past {
  opacity: 0.7;
  filter: grayscale(30%);
}

.event-time-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
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
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.panel-event-item:hover .event-title {
  color: #667eea;
}

.event-content .event-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: white;
  margin-bottom: 4px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* 日历中代办事项事件样式 */
:deep(.todo-event) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

:deep(.fc-todo-event) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #4b5563;
}

:deep(.fc-todo-dot) {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22c55e;
}

:deep(.fc-todo-event.fc-todo-done .fc-todo-text) {
  text-decoration: line-through;
  color: #9ca3af;
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

/* ==================== FullCalendar「更多」弹出框样式 ==================== */

/* 弹层整体：白色背景、圆角、阴影，与背景区分开 */
:deep(.fc-theme-standard .fc-popover) {
  background: #ffffff !important;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
}

/* 弹层头部 */
:deep(.fc-popover-header) {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

/* 弹层内容区：增加内边距与滚动 */
:deep(.fc-popover-body) {
  padding: 6px 8px;
  max-height: 260px;
  overflow-y: auto;
  background: #ffffff;
}

/* 弹层内容中，隐藏重复的日期与农历，只保留代办和事件列表 */
:deep(.fc-popover-body .fc-daygrid-day-number),
:deep(.fc-popover-body .fc-daygrid-lunar),
:deep(.fc-popover-body .fc-daygrid-day-top) {
  display: none;
}

/* 弹层中的事件卡片更紧凑，增加间距与阴影 */
:deep(.fc-popover .fc-daygrid-event) {
  margin-bottom: 4px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.1);
}

/* 弹层中的代办事项：保持小点 + 文本样式 */
:deep(.fc-popover .todo-event) {
  background: transparent !important;
}

/* 弹层中的普通事件时间与标题字号略微缩小，避免视觉拥挤 */
:deep(.fc-popover .fc-event-time),
:deep(.fc-popover .fc-event-title) {
  font-size: 12px;
}

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