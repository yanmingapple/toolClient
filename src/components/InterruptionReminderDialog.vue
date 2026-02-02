<template>
  <el-dialog
    v-model="visible"
    title="⏰ 恢复提醒"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div v-if="interruption" class="reminder-content">
      <div class="reminder-header">
        <el-icon class="reminder-icon"><Clock /></el-icon>
        <h3>继续你的工作</h3>
      </div>

      <div class="reminder-body">
        <div class="task-info">
          <div class="task-title">
            <el-icon><Document /></el-icon>
            <span>{{ interruption.taskTitle }}</span>
          </div>
          <div class="last-action" v-if="interruption.lastAction">
            <el-icon><EditPen /></el-icon>
            <span>{{ interruption.lastAction }}</span>
          </div>
          <div class="notes" v-if="interruption.notes">
            <el-icon><Memo /></el-icon>
            <span>{{ interruption.notes }}</span>
          </div>
        </div>

        <div class="time-info">
          <div class="interrupt-time">
            <span class="label">打断时间：</span>
            <span>{{ formatTime(interruption.interruptTime) }}</span>
          </div>
          <div class="reminder-time">
            <span class="label">提醒时间：</span>
            <span>{{ formatTime(interruption.reminderTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleDismiss">稍后提醒</el-button>
        <el-button type="primary" @click="handleMarkHandled">标记已处理</el-button>
        <el-button type="success" @click="handleContinue">继续任务</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Document, EditPen, Memo } from '@element-plus/icons-vue'

interface Interruption {
  id: string
  eventId?: string
  taskTitle: string
  lastAction: string
  notes?: string
  context?: string
  interruptTime: string
  reminderScheduled: boolean
  reminderTime?: string
  createdAt: string
}

const props = defineProps<{
  modelValue: boolean
  interruption: Interruption | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'mark-handled': [interruptionId: string]
  'continue': [interruption: Interruption]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleClose = () => {
  visible.value = false
}

const handleDismiss = () => {
  visible.value = false
  ElMessage.info('稍后会再次提醒')
}

const handleMarkHandled = async () => {
  if (!props.interruption) return

  try {
    const result = await (window as any).electronAPI.interruption.markHandled(props.interruption.id)
    if (result.success) {
      ElMessage.success('已标记为已处理')
      emit('mark-handled', props.interruption.id)
      visible.value = false
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error: any) {
    console.error('标记提醒失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleContinue = () => {
  if (!props.interruption) return
  emit('continue', props.interruption)
  visible.value = false
  ElMessage.success('继续任务')
}
</script>

<style lang="scss" scoped>
.reminder-content {
  padding: 10px 0;
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;

  .reminder-icon {
    font-size: 24px;
    color: #409eff;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.reminder-body {
  .task-info {
    margin-bottom: 20px;

    .task-title,
    .last-action,
    .notes {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 6px;

      .el-icon {
        margin-top: 2px;
        color: #606266;
        font-size: 16px;
      }

      span {
        flex: 1;
        line-height: 1.6;
        color: #606266;
      }
    }

    .task-title {
      background: #ecf5ff;
      border-left: 3px solid #409eff;

      .el-icon {
        color: #409eff;
      }

      span {
        font-weight: 600;
        color: #303133;
        font-size: 15px;
      }
    }
  }

  .time-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    font-size: 13px;

    .interrupt-time,
    .reminder-time {
      display: flex;
      justify-content: space-between;

      .label {
        color: #909399;
      }

      span:last-child {
        color: #606266;
        font-weight: 500;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

