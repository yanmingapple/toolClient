# Tesseract.js 语言文件目录

本目录用于存放 Tesseract OCR 引擎的语言数据文件。

## 语言文件说明

Tesseract.js 需要语言数据文件才能进行文字识别。这些文件包含了特定语言的训练数据。

## 如何下载语言文件

### 方法 1：自动下载（推荐）

首次使用 OCR 功能时，Tesseract.js 会自动从 GitHub 下载所需的语言文件到浏览器缓存中。

### 方法 2：手动下载（离线使用）

如果你需要离线使用或想将语言文件存放在本地，请按照以下步骤操作：

#### 1. 下载语言文件

从以下地址下载所需的语言文件：
- **GitHub 仓库**: https://github.com/tesseract-ocr/tessdata
- **官方镜像**: https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/

#### 2. 常用语言文件

| 语言 | 文件名 | 大小 | 说明 |
|------|--------|------|------|
| 中文简体 | `chi_sim.traineddata` | ~19MB | 简体中文 |
| 中文繁体 | `chi_tra.traineddata` | ~20MB | 繁体中文 |
| 英文 | `eng.traineddata` | ~4.5MB | 英语 |
| 日文 | `jpn.traineddata` | ~16MB | 日语 |
| 韩文 | `kor.traineddata` | ~18MB | 韩语 |
| 多语言 | `osd.traineddata` | ~1MB | 方向和脚本检测 |

#### 3. 下载命令示例

使用 PowerShell 下载：

```powershell
# 下载中文简体
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/chi_sim.traineddata" -OutFile "chi_sim.traineddata"

# 下载英文
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/eng.traineddata" -OutFile "eng.traineddata"

# 下载多语言检测
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/osd.traineddata" -OutFile "osd.traineddata"
```

#### 4. 放置位置

将下载的 `.traineddata` 文件直接放在本目录（`public/tessdata/`）中。

## 目录结构

```
public/
└── tessdata/
    ├── README.md                 # 本说明文件
    ├── worker.min.js             # Tesseract Worker 脚本（已下载）
    ├── tesseract-core.wasm.js    # Tesseract 核心 WASM 文件（已下载）
    ├── chi_sim.traineddata       # 中文简体语言文件（需下载）
    ├── eng.traineddata           # 英文语言文件（需下载）
    ├── jpn.traineddata           # 日文语言文件（需下载）
    ├── kor.traineddata           # 韩文语言文件（需下载）
    └── osd.traineddata           # 方向检测语言文件（需下载）
```

## 配置 OCR 使用本地文件

OCR 组件已经配置为完全使用本地文件，避免 CSP 安全策略问题。代码位置：

`src/view/orc/index.vue`

```typescript
const worker = await createWorker(
  selectedLanguage.value,
  1,
  {
    logger: (m) => {
      // 日志处理
    },
    // 使用本地 Worker 脚本
    workerPath: '/tessdata/worker.min.js',
    // 使用本地语言文件路径
    langPath: '/tessdata/',
    // 使用本地核心 WASM 文件
    corePath: '/tessdata/tesseract-core.wasm.js'
  }
)
```

### 已包含的核心文件

1. **worker.min.js** (~500KB)
   - Tesseract.js 的 Web Worker 脚本
   - 负责在后台线程执行 OCR 识别
   - 已下载，无需额外操作

2. **tesseract-core.wasm.js** (~2.5MB)
   - Tesseract OCR 引擎的 WebAssembly 版本
   - 包含核心识别算法
   - 已下载，无需额外操作

## 语言文件大小说明

- **小语言包**（< 10MB）：英文、法文、德文等
- **中语言包**（10-20MB）：中文、日文、韩文等
- **大语言包**（> 20MB）：阿拉伯文、印度语等

建议只下载你需要使用的语言文件，以减少存储空间占用。

## 更新语言文件

语言文件会定期更新以提高识别准确率。如需更新：

1. 删除旧的 `.traineddata` 文件
2. 重新下载最新版本
3. 清除浏览器缓存

## 故障排除

### Q: OCR 无法识别文字

A: 请检查：
1. 语言文件是否已下载并放置在正确位置
2. 语言选择是否正确
3. 图片质量是否清晰

### Q: 首次使用速度很慢

A: 首次使用需要下载语言文件，请确保网络连接正常。下载完成后会缓存到本地。

### Q: 离线使用时出错

A: 请确保已下载所需的语言文件并放置在本目录中。

## 相关链接

- Tesseract OCR 官方网站: https://github.com/tesseract-ocr/tesseract
- Tesseract.js GitHub: https://github.com/naptha/tesseract.js
- 语言文件下载: https://github.com/tesseract-ocr/tessdata

## 备注

- 语言文件版权归 Tesseract OCR 项目所有
- 请根据你的需求下载相应的语言文件
- 建议保留本说明文件以便日后参考
