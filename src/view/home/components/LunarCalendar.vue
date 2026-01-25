<template>
  <el-dialog 
    v-model="dialogVisible" 
    title=""
    width="900px"
    height="750px"
    :close-on-click-modal="false"
    append-to-body
    class="lunar-calendar-dialog"
  >
    <div class="calendar-container">
      <!-- 顶部控制栏 -->
      <div class="calendar-header">
        <div class="header-controls">
          <div class="date-selector">
            <el-select v-model="currentYear" size="default" @change="onYearChange">
              <el-option v-for="year in yearRange" :key="year" :label="year + '年'" :value="year" />
            </el-select>
            <span class="separator">年</span>
            <el-select v-model="currentMonth" size="default" @change="onMonthChange">
              <el-option v-for="month in 12" :key="month" :label="month + '月'" :value="month - 1" />
            </el-select>
            <span class="separator">月</span>
          </div>
          
          <el-button type="primary" size="default" @click="goToToday" class="today-btn">
            <el-icon><Calendar /></el-icon>
            返回今天
          </el-button>
        </div>
        
        <div class="clock-display">
          <div class="clock-label">北京时间</div>
          <div class="clock-time">{{ currentTime }}</div>
        </div>
      </div>

      <!-- 主日历区域和侧边栏 -->
      <div class="main-content">
        <!-- 左侧：星期标题 + 日期网格 -->
        <div class="calendar-section">
          <!-- 星期标题 -->
          <div class="weekdays">
            <div 
              class="weekday" 
              v-for="(weekday, index) in weekdays" 
              :key="index"
              :class="{ 'weekend-header': index === 5 || index === 6 }"
            >
              {{ weekday }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="calendar-grid">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="day-cell"
              :class="{
                'other-month': day.isOtherMonth,
                'today': day.isToday,
                'selected': day.dateString === selectedDateString,
                'weekend': day.weekday === 5 || day.weekday === 6,
                'has-festival': day.festival,
                'has-lunar-festival': day.lunarFestival,
                'rest-day': day.isRestDay,
                'work-day': day.isWorkday
              }"
              @click="selectDay(day)"
            >
              <div class="solar-day">{{ day.day }}</div>
              <div class="lunar-day">
                <template v-if="day.festival">
                  <span class="festival-text">{{ truncateText(day.festival, 4) }}</span>
                </template>
                <template v-else-if="day.lunarFestival">
                  <span class="lunar-festival-text">{{ truncateText(day.lunarFestival, 4) }}</span>
                </template>
                <template v-else-if="day.solarTerm">
                  <span class="solar-term-text">{{ truncateText(day.solarTerm, 4) }}</span>
                </template>
                <template v-else>
                  {{ day.dayText }}
                </template>
              </div>
              <div v-if="day.isRestDay" class="status-badge rest-badge">休</div>
              <div v-else-if="day.isWorkday" class="status-badge work-badge">班</div>
            </div>
          </div>
        </div>

        <!-- 右侧：侧边栏（日期详情面板） -->
        <div class="sidebar" v-if="selectedDay">
          <div class="sidebar-header">
            <div class="sidebar-full-date">{{ selectedDay.fullDate }}</div>
            <div class="sidebar-weekday">星期{{ selectedDay.weekdayText }}</div>
          </div>
          
          <div class="sidebar-date-large">{{ selectedDay.day }}</div>
          
          <div class="lunar-info">
            <div class="lunar-date">{{ selectedDay.lunarDate }}</div>
            <div class="gan-zhi">{{ selectedDay.ganZhi }}</div>
          </div>
          
          <div class="zodiac-info">
            <div class="zodiac-item">
              <span class="zodiac-label">生肖</span>
              <span class="zodiac-value">{{ selectedDay.zodiac }}年</span>
            </div>
            <div class="zodiac-item">
              <span class="zodiac-label">星座</span>
              <span class="zodiac-value">{{ selectedDay.constellation }}</span>
            </div>
          </div>
          
          <div v-if="selectedDay.festival || selectedDay.lunarFestival || selectedDay.solarTerm" class="festival-highlight">
            <template v-if="selectedDay.festival">
              <div class="highlight-item festival">
                <el-icon><Star /></el-icon>
                <span>{{ selectedDay.festival }}</span>
              </div>
            </template>
            <template v-if="selectedDay.lunarFestival">
              <div class="highlight-item lunar-festival">
                <el-icon><Moon /></el-icon>
                <span>{{ selectedDay.lunarFestival }}</span>
              </div>
            </template>
            <template v-if="selectedDay.solarTerm">
              <div class="highlight-item solar-term">
                <el-icon><Sunny /></el-icon>
                <span>{{ selectedDay.solarTerm }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { Solar } from 'lunar-javascript'
import { Calendar, Star, Moon, Sunny } from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 星期标题
const weekdays = ['一', '二', '三', '四', '五', '六', '日']

// 当前年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// 年份范围
const yearRange = computed(() => {
  const current = new Date().getFullYear()
  const range = []
  for (let i = current - 10; i <= current + 10; i++) {
    range.push(i)
  }
  return range
})

// 选中日期
const selectedDate = ref(new Date())
const selectedDay = ref<any>(null)

// 实时时钟
const currentTime = ref('')
let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

// 启动时钟
const startClock = () => {
  if (timer) return
  updateTime()
  timer = window.setInterval(updateTime, 1000)
}

// 停止时钟
const stopClock = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const selectedDateString = computed(() => {
  const date = selectedDate.value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

// 获取生肖
const getZodiac = (year: number) => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  return zodiacs[(year - 4) % 12]
}


const getSolarTerm = (date: Date) => {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return lunar.getJieQi() || ''
}


// 获取星座
const getConstellation = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const constellations = [
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', start: [2, 19], end: [3, 20] },
    { name: '白羊座', start: [3, 21], end: [4, 19] },
    { name: '金牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', start: [6, 22], end: [7, 22] },
    { name: '狮子座', start: [7, 23], end: [8, 22] },
    { name: '处女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', start: [10, 24], end: [11, 22] },
    { name: '射手座', start: [11, 23], end: [12, 21] },
    { name: '摩羯座', start: [12, 22], end: [1, 19] }
  ]
  
  for (let i = 0; i < constellations.length; i++) {
    const c = constellations[i]
    if (month === c.start[0] && day >= c.start[1]) return c.name
    if (month === c.end[0] && day <= c.end[1]) return c.name
  }
  return ''
}


// 判断是否为休息日（节假日）
const isRestDay = (date: Date) => {
  // 这里可以添加节假日数据
  return false
}


// 判断是否为调休工作日
const isWorkday = (date: Date) => {
  // 这里可以添加调休数据
  return false
}



// 获取农历信息
const getLunarInfo = (date: Date) => {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return {
    // 农历年份（数字）
    year: lunar.getYear(),
    // 农历月份（数字，负数表示闰月）
    month: lunar.getMonth(),
    // 农历日期（数字）
    lunarDay: lunar.getDay(),
    // 是否为闰月
    isLeap: lunar.getMonth() < 0,
    // 干支纪年（如：乙巳年）
    yearText: lunar.getYearInGanZhi() + '年',
    // 农历月份中文（如：冬月）
    monthText: lunar.getMonthInChinese(),
    // 农历日期中文（如：三十）
    dayText: lunar.getDayInChinese(),
    // 生肖（如：蛇）
    zodiac: getZodiac(lunar.getYear()),
    // 公历节日（如：元旦）
    festival: solar.getFestivals().length > 0 ? String(solar.getFestivals()[0]) : '',
    // 农历节日（如：春节）
    lunarFestival: lunar.getFestivals().length > 0 ? String(lunar.getFestivals()[0]) : '',
    // 节气（如：小寒）
    solarTerm: getSolarTerm(date),
    // 完整干支（如：乙巳年己丑月壬辰日）
    ganZhi: lunar.getYearInGanZhi() + '年' + lunar.getMonthInGanZhi() + '月' + lunar.getDayInGanZhi() + '日',
    // 星座（如：摩羯座）
    constellation: getConstellation(date)
  }
}

// 初始化选中日期
const initSelectedDay = () => {
  const today = new Date()
  const lunarInfo = getLunarInfo(today)
  selectedDay.value = {
    day: today.getDate(),
    fullDate: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    lunarDate: `农历${lunarInfo.monthText}${lunarInfo.dayText}`,
    fullLunarDate: `${lunarInfo.yearText}${lunarInfo.monthText}${lunarInfo.dayText}`,
    ganZhi: lunarInfo.ganZhi,
    zodiac: lunarInfo.zodiac,
    constellation: lunarInfo.constellation,
    weekdayText: weekdays[today.getDay() === 0 ? 6 : today.getDay() - 1],
    festival: lunarInfo.festival,
    lunarFestival: lunarInfo.lunarFestival,
    solarTerm: lunarInfo.solarTerm
  }
}

// 立即初始化
initSelectedDay()

// 获取农历日历天数
const calendarDays = computed(() => {
  const days: any[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 调整为周一开头
  const daysInMonth = lastDay.getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 添加上个月的日期（Windows风格：显示上个月的最后几天，直到填满第一行）
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const daysToShowFromPrevMonth = startDayOfWeek
  for (let i = 0; i < daysToShowFromPrevMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - daysToShowFromPrevMonth + 1 + i)
    const lunar = getLunarInfo(date)
    const adjustedWeekday = date.getDay() === 0 ? 6 : date.getDay() - 1 // 调整为0-6表示周一到周日
    days.push({
      day: date.getDate(),
      date: date,
      dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      isOtherMonth: true,
      isToday: false,
      weekday: adjustedWeekday,
      isRestDay: isRestDay(date),
      isWorkday: isWorkday(date),
      ...lunar
    })
  }

  // 添加当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    const lunar = getLunarInfo(date)
    const adjustedWeekday = date.getDay() === 0 ? 6 : date.getDay() - 1 // 调整为0-6表示周一到周日
    days.push({
      day,
      date: date,
      dateString: `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isOtherMonth: false,
      isToday: compareDate.getTime() === today.getTime(),
      weekday: adjustedWeekday,
      isRestDay: isRestDay(date),
      isWorkday: isWorkday(date),
      ...lunar
    })
  }

  // 添加下个月的日期
  const remainingCells = 42 - days.length // 6行 * 7列
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, day)
    const lunar = getLunarInfo(date)
    const adjustedWeekday = date.getDay() === 0 ? 6 : date.getDay() - 1 // 调整为0-6表示周一到周日
    days.push({
      day,
      date: date,
      dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isOtherMonth: true,
      isToday: false,
      weekday: adjustedWeekday,
      isRestDay: isRestDay(date),
      isWorkday: isWorkday(date),
      ...lunar
    })
  }

  return days
})

// 年份月份变更处理
const onYearChange = () => {
  // 年份变更时自动调整到当月
  // 触发 calendarDays 重新计算
}

const onMonthChange = () => {
  // 月份变更时自动调整到当月
  // 触发 calendarDays 重新计算
}

// 返回今天
const goToToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectDay({
    day: today.getDate(),
    date: today,
    weekday: today.getDay() === 0 ? 6 : today.getDay() - 1,
    ...getLunarInfo(today)
  })
}


// 选择日期
const selectDay = (day: any) => {
  selectedDate.value = day.date
  selectedDay.value = {
    day: day.date.getDate(),
    fullDate: `${day.date.getFullYear()}年${day.date.getMonth() + 1}月${day.date.getDate()}日`,
    lunarDate: `农历${day.monthText}${day.dayText}`,
    fullLunarDate: `${day.yearText}${day.monthText}${day.dayText}`,
    ganZhi: day.ganZhi,
    zodiac: day.zodiac,
    constellation: day.constellation,
    weekdayText: weekdays[day.weekday],
    festival: day.festival,
    lunarFestival: day.lunarFestival,
    solarTerm: day.solarTerm
  }
}

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}



// 初始化
onMounted(() => {
  // 启动时钟
  startClock()
  
  const today = new Date()
  selectDay({
    day: today.getDate(),
    date: today,
    weekday: today.getDay() === 0 ? 6 : today.getDay() - 1,
    ...getLunarInfo(today)
  })
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopClock()
})

// 监听对话框显示
watch(() => dialogVisible.value, (visible) => {
  if (visible) {
    const today = new Date()
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth()
    
    // 启动时钟
    startClock()
    
    // 选择今天
    selectDay({
      day: today.getDate(),
      date: today,
      weekday: today.getDay() === 0 ? 6 : today.getDay() - 1,
      ...getLunarInfo(today)
    })
  } else {
    // 对话框关闭时停止时钟
    stopClock()
  }
})
</script>

<style scoped>
.lunar-calendar-dialog :deep(.el-dialog__header) {
  display: none;
}

.lunar-calendar-dialog :deep(.el-dialog .el-dialog__body) {
  padding: 0 !important;
  max-height: none !important;
  overflow: hidden !important;
}

.calendar-container {
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 650px;
  max-height: 700px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-selector .separator {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.today-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 8px 20px;
  font-weight: 600;
}

.today-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.clock-display {
  text-align: right;
}

.clock-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.clock-time {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px 8px 0 0;
  padding: 12px 0;
}

.weekday {
  text-align: center;
  font-weight: 700;
  color: #303133;
  padding: 8px 4px;
  font-size: 14px;
}

.weekday.weekend-header {
  color: #f56c6c;
}

.main-content {
  display: flex;
  gap: 20px;
}

.calendar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  flex: 1;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  padding: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 72px;
  background: #f8f9fa;
}

.day-cell:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.day-cell.today:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
  color: white;
}

.day-cell.selected:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white;
}

.day-cell.selected.weekend:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white;
}

.day-cell.other-month {
  opacity: 0.3;
  background: #f0f0f0;
}

.day-cell.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #667eea;
}

.day-cell.selected {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: white;
  border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.day-cell.weekend {
  background: #fef0f0;
}

.day-cell.selected.weekend {
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
}

.day-cell.rest-day .solar-day {
  color: #f56c6c;
  font-weight: 700;
}

.day-cell.work-day .solar-day {
  color: #e6a23c;
  font-weight: 700;
}

.solar-day {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 2px;
}

.lunar-day {
  font-size: 11px;
  opacity: 0.8;
  line-height: 1.2;
}

.festival-text {
  color: #e6a23c;
  font-weight: 600;
}

.lunar-festival-text {
  color: #f56c6c;
  font-weight: 600;
}

.solar-term-text {
  color: #67c23a;
  font-weight: 600;
}

.status-badge {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 700;
  min-width: 20px;
}

.rest-badge {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fab6b6;
}

.work-badge {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f3d19e;
}

.sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
}

.sidebar-full-date {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.sidebar-weekday {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.sidebar-date-large {
  font-size: 80px;
  font-weight: 800;
  color: #667eea;
  text-align: center;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
  margin: 12px 0;
}

.lunar-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.lunar-date {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.gan-zhi {
  font-size: 12px;
  color: #606266;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.zodiac-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.zodiac-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.zodiac-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.zodiac-label {
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.zodiac-value {
  font-size: 14px;
  color: #303133;
  font-weight: 700;
}

.festival-highlight {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.highlight-item.festival {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.highlight-item.lunar-festival {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #be185d;
}

.highlight-item.solar-term {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
}
</style>