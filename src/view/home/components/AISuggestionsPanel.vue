<template>
  <el-card class="ai-suggestions-panel" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>💡 AI智能建议</span>
        <el-button size="small" @click="refreshSuggestions" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </template>

    <!-- 冲突检测 -->
    <div v-if="conflicts.hasConflict" class="suggestion-section">
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>
          <div class="alert-title">检测到日程冲突</div>
        </template>
        <div class="conflict-list">
          <div
            v-for="conflict in conflicts.conflicts"
            :key="conflict.eventId"
            class="conflict-item"
          >
            <div class="conflict-info">
              <el-icon><Warning /></el-icon>
              <span class="conflict-title">{{ conflict.eventTitle }}</span>
              <el-tag size="small" type="warning">{{ getConflictTypeText(conflict.conflictType) }}</el-tag>
            </div>
            <div v-if="conflict.suggestion" class="conflict-suggestion">
              {{ conflict.suggestion }}
            </div>
            <el-button
              size="small"
              type="primary"
              text
              @click="handleResolveConflict(conflict)"
            >
              解决
            </el-button>
          </div>
        </div>
      </el-alert>
    </div>

    <!-- 日程优化建议 -->
    <div v-if="optimization.suggestions.length > 0" class="suggestion-section">
      <h4 class="section-title">优化建议</h4>
      <div
        v-for="suggestion in optimization.suggestions"
        :key="suggestion.eventId"
        class="suggestion-item"
      >
        <div class="suggestion-content">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ suggestion.reason }}</span>
        </div>
        <el-button
          size="small"
          type="primary"
          text
          @click="handleApplySuggestion(suggestion)"
        >
          应用建议
        </el-button>
      </div>
    </div>

    <!-- 日程洞察 -->
    <div class="suggestion-section">
      <h4 class="section-title">日程洞察</h4>
      <div class="insight-item">
        <span class="insight-label">忙碌程度：</span>
        <el-tag :type="getBusyLevelType(optimization.insights.busyLevel)" size="small">
          {{ getBusyLevelText(optimization.insights.busyLevel) }}
        </el-tag>
      </div>
      <div class="insight-item">
        <span class="insight-label">工作生活平衡：</span>
        <el-progress
          :percentage="Math.round(optimization.insights.workLifeBalance * 100)"
          :color="getBalanceColor(optimization.insights.workLifeBalance)"
        />
      </div>
      <div v-if="optimization.insights.recommendations.length > 0" class="recommendations">
        <h5>建议：</h5>
        <ul class="recommendation-list">
          <li v-for="(rec, index) in optimization.insights.recommendations" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 智能提醒建议 -->
    <div v-if="smartReminders.length > 0" class="suggestion-section">
      <h4 class="section-title">智能提醒</h4>
      <div
        v-for="reminder in smartReminders"
        :key="reminder.id"
        class="reminder-item"
      >
        <div class="reminder-content">
          <el-icon><Bell /></el-icon>
          <span>{{ reminder.message }}</span>
        </div>
        <el-tag :type="getReminderType(reminder.type)" size="small">
          {{ getReminderTypeText(reminder.type) }}
        </el-tag>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!conflicts.hasConflict && optimization.suggestions.length === 0 && smartReminders.length === 0"
      description="暂无建议"
      :image-size="80"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Warning, InfoFilled, Bell } from '@element-plus/icons-vue'

interface Conflict {
  eventId: string
  eventTitle: string
  conflictType: 'time' | 'location' | 'person' | 'resource'
  suggestion?: string
}

interface OptimizationSuggestion {
  type: 'reschedule' | 'merge' | 'cancel' | 'split'
  eventId: string
  reason: string
  newTime?: string
}

interface SmartReminder {
  id: string
  eventId: string
  type: 'preparation' | 'location' | 'dependency' | 'best-time' | 'checklist'
  message: string
  triggerTime: string
  priority: 'high' | 'medium' | 'low'
}

const props = defineProps<{
  events: any[]
  currentEvent?: any
}>()

const emit = defineEmits<{
  (e: 'event-updated', event: any): void
  (e: 'event-deleted', eventId: string): void
  (e: 'refresh-events'): void
}>()

const loading = ref(false)
const conflicts = ref<{ hasConflict: boolean; conflicts: Conflict[] }>({
  hasConflict: false,
  conflicts: []
})
const optimization = ref<{
  suggestions: OptimizationSuggestion[]
  insights: {
    busyLevel: 'low' | 'medium' | 'high' | 'very-high'
    workLifeBalance: number
    recommendations: string[]
  }
}>({
  suggestions: [],
  insights: {
    busyLevel: 'low',
    workLifeBalance: 0.5,
    recommendations: []
  }
})
const smartReminders = ref<SmartReminder[]>([])

// 清理事件对象，只保留可序列化的字段
const sanitizeEvent = (event: any) => {
  if (!event) return null
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    reminder: event.reminder,
    description: event.description,
    createTime: event.createTime,
    updateTime: event.updateTime
  }
}

// 清理事件数组
const sanitizeEvents = (events: any[]) => {
  if (!events || !Array.isArray(events)) return []
  return events.map(sanitizeEvent).filter(e => e !== null)
}

// 刷新建议
const refreshSuggestions = async () => {
  if (!props.events || props.events.length === 0) {
    return
  }

  loading.value = true
  try {
    // 清理事件数据，确保可序列化
    const sanitizedEvents = sanitizeEvents(props.events)
    
    // 1. 检测冲突（如果有当前事件）
    if (props.currentEvent && window.electronAPI?.ai) {
      const sanitizedCurrentEvent = sanitizeEvent(props.currentEvent)
      const otherEvents = sanitizedEvents.filter((e: any) => e && e.id !== sanitizedCurrentEvent?.id)
      
      if (!window.electronAPI?.ai) {
        ElMessage.error('AI服务不可用')
        return
      }
      
      const conflictResult = await window.electronAPI.ai.detectConflicts(
        sanitizedCurrentEvent,
        otherEvents
      )
      if (conflictResult.success) {
        conflicts.value = conflictResult.data
      }
    }

    // 2. 优化日程
    if (window.electronAPI?.ai) {
      const optimizeResult = await window.electronAPI.ai.optimizeSchedule(sanitizedEvents)
      if (optimizeResult.success) {
        optimization.value = optimizeResult.data
      }
    }

    // 3. 生成智能提醒（如果有当前事件）
    if (props.currentEvent && window.electronAPI?.smartReminder) {
      const sanitizedCurrentEvent = sanitizeEvent(props.currentEvent)
      const reminderResult = await window.electronAPI.smartReminder.generateReminders(sanitizedCurrentEvent)
      if (reminderResult.success) {
        smartReminders.value = reminderResult.data || []
      }
    }
  } catch (error: any) {
    console.error('刷新建议失败:', error)
    ElMessage.error('获取AI建议失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 解决冲突
const handleResolveConflict = async (conflict: Conflict) => {
  try {
    // 找到冲突的事件
    const conflictEvent = props.events.find(e => e.id === conflict.eventId)
    if (!conflictEvent) {
      ElMessage.error('未找到冲突的事件')
      return
    }

    // 如果冲突建议中有新时间，使用建议的时间
    if (conflict.suggestion) {
      // 从建议中提取时间（例如："建议将时间调整为 15:00"）
      const timeMatch = conflict.suggestion.match(/(\d{2}):(\d{2})/)
      if (timeMatch) {
        const newTime = timeMatch[0]
        const updatedEvent = {
          ...conflictEvent,
          time: newTime
        }
        
        const result = await window.electronAPI.event.save(updatedEvent)
        if (result.success) {
          ElMessage.success('冲突已解决，事件时间已调整')
          emit('event-updated', updatedEvent)
          emit('refresh-events')
          // 刷新建议
          await refreshSuggestions()
        } else {
          ElMessage.error('更新事件失败: ' + (result.message || '未知错误'))
        }
      } else {
        ElMessage.warning('无法从建议中提取时间，请手动调整')
      }
    } else {
      // 如果没有建议，提示用户手动调整
      ElMessage.info('请手动调整事件时间以解决冲突')
    }
  } catch (error: any) {
    console.error('解决冲突失败:', error)
    ElMessage.error('解决冲突失败: ' + (error.message || '未知错误'))
  }
}

// 应用建议
const handleApplySuggestion = async (suggestion: OptimizationSuggestion) => {
  try {
    const targetEvent = props.events.find(e => e.id === suggestion.eventId)
    if (!targetEvent) {
      ElMessage.error('未找到目标事件')
      return
    }

    switch (suggestion.type) {
      case 'reschedule':
        // 重新安排时间
        if (suggestion.newTime) {
          const updatedEvent = {
            ...targetEvent,
            time: suggestion.newTime
          }
          if (!window.electronAPI?.event) {
            ElMessage.error('事件服务不可用')
            return
          }
          const result = await window.electronAPI.event.save(updatedEvent)
          if (result.success) {
            ElMessage.success('事件时间已调整')
            emit('event-updated', updatedEvent)
            emit('refresh-events')
            await refreshSuggestions()
          } else {
            ElMessage.error('更新事件失败: ' + (result.message || '未知错误'))
          }
        } else {
          ElMessage.warning('建议中没有提供新时间')
        }
        break

      case 'merge':
        // 合并事件
        const { ElMessageBox } = await import('element-plus')
        try {
          // 找到所有相似的事件（同一天、同一类型、标题相似）
          const similarEvents = props.events.filter(e => {
            if (e.id === targetEvent.id) return false
            if (e.date !== targetEvent.date || e.type !== targetEvent.type) return false
            
            // 检查标题相似度
            const title1 = targetEvent.title.toLowerCase()
            const title2 = e.title.toLowerCase()
            return title1 === title2 || 
                   (title1.length > 2 && title2.includes(title1)) ||
                   (title2.length > 2 && title1.includes(title2))
          })
          
          if (similarEvents.length === 0) {
            ElMessage.warning('未找到相似的事件')
            return
          }
          
          // 确认合并
          const similarTitles = similarEvents.map(e => e.title).join('、')
          await ElMessageBox.confirm(
            `确定要合并以下事件吗？\n\n主事件：${targetEvent.title}\n相似事件：${similarTitles}\n\n合并后将保留主事件，删除相似事件。`,
            '确认合并事件',
            {
              confirmButtonText: '确定合并',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          
          if (!window.electronAPI?.event) {
            ElMessage.error('事件服务不可用')
            return
          }
          
          // 删除所有相似事件
          let successCount = 0
          let failCount = 0
          for (const event of similarEvents) {
            const result = await window.electronAPI.event.delete(event.id)
            if (result.success) {
              successCount++
              emit('event-deleted', event.id)
            } else {
              failCount++
            }
          }
          
          if (successCount > 0) {
            ElMessage.success(`成功合并 ${successCount} 个事件`)
            emit('refresh-events')
            await refreshSuggestions()
          }
          if (failCount > 0) {
            ElMessage.warning(`${failCount} 个事件合并失败`)
          }
        } catch {
          // 用户取消
        }
        break

      case 'cancel':
        // 取消事件
        {
          const { ElMessageBox } = await import('element-plus')
          try {
            await ElMessageBox.confirm(
              `确定要取消事件"${targetEvent.title}"吗？`,
              '确认取消',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
            
            if (!window.electronAPI?.event) {
              ElMessage.error('事件服务不可用')
              return
            }
            const result = await window.electronAPI.event.delete(targetEvent.id)
            if (result.success) {
              ElMessage.success('事件已取消')
              emit('event-deleted', targetEvent.id)
              emit('refresh-events')
              await refreshSuggestions()
            } else {
              ElMessage.error('删除事件失败: ' + (result.message || '未知错误'))
            }
          } catch {
            // 用户取消
          }
        }
        break

      case 'split':
        // 拆分事件（根据时间拆分成多个事件）
        {
          const { ElMessageBox } = await import('element-plus')
          try {
          // 解析当前时间
          const [hours, minutes] = targetEvent.time.split(':').map(Number)
          const currentTime = hours * 60 + minutes // 转换为分钟
          
          // 询问用户如何拆分
          const { value: splitCount } = await ElMessageBox.prompt(
            `建议将事件"${targetEvent.title}"拆分成多个事件。\n\n请输入要拆分的数量（2-5个）：`,
            '拆分事件',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPattern: /^[2-5]$/,
              inputErrorMessage: '请输入2-5之间的数字'
            }
          )
          
          const count = parseInt(splitCount)
          if (isNaN(count) || count < 2 || count > 5) {
            ElMessage.warning('拆分数量无效')
            return
          }
          
          if (!window.electronAPI?.event) {
            ElMessage.error('事件服务不可用')
            return
          }
          
          // 计算每个拆分事件的时间间隔（假设每个事件30分钟）
          const interval = 30 // 分钟
          const newEvents: any[] = []
          
          for (let i = 0; i < count; i++) {
            const newTimeMinutes = currentTime + i * interval
            const newHours = Math.floor(newTimeMinutes / 60)
            const newMins = newTimeMinutes % 60
            const newTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
            
            const splitEvent = {
              ...targetEvent,
              id: `${targetEvent.id}_split_${i + 1}_${Date.now()}`,
              title: `${targetEvent.title} (${i + 1}/${count})`,
              time: newTime
            }
            
            newEvents.push(splitEvent)
          }
          
          // 保存所有拆分后的事件
          let successCount = 0
          for (const event of newEvents) {
            const result = await window.electronAPI.event.save(event)
            if (result.success) {
              successCount++
              emit('event-updated', event)
            }
          }
          
          // 删除原始事件
          if (successCount === count) {
            await window.electronAPI.event.delete(targetEvent.id)
            emit('event-deleted', targetEvent.id)
            ElMessage.success(`成功将事件拆分为 ${count} 个事件`)
            emit('refresh-events')
            await refreshSuggestions()
          } else {
            ElMessage.warning(`部分事件拆分失败（成功 ${successCount}/${count}）`)
          }
        } catch (error: any) {
          // 用户取消或输入错误
          if (error !== 'cancel') {
            console.error('拆分事件失败:', error)
              ElMessage.error('拆分事件失败: ' + (error.message || '未知错误'))
            }
          }
        }
        break

      default:
        ElMessage.warning('未知的建议类型')
    }
  } catch (error: any) {
    console.error('应用建议失败:', error)
    ElMessage.error('应用建议失败: ' + (error.message || '未知错误'))
  }
}

// 获取冲突类型文本
const getConflictTypeText = (type: string): string => {
  const map: Record<string, string> = {
    time: '时间冲突',
    location: '地点冲突',
    person: '人员冲突',
    resource: '资源冲突'
  }
  return map[type] || type
}

// 获取忙碌程度类型
const getBusyLevelType = (level: string): 'success' | 'info' | 'warning' | 'danger' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    'very-high': 'danger'
  }
  return map[level] || 'info'
}

// 获取忙碌程度文本
const getBusyLevelText = (level: string): string => {
  const map: Record<string, string> = {
    low: '轻松',
    medium: '适中',
    high: '繁忙',
    'very-high': '非常繁忙'
  }
  return map[level] || level
}

// 获取平衡颜色
const getBalanceColor = (balance: number): string => {
  if (balance >= 0.7) return '#67c23a'
  if (balance >= 0.4) return '#e6a23c'
  return '#f56c6c'
}

// 获取提醒类型
const getReminderType = (type: string): 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'primary'> = {
    preparation: 'warning',
    location: 'info',
    dependency: 'danger',
    'best-time': 'success',
    checklist: 'primary'
  }
  return map[type] || 'info'
}

// 获取提醒类型文本
const getReminderTypeText = (type: string): string => {
  const map: Record<string, string> = {
    preparation: '准备提醒',
    location: '位置提醒',
    dependency: '依赖提醒',
    'best-time': '最佳时间',
    checklist: '清单提醒'
  }
  return map[type] || type
}

// 监听事件变化，自动刷新
watch(() => props.events, () => {
  refreshSuggestions()
}, { deep: true })

onMounted(() => {
  refreshSuggestions()
})
</script>

<style scoped>
.ai-suggestions-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.conflict-list {
  margin-top: 8px;
}

.conflict-item {
  margin-bottom: 12px;
  padding: 8px;
  background: #fef0f0;
  border-radius: 4px;
}

.conflict-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.conflict-title {
  flex: 1;
  font-weight: 500;
}

.conflict-suggestion {
  margin: 4px 0;
  padding-left: 24px;
  font-size: 12px;
  color: #606266;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.insight-item {
  margin-bottom: 12px;
}

.insight-label {
  display: inline-block;
  width: 120px;
  font-size: 13px;
  color: #606266;
}

.recommendations {
  margin-top: 12px;
}

.recommendations h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
}

.recommendation-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #606266;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background: #f0f9ff;
  border-radius: 4px;
}

.reminder-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
</style>

