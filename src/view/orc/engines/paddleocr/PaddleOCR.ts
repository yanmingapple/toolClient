import * as ort from 'onnxruntime-web';
import type { OCRResult, OCRLine } from '../types/ocr';

/**
 * PaddleOCR 前端实现
 * 使用 ONNX Runtime Web 运行 PaddleOCR ONNX 模型
 */
export class PaddleOCR {
  private detSession: ort.InferenceSession | null = null;
  private recSession: ort.InferenceSession | null = null;
  private clsSession: ort.InferenceSession | null = null;
  private recDict: string[] = [];
  private initialized = false;



  // 模型配置 - 使用相对路径，从 public 目录开始
  private config = {
    detModelPath: '/model/ocr/PP-OCRv5_mobile_det_infer/PP-OCRv5_mobile_det_infer.onnx',
    recModelPath: '/model/ocr/PP-OCRv5_mobile_rec_infer/PP-OCRv5_mobile_rec_infer.onnx',
    clsModelPath: '/model/ocr/ch_ppocr_mobile_v2.0_cls/ch_ppocr_mobile_v2.0_cls.onnx'
  };


  // 预处理参数
  private detConfig = {
    inputSize: [640, 640],
    threshold: 0.3,
    nmsThreshold: 0.4,
  };

  private recConfig = {
    inputSize: [3, 48, 320],
  };

  /**
   * 初始化 OCR 引擎
   * 加载检测、识别、分类模型和字典
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    ort.env.wasm.wasmPaths = {
      'ort-wasm.wasm': './ort-wasm.wasm',
      'ort-wasm-simd.wasm': './ort-wasm-simd.wasm',
      'ort-wasm-threaded.wasm': './ort-wasm-threaded.wasm'
    }

    console.log('Initializing PaddleOCR...');

    try {
      // 配置 ONNX Runtime 全局设置
      console.log('Configuring ONNX Runtime...');


      // 并行加载模型
      const [detSession, recSession, clsSession] = await Promise.all([
        this.loadModel(this.config.detModelPath),
        this.loadModel(this.config.recModelPath),
        this.loadModel(this.config.clsModelPath)
      ]);

      this.detSession = detSession;
      this.recSession = recSession;
      this.clsSession = clsSession;
      this.initialized = true;

      console.log('PaddleOCR initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize PaddleOCR:', error);
      throw error;
    }
  }

  /**
   * 加载 ONNX 模型 - 带后端自动降级
   */
  private async loadModel(path: string): Promise<ort.InferenceSession> {
    console.log(`Loading model: ${path}`);

    // 使用 onnxruntime-web 1.23.2 支持的后端顺序
    const backends = ['webgl', 'wasm', 'cpu'];

    for (const backend of backends) {
      try {
        console.log(`尝试使用 ${backend} 后端...`);

        const session = await ort.InferenceSession.create(path, {
          executionProviders: [backend],
          graphOptimizationLevel: 'all',
          executionMode: 'sequential',
        });

        console.log(`✅ 成功使用 ${backend} 后端加载模型`);
        return session;
      } catch (error) {
        console.warn(`❌ ${backend} 后端失败:`, (error as Error).message);
        continue;
      }
    }

    throw new Error('所有后端都失败，无法加载模型');
  }


  /**
   * 运行 OCR 识别
   * @param imageData - ImageData 对象
   * @returns OCR 识别结果
   */
  async recognize(imageData: ImageData): Promise<OCRResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Running OCR recognition...');
    const startTime = performance.now();

    try {
      // 1. 文本检测
      const boxes = await this.detectText(imageData);
      console.log(`Detected ${boxes.length} text boxes`);

      // 2. 文本识别
      const lines: OCRLine[] = [];
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const croppedImage = this.cropImage(imageData, box);

        // 方向分类
        const { angle, score } = await this.classifyOrientation(croppedImage);
        if (angle === 180 && score > 0.5) {
          // 如果是倒转的，旋转180度
          // 这里简化处理，实际需要实现旋转
        }

        // 文本识别
        const { text, confidence } = await this.recognizeText(croppedImage);

        if (text && confidence > 0.5) {
          lines.push({
            text,
            confidence,
            box: box.map(p => ({ x: p[0], y: p[1] })),
            angle,
          });
        }
      }

      const endTime = performance.now();
      console.log(`OCR completed in ${endTime - startTime}ms`);

      return {
        lines,
        totalTime: endTime - startTime,
        lineCount: lines.length,
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw error;
    }
  }

  /**
   * 文本检测
   */
  private async detectText(imageData: ImageData): Promise<number[][][]> {
    if (!this.detSession) throw new Error('Detection model not loaded');

    // 预处理图像
    const input = this.preprocessDetect(imageData);

    // 运行模型
    const feeds = { x: input };
    const results = await this.detSession.run(feeds);

    // 后处理
    const pred = results['fetch_name_0'] as ort.Tensor;
    return this.postprocessDetect(pred);
  }

  /**
   * 检测模型预处理
   */
  private preprocessDetect(imageData: ImageData): ort.Tensor {
    const { width, height, data } = imageData;
    const [targetWidth, targetHeight] = this.detConfig.inputSize;

    // 调整大小（简化实现，实际需要保持比例并填充）
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      this.imageDataToImage(imageData),
      0, 0, width, height,
      0, 0, targetWidth, targetHeight
    );

    // 获取像素数据
    const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

    // 转换为 CHW 格式并归一化
    const float32Data = new Float32Array(3 * targetHeight * targetWidth);
    for (let i = 0; i < targetHeight * targetWidth; i++) {
      float32Data[i] = resizedData[i * 4] / 255.0;         // R
      float32Data[i + targetHeight * targetWidth] = resizedData[i * 4 + 1] / 255.0; // G
      float32Data[i + 2 * targetHeight * targetWidth] = resizedData[i * 4 + 2] / 255.0; // B
    }

    return new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]);
  }

  /**
   * 检测模型后处理
   */
  private postprocessDetect(pred: ort.Tensor): number[][][] {
    const boxes: number[][][] = [];
    const [batch, channels, height, width] = pred.dims;
    const data = pred.data as Float32Array;

    // 简化的后处理实现
    // 实际需要使用 DB 后处理算法
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = y * width + x;
        if (data[idx] > this.detConfig.threshold) {
          // 创建一个简化的文本框
          const scaleX = width / this.detConfig.inputSize[0];
          const scaleY = height / this.detConfig.inputSize[1];
          boxes.push([
            [x * 2 * scaleX, y * 2 * scaleY],
            [x * 2 * scaleX + 20, y * 2 * scaleY],
            [x * 2 * scaleX + 20, y * 2 * scaleY + 20],
            [x * 2 * scaleX, y * 2 * scaleY + 20],
          ]);
        }
      }
    }

    return boxes;
  }

  /**
   * 方向分类
   */
  private async classifyOrientation(imageData: ImageData): Promise<{ angle: number; score: number }> {
    if (!this.clsSession) return { angle: 0, score: 1 };

    // 预处理
    const input = this.preprocessClassify(imageData);

    // 运行模型
    const feeds = { x: input };
    const results = await this.clsSession.run(feeds);

    // 后处理
    const pred = results['softmax_0.tmp_0'] as ort.Tensor;
    const data = pred.data as Float32Array;
    const angle = data[1] > data[0] ? 180 : 0;
    const score = Math.max(data[0], data[1]);

    return { angle, score };
  }

  /**
   * 分类模型预处理
   */
  private preprocessClassify(imageData: ImageData): ort.Tensor {
    const { width, height } = imageData;
    const [channels, targetHeight, targetWidth] = this.recConfig.inputSize;

    // 调整大小
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      this.imageDataToImage(imageData),
      0, 0, width, height,
      0, 0, targetWidth, targetHeight
    );

    // 获取像素数据
    const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

    // 转换为 CHW 格式并归一化
    const float32Data = new Float32Array(3 * targetHeight * targetWidth);
    const mean = [0.5, 0.5, 0.5];
    const std = [0.5, 0.5, 0.5];

    for (let i = 0; i < targetHeight * targetWidth; i++) {
      float32Data[i] = (resizedData[i * 4] / 255.0 - mean[0]) / std[0];
      float32Data[i + targetHeight * targetWidth] = (resizedData[i * 4 + 1] / 255.0 - mean[1]) / std[1];
      float32Data[i + 2 * targetHeight * targetWidth] = (resizedData[i * 4 + 2] / 255.0 - mean[2]) / std[2];
    }

    return new ort.Tensor('float32', float32Data, [1, channels, targetHeight, targetWidth]);
  }

  /**
   * 文本识别
   */
  private async recognizeText(imageData: ImageData): Promise<{ text: string; confidence: number }> {
    if (!this.recSession) throw new Error('Recognition model not loaded');

    // 预处理
    const input = this.preprocessRecognize(imageData);

    // 运行模型
    const feeds = { x: input };
    const results = await this.recSession.run(feeds);

    // 后处理
    const pred = results['transpose_0.tmp_0'] as ort.Tensor;
    return this.postprocessRecognize(pred);
  }

  /**
   * 识别模型预处理
   */
  private preprocessRecognize(imageData: ImageData): ort.Tensor {
    return this.preprocessClassify(imageData); // 与分类预处理相同
  }

  /**
   * 识别模型后处理
   */
  private postprocessRecognize(pred: ort.Tensor): { text: string; confidence: number } {
    const [batch, channels, seqLen, vocabSize] = pred.dims;
    const data = pred.data as Float32Array;

    let text = '';
    let maxConfidence = 0;
    let prevIndex = -1;

    for (let i = 0; i < seqLen; i++) {
      let maxVal = -Infinity;
      let maxIdx = 0;

      for (let j = 0; j < vocabSize; j++) {
        const val = data[i * vocabSize + j];
        if (val > maxVal) {
          maxVal = val;
          maxIdx = j;
        }
      }

      // CTC 解码：跳过重复和空白
      if (maxIdx !== 0 && maxIdx !== prevIndex) {
        if (maxIdx < this.recDict.length) {
          text += this.recDict[maxIdx];
        }
        maxConfidence = Math.max(maxConfidence, maxVal);
      }
      prevIndex = maxIdx;
    }

    return { text, confidence: maxConfidence };
  }

  /**
   * 裁剪图像区域
   */
  private cropImage(imageData: ImageData, box: number[][]): ImageData {
    // 计算边界框
    const xs = box.map(p => p[0]);
    const ys = box.map(p => p[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs)));
    const minY = Math.max(0, Math.floor(Math.min(...ys)));
    const maxX = Math.min(imageData.width, Math.ceil(Math.max(...xs)));
    const maxY = Math.min(imageData.height, Math.ceil(Math.max(...ys)));

    const width = maxX - minX;
    const height = maxY - minY;

    if (width <= 0 || height <= 0) {
      return new ImageData(1, 1);
    }

    // 创建裁剪后的图像
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, -minX, -minY);

    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * ImageData 转换为 Image
   */
  private imageDataToImage(imageData: ImageData): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    if (this.detSession) {
      await this.detSession.end();
      this.detSession = null;
    }
    if (this.recSession) {
      await this.recSession.end();
      this.recSession = null;
    }
    if (this.clsSession) {
      await this.clsSession.end();
      this.clsSession = null;
    }
    this.initialized = false;
  }
}

// 单例导出
export const paddleOCR = new PaddleOCR();
