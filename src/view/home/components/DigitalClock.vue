<template>
  <div class="digital-clock" @click="toggleCalendar">
    <div class="clock-display">
      <div class="time-section">
        <div class="time-value">{{ currentTime }}</div>
        <div class="time-label">当前时间</div>
      </div>
      <div class="date-section">
        <div class="date-value">{{ currentDate }}</div>
        <div class="date-label">{{ currentWeek }} | {{ currentLunarDate }}</div>
      </div>
    </div>
    <LunarCalendar v-model:visible="calendarVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Solar } from 'lunar-javascript'
import LunarCalendar from './LunarCalendar.vue'

const currentTime = ref('')
const currentDate = ref('')
const currentWeek = ref('')
const currentLunarDate = ref('')
const calendarVisible = ref(false)
let timer: number | null = null

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const updateTime = () => {
  const now = new Date()
  
  // 格式化时间
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  // 格式化日期
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  currentDate.value = `${year}年${month}月${day}日`
  
  // 星期
  currentWeek.value = weekDays[now.getDay()]
  
  // 农历
  const solar = Solar.fromDate(now)
  const lunar = solar.getLunar()
  currentLunarDate.value = `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`
}

const toggleCalendar = () => {
  calendarVisible.value = !calendarVisible.value
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.digital-clock {
  position: relative;
  background: transparent;
  border-radius: 8px;
  padding: 8px 16px;
  margin: 0;
  box-shadow: none;
  overflow: visible;
  cursor: pointer;
  transition: all 0.2s;
}

.digital-clock:hover {
  background: rgba(102, 126, 234, 0.1);
}

.clock-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-section {
  text-align: center;
}

.time-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.time-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-section {
  text-align: center;
  padding-left: 12px;
  border-left: 1px solid #e8e8e8;
}

.date-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  font-family: 'Microsoft YaHei', sans-serif;
}

.date-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  font-weight: 500;
}
</style>