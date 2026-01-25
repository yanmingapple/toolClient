<template>
  <div class="ocr-container" @paste="handlePaste">
    <!-- 顶部标题栏 -->
    <header class="ocr-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon qwen3vl">
              <el-icon><Picture /></el-icon>
            </div>
            <h1 class="ocr-title">Qwen3-VL 视觉语言识别</h1>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">已上传</span>
              <span class="stat-value">{{ selectedFiles.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已识别</span>
              <span class="stat-value">{{ recognizedCount }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="startRecognition" :disabled="!selectedFiles.length || isProcessing" :loading="isProcessing">
            <el-icon><MagicStick /></el-icon>
            {{ isProcessing ? '识别中...' : '开始识别' }}
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="ocr-main">
      <!-- 左侧：文件上传和预览 -->
      <section class="panel upload-section">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><Upload /></el-icon>
          </div>
          <h2 class="panel-title">上传图片</h2>
        </div>

        <!-- 文件上传区域 -->
        <div class="upload-area">
          <div
            class="drop-zone"
            :class="{ 'is-dragover': isDragover }"
            @dragover.prevent="isDragover = true"
            @dragleave="isDragover = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileSelect"
              style="display: none"
            />

            <div class="drop-content">
              <el-icon class="drop-icon"><Upload /></el-icon>
              <p class="drop-text">拖拽文件到此处</p>
              <p class="drop-hint">或点击选择文件（支持 JPG、PNG、BMP 等格式）</p>
              <p class="drop-hint">或直接粘贴图片（Ctrl+V）</p>
              <el-button type="primary" @click="triggerFileSelect">
                选择文件
              </el-button>
            </div>
          </div>

          <!-- 文件列表 -->
          <div v-if="selectedFiles.length > 0" class="file-list">
            <div
              v-for="file in selectedFiles"
              :key="file.id"
              class="file-item"
            >
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <el-button type="danger" size="small" circle @click="removeFile(file.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 图片预览 -->
        <div v-if="selectedFiles.length > 0" class="preview-section">
          <div class="section-header">
            <h3 class="section-subtitle">图片预览</h3>
          </div>
          <div class="preview-container">
            <div
              v-for="file in selectedFiles"
              :key="file.id"
              class="preview-item"
            >
              <img :src="file.preview" :alt="file.name" class="preview-image" />
              <div class="preview-info">{{ file.name }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 中间：处理选项 -->
      <section class="panel options-section">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <h2 class="panel-title">处理选项</h2>
        </div>

        <div class="options-container">
          <!-- 识别语言 -->
          <div class="option-item">
            <label class="option-label">识别语言</label>
            <el-select v-model="selectedLanguage" placeholder="选择语言" size="large">
              <el-option label="自动检测" value="auto" />
              <el-option label="中文" value="chi_sim" />
              <el-option label="英文" value="eng" />
              <el-option label="中英混合" value="chi_sim+eng" />
            </el-select>
          </div>

          <!-- 提示词 -->
          <div class="option-item">
            <label class="option-label">自定义提示词</label>
            <el-input
              v-model="prompt"
              type="textarea"
              :rows="3"
              placeholder="输入额外的识别提示词（可选）"
            />
          </div>

          <!-- 任务类型 -->
          <div class="option-item">
            <label class="option-label">任务类型</label>
            <el-select v-model="taskType" placeholder="选择任务类型" size="large">
              <el-option label="纯文字识别" value="text" />
              <el-option label="图文理解" value="vision" />
              <el-option label="详细描述" value="describe" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- 右侧：识别结果 -->
      <section class="panel result-section">
        <div class="panel-header">
          <div class="panel-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h2 class="panel-title">识别结果</h2>
          <div class="panel-actions">
            <el-button type="primary" size="small" @click="copyResult" :disabled="!recognizedText">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button type="success" size="small" @click="exportResult" :disabled="!recognizedText">
              <el-icon><Download /></el-icon>
              导出TXT
            </el-button>
          </div>
        </div>

        <!-- 结果显示区域 -->
        <div class="result-container">
          <div v-if="isProcessing" class="processing-state">
            <el-icon class="processing-icon"><Loading /></el-icon>
            <p class="processing-text">正在识别中，请稍候...</p>
            <el-progress :percentage="progress" :stroke-width="8" />
            <p class="processing-message">{{ progressMessage }}</p>
          </div>

          <div v-else-if="recognizedText" class="result-content">
            <pre class="result-text">{{ recognizedText }}</pre>

            <!-- 识别统计信息 -->
            <div class="result-stats">
              <div class="stat-item">
                <span class="stat-label">处理时间</span>
                <span class="stat-value">{{ recognitionStats.processTime }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">置信度</span>
                <span class="stat-value">{{ (recognitionStats.confidence * 100).toFixed(2) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">字符数</span>
                <span class="stat-value">{{ recognitionStats.charCount }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-icon class="empty-icon"><Document /></el-icon>
            <p class="empty-text">识别结果将显示在这里</p>
            <p class="empty-hint">请上传图片并点击开始识别</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Upload, Document, Delete, MagicStick, CopyDocument, Download, Loading, Setting, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ocrEngineFactory } from './engine/engine-factory'

// 状态
const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const selectedFiles = ref<any[]>([])
const isProcessing = ref(false)
const progress = ref(0)
const progressMessage = ref('')
const recognizedText = ref('')
const selectedLanguage = ref<string>('auto')
const prompt = ref('')
const taskType = ref<string>('text')

// 识别统计
const recognitionStats = ref({
  processTime: 0,
  confidence: 0,
  charCount: 0
})

// 计算已识别数量
const recognizedCount = computed(() => {
  return selectedFiles.value.filter(f => f.recognized).length
})

// 生成唯一ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      ElMessage.warning('请上传图片文件')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedFiles.value.push({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: e.target?.result as string,
        file: file,
        recognized: false
      })
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (!files) return

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      ElMessage.warning('请上传图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      selectedFiles.value.push({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: e.target?.result as string,
        file: file,
        recognized: false
      })
    }
    reader.readAsDataURL(file)
  })
}

// 处理粘贴上传
const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedFiles.value.push({
            id: generateId(),
            name: 'pasted_image_' + Date.now() + '.png',
            size: file.size,
            type: file.type,
            preview: e.target?.result as string,
            file: file,
            recognized: false
          })
        }
        reader.readAsDataURL(file)
      }
      break
    }
  }
}

// 移除文件
const removeFile = (id: string) => {
  const index = selectedFiles.value.findIndex(f => f.id === id)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  }
}

// 开始识别
const startRecognition = async () => {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }

  isProcessing.value = true
  progress.value = 0
  progressMessage.value = '正在连接 Qwen3-VL 服务...'
  recognizedText.value = ''

  try {
    // 创建Qwen3-VL引擎实例
    const engine = await ocrEngineFactory.createEngine('qwen3vl')

    // 处理每个文件
    let fullText = ''
    let totalConfidence = 0
    let totalTime = 0

    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]

      progressMessage.value = `正在识别图片 ${i + 1}/${selectedFiles.value.length}...`
      progress.value = Math.round(((i + 1) / selectedFiles.value.length) * 80)

      // 识别图片
      const result = await engine.recognize(
        file.preview,
        {
          language: selectedLanguage.value,
          prompt: prompt.value,
          taskType: taskType.value,
          autoRotate: false,
          grayScale: false,
          contrast: 1.0,
          brightness: 0,
          scale: 1.0,
          binarize: false,
          threshold: 128,
          denoise: false,
          denoiseLevel: 1
        },
        (p, msg) => {
          progress.value = 80 + Math.round(p * 0.2)
          progressMessage.value = msg
        }
      )

      fullText += result.text + '\n\n'
      totalConfidence += result.confidence
      totalTime += result.processTime
      file.recognized = true
    }

    progress.value = 100
    progressMessage.value = '识别完成'

    // 更新结果
    recognizedText.value = fullText.trim()
    recognitionStats.value = {
      processTime: totalTime,
      confidence: totalConfidence / selectedFiles.value.length,
      charCount: fullText.length
    }

    ElMessage.success('识别完成！')
  } catch (error) {
    console.error('Qwen3-VL识别失败:', error)
    ElMessage.error('识别失败: ' + (error as Error).message)
  } finally {
    isProcessing.value = false
  }
}

// 复制结果
const copyResult = async () => {
  if (!recognizedText.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(recognizedText.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 导出结果
const exportResult = () => {
  if (!recognizedText.value) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const blob = new Blob([recognizedText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'qwen3vl_result_' + Date.now() + '.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功！')
}

onMounted(() => {
  console.log('Qwen3-VL page mounted')
})

onUnmounted(async () => {
  await ocrEngineFactory.destroyAll()
})
</script>

<style lang="scss" scoped>
.ocr-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.5), 0 0 30px rgba(236, 72, 153, 0.2);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1.2) rotate(10deg) translateY(0);
  }
  50% {
    transform: scale(1.2) rotate(10deg) translateY(-8px);
  }
}

.ocr-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 30px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.logo-icon.qwen3vl {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.ocr-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.header-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  border-radius: 12px;
  color: white;
}

.header-stats .stat-item .stat-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.header-stats .stat-item .stat-value {
  font-size: 24px;
  font-weight: 700;
}

.ocr-main {
  display: grid;
  grid-template-columns: 1fr 320px 1fr;
  gap: 20px;
  min-height: calc(100vh - 120px);
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f472b6 0%, #ec4899 50%, #db2777 100%);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: rgba(236, 72, 153, 0.4);
  }

  &:active {
    transform: translateY(-2px) scale(0.995);
    transition-duration: 0.15s;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.panel-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  background-size: 200% 200%;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pulse-glow 2s ease-in-out infinite;

  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
    background-position: 100% 100%;
  }
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  flex: 1;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.upload-section {
  display: flex;
  flex-direction: column;
}

.upload-area {
  flex: 1;
  min-height: 0;
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 50px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    border-color: #ec4899;
    background: rgba(236, 72, 153, 0.08);
    border-style: solid;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.15);

    &::before {
      left: 100%;
    }

    .drop-icon {
      transform: scale(1.1) rotate(5deg);
      color: #ec4899;
    }
  }

  &.is-dragover {
    border-color: #ec4899;
    background: rgba(236, 72, 153, 0.15);
    transform: scale(1.03);
    border-style: solid;
    box-shadow: 0 12px 32px rgba(236, 72, 153, 0.25);

    .drop-icon {
      transform: scale(1.2) rotate(10deg);
      color: #ec4899;
      animation: bounce 0.6s ease infinite;
    }
  }
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-icon {
  font-size: 48px;
  color: #94a3b8;
}

.drop-text {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.drop-hint {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.file-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 13px;
  color: #64748b;
}

.preview-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.preview-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.preview-info {
  padding: 8px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.options-section {
  display: flex;
  flex-direction: column;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.option-item .el-select {
  width: 100%;
}

.option-item .el-input {
  width: 100%;
}

.result-section {
  display: flex;
  flex-direction: column;
}

.result-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
}

.processing-icon {
  font-size: 48px;
  color: #ec4899;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.processing-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-text {
  flex: 1;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.8;
  color: #1e293b;
  overflow-y: auto;
  min-height: 300px;
  max-height: 500px;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.result-stats .stat-item {
  padding: 16px;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  border-radius: 12px;
  color: white;
  text-align: center;
}

.result-stats .stat-item .stat-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
  display: block;
}

.result-stats .stat-item .stat-value {
  font-size: 24px;
  font-weight: 700;
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

// 响应式设计
@media (max-width: 1200px) {
  .ocr-main {
    grid-template-columns: 1fr;
  }

  .options-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .ocr-container {
    padding: 12px;
  }

  .ocr-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 16px;
  }

  .ocr-title {
    font-size: 22px;
  }

  .panel {
    padding: 16px;
  }

  .panel-title {
    font-size: 18px;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }
}
</style>
