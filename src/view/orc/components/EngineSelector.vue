<template>
  <div class="engine-selector">
    <div class="selector-header">
      <label class="selector-label">选择 OCR 引擎</label>
      <el-tooltip content="不同引擎有不同的特点和适用场景" placement="top">
        <el-icon class="help-icon"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <div class="engine-grid">
      <div
        v-for="engine in allEngines"
        :key="engine.type"
        class="engine-card"
        :class="{
          'selected': selectedEngine === engine.type,
          'unavailable': !engine.available
        }"
        @click="handleEngineSelect(engine)"
      >
        <div class="engine-header">
          <div class="engine-icon">
            <el-icon><component :is="getEngineIcon(engine.type)" /></el-icon>
          </div>
          <div class="engine-info">
            <h4 class="engine-name">{{ engine.name }}</h4>
            <p class="engine-desc">{{ engine.description }}</p>
          </div>
        </div>

        <div class="engine-features">
          <div class="feature-row">
            <span class="feature-label">模型大小</span>
            <span class="feature-value">{{ formatModelSize(engine.modelSize) }}</span>
          </div>
          <div class="feature-row">
            <span class="feature-label">平均速度</span>
            <span class="feature-value">{{ formatSpeed(engine.avgSpeed) }}</span>
          </div>
          <div class="feature-row">
            <span class="feature-label">准确率</span>
            <span class="feature-value">{{ formatAccuracy(engine.accuracy) }}</span>
          </div>
          <div class="feature-row">
            <span class="feature-label">网络需求</span>
            <el-tag :type="engine.requiresNetwork ? 'warning' : 'success'" size="small">
              {{ engine.requiresNetwork ? '需要网络' : '完全离线' }}
            </el-tag>
          </div>
        </div>

        <div v-if="!engine.available" class="unavailable-badge">
          <el-icon><Clock /></el-icon>
          <span>暂未实现</span>
        </div>

        <div v-else-if="selectedEngine === engine.type" class="selected-indicator">
          <el-icon><Check /></el-icon>
          <span>已选择</span>
        </div>
      </div>
    </div>

    <!-- 语言选择 -->
    <div v-if="selectedEngineConfig" class="language-section">
      <div class="section-header">
        <label class="section-label">识别语言</label>
      </div>
      <el-select v-model="selectedLanguage" size="small" style="width: 100%">
        <el-option
          v-for="lang in getLanguageOptions(selectedEngineConfig.supportedLanguages)"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  OCREngineType,
  OCREngineConfig
} from '../types/ocr'
import { ocrEngineFactory } from '../engine/engine-factory'
import {
  MagicStick,
  Document,
  Cpu,
  Platform,
  QuestionFilled,
  Check,
  Clock
} from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  modelValue: OCREngineType
  language: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: OCREngineType): void
  (e: 'update:language', value: string): void
}>()

// 状态
const selectedEngine = ref<OCREngineType>(props.modelValue)
const selectedLanguage = ref(props.language)
const allEngines = ref<OCREngineConfig[]>([])

// 初始化
const init = () => {
  allEngines.value = ocrEngineFactory.getAllEngines()
}

init()

// 计算属性
const selectedEngineConfig = computed(() => {
  return allEngines.value.find(e => e.type === selectedEngine.value)
})

// 方法
const getEngineIcon = (type: OCREngineType) => {
  switch (type) {
    case OCREngineType.TESSERACT:
      return MagicStick
    case OCREngineType.PADDLE_OCR:
      return Document
    case OCREngineType.DEEPSEEK:
      return Platform
    case OCREngineType.QWEN3_VL:
      return Cpu
    default:
      return MagicStick
  }
}

const formatModelSize = (size?: number): string => {
  if (size === undefined) return '未知'
  if (size < 100) return `${size}MB`
  return `${(size / 1000).toFixed(1)}GB`
}

const formatSpeed = (speed?: number): string => {
  if (speed === undefined) return '未知'
  if (speed < 1000) return `${speed}ms`
  return `${(speed / 1000).toFixed(1)}s`
}

const formatAccuracy = (accuracy?: number): string => {
  if (accuracy === undefined) return '未知'
  return `${(accuracy * 100).toFixed(1)}%`
}

const getLanguageOptions = (languages: string[]) => {
  const langMap: Record<string, string> = {
    'auto': '自动识别',
    'chi_sim': '中文',
    'eng': '英文',
    'jpn': '日文',
    'kor': '韩文',
    'enm': '英文(旧)',
    'latin': '拉丁语系',
    'arabic': '阿拉伯语',
    'cyrillic': '西里尔语',
    'devanagari': '梵文',
    'chi_sim+jpn+kor': '中日韩',
    'chi_sim+eng': '中文+英文'
  }

  return languages.map(lang => ({
    value: lang,
    label: langMap[lang] || lang
  }))
}

const handleEngineSelect = (engine: OCREngineConfig) => {
  if (!engine.available) {
    return
  }

  selectedEngine.value = engine.type
  emit('update:modelValue', engine.type)

  // 如果当前语言不在新引擎支持的列表中，切换到第一个支持的语言
  if (engine.supportedLanguages.length > 0 && 
      !engine.supportedLanguages.includes(selectedLanguage.value)) {
    selectedLanguage.value = engine.supportedLanguages[0]
    emit('update:language', selectedLanguage.value)
  }
}

// 监听语言变化
const handleLanguageChange = (value: string) => {
  selectedLanguage.value = value
  emit('update:language', value)
}
</script>

<style scoped>
.engine-selector {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.selector-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.help-icon {
  margin-left: 8px;
  color: var(--el-color-info);
  cursor: help;
}

.engine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.engine-card {
  padding: 16px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--el-fill-color-lighter);
}

.engine-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.engine-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.engine-card.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.engine-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.engine-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.engine-info {
  flex: 1;
  min-width: 0;
}

.engine-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.engine-desc {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.engine-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.feature-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-label {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.feature-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.unavailable-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--el-color-warning-light-7);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-color-warning);
}

.selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--el-color-success-light-7);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-color-success);
}

.language-section {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
}

.section-header {
  margin-bottom: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

@media (max-width: 768px) {
  .engine-grid {
    grid-template-columns: 1fr;
  }

  .engine-features {
    grid-template-columns: 1fr;
  }
}
</style>