<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="80%"
    :before-close="handleClose"
  >
    <div class="result-container">
      <div class="result-header">
        <div class="command-info">
          <span class="command-label">执行命令:</span>
          <code class="command-text">{{ command }}</code>
          <span class="shell-type">{{ shell.toUpperCase() }}</span>
        </div>
        <div class="execution-info" v-if="executionTime">
          <span>执行时间: {{ executionTime }}ms</span>
          <span class="exit-code" :class="{ success: exitCode === 0, error: exitCode !== 0 }">
            退出码: {{ exitCode }}
          </span>
        </div>
      </div>

      <div class="result-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="标准输出" name="stdout">
            <div class="output-panel">
              <pre class="output-text" v-if="stdout">{{ stdout }}</pre>
              <div class="empty-message" v-else>无标准输出</div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="错误输出" name="stderr">
            <div class="output-panel error">
              <pre class="output-text" v-if="stderr">{{ stderr }}</pre>
              <div class="empty-message" v-else>无错误输出</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="详细信息" name="details">
            <div class="details-panel">
              <div class="detail-row">
                <span class="detail-label">命令:</span>
                <span class="detail-value">{{ command }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Shell:</span>
                <span class="detail-value">{{ shell.toUpperCase() }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">退出码:</span>
                <span class="detail-value" :class="{ success: exitCode === 0, error: exitCode !== 0 }">
                  {{ exitCode }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">执行时间:</span>
                <span class="detail-value">{{ executionTime }}ms</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">时间戳:</span>
                <span class="detail-value">{{ timestamp }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="copyToClipboard" type="primary" plain>
          复制结果
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface CommandResult {
  command: string
  shell: string
  exitCode: number
  stdout: string
  stderr: string
  executionTime: number
  timestamp: Date
}

interface Props {
  modelValue: boolean
  title?: string
  result?: any
}

const props = withDefaults(defineProps<Props>(), {
  title: '命令执行结果'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 响应式状态
const visible = ref(props.modelValue)
const activeTab = ref('stdout')

// 从结果中提取数据
const resultData = computed(() => {
  if (!props.result?.data) return null
  return props.result.data
})

const command = computed(() => resultData.value?.command || '')
const shell = computed(() => resultData.value?.shell || '')
const exitCode = computed(() => resultData.value?.exitCode || 0)
const stdout = computed(() => resultData.value?.stdout || '')
const stderr = computed(() => resultData.value?.stderr || '')
const executionTime = computed(() => resultData.value?.executionTime || 0)
const timestamp = computed(() => {
  const time = resultData.value?.timestamp
  return time ? new Date(time).toLocaleString() : ''
})

// 监听 visible 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 复制到剪贴板
const copyToClipboard = async () => {
  const textToCopy = `命令: ${command.value}
Shell: ${shell.value.toUpperCase()}
退出码: ${exitCode.value}
执行时间: ${executionTime.value}ms

标准输出:
${stdout.value}

错误输出:
${stderr.value}`

  try {
    await navigator.clipboard.writeText(textToCopy)
    ElMessage.success('结果已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.result-container {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.result-header {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #e0e0e0;
}

.command-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.command-label {
  font-weight: 600;
  color: #333;
}

.command-text {
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #1890ff;
  border: 1px solid #d9d9d9;
}

.shell-type {
  background: #1890ff;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.execution-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.exit-code.success {
  color: #52c41a;
  font-weight: 600;
}

.exit-code.error {
  color: #ff4d4f;
  font-weight: 600;
}

.result-content {
  flex: 1;
  padding: 0;
}

.output-panel {
  height: 350px;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 12px;
  overflow: auto;
}

.output-panel.error {
  background: #2d1b1b;
  border: 1px solid #ff4d4f;
}

.output-text {
  margin: 0;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-message {
  color: #999;
  text-align: center;
  margin-top: 150px;
  font-style: italic;
}

.details-panel {
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 120px;
  font-weight: 600;
  color: #333;
}

.detail-value {
  flex: 1;
  color: #666;
}

.detail-value.success {
  color: #52c41a;
  font-weight: 600;
}

.detail-value.error {
  color: #ff4d4f;
  font-weight: 600;
}

.dialog-footer {
  text-align: right;
}
</style>