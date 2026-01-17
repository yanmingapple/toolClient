<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="农历日历"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="calendar-container">
      <!-- 顶部控制栏 -->
      <div class="calendar-header">
        <el-select v-model="currentYear" size="small" :style="{ width: '100px' }" @change="onYearChange">
          <el-option v-for="year in yearRange" :key="year" :label="year + '年'" :value="year" />
        </el-select>
        <el-select v-model="currentMonth" size="small" :style="{ width: '80px', marginLeft: '8px' }" @change="onMonthChange">
          <el-option v-for="month in 12" :key="month" :label="month + '月'" :value="month - 1" />
        </el-select>

        <div style="margin-left: 28px">
          <el-button size="small"  @click="goToToday">
            返回今天
          </el-button>
        </div>
        <div class="clock" style="margin-left: auto">
          北京时间：{{ currentTime }}
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
                'weekend': day.weekday === 0 || day.weekday === 6,
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
                  {{ truncateText(day.festival, 4) }}
                </template>
                <template v-else-if="day.lunarFestival">
                  {{ truncateText(day.lunarFestival, 4) }}
                </template>
                <template v-else-if="day.solarTerm">
                  {{ truncateText(day.solarTerm, 4) }}
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
          <div class="sidebar-full-date">{{ selectedDay.fullDate }} 星期{{ selectedDay.weekdayText }}</div>
          <div class="sidebar-date">{{ selectedDay.day }}</div>
          <div class="sidebar-lunar">{{ selectedDay.lunarDate }}</div>
          <div class="sidebar-gangzhi">{{ selectedDay.ganZhi }}</div>
          <div class="sidebar-zodiac">{{ selectedDay.zodiac }}年 {{ selectedDay.constellation }}</div>
        </div>
      </div>


    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { Solar } from 'lunar-javascript'

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
  debugger
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
.calendar-container {
  padding: 8px;
}

.calendar-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.clock {
  font-size: 14px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #606266;
  padding: 8px 4px;
  font-size: 14px;
}

.weekday.weekend-header {
  color: #f56c6c;
}

.main-content {
  display: flex;
  gap: 16px;
}

.calendar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  flex: 1;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
  padding: 4px;
  transition: all 0.2s;
  min-height: 60px;
}

.day-cell:hover {
  background: #f0f9ff !important;
  z-index: 1;
}

.day-cell.other-month {
  opacity: 0.3;
}

.day-cell.today {
  background: #ecf5ff;
  border: 2px solid #409eff;
}

.day-cell.selected {
  background: #409eff;
  color: white;
}

.day-cell.weekend {
  color: #f56c6c;
}

.day-cell.selected.weekend {
  color: #ffe0e0;
}

.day-cell.rest-day .solar-day {
  color: #f56c6c;
}

.day-cell.work-day .solar-day {
  color: #e6a23c;
}

.solar-day {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.lunar-day {
  font-size: 10px;
  opacity: 0.7;
  line-height: 1;
}

.status-badge {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  white-space: nowrap;
  font-weight: 600;
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

.festival-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  font-size: 8px;
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
  padding: 1px 2px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lunar-festival-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  font-size: 8px;
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
  padding: 1px 2px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.solar-term-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  font-size: 8px;
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
  padding: 1px 2px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-cell.has-festival .solar-day {
  color: #e6a23c;
}

.day-cell.has-lunar-festival .solar-day {
  color: #f56c6c;
}

.sidebar {
  width: 180px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-date {
  font-size: 64px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
  line-height: 1;
}

.sidebar-lunar {
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.sidebar-gangzhi {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.sidebar-zodiac {
  font-size: 14px;
  color: #303133;
  text-align: center;
  font-weight: 600;
}
</style>