<template>
  <el-dialog
    v-model="visible"
    title="⚠️ 检测到时间冲突"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div class="conflict-dialog-content">
      <!-- 冲突信息 -->
      <div class="conflict-info">
        <div class="new-event-info">
          <div class="info-header">
            <el-icon><InfoFilled /></el-icon>
            <span>新事件</span>
          </div>
          <div class="event-details">
            <div class="event-title">{{ newEvent.title }}</div>
            <div class="event-time">
              {{ formatDateTime(newEvent.date, newEvent.time) }}
              <span v-if="newEvent.endTime"> - {{ formatTime(newEvent.endTime) }}</span>
            </div>
          </div>
        </div>

        <div class="conflicts-list">
          <div class="conflicts-header">
            <el-icon><WarningFilled /></el-icon>
            <span>冲突事件 ({{ conflicts.length }})</span>
          </div>
          <div 
            v-for="(conflict, index) in conflicts" 
            :key="index"
            class="conflict-item"
          >
            <div class="conflict-event">
              <div class="conflict-title">{{ conflict.eventTitle }}</div>
              <div class="conflict-type">
                <el-tag :type="getConflictTypeTag(conflict.conflictType)" size="small">
                  {{ getConflictTypeText(conflict.conflictType) }}
                </el-tag>
              </div>
              <div class="conflict-suggestion" v-if="conflict.suggestion">
                <el-icon><Lightbulb /></el-icon>
                <span>{{ conflict.suggestion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 解决方案选项 -->
      <div class="solutions-section">
        <div class="solutions-header">
          <el-icon><Tools /></el-icon>
          <span>解决方案</span>
        </div>
        <div class="solutions-list">
          <el-radio-group v-model="selectedSolution" class="solutions-radio-group">
            <el-radio 
              v-for="solution in solutions" 
              :key="solution.type"
              :label="solution.type"
              class="solution-radio"
            >
              <div class="solution-content">
                <div class="solution-title">{{ solution.title }}</div>
                <div class="solution-description">{{ solution.description }}</div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 时间调整选项 -->
        <div v-if="selectedSolution === 'adjust-time'" class="time-adjustment">
          <el-form-item label="调整到">
            <el-time-picker
              v-model="adjustedTime"
              format="HH:mm"
              placeholder="选择新时间"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleIgnore">忽略冲突</el-button>
        <el-button type="primary" @click="handleApply" :loading="applying">
          应用解决方案
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, WarningFilled, Lightbulb, Tools } from '@element-plus/icons-vue'

interface Conflict {
  eventId: string
  eventTitle: string
  conflictType: 'time' | 'location' | 'person' | 'resource'
  suggestion?: string
}

interface NewEvent {
  id?: string
  title: string
  date: string
  time: string
  endTime?: string
  type?: string
}

interface Solution {
  type: 'adjust-time' | 'cancel-existing' | 'merge' | 'ignore'
  title: string
  description: string
}

const props = defineProps<{
  modelValue: boolean
  newEvent: NewEvent | null
  conflicts: Conflict[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply-solution': [solution: { type: string; adjustedTime?: string; conflictIds?: string[] }]
  'ignore': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedSolution = ref<string>('adjust-time')
const adjustedTime = ref<Date | null>(null)
const applying = ref(false)

const solutions: Solution[] = [
  {
    type: 'adjust-time',
    title: '调整新事件时间',
    description: '将新事件调整到其他时间，避免冲突'
  },
  {
    type: 'cancel-existing',
    title: '取消冲突事件',
    description: '取消已存在的冲突事件，保留新事件'
  },
  {
    type: 'merge',
    title: '合并事件',
    description: '将新事件与冲突事件合并为一个事件'
  },
  {
    type: 'ignore',
    title: '忽略冲突',
    description: '继续保存，忽略时间冲突'
  }
]

const formatDateTime = (date: string, time: string): string => {
  const d = new Date(`${date}T${time}`)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
}

const formatTime = (time: string): string => {
  return time
}

const getConflictTypeTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    time: 'danger',
    location: 'warning',
    person: 'info',
    resource: 'warning'
  }
  return tagMap[type] || 'info'
}

const getConflictTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    time: '时间冲突',
    location: '地点冲突',
    person: '人员冲突',
    resource: '资源冲突'
  }
  return textMap[type] || '冲突'
}

const handleClose = () => {
  visible.value = false
  selectedSolution.value = 'adjust-time'
  adjustedTime.value = null
}

const handleIgnore = () => {
  emit('ignore')
  handleClose()
}

const handleApply = async () => {
  if (selectedSolution.value === 'adjust-time' && !adjustedTime.value) {
    ElMessage.warning('请选择调整后的时间')
    return
  }

  applying.value = true
  try {
    const solution = {
      type: selectedSolution.value,
      adjustedTime: adjustedTime.value 
        ? `${adjustedTime.value.getHours().toString().padStart(2, '0')}:${adjustedTime.value.getMinutes().toString().padStart(2, '0')}`
        : undefined,
      conflictIds: props.conflicts.map(c => c.eventId)
    }

    emit('apply-solution', solution)
    handleClose()
  } catch (error: any) {
    console.error('应用解决方案失败:', error)
    ElMessage.error('应用解决方案失败')
  } finally {
    applying.value = false
  }
}

// 监听对话框打开，初始化调整时间
watch(visible, (newVal) => {
  if (newVal && props.newEvent) {
    // 默认设置为原时间
    const [hours, minutes] = props.newEvent.time.split(':')
    adjustedTime.value = new Date()
    adjustedTime.value.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  }
})
</script>

<style lang="scss" scoped>
.conflict-dialog-content {
  padding: 10px 0;
}

.conflict-info {
  margin-bottom: 24px;
}

.new-event-info,
.conflicts-list {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.info-header,
.conflicts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #303133;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }
}

.conflicts-header .el-icon {
  color: #e6a23c;
}

.event-details {
  .event-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .event-time {
    font-size: 14px;
    color: #606266;
  }
}

.conflict-item {
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #f56c6c;

  &:last-child {
    margin-bottom: 0;
  }
}

.conflict-event {
  .conflict-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .conflict-type {
    margin-bottom: 8px;
  }

  .conflict-suggestion {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 13px;
    color: #909399;
    margin-top: 8px;

    .el-icon {
      color: #e6a23c;
      margin-top: 2px;
    }
  }
}

.solutions-section {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.solutions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #303133;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }
}

.solutions-radio-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.solution-radio {
  width: 100%;
  margin: 0;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }

  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: #409eff;
  }
}

.solution-content {
  width: 100%;

  .solution-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .solution-description {
    font-size: 13px;
    color: #909399;
  }
}

.time-adjustment {
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

