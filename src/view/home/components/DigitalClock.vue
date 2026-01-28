<template>
  <div class="digital-clock" @click="toggleCalendar">
    <div class="clock-display">
      <div class="time-section">
        <div class="time-value">{{ currentTime }}</div>
      </div>
      <div class="date-section">
        <div class="date-value">{{ currentDate }}</div>
        <div class="date-label">{{ currentWeek }} | {{ currentLunarDate }}</div>
      </div>
      <div class="calendar-indicator">
        <el-icon class="arrow-icon"><ArrowDown /></el-icon>
      </div>
    </div>
    <LunarCalendar v-model:visible="calendarVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Solar } from 'lunar-javascript'
import { ArrowDown } from '@element-plus/icons-vue'
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 20px;
  margin: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.digital-clock:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
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
  color: white;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.time-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-section {
  text-align: center;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.date-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  font-family: 'Microsoft YaHei', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.date-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
  font-weight: 500;
}

.calendar-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.arrow-icon {
  font-size: 16px;
  color: white;
  opacity: 0.8;
  transition: transform 0.3s ease;
  animation: pulse 2s infinite;
}

.digital-clock:hover .arrow-icon {
  transform: translateY(2px);
  opacity: 1;
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}
</style>