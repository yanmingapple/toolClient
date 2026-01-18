# OCR 引擎架构说明

## 一、架构概述

本项目采用了**可扩展的 OCR 引擎架构**，支持多种 OCR 引擎的无缝切换和扩展。当前已实现 Tesseract.js 引擎，并预留了 PaddleOCR、DeepSeek-OCR 和 Qwen3-VL 的扩展接口。

## 二、核心设计

### 2.1 设计模式

采用**工厂模式**和**策略模式**的组合：

- **工厂模式**：通过 `EngineFactory` 统一创建和管理不同类型的 OCR 引擎实例
- **策略模式**：所有引擎实现统一的 `IOCREngine` 接口，可互相替换

### 2.2 目录结构

```
src/view/orc/
├── index.vue              # OCR 主页面
├── components/
│   └── EngineSelector.vue # 引擎选择器组件
├── engine/
│   ├── engine-factory.ts  # 引擎工厂
│   └── tesseract-engine.ts # Tesseract.js 引擎实现
├── types/
│   └── ocr.ts            # TypeScript 类型定义
└── OCR引擎架构说明.md     # 本文档
```

## 三、核心组件

### 3.1 类型定义 (`types/ocr.ts`)

```typescript
// 引擎类型枚举
export enum OCREngineType {
  TESSERACT = 'tesseract',
  PADDLE_OCR = 'paddleocr',
  DEEPSEEK = 'deepseek',
  QWEN3_VL = 'qwen3vl'
}

// 统一的 OCR 引擎接口
export interface IOCREngine {
  getConfig(): OCREngineConfig
  initialize(): Promise<void>
  isInitialized(): boolean
  recognize(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OCRResult>
  destroy(): Promise<void>
}
```

### 3.2 引擎工厂 (`engine/engine-factory.ts`)

**职责**：
- 统一创建不同类型的 OCR 引擎实例
- 管理引擎实例的生命周期
- 提供引擎配置查询

**核心方法**：
```typescript
// 获取所有可用引擎
const engines = ocrEngineFactory.getAvailableEngines()

// 创建引擎实例
const engine = await ocrEngineFactory.createEngine(OCREngineType.TESSERACT)

// 销毁引擎
await ocrEngineFactory.destroyEngine(OCREngineType.TESSERACT)
```

### 3.3 引擎选择器组件 (`components/EngineSelector.vue`)

**功能**：
- 展示所有可用的 OCR 引擎
- 显示引擎的关键特性（模型大小、速度、准确率等）
- 支持引擎切换
- 根据选择的引擎动态更新语言选项

**使用方式**：
```vue
<EngineSelector
  v-model="selectedEngine"
  :language="selectedLanguage"
  @update:language="selectedLanguage = $event"
/>
```

## 四、已实现的引擎

### 4.1 Tesseract.js

**状态**：✅ 已实现

**特点**：
- 纯前端解决方案
- 支持多语言（中文、英文、日文、韩文等）
- 完全离线运行
- 模型大小约 4.5MB
- 平均识别速度约 2 秒
- 准确率约 85%

**配置**：
```typescript
{
  type: OCREngineType.TESSERACT,
  name: 'Tesseract.js',
  available: true,
  requiresNetwork: false,
  modelSize: 4.5,
  avgSpeed: 2000,
  accuracy: 0.85
}
```

## 五、待实现的引擎

### 5.1 PaddleOCR

**状态**：❌ 暂未实现

**原因**：
- Paddle.js 的 npm 包已不可用
- 需要从 GitHub 源码构建
- 模型文件较大（10-140MB）

**建议方案**：
- 使用 CDN 方式引入 Paddle.js
- 或考虑使用其他前端 OCR 库替代

### 5.2 DeepSeek-OCR

**状态**：❌ 暂未实现

**特点**：
- 基于大模型的文档理解
- 需要后端部署
- 模型大小约 7GB
- 准确率约 95%

**实现建议**：
- 使用 FastAPI 构建后端服务
- 通过 REST API 调用
- 支持流式返回结果

### 5.3 Qwen3-VL

**状态**：❌ 暂未实现

**特点**：
- 多模态大模型
- 支持复杂文档理解
- 可通过阿里云 API 或本地 Ollama 部署
- 准确率约 96%

**实现建议**：
- 支持云 API 和本地部署两种模式
- 自动选择最优方案
- 提供详细的使用统计

## 六、扩展新引擎

### 6.1 步骤

1. **创建引擎实现类**
```typescript
// engine/new-engine.ts
export class NewEngine implements IOCREngine {
  // 实现所有接口方法
}
```

2. **注册到工厂**
```typescript
// engine/engine-factory.ts
switch (type) {
  case OCREngineType.NEW_ENGINE:
    engine = new NewEngine()
    break
  // ...
}
```

3. **更新类型定义**
```typescript
// types/ocr.ts
export enum OCREngineType {
  // ...
  NEW_ENGINE = 'newengine'
}
```

4. **添加配置**
```typescript
// engine/engine-factory.ts
this.engineConfigs = [
  // ...
  {
    type: OCREngineType.NEW_ENGINE,
    name: '新引擎名称',
    description: '引擎描述',
    available: true,
    supportedLanguages: ['auto', 'chi_sim', 'eng'],
    requiresNetwork: false,
    modelSize: 10,
    avgSpeed: 1500,
    accuracy: 0.90
  }
]
```

### 6.2 接口实现要点

```typescript
class CustomEngine implements IOCREngine {
  // 1. 返回引擎配置
  getConfig(): OCREngineConfig {
    return this.config
  }

  // 2. 初始化引擎（加载模型等）
  async initialize(): Promise<void> {
    // 初始化逻辑
  }

  // 3. 检查初始化状态
  isInitialized(): boolean {
    return this.initialized
  }

  // 4. 核心识别方法
  async recognize(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OCRResult> {
    // 识别逻辑
    return {
      text: '识别结果',
      confidence: 0.95,
      processTime: 1000,
      charCount: 100
    }
  }

  // 5. 销毁资源
  async destroy(): Promise<void> {
    // 清理逻辑
  }
}
```

## 七、使用示例

### 7.1 基本使用

```typescript
// 1. 创建引擎
const engine = await ocrEngineFactory.createEngine(OCREngineType.TESSERACT)

// 2. 准备选项
const options: OCRProcessOptions = {
  language: 'chi_sim',
  scale: 1.0,
  grayScale: false,
  // ... 其他选项
}

// 3. 识别图片
const result = await engine.recognize(
  imageUrl,
  options,
  (progress, message) => {
    console.log(`进度: ${progress}%, 状态: ${message}`)
  }
)

// 4. 获取结果
console.log('识别文本:', result.text)
console.log('置信度:', result.confidence)
console.log('处理时间:', result.processTime)
```

### 7.2 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OCREngineType } from './types/ocr'
import { ocrEngineFactory } from './engine/engine-factory'

const selectedEngine = ref<OCREngineType>(OCREngineType.TESSERACT)

const handleRecognize = async () => {
  const engine = await ocrEngineFactory.createEngine(selectedEngine.value)
  // ... 识别逻辑
}
</script>
```

## 八、性能优化建议

### 8.1 引擎实例缓存

工厂会自动缓存引擎实例，避免重复初始化：
```typescript
// 第一次调用：创建并初始化引擎
const engine1 = await ocrEngineFactory.createEngine(OCREngineType.TESSERACT)

// 第二次调用：直接返回缓存的实例
const engine2 = await ocrEngineFactory.createEngine(OCREngineType.TESSERACT)

console.log(engine1 === engine2) // true
```

### 8.2 资源清理

组件卸载时记得清理资源：
```typescript
onUnmounted(async () => {
  await ocrEngineFactory.destroyAll()
})
```

### 8.3 进度回调

使用进度回调提升用户体验：
```typescript
const result = await engine.recognize(
  image,
  options,
  (progress, message) => {
    progressValue.value = progress
    statusMessage.value = message
  }
)
```

## 九、常见问题

### Q1: 如何切换默认引擎？

修改 `index.vue` 中的初始值：
```typescript
const selectedEngine = ref<OCREngineType>(OCREngineType.TESSERACT)
```

### Q2: 如何添加新的语言支持？

在引擎配置中更新 `supportedLanguages`：
```typescript
supportedLanguages: ['auto', 'chi_sim', 'eng', 'fra', 'spa']
```

### Q3: 引擎初始化失败怎么办？

检查浏览器控制台错误信息，常见原因：
- 模型文件加载失败
- 网络连接问题（在线引擎）
- 浏览器不支持 WebAssembly

### Q4: 如何处理大图片？

建议在识别前进行预处理：
```typescript
const processedImage = await preprocessImage(imageUrl, {
  scale: 0.5, // 缩小图片
  grayScale: true // 灰度化
})
```

## 十、未来规划

- [ ] 实现 PaddleOCR 集成（需要解决 npm 包问题）
- [ ] 实现 DeepSeek-OCR 后端服务
- [ ] 实现 Qwen3-VL 云 API 集成
- [ ] 添加引擎性能对比面板
- [ ] 支持批量处理和队列管理
- [ ] 添加热键和快捷操作
- [ ] 支持更多图片格式（PDF、TIFF 等）

## 十一、贡献指南

欢迎提交 Issue 和 Pull Request！

### 代码规范

- 遵循 TypeScript 最佳实践
- 使用 `async/await` 处理异步操作
- 提供完整的类型定义
- 添加必要的注释和文档

### 测试要求

- 所有新功能需要添加单元测试
- 确保在主流浏览器中正常运行
- 性能测试：单张图片识别时间 < 5 秒

## 十二、许可证

本项目采用 MIT 许可证。

---

**最后更新**: 2025-01-18
**版本**: v1.0.0
**作者**: Trae AI Assistant
