/**
 * Tesseract.js OCR 引擎实现
 * 基于 Tesseract.js 库的前端 OCR 引擎
 */

import { IOCREngine, OCREngineConfig, OCREngineType, OCRProcessOptions, OCRResult } from '../types/ocr'

// 声明全局 Tesseract 对象
declare const Tesseract: any

export class TesseractEngine implements IOCREngine {
  private config: OCREngineConfig
  private initialized: boolean = false
  private worker: any = null

  constructor() {
    this.config = {
      type: OCREngineType.TESSERACT,
      name: 'Tesseract.js',
      description: '基于 Tesseract OCR 引擎的纯前端解决方案，支持多语言识别',
      available: true,
      supportedLanguages: ['auto', 'chi_sim', 'eng', 'chi_sim+jpn+kor', 'chi_sim+eng', 'jpn', 'kor'],
      requiresNetwork: false,
      modelSize: 4.5,
      avgSpeed: 2000,
      accuracy: 0.85
    }
  }

  getConfig(): OCREngineConfig {
    return this.config
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (typeof Tesseract === 'undefined') {
      throw new Error('Tesseract.js 未加载，请检查 index.html 中的脚本引用')
    }

    // 使用本地 worker 和 core 文件
    // <el-option label="自动检测" value="auto" />
    //         <el-option label="中文" value="chi_sim" />
    //         <el-option label="英文" value="eng" />
    //         <el-option label="日文" value="jpn" />
    //         <el-option label="韩文" value="kor" />
    //         <el-option label="中英混合" value="chi_sim+eng" />
    this.worker = await Tesseract.createWorker(
      'auto+chi_sim+eng+jpn+kor',
      1,
      {
        logger: () => { },
        workerPath: '/tessdata/worker.min.js',
        corePath: '/tessdata/tesseract-core.wasm.js',
        langPath: '/tessdata/',
        legacyCore: true
      }
    )

    this.initialized = true
  }

  isInitialized(): boolean {
    return this.initialized
  }

  async recognize(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OCRResult> {
    if (!this.initialized) {
      throw new Error('引擎未初始化，请先调用 initialize()')
    }

    const startTime = Date.now()
    let actualLanguage = options.language

    // 如果选择自动识别，先使用 OSD 检测语言
    if (options.language === 'auto') {
      onProgress?.(10, '正在自动检测语言...')

      // 创建 OSD Worker 用于语言检测
      const osdWorker = await Tesseract.createWorker(
        'osd',
        1,
        {
          logger: () => { }, // 不使用 logger，避免序列化问题
          workerPath: '/tessdata/worker.min.js',
          corePath: '/tessdata/tesseract-core.wasm.js',
          langPath: '/tessdata/',
          legacyCore: true
        }
      )

      try {
        const osdResult = await osdWorker.recognize(image)
        const detectedLanguages = osdResult.data?.osd?.detected_languages

        if (detectedLanguages && detectedLanguages.length > 0) {
          const langCode = detectedLanguages[0].language_code
          if (langCode.includes('chi') || langCode.includes('zh')) {
            actualLanguage = 'chi_sim'
          } else if (langCode.includes('jpn') || langCode.includes('ja')) {
            actualLanguage = 'jpn'
          } else if (langCode.includes('kor') || langCode.includes('ko')) {
            actualLanguage = 'kor'
          } else {
            actualLanguage = 'eng'
          }
          onProgress?.(20, `检测到语言: ${actualLanguage}`)
        } else {
          actualLanguage = 'eng'
          onProgress?.(20, '未检测到语言，默认使用英文')
        }
      } catch (osdError) {
        console.warn('OSD 语言检测失败，使用默认语言:', osdError)
        actualLanguage = 'eng'
      } finally {
        await osdWorker.terminate()
      }
    }

    // 如果语言不是 eng，需要加载对应的语言数据
    if (actualLanguage !== 'eng') {
      onProgress?.(25, `正在加载语言数据: ${actualLanguage}`)
      await this.worker.loadLanguage(actualLanguage)
      await this.worker.initialize(actualLanguage)
    }

    // 设置识别参数
    await this.worker.setParameters({
      tessedit_pageseg_mode: 3, // 自动分页模式
      tessedit_char_whitelist: '', // 空表示不限制
      tessedit_ocr_engine_mode: 1 // LSTM 引擎
    })

    onProgress?.(30, '正在识别图片...')

    // 执行识别（不使用 logger 回调，避免序列化问题）
    const result = await this.worker.recognize(image)

    // 更新进度为完成
    onProgress?.(90, '识别完成，正在处理结果...')

    const endTime = Date.now()
    const processTime = endTime - startTime

    // 计算置信度
    const words = result.data.words || []
    let totalConfidence = 0
    let wordCount = 0

    if (words.length > 0) {
      for (const word of words) {
        if (word.confidence !== undefined) {
          totalConfidence += word.confidence
          wordCount++
        }
      }
    }

    const confidence = wordCount > 0 ? (totalConfidence / wordCount) / 100 : 0.8
    const text = result.data.text || ''

    onProgress?.(100, '识别完成')

    return {
      text,
      confidence,
      processTime,
      charCount: text.length,
      data: result.data
    }
  }

  async destroy(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
    this.initialized = false
  }
}
