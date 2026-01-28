<template>
  <div class="app-container ocr-app-container">
    <!-- 顶部导航栏 -->
    <header class="ocr-header">
      <div class="header-content">
        <div class="header-back" @click="closeCurrentWindow">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </div>
        <h1 class="header-title">{{ ocrPageTitle }}</h1>
        <div class="header-spacer"></div>
      </div>
    </header>
    
    <!-- OCR内容区域 -->
    <div class="ocr-content">
      <component :is="ocrPageComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { closeCurrentWindow } from '../utils/electronUtils'

// 动态引入组件，实现懒加载
const OCRPage = defineAsyncComponent(() => import('../view/orc/index.vue'))
const TesseractPage = defineAsyncComponent(() => import('../view/orc/tesseract.vue'))
const PaddleOCRPage = defineAsyncComponent(() => import('../view/orc/paddleocr.vue'))
const DeepSeekPage = defineAsyncComponent(() => import('../view/orc/deepseek.vue'))
const Qwen3VLPage = defineAsyncComponent(() => import('../view/orc/qwen3vl.vue'))

const ocrPageComponent = ref<any>(OCRPage)
const ocrPageTitle = ref('智能文字识别')

// 获取OCR引擎的标题
const getOCRTitle = (engine: string): string => {
  const titles: Record<string, string> = {
    tesseract: 'Tesseract OCR',
    paddleocr: 'PaddleOCR',
    deepseek: 'DeepSeek OCR',
    qwen3vl: 'Qwen3VL OCR'
  }
  return titles[engine] || '智能文字识别'
}

// 根据URL参数初始化页面
onMounted(() => {
  const hash = window.location.hash
  const pathname = window.location.pathname
  
  // 从 hash 中解析参数（格式：#ocr?engine=xxx&title=xxx）
  const hashParts = hash.split('?')
  if (hashParts.length > 1) {
    const urlParams = new URLSearchParams(hashParts[1])
    const engine = urlParams.get('engine')
    const title = urlParams.get('title')
    
    if (engine) {
      ocrPageTitle.value = title ? decodeURIComponent(title) : getOCRTitle(engine)
      switch (engine) {
        case 'tesseract':
          ocrPageComponent.value = TesseractPage
          break
        case 'paddleocr':
          ocrPageComponent.value = PaddleOCRPage
          break
        case 'deepseek':
          ocrPageComponent.value = DeepSeekPage
          break
        case 'qwen3vl':
          ocrPageComponent.value = Qwen3VLPage
          break
        default:
          ocrPageComponent.value = OCRPage
      }
    } else {
      ocrPageComponent.value = OCRPage
      ocrPageTitle.value = '智能文字识别'
    }
  } else {
    ocrPageComponent.value = OCRPage
    ocrPageTitle.value = '智能文字识别'
  }
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.ocr-app-container {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ocr-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.header-back:hover {
  background: #f0f9ff;
  color: #409eff;
}

.header-back .el-icon {
  font-size: 16px;
}

.header-back span {
  font-size: 14px;
  font-weight: 500;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-spacer {
  width: 80px; /* 与返回按钮宽度保持一致，使标题居中 */
}

.ocr-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>

