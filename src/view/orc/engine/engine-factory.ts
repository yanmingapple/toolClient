/**
 * OCR 引擎工厂
 * 用于创建和管理不同类型的 OCR 引擎实例
 */

import { IOCREngineFactory, OCREngineConfig, OCREngineType, IOCREngine } from '../types/ocr'
import { TesseractEngine } from './tesseract-engine'
import { PaddleOCREngine } from './paddleocr-engine'

export class OCREngineFactory implements IOCREngineFactory {
  private engineInstances: Map<OCREngineType, IOCREngine> = new Map()
  private engineConfigs: OCREngineConfig[] = []

  constructor() {
    // 初始化所有可用的引擎配置
    this.engineConfigs = [
      {
        type: OCREngineType.TESSERACT,
        name: 'Tesseract.js',
        description: '基于 Tesseract OCR 引擎的纯前端解决方案，支持多语言识别',
        available: true,
        supportedLanguages: ['auto', 'chi_sim', 'eng', 'chi_sim+jpn+kor', 'chi_sim+eng', 'jpn', 'kor'],
        requiresNetwork: false,
        modelSize: 4.5,
        avgSpeed: 2000,
        accuracy: 0.85
      },
      {
        type: OCREngineType.PADDLE_OCR,
        name: 'PaddleOCR',
        description: '百度飞桨 OCR，高精度产业级模型，支持80+语言',
        available: true,
        supportedLanguages: ['auto', 'chi_sim', 'eng', 'jpn', 'kor', 'enm', 'latin', 'arabic', 'cyrillic', 'devanagari'],
        requiresNetwork: false,
        modelSize: 10,
        avgSpeed: 1500,
        accuracy: 0.92
      },
      {
        type: OCREngineType.DEEPSEEK,
        name: 'DeepSeek-OCR',
        description: '深度求索 OCR，基于大模型的文档理解（暂未实现）',
        available: false,
        supportedLanguages: ['auto', 'chi_sim', 'eng'],
        requiresNetwork: true,
        modelSize: 7000,
        avgSpeed: 5000,
        accuracy: 0.95
      },
      {
        type: OCREngineType.QWEN3_VL,
        name: 'Qwen3-VL',
        description: '通义千问多模态大模型，支持复杂文档理解（暂未实现）',
        available: false,
        supportedLanguages: ['auto', 'chi_sim', 'eng'],
        requiresNetwork: true,
        modelSize: 8000,
        avgSpeed: 6000,
        accuracy: 0.96
      }
    ]
  }

  /**
   * 获取所有可用的引擎配置
   */
  getAvailableEngines(): OCREngineConfig[] {
    return this.engineConfigs.filter(config => config.available)
  }

  /**
   * 获取所有引擎配置（包括不可用的）
   */
  getAllEngines(): OCREngineConfig[] {
    return this.engineConfigs
  }

  /**
   * 创建指定类型的 OCR 引擎
   * @param type 引擎类型
   */
  async createEngine(type: OCREngineType): Promise<IOCREngine> {
    // 检查是否已有实例
    if (this.engineInstances.has(type)) {
      return this.engineInstances.get(type)!
    }

    let engine: IOCREngine

    switch (type) {
      case OCREngineType.TESSERACT:
        engine = new TesseractEngine()
        break

      case OCREngineType.PADDLE_OCR:
        engine = new PaddleOCREngine()
        break

      case OCREngineType.DEEPSEEK:
        throw new Error('DeepSeek-OCR 引擎暂未实现，请使用其他引擎')

      case OCREngineType.QWEN3_VL:
        throw new Error('Qwen3-VL 引擎暂未实现，请使用其他引擎')

      default:
        throw new Error(`不支持的引擎类型: ${type}`)
    }

    // 初始化引擎
    await engine.initialize()

    // 缓存实例
    this.engineInstances.set(type, engine)

    return engine
  }

  /**
   * 销毁指定类型的引擎实例
   * @param type 引擎类型
   */
  async destroyEngine(type: OCREngineType): Promise<void> {
    const engine = this.engineInstances.get(type)
    if (engine) {
      await engine.destroy()
      this.engineInstances.delete(type)
    }
  }

  /**
   * 销毁所有引擎实例
   */
  async destroyAll(): Promise<void> {
    const destroyPromises: Promise<void>[] = []

    for (const [type, engine] of this.engineInstances) {
      destroyPromises.push(engine.destroy())
    }

    await Promise.all(destroyPromises)
    this.engineInstances.clear()
  }

  /**
   * 获取引擎配置
   * @param type 引擎类型
   */
  getEngineConfig(type: OCREngineType): OCREngineConfig | undefined {
    return this.engineConfigs.find(config => config.type === type)
  }
}

// 创建全局单例
export const ocrEngineFactory = new OCREngineFactory()
