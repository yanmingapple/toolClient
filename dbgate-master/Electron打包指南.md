# DbGate Electron 应用打包指南

## 一、打包工具

DbGate 使用 **electron-builder** 进行打包，支持 Windows、macOS 和 Linux 平台。

## 二、Windows 平台打包

### 1. 完整打包流程（推荐）

```bash
# 在项目根目录执行
cd F:\workspace\toolClient\dbgate-master

# 1. 构建库文件
yarn build:lib

# 2. 构建插件前端文件
yarn build:plugins:frontend

# 3. 构建 API 和 Web
yarn build:api
yarn build:web

# 4. 复制插件到 dist
yarn plugins:copydist

# 5. 进入 app 目录并打包
cd app
yarn install
yarn dist
```

### 2. 一键打包（使用根目录脚本）

```bash
# 在项目根目录执行
yarn build:app
```

这个命令会：
- 复制插件到 dist
- 安装 app 依赖
- 构建 API、Web 和打包 Electron 应用

### 3. 打包输出

打包完成后，安装程序会在以下目录：

```
dbgate-master/app/dist/
├── dbgate-7.0.0-alpha.1-win_x64.exe  # NSIS 安装程序
├── dbgate-7.0.0-alpha.1-win_x64.zip  # 便携版压缩包
└── win-unpacked/                      # 未打包的应用文件夹
```

### 4. Windows 打包配置

在 `app/package.json` 中的配置：

```json
"win": {
  "target": [
    {
      "target": "nsis",      // NSIS 安装程序
      "arch": ["x64", "arm64"]
    },
    {
      "target": "zip",       // 便携版
      "arch": ["x64", "arm64"]
    }
  ],
  "icon": "icon.ico"
}
```

## 三、macOS 平台打包

### 1. 打包命令

```bash
# 在 macOS 系统上执行
cd app
yarn dist
```

### 2. 打包输出

```
app/dist/
├── dbgate-7.0.0-alpha.1-mac_universal.dmg  # 通用版本（Intel + Apple Silicon）
├── dbgate-7.0.0-alpha.1-mac_x64.dmg       # Intel 版本
├── dbgate-7.0.0-alpha.1-mac_arm64.dmg      # Apple Silicon 版本
└── mac/
```

### 3. macOS 打包配置

```json
"mac": {
  "category": "database",
  "icon": "icon512-mac.png",
  "hardenedRuntime": true,
  "entitlements": "entitlements.mac.plist",
  "target": {
    "target": "default",
    "arch": ["universal", "x64", "arm64"]
  },
  "notarize": true  // 需要 Apple 开发者证书
}
```

## 四、Linux 平台打包

### 1. 打包命令

```bash
# 在 Linux 系统上执行
cd app
yarn dist
```

### 2. 打包输出

```
app/dist/
├── dbgate-7.0.0-alpha.1-amd64.deb     # Debian/Ubuntu 安装包
├── dbgate-7.0.0-alpha.1-x86_64.AppImage # AppImage 格式
├── dbgate-7.0.0-alpha.1-x86_64.snap    # Snap 包
├── dbgate-7.0.0-alpha.1-x86_64.tar.gz  # 压缩包
└── linux-unpacked/
```

### 3. Linux 打包配置

```json
"linux": {
  "target": [
    "deb",        // Debian/Ubuntu
    "snap",       // Snap 包
    {
      "target": "AppImage",
      "arch": ["x64", "arm64"]
    },
    "tar.gz"      // 压缩包
  ],
  "icon": "icons/",
  "category": "Development"
}
```

## 五、打包配置说明

### 1. 应用信息

在 `app/package.json` 的 `build` 字段中：

```json
{
  "appId": "org.dbgate",           // 应用唯一标识
  "productName": "DbGate",          // 产品名称
  "artifactName": "dbgate-${version}-${os}_${arch}.${ext}"  // 输出文件名格式
}
```

### 2. 包含的文件

```json
"files": [
  "packages",      // API 和 Web 构建后的文件
  "src",           // Electron 主进程代码
  "icon.png",      // 应用图标
  "!node_modules/cpu-features/build/**"  // 排除某些文件
]
```

### 3. 打包前准备（predist）

`app/package.json` 中的 `predist` 脚本会：

```bash
# 复制 API 构建文件到 packages 目录
copyfiles ../packages/api/dist/* packages

# 复制 Web 构建文件到 packages 目录
copyfiles "../packages/web/public/*" packages
copyfiles "../packages/web/public/**/*" packages

# 复制插件到 packages/plugins 目录
copyfiles --up 3 "../plugins/dist/**/*" packages/plugins
```

## 六、本地打包（不发布）

### 1. 本地打包命令

```bash
cd app
yarn build:local
```

这会执行：
- `predist`：复制文件
- `dist`：打包但不发布

### 2. 与完整打包的区别

- `yarn build`：完整构建 + 打包（用于发布）
- `yarn build:local`：构建 API/Web + 准备文件（不执行打包，需要手动执行 `yarn dist`）

## 七、打包选项

### 1. 只打包特定平台

```bash
# Windows
yarn dist --win

# macOS
yarn dist --mac

# Linux
yarn dist --linux
```

### 2. 只打包特定架构

```bash
# 64位
yarn dist --x64

# ARM64
yarn dist --arm64
```

### 3. 打包但不发布

```bash
yarn dist --publish never
```

### 4. 清理后打包

```bash
yarn dist --clean
```

## 八、常见问题

### 问题1：打包失败 - 缺少依赖

**解决**：
```bash
cd app
yarn install
yarn rebuild  # 重新构建原生模块
```

### 问题2：打包失败 - 文件未找到

**解决**：
```bash
# 确保先构建了所有必要的文件
yarn build:lib
yarn build:plugins:frontend
yarn build:api
yarn build:web
yarn plugins:copydist
```

### 问题3：Windows 打包 - 图标问题

**解决**：
- 确保 `app/icon.ico` 文件存在
- 图标应该是多尺寸的 ICO 文件（16x16, 32x32, 48x48, 256x256）

### 问题4：macOS 打包 - 代码签名

**解决**：
- 需要 Apple 开发者证书
- 设置环境变量：
  ```bash
  export APPLE_ID="your@email.com"
  export APPLE_APP_SPECIFIC_PASSWORD="your-password"
  ```

### 问题5：打包文件过大

**解决**：
- 检查 `files` 配置，排除不必要的文件
- 使用 `asar` 打包（默认启用）
- 检查 `node_modules` 是否包含不必要的依赖

## 九、完整打包流程示例（Windows）

```bash
# 1. 进入项目根目录
cd F:\workspace\toolClient\dbgate-master

# 2. 安装依赖（如果还没安装）
yarn

# 3. 构建库文件
yarn build:lib

# 4. 构建插件
yarn build:plugins:frontend
yarn build:plugins:backend

# 5. 构建 API 和 Web
yarn build:api
yarn build:web

# 6. 复制插件
yarn plugins:copydist

# 7. 进入 app 目录
cd app

# 8. 安装 app 依赖
yarn install

# 9. 打包 Electron 应用
yarn dist

# 10. 打包完成后，安装程序在 app/dist/ 目录
```

## 十、验证打包结果

### 1. 检查输出文件

```bash
# Windows
dir app\dist\*.exe
dir app\dist\*.zip

# macOS/Linux
ls -lh app/dist/
```

### 2. 测试安装程序

- **Windows**：双击 `.exe` 文件安装
- **macOS**：双击 `.dmg` 文件挂载并安装
- **Linux**：使用包管理器安装 `.deb` 或运行 `.AppImage`

### 3. 测试应用

安装后运行应用，检查：
- 应用是否能正常启动
- 功能是否正常
- 插件是否加载
- 数据库连接是否正常

## 十一、发布配置

### 1. GitHub Releases

配置在 `app/package.json` 中：

```json
"publish": [
  {
    "provider": "github",
    "owner": "dbgate",
    "repo": "dbgate"
  }
]
```

### 2. 发布命令

```bash
# 打包并发布到 GitHub Releases
yarn dist --publish always
```

需要设置环境变量：
```bash
export GH_TOKEN="your-github-token"
```

## 十二、打包优化建议

1. **减小体积**：
   - 使用 `asar` 打包（默认启用）
   - 排除开发依赖
   - 压缩资源文件

2. **提升性能**：
   - 启用代码分割
   - 优化图片资源
   - 使用 CDN 加载大型库

3. **安全性**：
   - 代码签名（Windows/macOS）
   - 启用自动更新
   - 验证文件完整性

## 十三、快速参考

### 常用命令

```bash
# 完整构建和打包
yarn build:app

# 仅打包（需要先构建）
cd app && yarn dist

# 本地打包（不发布）
cd app && yarn build:local

# 清理并打包
cd app && yarn dist --clean

# 只打包 Windows
cd app && yarn dist --win

# 只打包 64位
cd app && yarn dist --x64
```

### 输出目录

- **Windows**：`app/dist/dbgate-*-win_x64.exe`
- **macOS**：`app/dist/dbgate-*-mac_*.dmg`
- **Linux**：`app/dist/dbgate-*-amd64.deb`

