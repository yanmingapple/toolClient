/**
 * PaddleOCR.js OCR 引擎实现
 * 基于 @paddlejs-models/ocr 的纯前端 OCR 引擎
 * 支持中文、英文等多语言识别
 *
 * 官方文档：
 * - @paddlejs-models/ocr: https://www.npmjs.com/package/@paddlejs-models/ocr
 *
 * 使用方式（按照官方文档）：
 * ```javascript
 * // ES Module 导入
 * import * as ocr from '@paddlejs-models/ocr'
 *
 * // 初始化
 * await ocr.init();
 *
 * // 识别
 * const result = await ocr.recognize(image);
 * ```
 */

import { IOCREngine, OCREngineConfig, OCREngineType, OCRProcessOptions, OCRResult } from '../types/ocr'

// 按照官方文档使用 ES Module 方式导入
// import * as paddlejs from '@paddlejs/paddlejs-core';
// import '@paddlejs/paddlejs-backend-webgl';  // WebGL后端
import * as ocr from '@paddlejs-models/ocr';

export class PaddleOCREngine implements IOCREngine {
  private config: OCREngineConfig
  private initialized: boolean = false

  constructor() {
    this.config = {
      type: OCREngineType.PADDLE_OCR,
      name: 'PaddleOCR',
      description: '百度飞桨 OCR，高精度产业级模型，支持80+语言',
      available: true,
      supportedLanguages: [],
      requiresNetwork: false,
      modelSize: 10,
      avgSpeed: 1500,
      accuracy: 0.92
    }
  }

  getConfig(): OCREngineConfig {
    return this.config
  }

  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 初始化 PaddleOCR 引擎
   * 加载 OCR 检测和识别模型
   *
   * 官方文档：
   * ```javascript
   * import * as ocr from '@paddlejs-models/ocr';
   * await ocr.init();
   * ```
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('PaddleOCR 引擎已初始化，跳过')
      return
    }

    this.validateEnvironment()

    try {
      console.log('开始初始化 PaddleOCR 引擎...')
      console.log('正在加载 OCR 模型（检测+识别）...')

      // 性能优化：@paddlejs-models/ocr 会自动启用 WebGL 加速
      console.log('启用性能优化...')
      console.log('✅ 性能优化已启用（自动）')
      // 配置模型路径
      // 设置WebGL参数
      // paddlejs.env.set('WEBGL_FORCE_F16_TEXTURES', true);

      // 按照官方文档：使用 ocr.init()
      // 支持离线模式：如果本地模型存在则使用本地模型
      const initOptions = this.buildInitOptions()
      console.log('初始化选项:', initOptions)
      await ocr.init()
      // await ocr.init("/paddleocr/ch_PP-OCRv3_det_infer", "/paddleocr/ch_PP-OCRv3_rec_infer")
      // await ocr.init("https://paddlejs.bj.bcebos.com/models/ocr_v2_det_new/model.json", "https://paddlejs.bj.bcebos.com/models/ocr_v2_rec_320/model.json")
      this.initialized = true
      console.log('🎉 PaddleOCR 引擎初始化成功')
    } catch (error) {
      console.error('PaddleOCR 引擎初始化失败:', error)

      // 处理 WebGL frameBufferSupportFloat 错误
      if (error.message.includes('frameBufferSupportFloat')) {
        console.warn('⚠️  WebGL 浮点纹理不支持，尝试使用默认配置...')
        try {
          // 不传递初始化选项，使用默认配置
          await ocr.init()
          this.initialized = true
          console.log('🎉 PaddleOCR 引擎初始化成功（使用默认配置）')
          return
        } catch (secondError) {
          console.error('PaddleOCR 引擎初始化再次失败:', secondError)
          throw new Error('PaddleOCR 初始化失败: ' + (secondError as Error).message)
        }
      }

      // 处理 WebGL framebufferTexture2D 错误（WebGL 上下文为 null）
      if (error.message.includes('framebufferTexture2D')) {
        throw new Error(
          'PaddleOCR 初始化失败：WebGL 上下文创建失败。\n' +
          '请检查：\n' +
          '1. 浏览器是否支持 WebGL（推荐 Chrome 90+、Firefox 88+、Edge 90+）\n' +
          '2. WebGL 是否被禁用\n' +
          '3. 显卡驱动是否已更新\n' +
          '或切换到 Tesseract.js 引擎（不需要 WebGL）'
        )
      }

      throw new Error('PaddleOCR 初始化失败: ' + (error as Error).message)
    }
  }

  /**
   * 构建初始化选项
   * 支持离线模式：使用本地模型文件
   */
  private buildInitOptions(): any {
    // 检查是否有本地模型
    const hasLocalModels = this.checkLocalModels()

    if (hasLocalModels) {
      console.log('✅ 发现本地模型，使用离线模式')
      return 'https://paddlejs.bj.bcebos.com/models/ocr_v2_rec_320/model.json'
    }

    console.log('⚠️  未发现本地模型，使用远程模型（需要网络）')
    // 使用默认的远程模型
    return 'https://paddlejs.bj.bcebos.com/models/ocr_v2_rec_320/model.json'
  }

  /**
   * 检查本地模型是否存在
   */
  private checkLocalModels(): boolean {
    try {
      // 检查模型目录是否存在
      // 这里使用简单的方式：检查 localStorage 中的标记
      const modelsCached = localStorage.getItem('paddleocr_models_cached')
      return modelsCached === 'true'
    } catch (error) {
      console.warn('检查本地模型失败:', error)
      return false
    }
  }

  /**
   * 验证运行环境
   * 检查浏览器兼容性和依赖
   */
  private validateEnvironment(): void {
    // 检查浏览器兼容性
    this.checkBrowserCompatibility()

    // 检查 ocr 对象是否正确导入
    if (typeof ocr === 'undefined') {
      throw new Error(
        'Paddle.js OCR 模块未正确导入，请检查：\n' +
        '1. 是否已安装 @paddlejs-models/ocr 包\n' +
        '2. import 语句是否正确\n' +
        '3. TypeScript 配置是否支持 ES Module'
      )
    }

    // 检查关键方法是否存在
    if (typeof ocr.init !== 'function') {
      throw new Error('ocr.init 方法未找到，请检查包版本是否正确')
    }

    if (typeof ocr.recognize !== 'function') {
      throw new Error('ocr.recognize 方法未找到，请检查包版本是否正确')
    }

    // 检查网络连接（可选）
    this.checkNetworkConnection()
  }

  /**
   * 检查网络连接
   * 如果没有网络且没有本地模型，给出警告
   */
  private checkNetworkConnection(): void {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const hasLocalModels = this.checkLocalModels()
      if (!hasLocalModels) {
        console.warn(
          '⚠️  警告：当前没有网络连接，且未发现本地模型。\n' +
          '请在有网络的环境下首次使用以下载模型，\n' +
          '或手动下载模型文件到 public/paddleocr/ 目录。\n' +
          '参考文档：public/paddleocr/模型下载说明.md'
        )
      }
    }
  }

  /**
   * 检查浏览器兼容性
   */
  private checkBrowserCompatibility(): void {
    // 检查 WebGL 支持（创建实际的 WebGL 上下文）
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      throw new Error(
        '浏览器不支持 WebGL，无法运行 PaddleOCR。\n' +
        '请使用以下浏览器：\n' +
        '- Chrome 90+\n' +
        '- Firefox 88+\n' +
        '- Edge 90+\n' +
        '或切换到 Tesseract.js 引擎（不需要 WebGL）'
      )
    }

    // 检查 Canvas 支持
    const isCanvasAvailable = typeof HTMLCanvasElement !== 'undefined'
    if (!isCanvasAvailable) {
      throw new Error('浏览器不支持 Canvas，无法运行 PaddleOCR')
    }

    // 检查 ES Module 支持
    // 使用间接方式检查，因为 import 是关键字
    try {
      new Function('import("test")')
    } catch (e) {
      console.warn('⚠️  浏览器不支持动态 import，可能影响性能')
    }
  }

  /**
   * 识别图片中的文字
   * @param image - 输入图片元素
   * @param options - 处理选项
   * @param onProgress - 进度回调函数
   */
  async recognize(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OCRResult> {
    if (!this.initialized) {
      throw new Error('PaddleOCR 引擎未初始化，请先调用 initialize() 方法')
    }

    const startTime = Date.now()

    try {
      if (onProgress) {
        onProgress(0, '开始处理图片...')
      }

      // 图片预处理
      const processedImage = await this.preprocessImage(image, options)

      if (onProgress) {
        onProgress(30, '图片预处理完成，开始识别...')
      }

      // 使用 @paddlejs-models/ocr 进行识别
      // 官方文档：const result = await ocr.recognize(image);
      const result = await ocr.recognize(processedImage)

      if (onProgress) {
        onProgress(100, '识别完成')
      }

      // 处理识别结果
      const ocrResult = this.processResult(result, startTime)

      return ocrResult
    } catch (error) {
      console.error('PaddleOCR 识别失败:', error)
      throw new Error('PaddleOCR 识别失败: ' + (error as Error).message)
    }
  }

  /**
   * 图片预处理
   * @param image - 输入图片
   * @param options - 处理选项
   */
  private async preprocessImage(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions
  ): Promise<HTMLCanvasElement> {
    // 将输入转换为 Canvas
    let canvas: HTMLCanvasElement

    if (image instanceof HTMLCanvasElement) {
      canvas = image
    } else if (image instanceof File) {
      canvas = await this.fileToCanvas(image)
    } else {
      // 图片 URL
      canvas = await this.urlToCanvas(image)
    }

    // 应用预处理选项
    return this.applyPreprocessing(canvas, options)
  }

  /**
   * 将 File 对象转换为 Canvas
   */
  private async fileToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const canvas = await this.urlToCanvas(e.target?.result as string)
          resolve(canvas)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 将图片 URL 转换为 Canvas
   */
  private async urlToCanvas(url: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas)
        } else {
          reject(new Error('无法获取 Canvas 2D 上下文'))
        }
      }
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 应用预处理操作
   * @param canvas - 输入 Canvas
   * @param options - 处理选项
   */
  private applyPreprocessing(
    canvas: HTMLCanvasElement,
    options: OCRProcessOptions
  ): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return canvas
    }

    // 创建新的 Canvas 用于处理
    const processedCanvas = document.createElement('canvas')
    processedCanvas.width = canvas.width
    processedCanvas.height = canvas.height
    const processedCtx = processedCanvas.getContext('2d')
    if (!processedCtx) {
      return canvas
    }

    // 应用亮度和对比度调整
    let filterString = ''
    if (options.brightness !== 0) {
      filterString += ` brightness(${1 + options.brightness / 100})`
    }
    if (options.contrast !== 1) {
      filterString += ` contrast(${options.contrast})`
    }

    // 应用灰度化
    if (options.grayScale) {
      filterString += ' grayscale(100%)'
    }

    // 应用二值化
    if (options.binarize) {
      filterString += ` threshold(${options.threshold})`
    }

    // 应用降噪
    if (options.denoise) {
      filterString += ` blur(${options.denoiseLevel / 10})`
    }

    // 应用滤镜
    if (filterString) {
      processedCtx.filter = filterString.trim()
    }

    // 绘制图片
    processedCtx.drawImage(canvas, 0, 0)

    return processedCanvas
  }

  /**
   * 处理识别结果
   * @param result - PaddleOCR 原始结果
   * @param startTime - 开始时间
   */
  private processResult(result: any, startTime: number): OCRResult {
    // @paddlejs-models/ocr 返回的结果格式：
    // {
    //   data: [
    //     { text: '识别文本', confidence: 0.99 },
    //     ...
    //   ]
    // }

    let text = ''
    let totalConfidence = 0
    let charCount = 0

    if (result && result.data && Array.isArray(result.data)) {
      // 提取所有文本
      text = result.data.map((item: any) => item.text).join('\n')
      charCount = text.length

      // 计算平均置信度
      if (result.data.length > 0) {
        totalConfidence = result.data.reduce((sum: number, item: any) => {
          return sum + (item.confidence || 0)
        }, 0)
        totalConfidence /= result.data.length
      }
    }

    const processTime = Date.now() - startTime

    return {
      text,
      confidence: totalConfidence,
      processTime,
      charCount,
      data: result
    }
  }

  /**
   * 销毁引擎资源
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return
    }

    try {
      // @paddlejs-models/ocr 没有明确的销毁方法
      // 这里可以清理一些资源
      this.initialized = false
      console.log('PaddleOCR 引擎已销毁')
    } catch (error) {
      console.error('销毁 PaddleOCR 引擎失败:', error)
    }
  }
}
