# DbGate 集成构建指南

## 概述

本项目集成了 dbgate 数据库管理工具。由于 dbgate 有自己的目录结构，在打包时需要特殊处理。

## 目录结构

### 开发环境
```
toolClient/
├── dist/                    # 编译输出
│   ├── electron/           # Electron 主进程代码
│   └── dbgate-master/      # 复制过来的 dbgate 文件（构建后）
├── dbgate-master/          # dbgate 源码
│   ├── packages/
│   │   ├── api/dist/       # API bundle
│   │   └── web/            # Web 源码
│   ├── app/
│   │   └── packages/        # app 打包后的文件
│   │       ├── api/dist/   # API bundle（app 打包后）
│   │       ├── web/public/ # Web 构建文件（app 打包后）
│   │       └── plugins/    # 插件（app 打包后）
│   └── plugins/            # 插件源码
└── electron/
    └── service/
        └── dbgateWindowService.ts
```

### 生产环境（打包后）
```
resources/
└── app/
    ├── electron/
    │   └── service/
    │       └── dbgateWindowService.js
    └── dbgate-master/       # 从 asar 解包出来
        ├── packages/api/dist/
        ├── app/packages/
        └── plugins/
```

## 构建流程

### 1. 开发环境构建

```bash
# 构建主进程和渲染进程
npm run build

# 这会自动执行：
# 1. npm run build:main      # 编译 TypeScript
# 2. npm run build:renderer  # 构建 Vue 应用
# 3. npm run copy:dbgate     # 复制 dbgate 文件到 dist
```

### 2. 生产环境打包

```bash
# 完整打包流程
npm run build:app

# 这会执行：
# 1. npm run build           # 构建所有代码
# 2. electron-builder        # 打包 Electron 应用
```

## 路径查找逻辑

`dbgateWindowService.ts` 中的 `findDbgatePath()` 函数会智能查找 dbgate 文件：

1. **开发环境**：
   - 从 `dist/electron/service` 向上三级到项目根目录
   - 查找 `dbgate-master/` 或 `dist/dbgate-master/`

2. **生产环境**：
   - 从 `resources/app/electron/service` 向上查找
   - 从 `process.resourcesPath` 查找
   - 从 `app.getAppPath()` 查找

3. **支持的路径模式**：
   - `{root}/dbgate-master/{relativePath}`
   - `{root}/dist/dbgate-master/{relativePath}`
   - `{root}/dbgate-master/app/{relativePath}`

## 关键文件

### 1. 构建脚本
- `scripts/copy-dbgate-files.js` - 复制 dbgate 文件到 dist

### 2. 配置文件
- `package.json` - 构建脚本和 electron-builder 配置
- `electron/service/dbgateWindowService.ts` - dbgate 窗口服务

### 3. Electron Builder 配置

```json
{
  "files": [
    "dist/**/*",
    "dbgate-master/packages/api/dist/**/*",
    "dbgate-master/app/packages/**/*",
    "dbgate-master/plugins/**/*"
  ],
  "asarUnpack": [
    "**/*.node",
    "dbgate-master/**/*"
  ]
}
```

**重要**：`dbgate-master/**/*` 必须放在 `asarUnpack` 中，因为：
- dbgate API 需要动态加载插件
- 插件文件需要可执行
- 某些文件路径解析可能不兼容 asar

## 验证构建

### 开发环境验证

```bash
# 1. 构建
npm run build

# 2. 检查 dist 目录
ls dist/dbgate-master/
# 应该看到：
# - packages/api/dist/bundle.js
# - app/packages/web/public/index.html
# - plugins/

# 3. 运行应用
npm start
```

### 生产环境验证

```bash
# 1. 打包
npm run build:app

# 2. 检查打包输出
# Windows: release/${version}/win-unpacked/
# 应该看到 resources/app.asar.unpacked/dbgate-master/
```

## 常见问题

### 1. 找不到 dbgate 文件

**症状**：`Dbgate files not found. Please build dbgate first.`

**解决**：
- 确保运行了 `npm run build`（会自动复制文件）
- 检查 `dist/dbgate-master/` 目录是否存在
- 检查 `dbgate-master/app/packages/web/public/index.html` 是否存在

### 2. 插件加载失败

**症状**：`ENOENT: no such file or directory, scandir '...plugins'`

**解决**：
- 确保 `IS_NPM_DIST = true` 已设置
- 确保 `PLUGINS_DIR` 指向正确的路径
- 检查 `dbgate-master/plugins/` 目录是否存在

### 3. IPC 处理程序未注册

**症状**：`No handler registered for 'config-get'`

**解决**：
- 确保在创建窗口之后调用 `useAllControllers`
- 检查 electron 对象是否正确传递
- 查看控制台日志确认初始化成功

## 注意事项

1. **开发环境**：dbgate 文件在 `dbgate-master/` 目录，构建后复制到 `dist/dbgate-master/`
2. **生产环境**：dbgate 文件必须从 asar 解包（`asarUnpack`）
3. **路径解析**：使用 `findDbgatePath()` 智能查找，支持多种路径模式
4. **插件目录**：必须设置 `IS_NPM_DIST = true` 并使用 `PLUGINS_DIR`

