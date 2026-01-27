# Electron 安装问题解决方案

## 问题描述

安装 Electron 时出现网络错误：
```
ReadError: The server aborted pending request
```

这通常是因为：
1. 网络连接不稳定
2. 下载服务器超时
3. 需要配置国内镜像源

## 解决方案

### 方案一：使用环境变量（推荐）

#### Windows PowerShell

```powershell
# 设置 Electron 镜像
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"

# 然后执行安装
cd app
yarn install
```

#### Windows CMD

```cmd
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
cd app
yarn install
```

#### Linux/macOS

```bash
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
cd app
yarn install
```

### 方案二：使用 .npmrc 文件（永久配置）

已在 `app/.npmrc` 文件中配置了镜像源，如果文件存在，Yarn 会自动使用。

如果还是失败，可以手动创建：

```bash
# 在 app 目录下创建 .npmrc 文件
cd app
echo electron_mirror=https://npmmirror.com/mirrors/electron/ > .npmrc
echo electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/ >> .npmrc
```

### 方案三：使用 Yarn 配置

```bash
# 设置 Yarn 镜像
yarn config set registry https://registry.npmmirror.com

# 设置 Electron 镜像
yarn config set electron_mirror https://npmmirror.com/mirrors/electron/
yarn config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 方案四：手动下载 Electron 二进制文件

如果网络问题持续，可以手动下载：

1. 查看需要的 Electron 版本：
   ```bash
   cd app
   cat package.json | grep electron
   ```

2. 从镜像站下载对应版本：
   - 访问：https://npmmirror.com/mirrors/electron/
   - 下载对应版本的压缩包
   - 解压到 `app/node_modules/electron/dist/` 目录

3. 或者使用命令行下载：
   ```bash
   # 设置镜像后重试
   $env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
   yarn install
   ```

### 方案五：清理缓存后重试

```bash
# 清理 Yarn 缓存
yarn cache clean

# 删除 node_modules 和 lock 文件
cd app
Remove-Item -Recurse -Force node_modules
Remove-Item yarn.lock

# 设置镜像后重新安装
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
yarn install
```

## 推荐的完整安装流程

```powershell
# 1. 进入 app 目录
cd F:\workspace\toolClient\dbgate-master\app

# 2. 设置 Electron 镜像（PowerShell）
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"

# 3. 清理旧的安装（如果存在）
if (Test-Path node_modules\electron) {
    Remove-Item -Recurse -Force node_modules\electron
}

# 4. 重新安装
yarn install
```

## 验证安装

安装成功后，检查：

```bash
# 检查 Electron 是否安装成功
cd app
node_modules\.bin\electron --version
```

应该显示 Electron 版本号，例如：`v38.6.0`

## 其他镜像源

如果淘宝镜像也慢，可以尝试：

1. **华为云镜像**：
   ```
   https://mirrors.huaweicloud.com/electron/
   ```

2. **腾讯云镜像**：
   ```
   https://mirrors.cloud.tencent.com/electron/
   ```

3. **官方源**（如果网络好）：
   ```
   https://github.com/electron/electron/releases/download/
   ```

## 常见问题

### Q: 设置镜像后还是失败？

A: 尝试：
1. 检查网络连接
2. 使用 VPN 或代理
3. 清理缓存后重试
4. 手动下载二进制文件

### Q: 如何永久设置镜像？

A: 
1. 在 `app/.npmrc` 文件中配置（已创建）
2. 或在系统环境变量中设置
3. 或在 Yarn 配置中设置

### Q: 安装后 Electron 还是找不到？

A: 检查：
1. `app/node_modules/electron/dist/electron.exe` 是否存在
2. 版本是否匹配 `package.json` 中的版本
3. 尝试重新安装：`yarn install --force`

## 快速修复命令（Windows PowerShell）

```powershell
cd F:\workspace\toolClient\dbgate-master\app
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
Remove-Item -Recurse -Force node_modules\electron -ErrorAction SilentlyContinue
yarn install
```

