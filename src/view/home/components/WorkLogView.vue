<template>
  <div class="work-log-view">
    <el-card shadow="hover" class="work-log-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="loadWorkLog"
            />
            <el-button
              type="primary"
              :icon="DocumentAdd"
              @click="handleCreateNewLog"
              style="margin-left: 12px;"
            >
              新建日志
            </el-button>
          </div>
          <div class="header-right">
            <el-button
              :icon="Refresh"
              @click="loadWorkLog"
              :loading="loading"
            >
              刷新
            </el-button>
            <el-button
              :icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </div>
        </div>
      </template>

      <div class="work-log-content">
        <!-- 编辑器模式 -->
        <div v-if="editMode" class="editor-container">
          <div class="editor-toolbar">
            <el-space>
              <el-button size="small" @click="handlePreview">预览</el-button>
              <el-button size="small" type="primary" @click="handleSave">保存</el-button>
              <el-button size="small" @click="handleCancel">取消</el-button>
            </el-space>
          </div>
          <div class="editor-wrapper">
            <el-input
              v-model="logContent"
              type="textarea"
              :rows="20"
              placeholder="开始记录你的工作日志..."
              class="markdown-editor"
            />
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-else class="preview-container">
          <div class="preview-toolbar">
            <el-space>
              <el-button size="small" @click="handleEdit">编辑</el-button>
              <el-button size="small" @click="handleAutoGenerate">AI生成</el-button>
            </el-space>
          </div>
          <div class="markdown-preview" v-html="renderedContent"></div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!logContent && !editMode"
          description="暂无工作日志"
          :image-size="120"
        >
          <el-button type="primary" @click="handleCreateNewLog">创建今日日志</el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 今日概览卡片 -->
    <el-card shadow="hover" class="overview-card" style="margin-top: 20px;">
      <template #header>
        <span>📊 今日概览</span>
      </template>
      <div class="overview-content">
        <div class="overview-item">
          <span class="label">完成任务：</span>
          <span class="value">{{ todayStats.completedTasks }}/{{ todayStats.totalTasks }}</span>
        </div>
        <div class="overview-item">
          <span class="label">总工作时长：</span>
          <span class="value">{{ todayStats.totalHours }}小时</span>
        </div>
        <div class="overview-item">
          <span class="label">效率评分：</span>
          <el-progress
            :percentage="todayStats.efficiencyScore"
            :color="getEfficiencyColor(todayStats.efficiencyScore)"
          />
        </div>
        <div class="overview-item">
          <span class="label">打断次数：</span>
          <span class="value">{{ todayStats.interruptions }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentAdd, Refresh, Download } from '@element-plus/icons-vue'
import { marked } from 'marked'

const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
const logContent = ref<string>('')
const editMode = ref<boolean>(false)
const loading = ref<boolean>(false)
const todayStats = ref({
  completedTasks: 0,
  totalTasks: 0,
  totalHours: 0,
  efficiencyScore: 0,
  interruptions: 0
})

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!logContent.value) return ''
  try {
    return marked(logContent.value)
  } catch (error) {
    return '<p>渲染失败</p>'
  }
})

// 加载工作日志
const loadWorkLog = async () => {
  if (!selectedDate.value) return

  loading.value = true
  try {
    const result = await (window as any).electronAPI.workLog.getLogByDate(selectedDate.value)
    if (result.success && result.data) {
      logContent.value = result.data
    } else {
      logContent.value = ''
    }

    // 加载今日统计
    await loadTodayStats()
  } catch (error: any) {
    console.error('加载工作日志失败:', error)
    ElMessage.error('加载工作日志失败')
  } finally {
    loading.value = false
  }
}

// 加载今日统计
const loadTodayStats = async () => {
  try {
    const result = await (window as any).electronAPI.workLog.getTodayStats()
    if (result.success && result.data) {
      todayStats.value = result.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 创建新日志
const handleCreateNewLog = () => {
  const today = new Date().toISOString().split('T')[0]
  selectedDate.value = today
  logContent.value = `# ${today} 工作日志\n\n## 📊 今日概览\n\n## ✅ 完成任务\n\n## 🔄 进行中任务\n\n## 📝 明日计划\n\n## 💡 AI洞察\n\n`
  editMode.value = true
}

// 编辑日志
const handleEdit = () => {
  editMode.value = true
}

// 保存日志
const handleSave = async () => {
  if (!selectedDate.value) {
    ElMessage.warning('请选择日期')
    return
  }

  loading.value = true
  try {
    const result = await (window as any).electronAPI.workLog.saveLog(selectedDate.value, logContent.value)
    if (result.success) {
      ElMessage.success('保存成功')
      editMode.value = false
      await loadTodayStats()
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  editMode.value = false
  loadWorkLog()
}

// 预览
const handlePreview = () => {
  editMode.value = false
}

// AI生成日志
const handleAutoGenerate = async () => {
  if (!selectedDate.value) {
    ElMessage.warning('请选择日期')
    return
  }

  loading.value = true
  try {
    const result = await (window as any).electronAPI.workLog.generateLog(selectedDate.value)
    if (result.success && result.data) {
      logContent.value = result.data
      ElMessage.success('AI生成成功')
    } else {
      ElMessage.error(result.message || '生成失败')
    }
  } catch (error: any) {
    console.error('AI生成失败:', error)
    ElMessage.error('AI生成失败')
  } finally {
    loading.value = false
  }
}

// 导出日志
const handleExport = async () => {
  if (!selectedDate.value || !logContent.value) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  try {
    const result = await (window as any).electronAPI.workLog.exportLog(selectedDate.value)
    if (result.success) {
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(result.message || '导出失败')
    }
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 获取效率颜色
const getEfficiencyColor = (score: number): string => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  loadWorkLog()
})
</script>

<style scoped>
.work-log-view {
  padding: 20px;
}

.work-log-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.work-log-content {
  min-height: 500px;
}

.editor-container,
.preview-container {
  height: 100%;
}

.editor-toolbar,
.preview-toolbar {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.editor-wrapper {
  margin-top: 12px;
}

.markdown-editor {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.markdown-preview {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: 500px;
  line-height: 1.6;
}

.markdown-preview :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}

.markdown-preview :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #e4e7ed;
}

.markdown-preview :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 8px 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-preview :deep(li) {
  margin: 4px 0;
}

.markdown-preview :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.markdown-preview :deep(pre) {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 12px;
  margin: 12px 0;
  color: #606266;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-item .label {
  min-width: 100px;
  font-weight: 500;
  color: #606266;
}

.overview-item .value {
  font-weight: 600;
  color: #303133;
}
</style>

