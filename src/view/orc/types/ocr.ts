/**
 * OCR 引擎类型定义
 */

/**
 * OCR 引擎类型枚举
 */
export enum OCREngineType {
  TESSERACT = 'tesseract',
  PADDLE_OCR = 'paddleocr',
  DEEPSEEK = 'deepseek',
  QWEN3_VL = 'qwen3vl'
}

/**
 * OCR 识别结果
 */
export interface OCRResult {
  /** 识别出的文本 */
  text: string
  /** 置信度 (0-1) */
  confidence: number
  /** 处理时间 (毫秒) */
  processTime: number
  /** 字符数 */
  charCount: number
  /** 详细的识别数据（可选） */
  data?: any
}

/**
 * OCR 处理选项
 */
export interface OCRProcessOptions {
  /** 识别语言 */
  language: string
  /** 自动旋转校正 */
  autoRotate: boolean
  /** 缩放比例 */
  scale: number
  /** 灰度化处理 */
  grayScale: boolean
  /** 二值化处理 */
  binarize: boolean
  /** 二值化阈值 */
  threshold: number
  /** 降噪处理 */
  denoise: boolean
  /** 降噪强度 */
  denoiseLevel: number
  /** 对比度增强 */
  contrast: number
  /** 亮度调整 */
  brightness: number
}

/**
 * OCR 引擎配置
 */
export interface OCREngineConfig {
  /** 引擎类型 */
  type: OCREngineType
  /** 引擎名称 */
  name: string
  /** 引擎描述 */
  description: string
  /** 是否可用 */
  available: boolean
  /** 支持的语言列表 */
  supportedLanguages: string[]
  /** 是否需要网络连接 */
  requiresNetwork: boolean
  /** 模型大小 (MB) */
  modelSize?: number
  /** 平均处理速度 (ms) */
  avgSpeed?: number
  /** 准确率估计 */
  accuracy?: number
}

/**
 * OCR 引擎接口
 * 所有 OCR 引擎都必须实现此接口
 */
export interface IOCREngine {
  /** 获取引擎配置 */
  getConfig(): OCREngineConfig
  
  /** 初始化引擎 */
  initialize(): Promise<void>
  
  /** 检查引擎是否已初始化 */
  isInitialized(): boolean
  
  /**
   * 识别图片中的文字
   * @param image 图片源（可以是 URL、File 对象或 Canvas）
   * @param options 处理选项
   * @param onProgress 进度回调函数
   */
  recognize(
    image: string | File | HTMLCanvasElement,
    options: OCRProcessOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OCRResult>
  
  /** 销毁引擎资源 */
  destroy(): Promise<void>
}

/**
 * OCR 引擎工厂接口
 */
export interface IOCREngineFactory {
  /** 获取所有可用的引擎配置 */
  getAvailableEngines(): OCREngineConfig[]
  
  /**
   * 创建指定类型的 OCR 引擎
   * @param type 引擎类型
   */
  createEngine(type: OCREngineType): Promise<IOCREngine>
  
  /** 销毁所有引擎实例 */
  destroyAll(): Promise<void>
}
