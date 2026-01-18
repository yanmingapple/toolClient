<template>
  <div class="ocr-container" @paste="handlePaste">

    <!-- 主内容区 -->
      <main class="ocr-main">
        <!-- 左侧：文件上传和预览 -->
        <section class="upload-section">
          <div class="section-header">
            <h2 class="section-title">上传图片</h2>
            <el-button type="primary" @click="startRecognition" :disabled="!selectedFiles.length || isProcessing" size="small">
              <el-icon><MagicStick /></el-icon>
              {{ isProcessing ? '识别中...' : '开始识别' }}
            </el-button>
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
              <el-button 
                type="primary"
                @click="triggerFileSelect"
              >
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
              <el-button 
                type="danger"
                size="small"
                circle
                @click="removeFile(file.id)"
              >
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
      <section class="options-section">
        <div class="section-header">
          <h2 class="section-title">处理选项</h2>
        </div>
        
        <div class="options-container">
          <!-- OCR 引擎选择器 -->
          <div class="option-item engine-selector-wrapper">
            <EngineSelector
              v-model="selectedEngine"
              :language="selectedLanguage"
              @update:language="selectedLanguage = $event"
            />
          </div>
          
          <!-- 图像处理选项 -->
          <div class="option-item">
            <label class="option-label">自动旋转校正</label>
            <el-switch v-model="processOptions.autoRotate" />
          </div>
          
          <div class="option-item">
            <label class="option-label">缩放比例</label>
            <el-slider 
              v-model="processOptions.scale" 
              :min="0.5" 
              :max="3.0" 
              :step="0.1"
              :show-tooltip="true"
            />
          </div>
          
          <div class="option-item">
            <label class="option-label">灰度化处理</label>
            <el-switch v-model="processOptions.grayScale" />
          </div>
          
          <div class="option-item">
            <label class="option-label">二值化处理</label>
            <el-switch v-model="processOptions.binarize" />
          </div>
          
          <div class="option-item">
            <label class="option-label">二值化阈值</label>
            <el-slider 
              v-model="processOptions.threshold" 
              :min="0" 
              :max="255" 
              :step="1"
              :show-tooltip="true"
              :disabled="!processOptions.binarize"
            />
          </div>
          
          <div class="option-item">
            <label class="option-label">降噪处理</label>
            <el-switch v-model="processOptions.denoise" />
          </div>
          
          <div class="option-item">
            <label class="option-label">降噪强度</label>
            <el-slider 
              v-model="processOptions.denoiseLevel" 
              :min="1" 
              :max="10" 
              :step="1"
              :show-tooltip="true"
              :disabled="!processOptions.denoise"
            />
          </div>
          
          <div class="option-item">
            <label class="option-label">对比度增强</label>
            <el-slider 
              v-model="processOptions.contrast" 
              :min="0.5" 
              :max="2.0" 
              :step="0.1"
              :show-tooltip="true"
            />
          </div>
          
          <div class="option-item">
            <label class="option-label">亮度调整</label>
            <el-slider 
              v-model="processOptions.brightness" 
              :min="-50" 
              :max="50" 
              :step="1"
              :show-tooltip="true"
            />
          </div>
        </div>
        
        <!-- 进度显示 -->
        <div v-if="isProcessing" class="progress-section">
          <div class="progress-header">
            <span>识别进度：{{ progress }}%</span>
          </div>
          <el-progress :percentage="progress" :status="progress === 100 ? 'success' : undefined" />
          <div class="progress-info">{{ progressMessage }}</div>
        </div>
      </section>

      <!-- 右侧：识别结果 -->
      <section class="result-section">
        <div class="section-header">
          <h2 class="section-title">识别结果</h2>
          <div class="result-actions">
            <el-button size="small" @click="copyToClipboard" :disabled="!recognizedText">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" @click="exportToText" :disabled="!recognizedText">
              <el-icon><Download /></el-icon>
              导出TXT
            </el-button>
          </div>
        </div>
        
        <div class="result-container">
          <div v-if="recognizedText" class="result-text">
            <pre>{{ recognizedText }}</pre>
          </div>
          <div v-else class="result-empty">
            <el-icon class="empty-icon"><Document /></el-icon>
            <p>识别结果将显示在这里</p>
          </div>
        </div>
        
        <!-- 识别统计 -->
        <div v-if="recognitionStats" class="stats-section">
          <div class="stats-grid">
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
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { Upload, Document, Delete, MagicStick, CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 导入引擎相关
import { OCREngineType, IOCREngine, OCRProcessOptions as EngineProcessOptions } from './types/ocr'
import { ocrEngineFactory } from './engine/engine-factory'
import EngineSelector from './components/EngineSelector.vue'

// 声明全局 Tesseract 对象
declare const Tesseract: any

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const selectedFiles = ref<any[]>([])

// 引擎选择
const selectedEngine = ref<OCREngineType>(OCREngineType.TESSERACT)
let currentEngine: IOCREngine | null = null

// 处理选项
const selectedLanguage = ref('auto')
const processOptions = reactive({
  autoRotate: true,
  scale: 1.0,
  grayScale: false,
  binarize: false,
  threshold: 128,
  denoise: false,
  denoiseLevel: 3,
  contrast: 1.0,
  brightness: 0
})

// 识别相关
const isProcessing = ref(false)
const progress = ref(0)
const progressMessage = ref('')
const recognizedText = ref('')
const recognitionStats = ref<any>(null)

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
  if (files) {
    addFiles(Array.from(files))
  }
  target.value = '' // 重置以允许重复选择
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

// 添加文件
const addFiles = (files: File[]) => {
  const validFiles = files
    .filter(file => file.type.startsWith('image/'))
    .map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }))
  
  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  ElMessage.success(`成功添加 ${validFiles.length} 个文件`)
}

// 移除文件
const removeFile = (fileId: string) => {
  const file = selectedFiles.value.find(f => f.id === fileId)
  if (file) {
    URL.revokeObjectURL(file.preview)
  }
  
  selectedFiles.value = selectedFiles.value.filter(f => f.id !== fileId)
  ElMessage.success('文件已移除')
}

// 处理粘贴图片
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], `pasted_image_${Date.now()}.png`, {
          type: 'image/png'
        })
        
        const validFile = {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file)
        }
        
        selectedFiles.value = [...selectedFiles.value, validFile]
        ElMessage.success('图片粘贴成功')
      }
    }
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
  progressMessage.value = '正在初始化OCR引擎...'
  recognizedText.value = ''
  
  try {
    // 创建引擎实例
    const engine = await ocrEngineFactory.createEngine(selectedEngine.value)
    currentEngine = engine
    
    const startTime = Date.now()
    let fullText = ''
    
    // 构建处理选项
    const options: EngineProcessOptions = {
      language: selectedLanguage.value,
      autoRotate: processOptions.autoRotate,
      scale: processOptions.scale,
      grayScale: processOptions.grayScale,
      binarize: processOptions.binarize,
      threshold: processOptions.threshold,
      denoise: processOptions.denoise,
      denoiseLevel: processOptions.denoiseLevel,
      contrast: processOptions.contrast,
      brightness: processOptions.brightness
    }
    
    // 处理所有文件
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      progressMessage.value = `正在处理第 ${i + 1}/${selectedFiles.value.length} 个文件...`
      
      // 预处理图片
      const processedImage = await preprocessImage(file.preview)
      
      // 识别
      const result = await engine.recognize(
        processedImage,
        options,
        (currentProgress, message) => {
          const overallProgress = 30 + ((i / selectedFiles.value.length) * 60) + (currentProgress / selectedFiles.value.length * 10)
          progress.value = Math.min(Math.round(overallProgress), 99)
          progressMessage.value = message
        }
      )
      
      if (i > 0) {
        fullText += '\n\n' + '='.repeat(50) + '\n\n' // 文件分隔符
      }
      fullText += `【${file.name}】\n\n${result.text}`
      
      // 更新统计信息（使用最后一个文件的统计）
      recognitionStats.value = {
        processTime: result.processTime,
        confidence: result.confidence,
        charCount: result.charCount
      }
    }
    
    const endTime = Date.now()
    
    // 更新总处理时间
    if (recognitionStats.value) {
      recognitionStats.value.processTime = endTime - startTime
    }
    
    recognizedText.value = fullText
    progress.value = 100
    progressMessage.value = '识别完成！'
    
    ElMessage.success('识别完成！')
  } catch (error) {
    console.error('OCR识别失败:', error)
    ElMessage.error('识别失败：' + (error as Error).message)
  } finally {
    isProcessing.value = false
  }
}

// 图片预处理
const preprocessImage = async (imageUrl: string): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')!
      
      // 1. 缩放处理
      const scaledWidth = Math.round(img.width * processOptions.scale)
      const scaledHeight = Math.round(img.height * processOptions.scale)
      canvas.width = scaledWidth
      canvas.height = scaledHeight
      
      // 应用亮度和对比度调整
      ctx.filter = `brightness(${1 + processOptions.brightness / 100}) contrast(${processOptions.contrast})`
      
      if (processOptions.grayScale) {
        ctx.filter += ' grayscale(100%)'
      }
      
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
      
      // 2. 降噪处理（使用中值滤波）
      if (processOptions.denoise) {
        canvas = applyMedianFilter(canvas, processOptions.denoiseLevel)
      }
      
      // 3. 二值化处理
      if (processOptions.binarize) {
        canvas = applyBinarization(canvas, processOptions.threshold)
      }
      
      resolve(canvas)
    }
    img.src = imageUrl
  })
}

// 中值滤波降噪
const applyMedianFilter = (canvas: HTMLCanvasElement, level: number): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(new Uint8ClampedArray(data), width, height)
  const outputData = output.data
  
  const kernelSize = Math.min(Math.max(level, 1), 10)
  const halfKernel = Math.floor(kernelSize / 2)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rValues: number[] = []
      const gValues: number[] = []
      const bValues: number[] = []
      
      // 收集邻域像素值
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = Math.min(Math.max(x + kx, 0), width - 1)
          const ny = Math.min(Math.max(y + ky, 0), height - 1)
          const idx = (ny * width + nx) * 4
          rValues.push(data[idx])
          gValues.push(data[idx + 1])
          bValues.push(data[idx + 2])
        }
      }
      
      // 计算中值
      rValues.sort((a, b) => a - b)
      gValues.sort((a, b) => a - b)
      bValues.sort((a, b) => a - b)
      
      const medianIdx = Math.floor(rValues.length / 2)
      const idx = (y * width + x) * 4
      outputData[idx] = rValues[medianIdx]
      outputData[idx + 1] = gValues[medianIdx]
      outputData[idx + 2] = bValues[medianIdx]
      outputData[idx + 3] = data[idx + 3] // Alpha通道不变
    }
  }
  
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  resultCanvas.getContext('2d')!.putImageData(output, 0, 0)
  
  return resultCanvas
}

// 二值化处理
const applyBinarization = (canvas: HTMLCanvasElement, threshold: number): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  for (let i = 0; i < data.length; i += 4) {
    // 计算灰度值
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    
    // 二值化
    const value = gray < threshold ? 0 : 255
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    // Alpha通道不变
  }
  
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  resultCanvas.getContext('2d')!.putImageData(imageData, 0, 0)
  
  return resultCanvas
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(recognizedText.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 导出为TXT文件
const exportToText = () => {
  const blob = new Blob([recognizedText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `ocr_result_${new Date().getTime()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  ElMessage.success('文件已导出')
}

// 清理资源
const cleanup = async () => {
  if (currentEngine) {
    await currentEngine.destroy()
    currentEngine = null
  }
  await ocrEngineFactory.destroyAll()
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.ocr-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.ocr-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px 1fr;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.upload-section,
.options-section,
.result-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 上传区域 */
.upload-area {
  flex: 1;
  overflow-y: auto;
}

.drop-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.drop-zone:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.drop-zone.is-dragover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-icon {
  font-size: 48px;
  color: #909399;
}

.drop-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.drop-hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  transition: all 0.3s;
}

.file-item:hover {
  background-color: #ecf5ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.file-info .el-icon {
  color: #409eff;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #303133;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

/* 预览区域 */
.preview-section {
  margin-top: 20px;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.preview-item {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 选项区域 */
.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-label {
  font-size: 14px;
  color: #606266;
}

/* 进度区域 */
.progress-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.progress-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 结果区域 */
.result-actions {
  display: flex;
  gap: 8px;
}

.result-container {
  flex: 1;
  overflow: hidden;
}

.result-text {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
}

.result-text pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 统计区域 */
.stats-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
/* 响应式设计 */
@media (max-width: 1200px) {
  .ocr-main {
    grid-template-columns: 1fr;
  }

  .upload-section,
  .options-section,
  .result-section {
    max-height: none;
  }
}

/* 引擎选择器包装器 */
.engine-selector-wrapper {
  padding: 0;
}

.engine-selector-wrapper >>> .engine-selector {
  padding: 0;
  background: transparent;
}

.engine-selector-wrapper >>> .engine-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

.engine-selector-wrapper >>> .engine-card {
  padding: 12px;
  cursor: pointer;
}

.engine-selector-wrapper >>> .engine-card:hover {
  border-color: var(--el-color-primary);
}

.engine-selector-wrapper >>> .engine-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.engine-selector-wrapper >>> .engine-header {
  gap: 8px;
}

.engine-selector-wrapper >>> .engine-icon {
  width: 36px;
  height: 36px;
  font-size: 18px;
}

.engine-selector-wrapper >>> .engine-name {
  font-size: 14px;
  margin-bottom: 2px;
}

.engine-selector-wrapper >>> .engine-desc {
  font-size: 11px;
}

.engine-selector-wrapper >>> .engine-features {
  display: none;
}

.engine-selector-wrapper >>> .language-section {
  padding-top: 12px;
  margin-top: 8px;
}
</style>