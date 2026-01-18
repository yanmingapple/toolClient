# PaddleOCR.js 前端集成设计方案

## 一、模型概述

### 1.1 模型简介
- **名称**: PaddleOCR（飞桨OCR）
- **开发者**: 百度飞桨(PaddlePaddle)
- **类型**: 产业级深度学习OCR模型
- **特点**: 高精度、轻量级、多语言、开源免费

### 1.2 核心优势
- ✅ **产业级精度**: 经过大规模数据训练，识别准确率高
- ✅ **轻量级**: 提供多种模型规格（超轻量、通用、高精度）
- ✅ **多语言**: 支持80+语言
- ✅ **端到端**: 检测+识别一体化
- ✅ **开源免费**: Apache 2.0 许可证
- ✅ **跨平台**: 支持服务器、移动端、前端

### 1.3 模型规格

| 模型类型 | 检测模型 | 识别模型 | 总大小 | 适用场景 |
|---------|---------|---------|--------|----------|
| **超轻量版** | ch_ppocr_mobile_v2.0_det | ch_ppocr_mobile_v2.0_rec | ~10MB | 移动端、前端 |
| **通用版** | ch_ppocr_server_v2.0_det | ch_ppocr_server_v2.0_rec | ~140MB | 服务器、桌面端 |
| **高精度版** | ch_ppocr_server_v2.0_det | ch_ppocr_mobile_v2.0_rec | ~140MB | 对精度要求高 |

---

## 二、前端集成方案

### 2.1 架构选择

#### 方案 A: 纯前端 Paddle.js 部署（推荐度: ⭐⭐⭐⭐⭐）

**技术栈**:
- Paddle.js (百度飞桨前端推理引擎)
- WebGL / WebAssembly 后端
- 浏览器端推理

**架构图**:
```
┌─────────────────────────────────────────────────────────┐
│                    浏览器 (Browser)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  Vue 3 应用  │───►│  Paddle.js   │───►│ WebGL/WASM │ │
│  │  + Element   │    │  推理引擎    │    │  计算后端  │ │
│  └──────────────┘    └──────────────┘    └────────────┘ │
│                           │                              │
│                           ▼                              │
│              ┌────────────────────────┐                  │
│              │  PaddleOCR 模型文件    │                  │
│              │  (.nb 格式)            │                  │
│              ├────────────────────────┤                  │
│              │  检测模型 (det)        │                  │
│              │  识别模型 (rec)        │                  │
│              │  角度分类器 (cls)      │                  │
│              └────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

**优势**:
- ✅ **完全离线**: 无需服务器，所有处理在浏览器完成
- ✅ **数据隐私**: 图片不会上传到服务器
- ✅ **无服务器成本**: 降低运维成本
- ✅ **快速响应**: 无需网络传输延迟
- ✅ **轻量级**: 超轻量模型仅 10MB
- ✅ **成熟方案**: 百度官方支持，文档完善

**劣势**:
- ❌ **首次加载慢**: 需要下载模型文件（10-140MB）
- ❌ **依赖浏览器**: 需要现代浏览器支持 WebGL/WebAssembly
- ❌ **性能限制**: 相比服务器端，推理速度较慢
- ❌ **功能有限**: 不支持复杂的版面分析

**适用场景**:
- ✅ 中小规模OCR需求
- ✅ 对数据隐私要求高
- ✅ 移动端/桌面端应用
- ✅ 离线使用场景
- ✅ 低频率使用

---

#### 方案 B: 前后端分离部署（推荐度: ⭐⭐⭐⭐）

**架构设计**:
```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   前端 (Vue 3)  │ ◄─────────────► │  PaddleOCR      │
│   + Paddle.js   │                 │  后端服务       │
└─────────────────┘                 └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ PaddlePaddle    │
                                    │ + PaddleOCR     │
                                    └─────────────────┘
```

**策略**:
- 前端使用轻量级模型进行快速预览
- 后端使用高精度模型进行最终识别
- 根据需求智能切换

**优势**:
- ✅ 兼顾速度和精度
- ✅ 灵活的使用模式

**适用场景**:
- 对精度和速度都有要求
- 混合使用场景

---

### 2.2 推荐方案: 方案 A（纯前端 Paddle.js 部署）

**理由**:

1. **完全离线**: 符合用户对隐私和离线使用的需求
2. **轻量级**: 超轻量模型仅 10MB，适合前端部署
3. **成熟方案**: Paddle.js 是百度官方前端推理引擎，技术成熟
4. **无服务器成本**: 降低运维复杂度和成本
5. **快速集成**: 已有成熟的 npm 包和文档
6. **与现有架构兼容**: 可以直接集成到现有的 Vue 3 + Element Plus 项目中

---

## 三、详细设计

### 3.1 项目结构

```
src/view/orc/
├── index.vue              # OCR 主页面
├── components/            # 组件
│   ├── OCRUploader.vue    # 文件上传组件
│   ├── OCRResult.vue      # 结果展示组件
│   └── OCRSettings.vue    # 设置组件
├── engine/                # OCR 引擎
│   ├── paddle-ocr.ts      # PaddleOCR 引擎封装
│   └── engine-factory.ts  # 引擎工厂（支持多引擎切换）
├── models/                # 模型配置
│   ├── model-config.ts    # 模型路径和配置
│   └── version.ts         # 版本信息
├── types/                 # TypeScript 类型
│   └── ocr.ts            # OCR 类型定义
└── utils/                 # 工具函数
    ├── image-utils.ts    # 图片处理工具
    └── model-loader.ts   # 模型加载器
```

---

### 3.2 核心依赖

```json
// package.json
{
  "dependencies": {
    "@paddlejs-models/ocr": "^1.2.4",
    "vue": "^3.3.0",
    "element-plus": "^2.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

### 3.3 模型配置

```typescript
// src/view/orc/models/model-config.ts

/**
 * PaddleOCR 模型配置
 */
export interface PaddleOCRConfig {
  /** 模型版本 */
  version: string
  
  /** 模型基础路径 */
  basePath: string
  
  /** 检测模型配置 */
  det: {
    modelPath: string
    inputShape: [number, number, number, number]
    mean: number[]
    std: number[]
    scale: number
  }
  
  /** 识别模型配置 */
  rec: {
    modelPath: string
    inputShape: [number, number, number, number]
    mean: number[]
    std: number[]
    scale: number
    charsetPath: string
  }
  
  /** 角度分类器配置（可选） */
  cls?: {
    modelPath: string
    inputShape: [number, number, number, number]
    mean: number[]
    std: number[]
    scale: number
  }
}

/**
 * 超轻量模型配置（推荐用于前端）
 */
export const LIGHTWEIGHT_CONFIG: PaddleOCRConfig = {
  version: '2.0',
  basePath: '/models/paddleocr/lightweight/',
  det: {
    modelPath: 'ch_ppocr_mobile_v2.0_det_infer/model.nb',
    inputShape: [1, 3, 640, 640],
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    scale: 1.0
  },
  rec: {
    modelPath: 'ch_ppocr_mobile_v2.0_rec_infer/model.nb',
    inputShape: [1, 3, 48, 320],
    mean: [0.5, 0.5, 0.5],
    std: [0.5, 0.5, 0.5],
    scale: 1.0,
    charsetPath: 'ppocr_keys_v1.txt'
  },
  cls: {
    modelPath: 'ch_ppocr_mobile_v2.0_cls_infer/model.nb',
    inputShape: [1, 3, 48, 192],
    mean: [0.5, 0.5, 0.5],
    std: [0.5, 0.5, 0.5],
    scale: 1.0
  }
}

/**
 * 通用模型配置（用于更高精度）
 */
export const STANDARD_CONFIG: PaddleOCRConfig = {
  version: '2.0',
  basePath: '/models/paddleocr/standard/',
  det: {
    modelPath: 'ch_ppocr_server_v2.0_det_infer/model.nb',
    inputShape: [1, 3, 960, 960],
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    scale: 1.0
  },
  rec: {
    modelPath: 'ch_ppocr_server_v2.0_rec_infer/model.nb',
    inputShape: [1, 3, 48, 320],
    mean: [0.5, 0.5, 0.5],
    std: [0.5, 0.5, 0.5],
    scale: 1.0,
    charsetPath: 'ppocr_keys_v1.txt'
  },
  cls: {
    modelPath: 'ch_ppocr_mobile_v2.0_cls_infer/model.nb',
    inputShape: [1, 3, 48, 192],
    mean: [0.5, 0.5, 0.5],
    std: [0.5, 0.5, 0.5],
    scale: 1.0
  }
}

/**
 * 多语言模型配置
 */
export const LANGUAGE_CONFIGS: Record<string, PaddleOCRConfig> = {
  en: {
    version: '2.0',
    basePath: '/models/paddleocr/multilingual/en/',
    det: LIGHTWEIGHT_CONFIG.det,
    rec: {
      ...LIGHTWEIGHT_CONFIG.rec,
      modelPath: 'en_ppocr_mobile_v2.0_rec_infer/model.nb',
      charsetPath: 'en_dict.txt'
    },
    cls: LIGHTWEIGHT_CONFIG.cls
  },
  // 其他语言配置...
}
```

---

### 3.4 OCR 引擎封装

```typescript
// src/view/orc/engine/paddleocr-engine.ts

import * as ocr from '@paddlejs-models/ocr'
import type { PaddleOCRConfig } from '../models/model-config'
import type { OCRResult, OCRBox } from '../types/ocr'

/**
 * PaddleOCR 引擎封装
 */
export class PaddleOCREngine {
  private config: PaddleOCRConfig
  private isLoaded: boolean = false

  constructor(config: PaddleOCRConfig) {
    this.config = config
  }

  /**
   * 初始化引擎
   */
  async init(): Promise<void> {
    if (this.isLoaded) return

    // 按照官方文档：使用 ocr.init()
    // 支持离线模式：如果本地模型存在则使用本地模型
    const initOptions = this.buildInitOptions()
    await ocr.init(initOptions)

    this.isLoaded = true

    // 加载检测模型
    await this.paddle.loadModel({
      modelPath: this.config.det.modelPath,
      fileCount: 1
    })

    // 加载识别模型
    await this.paddle.loadModel({
      modelPath: this.config.rec.modelPath,
      fileCount: 1
    })

    // 加载角度分类器（如果有）
    if (this.config.cls) {
      await this.paddle.loadModel({
        modelPath: this.config.cls.modelPath,
        fileCount: 1
      })
    }

    this.isLoaded = true
  }

  /**
   * 识别图片
   */
  async recognize(image: HTMLCanvasElement | HTMLImageElement | string): Promise<OCRResult> {
    if (!this.isLoaded || !this.paddle) {
      throw new Error('OCR engine not initialized')
    }

    // 1. 图片预处理
    const processedImage = await this.preprocessImage(image)

    // 2. 检测文本区域
    const boxes = await this.detectText(processedImage)

    // 3. 识别文本
    const texts = await this.recognizeText(processedImage, boxes)

    // 4. 整理结果
    return {
      text: texts.map(t => t.text).join('\n'),
      boxes: texts.map((t, i) => ({
        ...boxes[i],
        text: t.text,
        confidence: t.confidence
      })),
      confidence: this.calculateAverageConfidence(texts),
      processTime: Date.now() - startTime
    }
  }

  /**
   * 图片预处理
   */
  private async preprocessImage(image: HTMLCanvasElement | HTMLImageElement | string): Promise<HTMLCanvasElement> {
    // 实现图片缩放、归一化等预处理逻辑
    // 转换为模型要求的输入格式
  }

  /**
   * 检测文本区域
   */
  private async detectText(image: HTMLCanvasElement): Promise<OCRBox[]> {
    // 运行检测模型
    const result = await this.paddle!.run({
      input: image,
      inputShape: this.config.det.inputShape
    })

    // 解析检测结果，返回文本边界框
    return this.parseDetectionResult(result)
  }

  /**
   * 识别文本
   */
  private async recognizeText(image: HTMLCanvasElement, boxes: OCRBox[]): Promise<Array<{ text: string; confidence: number }>> {
    const results: Array<{ text: string; confidence: number }> = []

    for (const box of boxes) {
      // 裁剪文本区域
      const croppedImage = this.cropImage(image, box)

      // 可选: 角度分类
      if (this.config.cls) {
        const angle = await this.classifyAngle(croppedImage)
        if (angle !== 0) {
          croppedImage = this.rotateImage(croppedImage, angle)
        }
      }

      // 运行识别模型
      const result = await this.paddle!.run({
        input: croppedImage,
        inputShape: this.config.rec.inputShape
      })

      // 解析识别结果
      const { text, confidence } = this.parseRecognitionResult(result)
      results.push({ text, confidence })
    }

    return results
  }

  /**
   * 角度分类
   */
  private async classifyAngle(image: HTMLCanvasElement): Promise<number> {
    if (!this.config.cls) return 0

    const result = await this.paddle!.run({
      input: image,
      inputShape: this.config.cls.inputShape
    })

    // 返回角度（0, 90, 180, 270）
    return this.parseClassificationResult(result)
  }

  /**
   * 解析检测结果
   */
  private parseDetectionResult(result: any): OCRBox[] {
    // 实现检测结果解析逻辑
    // 转换为边界框格式
  }

  /**
   * 解析识别结果
   */
  private parseRecognitionResult(result: any): { text: string; confidence: number } {
    // 实现识别结果解析逻辑
    // 使用字典将输出转换为文本
  }

  /**
   * 计算平均置信度
   */
  private calculateAverageConfidence(texts: Array<{ confidence: number }>): number {
    if (texts.length === 0) return 0
    const total = texts.reduce((sum, t) => sum + t.confidence, 0)
    return total / texts.length
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.paddle) {
      this.paddle.dispose()
      this.paddle = null
    }
    this.isLoaded = false
  }

  /**
   * 获取加载状态
   */
  getIsLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * 获取加载进度
   */
  getLoadProgress(): number {
    return this.loadProgress
  }
}
```

---

### 3.5 引擎工厂

```typescript
// src/view/orc/engine/engine-factory.ts

import { PaddleOCREngine } from './paddle-ocr'
import { LIGHTWEIGHT_CONFIG, STANDARD_CONFIG, LANGUAGE_CONFIGS } from '../models/model-config'
import type { PaddleOCRConfig } from '../models/model-config'

/**
 * OCR 引擎工厂
 * 支持多引擎切换和缓存
 */
export class OCREngineFactory {
  private static engines: Map<string, PaddleOCREngine> = new Map()

  /**
   * 获取或创建引擎
   */
  static getEngine(config: PaddleOCRConfig): PaddleOCREngine {
    const key = this.generateKey(config)

    if (!this.engines.has(key)) {
      const engine = new PaddleOCREngine(config)
      this.engines.set(key, engine)
    }

    return this.engines.get(key)!
  }

  /**
   * 获取轻量级引擎（推荐）
   */
  static getLightweightEngine(): PaddleOCREngine {
    return this.getEngine(LIGHTWEIGHT_CONFIG)
  }

  /**
   * 获取标准引擎
   */
  static getStandardEngine(): PaddleOCREngine {
    return this.getEngine(STANDARD_CONFIG)
  }

  /**
   * 获取多语言引擎
   */
  static getLanguageEngine(language: string): PaddleOCREngine | null {
    const config = LANGUAGE_CONFIGS[language]
    if (!config) return null
    return this.getEngine(config)
  }

  /**
   * 生成引擎唯一标识
   */
  private static generateKey(config: PaddleOCRConfig): string {
    return `${config.version}-${config.basePath}`
  }

  /**
   * 销毁所有引擎
   */
  static destroyAll(): void {
    this.engines.forEach(engine => engine.destroy())
    this.engines.clear()
  }

  /**
   * 销毁指定引擎
   */
  static destroyEngine(config: PaddleOCRConfig): void {
    const key = this.generateKey(config)
    const engine = this.engines.get(key)
    if (engine) {
      engine.destroy()
      this.engines.delete(key)
    }
  }
}
```

---

### 3.6 主页面集成

```vue
<!-- src/view/orc/index.vue -->

<template>
  <div class="ocr-container" @paste="handlePaste">
    <!-- 模型加载进度 -->
    <div v-if="!isEngineLoaded" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载 OCR 模型... {{ loadProgress }}%</p>
        <el-progress :percentage="loadProgress" :stroke-width="8" />
      </div>
    </div>

    <!-- 主内容区 -->
    <main v-else class="ocr-main">
      <!-- 左侧：文件上传和预览 -->
      <section class="upload-section">
        <div class="section-header">
          <h2 class="section-title">上传图片</h2>
          <el-button 
            type="primary" 
            @click="startRecognition" 
            :disabled="!selectedFiles.length || isProcessing"
            size="small"
          >
            <el-icon><MagicStick /></el-icon>
            {{ isProcessing ? '识别中...' : '开始识别' }}
          </el-button>
        </div>

        <!-- 文件上传区域 -->
        <div class="upload-area">
          <!-- 拖拽上传 -->
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
          <!-- 引擎选择 -->
          <div class="option-item">
            <label class="option-label">OCR 引擎</label>
            <el-select v-model="selectedEngine" size="small" style="width: 100%">
              <el-option label="轻量引擎（推荐）" value="lightweight" />
              <el-option label="标准引擎（高精度）" value="standard" />
            </el-select>
          </div>

          <!-- 语言选择 -->
          <div class="option-item">
            <label class="option-label">识别语言</label>
            <el-select v-model="selectedLanguage" size="small" style="width: 100%">
              <el-option label="中文" value="zh" />
              <el-option label="英文" value="en" />
              <el-option label="中日韩" value="zh+ja+ko" />
              <el-option label="中文+英文" value="zh+en" />
            </el-select>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Upload, Document, Delete, MagicStick, CopyDocument, Download, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { OCREngineFactory } from './engine/engine-factory'
import type { PaddleOCREngine } from './engine/paddle-ocr'
import type { OCRResult } from './types/ocr'

// OCR 引擎
let ocrEngine: PaddleOCREngine | null = null
const isEngineLoaded = ref(false)
const loadProgress = ref(0)

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const selectedFiles = ref<any[]>([])

// 处理选项
const selectedEngine = ref<'lightweight' | 'standard'>('lightweight')
const selectedLanguage = ref<'zh' | 'en' | 'zh+ja+ko' | 'zh+en'>('zh')
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

// 初始化引擎
const initEngine = async () => {
  try {
    // 获取引擎实例
    ocrEngine = selectedEngine.value === 'lightweight'
      ? OCREngineFactory.getLightweightEngine()
      : OCREngineFactory.getStandardEngine()

    // 设置进度回调
    ocrEngine.setProgressCallback((progress: number) => {
      loadProgress.value = Math.round(progress * 100)
    })

    // 初始化引擎
    await ocrEngine.init()
    isEngineLoaded.value = true
    ElMessage.success('OCR 引擎加载成功！')
  } catch (error) {
    console.error('OCR 引擎初始化失败:', error)
    ElMessage.error('OCR 引擎加载失败：' + (error as Error).message)
  }
}

// 开始识别
const startRecognition = async () => {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (!ocrEngine || !ocrEngine.getIsLoaded()) {
    ElMessage.warning('OCR 引擎未加载完成')
    return
  }

  isProcessing.value = true
  progress.value = 0
  progressMessage.value = '正在进行 OCR 识别...'
  recognizedText.value = ''

  try {
    const startTime = Date.now()
    let fullText = ''

    // 处理所有文件
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      progress.value = Math.round((i / selectedFiles.value.length) * 50)
      progressMessage.value = `正在处理第 ${i + 1}/${selectedFiles.value.length} 个文件...`

      // 预处理图片
      const processedImage = await preprocessImage(file.preview)

      // OCR 识别
      const result: OCRResult = await ocrEngine.recognize(processedImage)

      if (i > 0) {
        fullText += '\n\n' + '='.repeat(50) + '\n\n' // 文件分隔符
      }
      fullText += `【${file.name}】\n\n${result.text}`
    }

    const endTime = Date.now()

    // 计算统计信息
    recognitionStats.value = {
      processTime: endTime - startTime,
      confidence: 0.85, // 从 OCR 结果中获取
      charCount: fullText.length
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
  // 实现图片预处理逻辑
  // 包括缩放、灰度化、二值化、降噪等
}

// 其他处理函数（文件选择、拖拽、粘贴等）
// ...

// 生命周期
onMounted(() => {
  initEngine()
})

onUnmounted(() => {
  if (ocrEngine) {
    ocrEngine.destroy()
  }
})
</script>

<style scoped>
/* 样式定义 */
/* 参考现有的样式实现 */
</style>
```

---

## 四、模型下载和部署

### 4.1 模型下载

#### 方法 1: 官方下载

```bash
# 创建模型目录
mkdir -p public/models/paddleocr/lightweight
cd public/models/paddleocr/lightweight

# 下载检测模型
wget https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_det_infer.tar

# 下载识别模型
wget https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_rec_infer.tar

# 下载角度分类器
wget https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_cls_infer.tar

# 解压
for file in *.tar; do tar -xf $file; done

# 清理压缩包
rm -f *.tar
```

#### 方法 2: 使用 Python 脚本下载

```python
# download_models.py
import os
import urllib.request
import tarfile

MODEL_URLS = {
    'det': 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_det_infer.tar',
    'rec': 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_rec_infer.tar',
    'cls': 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_cls_infer.tar'
}

MODEL_DIR = 'public/models/paddleocr/lightweight'

os.makedirs(MODEL_DIR, exist_ok=True)

for name, url in MODEL_URLS.items():
    print(f'Downloading {name} model...')
    filename = os.path.join(MODEL_DIR, os.path.basename(url))
    urllib.request.urlretrieve(url, filename)
    
    print(f'Extracting {name} model...')
    with tarfile.open(filename, 'r') as tar:
        tar.extractall(MODEL_DIR)
    
    os.remove(filename)
    print(f'{name} model downloaded successfully!')

print('All models downloaded successfully!')
```

```bash
# 运行下载脚本
python download_models.py
```

---

### 4.2 模型转换（可选）

如果需要将 PaddlePaddle 模型转换为适合 Web 的格式，可以使用 Paddle.js 提供的转换工具：

```bash
# 安装依赖
npm install @paddlejs/paddlejs-converter -g

# 转换检测模型
paddlejs-converter --modelPath=ch_ppocr_mobile_v2.0_det_infer/model --outputNodeName=save_infer_model/scale_0.tmp_1

# 转换识别模型
paddlejs-converter --modelPath=ch_ppocr_mobile_v2.0_rec_infer/model --outputNodeName=softmax_0.tmp_0

# 转换角度分类器
paddlejs-converter --modelPath=ch_ppocr_mobile_v2.0_cls_infer/model --outputNodeName=save_infer_model/scale_0.tmp_1
```

---

## 五、性能优化

### 5.1 前端优化

1. **模型选择**:
   - 使用超轻量模型（10MB）替代标准模型（140MB）
   - 减少首次加载时间

2. **懒加载**:
   - 按需加载模型
   - 支持动态切换模型

3. **缓存策略**:
   - 使用 IndexedDB 缓存模型文件
   - 避免重复下载

4. **图片预处理**:
   - 上传前压缩图片
   - 减少计算量

5. **Web Worker**:
   - 在 Web Worker 中运行推理
   - 避免阻塞主线程

### 5.2 浏览器兼容性

| 浏览器 | 最低版本 | WebGL | WebAssembly |
|--------|---------|-------|-------------|
| Chrome | 60+ | ✅ | ✅ |
| Firefox | 55+ | ✅ | ✅ |
| Safari | 11+ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ |

---

## 六、扩展功能

### 6.1 多语言支持

PaddleOCR 支持 80+ 语言，可以通过下载对应语言的模型来扩展：

```typescript
// 多语言模型配置
export const LANGUAGE_MODELS: Record<string, string> = {
  en: 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/multilingual/en/en_ppocr_mobile_v2.0_rec_infer.tar',
  ja: 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/multilingual/japan/japan_ppocr_mobile_v2.0_rec_infer.tar',
  ko: 'https://paddleocr.bj.bcebos.com/dygraph_v2.0/multilingual/korean/korean_ppocr_mobile_v2.0_rec_infer.tar',
  // 更多语言...
}
```

### 6.2 表格识别

可以集成 PaddleOCR 的表格识别功能：

```typescript
// 表格识别配置
export const TABLE_CONFIG: PaddleOCRConfig = {
  version: '2.0',
  basePath: '/models/paddleocr/table/',
  det: {
    modelPath: 'ch_ppocr_mobile_v2.0_det_infer/model.nb',
    // ...
  },
  rec: {
    modelPath: 'ch_ppocr_mobile_v2.0_rec_infer/model.nb',
    // ...
  },
  table: {
    modelPath: 'ch_ppocr_mobile_v2.0_table_infer/model.nb',
    // ...
  }
}
```

---

## 七、常见问题

### Q1: 模型下载慢怎么办？

**A**: 使用国内镜像或代理，或直接下载预训练模型文件。

### Q2: 浏览器不支持 WebGL 怎么办？

**A**: 
- 使用 WebAssembly 后端
- 降级到 CPU 推理（速度较慢）

### Q3: 识别准确率不高怎么办？

**A**: 
- 使用标准模型（140MB）替代轻量模型
- 调整图片预处理参数
- 尝试不同的语言设置

### Q4: 如何支持更多语言？

**A**: 
- 下载对应语言的模型
- 配置语言参数
- 支持自动语言检测

---

## 八、总结

### 8.1 方案优势

1. **完全离线**: 所有处理在浏览器完成，无需服务器
2. **轻量级**: 超轻量模型仅 10MB，适合前端部署
3. **成熟方案**: Paddle.js 是百度官方前端推理引擎
4. **无服务器成本**: 降低运维复杂度和成本
5. **快速集成**: 可以直接集成到现有项目

### 8.2 实施步骤

1. **第一阶段**: 下载 PaddleOCR 模型文件
2. **第二阶段**: 集成 Paddle.js 到前端项目
3. **第三阶段**: 实现 OCR 引擎封装
4. **第四阶段**: 集成到 OCR 主页面
5. **第五阶段**: 测试和优化

### 8.3 后续扩展

1. 支持多语言识别
2. 集成表格识别功能
3. 优化性能和用户体验
4. 添加更多图像处理选项

---

## 附录

### A. 参考资料

- PaddleOCR 官方文档: https://github.com/PaddlePaddle/PaddleOCR
- Paddle.js 官方文档: https://github.com/PaddlePaddle/Paddle.js
- Paddle.js 模型转换工具: https://github.com/PaddlePaddle/Paddle.js/tree/develop/packages/paddlejs-converter

### B. 许可证

- PaddleOCR: Apache License 2.0
- Paddle.js: Apache License 2.0
- 本设计文档: MIT License

---

**版本**: v1.0
**日期**: 2024-01-18
**作者**: AI Assistant

---

# Qwen3-VL 前端集成设计方案

## 一、模型概述

### 1.1 模型简介
- **名称**: Qwen3-VL（通义千问3-VL）
- **开发者**: 阿里云通义千问团队
- **类型**: 多模态大语言模型（Vision-Language Model, VLM）
- **特点**: 强大的视觉理解能力、多语言支持、对话式交互

### 1.2 核心优势
- ✅ **强大的视觉理解**: 超越传统OCR，理解图片内容
- ✅ **多模态能力**: 支持图文混合输入输出
- ✅ **对话式交互**: 支持问答、描述、总结等
- ✅ **多语言**: 支持中文、英文等多种语言
- ✅ **开源可部署**: 支持本地部署和API调用
- ✅ **大模型能力**: 具备LLM的理解和生成能力

### 1.3 模型规格

| 模型版本 | 参数规模 | 视觉输入 | 特点 | 适用场景 |
|---------|---------|---------|------|----------|
| **Qwen3-VL-7B** | 7B | 单图 | 轻量级 | 边缘设备、低延迟 |
| **Qwen3-VL-8B** | 8B | 单图 | 平衡型 | 通用场景 |
| **Qwen3-VL-72B** | 72B | 多图 | 高精度 | 复杂场景 |
| **Qwen3-VL-235B** | 235B | 多图 | 旗舰版 | 企业级应用 |

---

## 二、前端集成方案

### 2.1 架构选择

#### 方案 A: API 调用方式（推荐度: ⭐⭐⭐⭐⭐）

**技术栈**:
- OpenAI 兼容 API（阿里云 DashScope / 本地部署）
- HTTP 请求 / WebSocket
- 流式响应

**架构图**:
```
┌─────────────────┐    HTTP/WS    ┌─────────────────┐
│   前端 (Vue 3)  │ ◄─────────────► │  Qwen3-VL API   │
│   + Element     │                 │  (阿里云/本地)   │
└─────────────────┘                 └─────────────────┘
```

**优势**:
- ✅ **无需本地部署**: 直接调用 API
- ✅ **无需下载模型**: 模型在云端
- ✅ **推理速度快**: 利用云端GPU
- ✅ **功能完整**: 支持所有模型能力
- ✅ **易于集成**: 简单的 HTTP API
- ✅ **自动更新**: 模型自动更新

**劣势**:
- ❌ **需要网络**: 无法离线使用
- ❌ **有使用成本**: API 调用费用
- ❌ **数据隐私**: 图片需要上传到服务器

**适用场景**:
- ✅ 有网络连接的场景
- ✅ 对数据隐私要求不高
- ✅ 追求最佳体验
- ✅ 企业级应用

---

#### 方案 B: 本地 Ollama 部署（推荐度: ⭐⭐⭐⭐）

**架构设计**:
```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   前端 (Vue 3)  │ ◄─────────────► │  Ollama         │
│   + Element     │                 │  (本地运行)      │
└─────────────────┘                 └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Qwen3-VL        │
                                    │ 本地模型        │
                                    └─────────────────┘
```

**技术栈**:
- Ollama（本地大模型运行时）
- Qwen3-VL 模型
- HTTP API

**优势**:
- ✅ **完全离线**: 无需网络
- ✅ **数据隐私**: 数据不离开本地
- ✅ **无使用成本**: 一次性下载，永久使用
- ✅ **可控性强**: 完全控制模型

**劣势**:
- ❌ **需要本地部署**: 需要安装 Ollama
- ❌ **硬件要求高**: 需要较好的 CPU/GPU
- ❌ **模型下载大**: 模型文件大（几十GB）
- ❌ **推理速度慢**: 相比云端较慢

**适用场景**:
- ✅ 对数据隐私要求极高
- ✅ 需要离线使用
- ✅ 有较好的硬件
- ✅ 研究和开发

---

#### 方案 C: 混合部署（推荐度: ⭐⭐⭐⭐⭐）

**架构设计**:
```
┌─────────────────┐
│   前端 (Vue 3)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  智能路由层     │
│  (Route Layer)  │
└────────┬────────┘
         │
         ├─── 网络可用 ──► ┌─────────────────┐
         │                  │  Qwen3-VL API   │
         │                  │  (阿里云)        │
         │                  └─────────────────┘
         │
         └─── 离线/隐私 ──► ┌─────────────────┐
                            │  Ollama         │
                            │  (本地)          │
                            └─────────────────┘
```

**策略**:
1. **优先使用 API**: 网络可用时使用云端 API
2. **降级到本地**: 网络不可用或隐私要求高时使用本地 Ollama
3. **智能切换**: 根据网络和用户设置自动选择

**优势**:
- ✅ 兼顾体验和隐私
- ✅ 灵活的使用模式
- ✅ 高可用性

**适用场景**:
- 对体验和隐私都有要求
- 需要离线使用能力
- 企业级应用

---

### 2.2 推荐方案: 方案 C（混合部署）

**理由**:

1. **灵活性**: 支持多种使用模式
2. **高可用性**: 网络不可用时可以降级到本地
3. **数据隐私**: 敏感数据可以选择本地处理
4. **体验优先**: 优先使用云端 API，保证体验
5. **成本可控**: 可以根据需求选择不同方案

---

## 三、详细设计

### 3.1 项目结构

```
src/view/orc/
├── index.vue              # OCR 主页面
├── components/            # 组件
│   ├── QwenChat.vue       # 对话组件
│   ├── ImageUploader.vue  # 图片上传组件
│   └── QwenSettings.vue   # 设置组件
├── services/              # API 服务
│   ├── qwen-api.ts        # Qwen3-VL API 客户端
│   ├── ollama-api.ts      # Ollama API 客户端
│   └── qwen-factory.ts    # 智能工厂
├── types/                 # TypeScript 类型
│   └── qwen.ts           # Qwen3-VL 类型定义
└── utils/                 # 工具函数
    └── image-utils.ts    # 图片处理工具
```

---

### 3.2 核心依赖

```json
// package.json
{
  "dependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.4.0",
    "marked": "^9.1.0",        // Markdown 渲染
    "highlight.js": "^11.9.0"   // 代码高亮
  }
}
```

---

### 3.3 API 客户端设计

#### 3.3.1 Qwen3-VL API 客户端

```typescript
// src/view/orc/services/qwen-api.ts

import type { QwenRequest, QwenResponse, QwenMessage, QwenUsage } from '../types/qwen'

/**
 * Qwen3-VL API 客户端（阿里云 DashScope）
 */
export class QwenAPIClient {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(config: {
    apiKey: string
    baseUrl?: string
    model?: string
  }) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1'
    this.model = config.model || 'qwen-vl-max'
  }

  /**
   * 生成对话响应
   */
  async chat(request: QwenRequest): Promise<QwenResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 2048,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 0.95,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.message || response.status}`)
    }

    return await response.json()
  }

  /**
   * 流式对话响应
   */
  async *chatStream(request: QwenRequest): AsyncGenerator<QwenResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 2048,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 0.95,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.message || response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value)
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return
          
          try {
            const chunk = JSON.parse(data)
            yield chunk
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  /**
   * OCR 识别（简化接口）
   */
  async ocr(imageBase64: string, prompt?: string): Promise<string> {
    const messages: QwenMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: imageBase64
          },
          {
            type: 'text',
            text: prompt || '请识别图片中的文字，返回纯文本，不要包含任何格式标记。'
          }
        ]
      }
    ]

    const response = await this.chat({
      messages,
      max_tokens: 4096,
      temperature: 0
    })

    return response.choices[0]?.message?.content || ''
  }

  /**
   * 图片描述
   */
  async describe(imageBase64: string, detail: 'low' | 'high' = 'high'): Promise<string> {
    const prompt = detail === 'high'
      ? '请详细描述这张图片，包括内容、场景、物体、文字等所有细节。'
      : '请简要描述这张图片的主要内容。'

    return this.ocr(imageBase64, prompt)
  }

  /**
   * 视觉问答
   */
  async ask(imageBase64: string, question: string): Promise<string> {
    const prompt = `图片内容：
${question}

请根据图片内容回答问题。`

    return this.ocr(imageBase64, prompt)
  }
}
```

#### 3.3.2 Ollama API 客户端

```typescript
// src/view/orc/services/ollama-api.ts

import type { QwenRequest, QwenResponse, QwenMessage } from '../types/qwen'

/**
 * Ollama API 客户端（本地部署）
 */
export class OllamaClient {
  private baseUrl: string
  private model: string

  constructor(config: {
    baseUrl?: string
    model?: string
  }) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
    this.model = config.model || 'qwen3-vl'
  }

  /**
   * 检查 Ollama 是否运行
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 生成响应
   */
  async generate(request: {
    messages: QwenMessage[]
    options?: {
      temperature?: number
      top_p?: number
      max_tokens?: number
    }
  }): Promise<QwenResponse> {
    // 构建 Ollama 格式的请求
    const prompt = this.buildPrompt(request.messages)

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        options: request.options,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Ollama Error: ${error.error || response.status}`)
    }

    const result = await response.json()
    return this.convertToQwenResponse(result)
  }

  /**
   * 流式生成响应
   */
  async *generateStream(request: {
    messages: QwenMessage[]
    options?: {
      temperature?: number
      top_p?: number
      max_tokens?: number
    }
  }): AsyncGenerator<QwenResponse> {
    const prompt = this.buildPrompt(request.messages)

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        options: request.options,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Ollama Error: ${error.error || response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value)
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line) {
          try {
            const chunk = JSON.parse(line)
            yield this.convertToQwenResponse(chunk)
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(messages: QwenMessage[]): string {
    let prompt = ''

    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `系统：${message.content}\n`
      } else if (message.role === 'user') {
        prompt += `用户：${this.formatContent(message.content)}\n`
      } else if (message.role === 'assistant') {
        prompt += `助手：${message.content}\n`
      }
    }

    prompt += '助手：'
    return prompt
  }

  /**
   * 格式化内容
   */
  private formatContent(content: string | Array<{ type: string; text?: string; image?: string }>): string {
    if (typeof content === 'string') {
      return content
    }

    let result = ''
    for (const item of content) {
      if (item.type === 'text' && item.text) {
        result += item.text
      } else if (item.type === 'image' && item.image) {
        // Ollama 支持 base64 图片
        result += `![图片](${item.image})\n`
      }
    }

    return result
  }

  /**
   * 转换为 Qwen 响应格式
   */
  private convertToQwenResponse(ollamaResponse: any): QwenResponse {
    return {
      id: ollamaResponse.id || Date.now().toString(),
      object: 'chat.completion',
      created: Date.now(),
      model: this.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: ollamaResponse.response || ollamaResponse.message?.content || ''
          },
          finish_reason: ollamaResponse.done ? 'stop' : null
        }
      ],
      usage: {
        prompt_tokens: ollamaResponse.prompt_eval_count || 0,
        completion_tokens: ollamaResponse.eval_count || 0,
        total_tokens: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0)
      }
    }
  }

  /**
   * OCR 识别
   */
  async ocr(imageBase64: string, prompt?: string): Promise<string> {
    const messages: QwenMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: imageBase64
          },
          {
            type: 'text',
            text: prompt || '请识别图片中的文字，返回纯文本。'
          }
        ]
      }
    ]

    const response = await this.generate({
      messages,
      options: {
        temperature: 0,
        max_tokens: 4096
      }
    })

    return response.choices[0]?.message?.content || ''
  }
}
```

#### 3.3.3 智能工厂

```typescript
// src/view/orc/services/qwen-factory.ts

import { QwenAPIClient } from './qwen-api'
import { OllamaClient } from './ollama-api'
import type { QwenRequest, QwenResponse, QwenMessage } from '../types/qwen'

export type QwenProvider = 'api' | 'ollama' | 'auto'

/**
 * Qwen3-VL 智能工厂
 * 支持自动切换 API 和 Ollama
 */
export class QwenFactory {
  private apiClient: QwenAPIClient | null = null
  private ollamaClient: OllamaClient | null = null
  private defaultProvider: QwenProvider

  constructor(config: {
    apiKey?: string
    ollamaBaseUrl?: string
    defaultProvider?: QwenProvider
  }) {
    // 初始化 API 客户端
    if (config.apiKey) {
      this.apiClient = new QwenAPIClient({
        apiKey: config.apiKey
      })
    }

    // 初始化 Ollama 客户端
    this.ollamaClient = new OllamaClient({
      baseUrl: config.ollamaBaseUrl
    })

    this.defaultProvider = config.defaultProvider || 'auto'
  }

  /**
   * 获取客户端（自动选择）
   */
  async getClient(provider?: QwenProvider): Promise<QwenAPIClient | OllamaClient> {
    const p = provider || this.defaultProvider

    if (p === 'api') {
      if (!this.apiClient) {
        throw new Error('API client not configured')
      }
      return this.apiClient
    }

    if (p === 'ollama') {
      return this.ollamaClient
    }

    // 自动选择
    return this.selectClient()
  }

  /**
   * 自动选择客户端
   */
  private async selectClient(): Promise<QwenAPIClient | OllamaClient> {
    // 检查网络
    const hasNetwork = await this.checkNetwork()

    // 网络可用且有 API 客户端，优先使用 API
    if (hasNetwork && this.apiClient) {
      return this.apiClient
    }

    // 检查 Ollama 是否可用
    const ollamaAvailable = await this.ollamaClient.isAvailable()

    if (ollamaAvailable) {
      return this.ollamaClient
    }

    // 都不可用，尝试使用 API（可能有网络但 API 配置错误）
    if (this.apiClient) {
      return this.apiClient
    }

    throw new Error('No available Qwen3-VL provider')
  }

  /**
   * 检查网络连接
   */
  private async checkNetwork(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('https://dashscope.aliyuncs.com', {
        method: 'HEAD',
        signal: controller.signal
      })

      clearTimeout(timeout)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * OCR 识别（简化接口）
   */
  async ocr(imageBase64: string, options: {
    prompt?: string
    provider?: QwenProvider
  } = {}): Promise<string> {
    const client = await this.getClient(options.provider)
    return client.ocr(imageBase64, options.prompt)
  }

  /**
   * 对话
   */
  async chat(request: QwenRequest, options: {
    provider?: QwenProvider
  } = {}): Promise<QwenResponse> {
    const client = await this.getClient(options.provider)
    return client.chat(request)
  }

  /**
   * 流式对话
   */
  async *chatStream(request: QwenRequest, options: {
    provider?: QwenProvider
  } = {}): AsyncGenerator<QwenResponse> {
    const client = await this.getClient(options.provider)
    
    if ('chatStream' in client) {
      yield* client.chatStream(request)
    } else if ('generateStream' in client) {
      yield* client.generateStream(request)
    }
  }
}

// 创建全局实例
export const qwenFactory = new QwenFactory({
  apiKey: import.meta.env.VITE_QWEN_API_KEY,
  ollamaBaseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
  defaultProvider: 'auto'
})
```

---

### 3.4 类型定义

```typescript
// src/view/orc/types/qwen.ts

/**
 * Qwen3-VL 消息类型
 */
export interface QwenMessage {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'function'
  content: string | Array<{
    type: 'text' | 'image' | 'video'
    text?: string
    image?: string  // Base64 编码
    video?: string  // Base64 编码
  }>
  name?: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
}

/**
 * Qwen3-VL 请求
 */
export interface QwenRequest {
  messages: QwenMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
  stop?: string | string[]
  presence_penalty?: number
  frequency_penalty?: number
}

/**
 * Qwen3-VL 响应
 */
export interface QwenResponse {
  id: string
  object: 'chat.completion' | 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    message: QwenMessage
    finish_reason: 'stop' | 'length' | 'tool_calls' | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Qwen3-VL 配置
 */
export interface QwenConfig {
  apiKey?: string
  baseUrl?: string
  model?: string
  defaultOptions: {
    max_tokens: number
    temperature: number
    top_p: number
  }
}
```

---

### 3.5 主页面集成

```vue
<!-- src/view/orc/index.vue -->

<template>
  <div class="ocr-container" @paste="handlePaste">
    <!-- 顶部设置 -->
    <div class="qwen-settings">
      <el-select v-model="selectedProvider" size="small" @change="onProviderChange">
        <el-option label="自动选择" value="auto" />
        <el-option label="阿里云 API" value="api" />
        <el-option label="本地 Ollama" value="ollama" />
      </el-select>

      <el-button 
        type="primary" 
        @click="startRecognition" 
        :disabled="!selectedFiles.length || isProcessing"
      >
        <el-icon><MagicStick /></el-icon>
        {{ isProcessing ? '识别中...' : '开始识别' }}
      </el-button>
    </div>

    <!-- 主内容区 -->
    <main class="ocr-main">
      <!-- 左侧：文件上传和预览 -->
      <section class="upload-section">
        <div class="section-header">
          <h2 class="section-title">上传图片</h2>
        </div>

        <!-- 文件上传区域 -->
        <div class="upload-area">
          <!-- 拖拽上传 -->
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
          <!-- 提示词设置 -->
          <div class="option-item">
            <label class="option-label">自定义提示词</label>
            <el-input 
              v-model="customPrompt" 
              type="textarea" 
              :rows="4"
              placeholder="输入自定义提示词，例如：请识别图片中的表格内容，以 Markdown 表格格式返回。"
            />
          </div>

          <!-- 模型参数 -->
          <div class="option-item">
            <label class="option-label">温度参数</label>
            <el-slider 
              v-model="modelOptions.temperature" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :show-tooltip="true"
            />
          </div>

          <div class="option-item">
            <label class="option-label">最大生成长度</label>
            <el-slider 
              v-model="modelOptions.maxTokens" 
              :min="512" 
              :max="8192" 
              :step="512"
              :show-tooltip="true"
            />
          </div>

          <!-- 高级功能 -->
          <div class="option-item">
            <label class="option-label">图片描述</label>
            <el-button 
              type="primary" 
              size="small"
              @click="describeImage"
              :disabled="!selectedFiles.length"
            >
              描述图片
            </el-button>
          </div>

          <div class="option-item">
            <label class="option-label">视觉问答</label>
            <el-input 
              v-model="question" 
              placeholder="输入问题，例如：图片中有什么？"
              style="margin-right: 8px"
            />
            <el-button 
              type="primary" 
              size="small"
              @click="askQuestion"
              :disabled="!selectedFiles.length || !question"
            >
              提问
            </el-button>
          </div>
        </div>

        <!-- 状态显示 -->
        <div class="status-section">
          <div class="status-item">
            <span class="status-label">当前服务:</span>
            <span class="status-value">{{ providerStatus }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">API 状态:</span>
            <span class="status-value" :class="{ 'status-ok': apiAvailable }">
              {{ apiAvailable ? '可用' : '不可用' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Ollama 状态:</span>
            <span class="status-value" :class="{ 'status-ok': ollamaAvailable }">
              {{ ollamaAvailable ? '可用' : '不可用' }}
            </span>
          </div>
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
            <el-button size="small" @click="exportToMarkdown" :disabled="!recognizedText">
              <el-icon><Document /></el-icon>
              导出MD
            </el-button>
          </div>
        </div>

        <div class="result-container">
          <div v-if="isStreaming" class="result-streaming">
            <el-icon class="streaming-icon"><Loading /></el-icon>
            <span>正在生成响应...</span>
          </div>
          <div v-else-if="recognizedText" class="result-text" v-html="renderedText">
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
              <span class="stat-label">Token 数</span>
              <span class="stat-value">{{ recognitionStats.totalTokens }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">使用服务</span>
              <span class="stat-value">{{ recognitionStats.provider }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Upload, Document, Delete, MagicStick, CopyDocument, Download, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { qwenFactory, type QwenProvider } from './services/qwen-factory'
import type { QwenResponse } from './types/qwen'

// 配置 Markdown 渲染
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {
        console.error(e)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// 状态
const selectedProvider = ref<QwenProvider>('auto')
const providerStatus = ref('检测中...')
const apiAvailable = ref(false)
const ollamaAvailable = ref(false)

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const selectedFiles = ref<any[]>([])

// 模型选项
const customPrompt = ref('')
const question = ref('')
const modelOptions = reactive({
  temperature: 0.7,
  maxTokens: 4096
})

// 识别相关
const isProcessing = ref(false)
const isStreaming = ref(false)
const recognizedText = ref('')
const recognitionStats = ref<any>(null)

// 渲染后的文本
const renderedText = computed(() => {
  return marked(recognizedText.value)
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

// 检查服务状态
const checkStatus = async () => {
  try {
    // 检查 Ollama
    ollamaAvailable.value = await qwenFactory.ollamaClient.isAvailable()

    // 检查 API
    try {
      // 简单的网络检查
      const response = await fetch('https://dashscope.aliyuncs.com', { method: 'HEAD' })
      apiAvailable.value = response.ok
    } catch {
      apiAvailable.value = false
    }

    // 更新状态
    if (selectedProvider.value === 'auto') {
      if (apiAvailable.value) {
        providerStatus.value = '阿里云 API'
      } else if (ollamaAvailable.value) {
        providerStatus.value = '本地 Ollama'
      } else {
        providerStatus.value = '无可用服务'
      }
    } else if (selectedProvider.value === 'api') {
      providerStatus.value = '阿里云 API'
    } else {
      providerStatus.value = '本地 Ollama'
    }
  } catch (error) {
    console.error('检查状态失败:', error)
  }
}

// 开始识别
const startRecognition = async () => {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }

  isProcessing.value = true
  isStreaming.value = true
  recognizedText.value = ''

  try {
    const startTime = Date.now()
    let fullText = ''
    let usedProvider: string = ''

    // 处理所有文件
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]

      // 转换为 Base64
      const base64 = await fileToBase64(file)

      // 构建提示词
      const prompt = customPrompt.value || '请识别图片中的文字，返回纯文本。'

      // Qwen3-VL OCR
      const text = await qwenFactory.ocr(base64, {
        prompt,
        provider: selectedProvider.value
      })

      if (i > 0) {
        fullText += '\n\n' + '='.repeat(50) + '\n\n' // 文件分隔符
      }
      fullText += `【${file.name}】\n\n${text}`
    }

    const endTime = Date.now()

    // 记录使用的服务
    usedProvider = selectedProvider.value === 'auto'
      ? (apiAvailable.value ? '阿里云 API' : '本地 Ollama')
      : (selectedProvider.value === 'api' ? '阿里云 API' : '本地 Ollama')

    // 计算统计信息
    recognitionStats.value = {
      processTime: endTime - startTime,
      totalTokens: fullText.length,
      provider: usedProvider
    }

    recognizedText.value = fullText
    isStreaming.value = false

    ElMessage.success('识别完成！')
  } catch (error) {
    console.error('OCR识别失败:', error)
    ElMessage.error('识别失败：' + (error as Error).message)
    isStreaming.value = false
  } finally {
    isProcessing.value = false
  }
}

// 文件转 Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // 移除 data:image/png;base64, 前缀
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 描述图片
const describeImage = async () => {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }

  isProcessing.value = true
  isStreaming.value = true
  recognizedText.value = ''

  try {
    const file = selectedFiles.value[0]
    const base64 = await fileToBase64(file)

    const text = await qwenFactory.ocr(base64, {
      prompt: '请详细描述这张图片，包括内容、场景、物体、文字等所有细节。',
      provider: selectedProvider.value
    })

    recognizedText.value = text
    isStreaming.value = false

    ElMessage.success('图片描述完成！')
  } catch (error) {
    console.error('描述失败:', error)
    ElMessage.error('描述失败：' + (error as Error).message)
    isStreaming.value = false
  } finally {
    isProcessing.value = false
  }
}

// 视觉问答
const askQuestion = async () => {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (!question.value) {
    ElMessage.warning('请输入问题')
    return
  }

  isProcessing.value = true
  isStreaming.value = true

  try {
    const file = selectedFiles.value[0]
    const base64 = await fileToBase64(file)

    const text = await qwenFactory.ocr(base64, {
      prompt: `图片内容：
${question.value}

请根据图片内容回答问题。`,
      provider: selectedProvider.value
    })

    // 追加到结果
    if (recognizedText.value) {
      recognizedText.value += '\n\n' + '='.repeat(50) + '\n\n'
    }
    recognizedText.value += `Q: ${question.value}\n\nA: ${text}`

    isStreaming.value = false

    ElMessage.success('回答完成！')
  } catch (error) {
    console.error('问答失败:', error)
    ElMessage.error('问答失败：' + (error as Error).message)
    isStreaming.value = false
  } finally {
    isProcessing.value = false
  }
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

// 导出为 TXT
const exportToText = () => {
  const blob = new Blob([recognizedText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `qwen_ocr_result_${new Date().getTime()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
  ElMessage.success('文件已导出')
}

// 导出为 Markdown
const exportToMarkdown = () => {
  const blob = new Blob([recognizedText.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `qwen_ocr_result_${new Date().getTime()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
  ElMessage.success('Markdown 文件已导出')
}

// 其他处理函数（文件选择、拖拽、粘贴等）
// ...

// 监听提供者变化
const onProviderChange = () => {
  checkStatus()
}

// 生命周期
onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
/* 样式定义 */
/* 参考现有的样式实现 */

.status-ok {
  color: #67c23a;
}

.result-streaming {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #909399;
}

.streaming-icon {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
```

---

## 四、Ollama 本地部署

### 4.1 安装 Ollama

#### Windows

```bash
# 下载并安装
winget install Ollama.Ollama

# 或从官网下载
# https://ollama.com/download
```

#### macOS

```bash
brew install ollama
```

#### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 4.2 运行 Qwen3-VL

```bash
# 拉取并运行 Qwen3-VL
ollama run qwen3-vl

# 或指定版本
ollama run qwen3-vl:7b
ollama run qwen3-vl:8b
ollama run qwen3-vl:72b
```

### 4.3 配置 Ollama

```bash
# 查看已安装的模型
ollama list

# 查看模型信息
ollama show qwen3-vl

# 创建自定义模型
ollama create my-qwen -f Modelfile
```

Modelfile 示例:

```dockerfile
FROM qwen3-vl

PARAMETER temperature 0.7
PARAMETER top_p 0.95
PARAMETER num_ctx 4096
```

---

## 五、阿里云 API 配置

### 5.1 获取 API Key

1. 访问 [阿里云 DashScope](https://dashscope.aliyuncs.com/)
2. 注册/登录账号
3. 创建 API Key
4. 保存 API Key

### 5.2 环境配置

```env
# .env.development
VITE_QWEN_API_KEY=your-api-key-here
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

```env
# .env.production
VITE_QWEN_API_KEY=your-api-key-here
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

---

## 六、性能优化

### 6.1 前端优化

1. **图片压缩**:
   - 上传前压缩图片
   - 减少传输时间

2. **流式响应**:
   - 使用流式 API
   - 实时显示响应

3. **缓存策略**:
   - 缓存识别结果
   - 避免重复识别

4. **错误处理**:
   - 网络错误自动重试
   - 降级到本地服务

### 6.2 后端优化

1. **模型选择**:
   - 根据场景选择合适的模型
   - 平衡速度和精度

2. **批量处理**:
   - 支持多张图片批量识别
   - 提高吞吐量

3. **异步处理**:
   - 使用异步任务队列
   - 支持大文件和批量请求

---

## 七、安全考虑

### 7.1 API 安全

1. **API Key 保护**:
   - 不要在前端暴露 API Key
   - 使用后端代理

2. **请求限制**:
   - 限制请求频率
   - 防止滥用

3. **数据加密**:
   - HTTPS 传输
   - 数据加密存储

### 7.2 数据隐私

1. **本地处理**:
   - 敏感数据使用本地 Ollama
   - 避免上传到云端

2. **数据隔离**:
   - 用户数据隔离
   - 防止数据泄露

3. **自动清理**:
   - 定期清理临时文件
   - 保护用户隐私

---

## 八、扩展功能

### 8.1 多模态能力

1. **图片描述**: 详细描述图片内容
2. **视觉问答**: 根据图片回答问题
3. **物体检测**: 识别图片中的物体
4. **场景理解**: 理解图片场景和上下文

### 8.2 高级 OCR

1. **表格识别**: 识别表格结构和内容
2. **公式识别**: 识别数学公式
3. **手写识别**: 识别手写文字
4. **版面分析**: 分析文档结构

### 8.3 对话功能

1. **多轮对话**: 支持上下文对话
2. **记忆功能**: 记住对话历史
3. **工具调用**: 调用外部工具
4. **函数调用**: 执行函数

---

## 九、常见问题

### Q1: Ollama 运行慢怎么办？

**A**: 
- 使用较小的模型（7B/8B）
- 确保有足够的内存（建议 16GB+）
- 使用 GPU 加速（需要 NVIDIA GPU）

### Q2: API Key 如何安全存储？

**A**: 
- 不要在前端代码中硬编码
- 使用环境变量
- 考虑使用后端代理

### Q3: 如何支持更多语言？

**A**: 
- Qwen3-VL 内置多语言支持
- 可以通过提示词指定语言
- 支持中文、英文、日文、韩文等

### Q4: 图片大小限制？

**A**: 
- API: 通常支持 10MB 以下
- Ollama: 取决于模型配置
- 建议上传前压缩图片

---

## 十、总结

### 10.1 方案优势

1. **强大的能力**: 超越传统 OCR，支持视觉理解
2. **灵活的部署**: 支持 API 和本地部署
3. **智能切换**: 自动选择最佳服务
4. **多模态支持**: 图片、文字、对话一体化
5. **易于扩展**: 支持多种高级功能

### 10.2 实施步骤

1. **第一阶段**: 配置阿里云 API 或本地 Ollama
2. **第二阶段**: 集成 Qwen3-VL API 客户端
3. **第三阶段**: 实现智能工厂和服务切换
4. **第四阶段**: 集成到 OCR 主页面
5. **第五阶段**: 测试和优化

### 10.3 后续扩展

1. 支持更多多模态功能
2. 集成视觉问答和图片描述
3. 优化性能和用户体验
4. 添加更多高级 OCR 功能

---

## 附录

### A. 参考资料

- Qwen3-VL 官方文档: https://github.com/QwenLM/Qwen-VL
- Ollama 官方文档: https://ollama.com/
- 阿里云 DashScope: https://dashscope.aliyuncs.com/
- PaddleOCR 官方文档: https://github.com/PaddlePaddle/PaddleOCR
- DeepSeek-OCR 官方文档: https://github.com/deepseek-ai/DeepSeek-OCR

### B. 许可证

- Qwen3-VL: Apache License 2.0
- Ollama: MIT License
- 本设计文档: MIT License

---

**版本**: v1.0
**日期**: 2024-01-18
**作者**: AI Assistant

---

# 三大 OCR 方案对比总结

## 方案对比表

| 特性 | DeepSeek-OCR | PaddleOCR-js | Qwen3-VL |
|------|-------------|--------------|----------|
| **模型类型** | 专用 OCR 模型 | 专用 OCR 模型 | 多模态大模型 |
| **核心能力** | OCR 识别 | OCR 识别 | OCR + 视觉理解 + 对话 |
| **部署方式** | 后端部署 | 纯前端部署 | API / 本地 Ollama |
| **离线支持** | ❌ 需要后端 | ✅ 完全离线 | ⚠️ 部分离线 |
| **数据隐私** | ⚠️ 需要上传 | ✅ 本地处理 | ⚠️ 可选本地 |
| **模型大小** | 1.5-3GB | 10-140MB | 7B-235B |
| **推理速度** | 快（GPU） | 中等（浏览器） | 中等（云端/本地） |
| **识别精度** | 高 | 中高 | 极高 |
| **多语言** | ✅ | ✅ | ✅ |
| **表格识别** | ✅ | ⚠️ 基础 | ✅ |
| **视觉理解** | ❌ | ❌ | ✅ |
| **对话功能** | ❌ | ❌ | ✅ |
| **使用成本** | 中（服务器） | 低（无服务器） | 中高（API/硬件） |
| **集成难度** | 中 | 低 | 中 |

## 适用场景推荐

### DeepSeek-OCR
- ✅ 需要高精度 OCR
- ✅ 企业级应用
- ✅ 服务器部署
- ✅ 批量处理
- ✅ 表格识别

### PaddleOCR-js
- ✅ 前端离线使用
- ✅ 数据隐私要求高
- ✅ 中小规模应用
- ✅ 移动端/桌面端
- ✅ 低使用频率

### Qwen3-VL
- ✅ 需要视觉理解
- ✅ 多模态应用
- ✅ 对话式交互
- ✅ 复杂场景
- ✅ 企业级应用

## 技术选型建议

### 如果您需要:

1. **完全离线 + 数据隐私**: **PaddleOCR-js**
2. **高精度 + 表格识别**: **DeepSeek-OCR**
3. **视觉理解 + 对话**: **Qwen3-VL**
4. **灵活部署 + 混合使用**: **Qwen3-VL (混合部署)**

### 组合方案:

```
┌─────────────────────────────────────────────────────────┐
│                    智能 OCR 系统                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  前端界面    │───►│  智能路由    │───►│  引擎池    │ │
│  │  (Vue 3)     │    │  (Router)    │    │  (Engines) │ │
│  └──────────────┘    └──────────────┘    └────────────┘ │
│         │                                              │
│         ▼                                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  策略选择:                                       │  │
│  │  - 离线 → PaddleOCR-js                         │  │
│  │  - 高精度 → DeepSeek-OCR                       │  │
│  │  - 视觉理解 → Qwen3-VL                         │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

**版本**: v1.0
**日期**: 2024-01-18
**作者**: AI Assistant
