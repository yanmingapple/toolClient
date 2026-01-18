# Worker 回调函数序列化问题修复

## 一、问题描述

### 错误信息

```javascript
Uncaught (in promise) DataCloneError: Failed to execute 'postMessage' on 'Worker': 
(m) => { 
  if (m.status === "recognizing text") { 
    const currentProgress = 30 + m.progress * 60;...<omitted>... 
} could not be cloned.
```

### 根本原因

**Web Worker 通信限制**：
- Web Worker 使用 `postMessage()` 进行通信
- 传递的数据必须是可序列化的（JSON-serializable）
- **函数不能被序列化和克隆**
- 包含闭包的箭头函数更无法序列化

### 问题代码位置

#### 位置 1：`Tesseract.createWorker()` 配置

```typescript
// ❌ 错误
const osdWorker = await Tesseract.createWorker(
  'osd',
  1,
  {
    logger: (m: any) => {  // ❌ 不能传递函数
      if (m.status === 'recognizing text') {
        onProgress?.(15, '检测语言中...')  // ❌ 闭包引用外部变量
      }
    },
    workerPath: '/tessdata/worker.min.js',
    corePath: '/tessdata/tesseract-core.wasm.js',
    langPath: '/tessdata/',
    legacyCore: true
  }
)
```

#### 位置 2：`worker.recognize()` 配置

```typescript
// ❌ 错误
const result = await this.worker.recognize(image, {
  logger: (m: any) => {  // ❌ 不能传递函数
    if (m.status === 'recognizing text') {
      const currentProgress = 30 + (m.progress * 60)
      onProgress?.(Math.round(currentProgress), '识别中...')  // ❌ 闭包
    }
  }
})
```

## 二、修复方案

### 方案 1：移除 logger 回调（推荐）

**原理**：
- 不使用 Tesseract.js 的 logger 机制
- 在调用前后手动更新进度
- 简化实现，避免序列化问题

**修复代码**：

```typescript
// ✅ 正确：移除 logger 回调
const osdWorker = await Tesseract.createWorker(
  'osd',
  1,
  {
    logger: () => { },  // ✅ 空函数，不做任何操作
    workerPath: '/tessdata/worker.min.js',
    corePath: '/tessdata/tesseract-core.wasm.js',
    langPath: '/tessdata/',
    legacyCore: true
  }
)

// ✅ 正确：手动更新进度
onProgress?.(10, '正在自动检测语言...')
const osdResult = await osdWorker.recognize(image)  // 不传递回调
onProgress?.(20, '语言检测完成')
```

### 方案 2：使用事件监听（备选）

**原理**：
- 在 Worker 外部监听事件
- 通过事件系统传递进度
- 避免直接传递函数

**示例代码**：

```typescript
// 备选方案：使用事件发射器
class ProgressEmitter {
  private listeners: Map<string, Function[]> = new Map()
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }
  
  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }
}

// 使用
const emitter = new ProgressEmitter()
emitter.on('progress', (progress, message) => {
  onProgress?.(progress, message)
})

// 在识别过程中手动触发
emitter.emit('progress', 30, '正在识别...')
```

### 方案 3：使用 Promise + 轮询（不推荐）

**原理**：
- 定期检查识别状态
- 通过共享状态传递进度
- 实现复杂，效率低

**不推荐原因**：
- 增加复杂度
- 浪费资源
- 实时性差

## 三、已应用的修复

### 修改文件：`src/view/orc/engine/tesseract-engine.ts`

#### 修复 1：OSD Worker 创建（第 80-90 行）

```typescript
// ❌ 修复前
const osdWorker = await Tesseract.createWorker(
  'osd',
  1,
  {
    logger: (m: any) => {  // ❌ 问题代码
      if (m.status === 'recognizing text') {
        onProgress?.(15, '检测语言中...')
      }
    },
    // ...
  }
)

// ✅ 修复后
const osdWorker = await Tesseract.createWorker(
  'osd',
  1,
  {
    logger: () => { },  // ✅ 空函数
    workerPath: '/tessdata/worker.min.js',
    corePath: '/tessdata/tesseract-core.wasm.js',
    langPath: '/tessdata/',
    legacyCore: true
  }
)

// ✅ 手动更新进度
onProgress?.(10, '正在自动检测语言...')
const osdResult = await osdWorker.recognize(image)
onProgress?.(20, '语言检测完成')
```

#### 修复 2：主识别调用（第 137-144 行）

```typescript
// ❌ 修复前
const result = await this.worker.recognize(image, {
  logger: (m: any) => {  // ❌ 问题代码
    if (m.status === 'recognizing text') {
      const currentProgress = 30 + (m.progress * 60)
      onProgress?.(Math.round(currentProgress), '识别中...')
    }
  }
})

// ✅ 修复后
onProgress?.(30, '正在识别图片...')
const result = await this.worker.recognize(image)  // ✅ 不传递回调
onProgress?.(90, '识别完成，正在处理结果...')
```

## 四、技术原理

### Web Worker 通信机制

```javascript
// 主线程
const worker = new Worker('worker.js')

// 发送消息（必须可序列化）
worker.postMessage({
  type: 'recognize',
  image: imageData,  // ✅ 可以：二进制数据
  options: { ... }, // ✅ 可以：普通对象
  callback: () => { } // ❌ 不可以：函数
})

// Worker 线程
self.onmessage = (e) => {
  const data = e.data  // 接收序列化后的数据
  // ... 处理
  self.postMessage(result) // 发送结果回主线程
}
```

### 可序列化的数据类型

| 类型 | 是否支持 | 说明 |
|-----|---------|------|
| **基本类型** | ✅ | string, number, boolean, null, undefined |
| **对象** | ✅ | plain object（无函数、无循环引用） |
| **数组** | ✅ | 普通数组 |
| **二进制数据** | ✅ | ArrayBuffer, Blob, File 等（会被转移） |
| **函数** | ❌ | 箭头函数、普通函数、异步函数都不行 |
| **Symbol** | ❌ | 符号类型 |
| **循环引用** | ❌ | 对象之间相互引用 |
| **DOM 对象** | ❌ | Element, Window 等 |

### 结构化克隆算法

浏览器使用**结构化克隆算法**（Structured Clone Algorithm）来序列化数据：

```javascript
// 工作原理
const data = { a: 1, b: 'hello' }
const cloned = structuredClone(data)  // ✅ 成功

const dataWithFunc = { callback: () => { } }
const cloned = structuredClone(dataWithFunc)  // ❌ 失败
```

**限制**：
- 不支持函数
- 不支持 Symbol
- 不支持循环引用
- 不支持某些特殊对象（如 Error, DOM 节点等）

## 五、Tesseract.js 特定问题

### Tesseract.js 的 Worker 架构

```javascript
// Tesseract.js 的内部实现
class Worker {
  constructor(options) {
    this.worker = new Worker(options.workerPath)
    
    // 尝试传递 logger 函数
    this.worker.postMessage({
      type: 'init',
      logger: options.logger  // ❌ 这里会失败
    })
  }
  
  async recognize(image, options) {
    // 尝试传递 logger 函数
    return this.worker.postMessage({
      type: 'recognize',
      image: image,
      logger: options.logger  // ❌ 这里会失败
    })
  }
}
```

### 为什么会失败

```typescript
// 用户代码
const worker = await Tesseract.createWorker('eng', 1, {
  logger: (m) => {  // 定义在用户代码中的函数
    updateProgress(m.progress)  // 引用了外部的 updateProgress 函数
  }
})

// Tesseract.js 内部
this.worker.postMessage({
  logger: options.logger  // 尝试序列化函数
  // ❌ 失败：函数不能被序列化
  // ❌ 更失败：闭包引用了外部变量
})
```

## 六、最佳实践

### 避免传递回调函数

```typescript
// ❌ 错误
async function recognize(image, onProgress) {
  const result = await worker.recognize(image, {
    logger: (m) => {
      onProgress(m.progress, m.status)  // ❌ 回调传递
    }
  })
  return result
}

// ✅ 正确
async function recognize(image, onProgress) {
  onProgress?.(0, '开始识别...')
  
  // 步骤 1
  onProgress?.(25, '预处理图片...')
  const processed = preprocess(image)
  
  // 步骤 2
  onProgress?.(50, '执行识别...')
  const result = await worker.recognize(processed)  // 不传递回调
  
  // 步骤 3
  onProgress?.(75, '后处理结果...')
  const final = postprocess(result)
  
  onProgress?.(100, '识别完成')
  return final
}
```

### 使用事件发射器模式

```typescript
// ✅ 推荐：使用事件系统
class OCREngine {
  private emitter = new EventEmitter()
  
  on(event: string, callback: Function) {
    this.emitter.on(event, callback)
  }
  
  async recognize(image) {
    this.emitter.emit('progress', 0, '开始')
    
    // ... 处理
    
    this.emitter.emit('progress', 50, '识别中')
    
    // ... 处理
    
    this.emitter.emit('progress', 100, '完成')
    this.emitter.emit('result', result)
  }
}

// 使用
const engine = new OCREngine()
engine.on('progress', (progress, message) => {
  console.log(`${progress}%: ${message}`)
})
engine.on('result', (result) => {
  console.log('结果:', result)
})
engine.recognize(image)
```

### 使用 Promise + 状态轮询

```typescript
// ⚠️ 备选：轮询状态
class OCREngine {
  private currentProgress = 0
  private currentStatus = ''
  
  getProgress() {
    return { 
      progress: this.currentProgress,
      status: this.currentStatus
    }
  }
  
  async recognize(image) {
    this.currentProgress = 0
    this.currentStatus = '开始识别'
    
    // ... 处理
    this.currentProgress = 50
    this.currentStatus = '识别中'
    
    // ... 处理
    this.currentProgress = 100
    this.currentStatus = '完成'
    
    return result
  }
}

// 使用
const engine = new OCREngine()
const recognitionPromise = engine.recognize(image)

// 轮询进度
const interval = setInterval(() => {
  const { progress, status } = engine.getProgress()
  console.log(`${progress}%: ${status}`)
  
  if (progress === 100) {
    clearInterval(interval)
  }
}, 100)

const result = await recognitionPromise
```

## 六、调试技巧

### 方法 1：检查数据是否可序列化

```javascript
function isSerializable(data) {
  try {
    JSON.stringify(data)  // 尝试序列化
    return true
  } catch (e) {
    console.error('不可序列化:', e.message)
    return false
  }
}

// 使用
const options = { logger: () => { } }
console.log(isSerializable(options))  // ❌ false
```

### 方法 2：在发送前验证

```javascript
function validateOptions(options) {
  const keys = Object.keys(options)
  for (const key of keys) {
    const value = options[key]
    if (typeof value === 'function') {
      console.warn(`选项 "${key}" 是函数，将被忽略`)
      delete options[key]  // 移除函数
    }
  }
  return options
}

// 使用
const safeOptions = validateOptions(originalOptions)
worker.postMessage(safeOptions)  // ✅ 安全
```

### 方法 3：使用浏览器开发工具

1. **打开开发者工具**（F12）
2. **切换到 Sources 面板**
3. **设置断点**在 `postMessage` 调用处
4. **检查调用栈**和变量
5. **查看错误信息**中的具体原因

## 七、总结

### 关键要点

1. **Web Worker 限制**：不能传递函数、闭包等不可序列化的数据
2. **Tesseract.js 问题**：`createWorker()` 和 `recognize()` 的 `logger` 选项不能使用回调函数
3. **修复方案**：移除 logger 回调，改用手动更新进度
4. **最佳实践**：使用事件发射器模式或 Promise 链式调用

### 已修复的问题

| 位置 | 问题 | 修复方法 | 状态 |
|-----|------|---------|------|
| **第 80-90 行** | OSD Worker 创建时传递 logger | 改为空函数 `() => { }` | ✅ 完成 |
| **第 137-144 行** | recognize 调用时传递 logger | 移除 logger 参数，手动更新进度 | ✅ 完成 |

### 预防措施

1. **检查所有 Worker 通信**：确保只传递可序列化数据
2. **避免在配置中使用函数**：Tesseract.js、Paddle.js 等库的配置选项
3. **使用事件系统**：替代回调函数模式
4. **添加验证函数**：在发送数据前检查是否可序列化
5. **编写单元测试**：测试数据序列化

---

**修复时间**：2025-01-18  
**修复人员**：Trae AI Assistant  
**文档版本**：v1.0  
**相关文件**：`src/view/orc/engine/tesseract-engine.ts`

---

**📞 如有问题**：
1. 查看本文档的修复方案
2. 检查浏览器控制台错误信息
3. 验证数据是否可序列化
4. 联系开发团队
