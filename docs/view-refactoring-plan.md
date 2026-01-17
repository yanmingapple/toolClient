# View 目录重构方案

## 当前结构问题分析

1. **命名混乱**：
   - `workspace` 实际是工具面板/主页，不是工作区
   - `database` 是数据库管理视图，可以理解为工作区模式
   - `dataConnection` 是组件而不是视图

2. **层级不清**：
   - `dataConnection` 被 `workspace` 引用，应该是组件而不是视图
   - `serviceMonitor` 同时作为独立视图和被引用的组件

3. **功能划分不明确**：
   - 工具面板、数据库连接、服务监控混合在一起

## 推荐的新结构

```
src/view/
├── home/                    # 主页/工具面板（原 workspace）
│   └── index.vue           # 工具面板主页面
│
├── database/                # 数据库管理视图（工作区模式）
│   └── index.vue           # 数据库管理主界面
│
└── modules/                 # 功能模块（可被多个视图复用）
    ├── connection/          # 数据库连接管理模块
    │   ├── index.vue       # 连接列表组件（原 dataConnection）
    │   ├── components/     # 连接相关子组件
    │   └── dialogs/        # 连接相关对话框
    │
    └── monitor/             # 服务监控模块
        ├── index.vue       # 监控列表组件（原 serviceMonitor）
        ├── components/     # 监控相关子组件
        │   └── ServiceMonitorDlg.vue
        └── dialogs/        # 监控相关对话框
```

## 重构步骤

### 步骤 1: 创建新目录结构

1. 创建 `src/view/home/` 目录
2. 创建 `src/view/modules/` 目录
3. 创建 `src/view/modules/connection/` 目录
4. 创建 `src/view/modules/monitor/` 目录

### 步骤 2: 移动文件

1. `workspace/index.vue` → `home/index.vue`
2. `dataConnection/index.vue` → `modules/connection/index.vue`
3. `serviceMonitor/` → `modules/monitor/`

### 步骤 3: 更新导入路径

需要更新以下文件中的导入：
- `src/App.vue`
- `src/view/home/index.vue`
- 其他引用这些组件的文件

## 替代方案（更扁平的结构）

如果不想使用 `modules` 子目录，也可以采用更扁平的结构：

```
src/view/
├── home/                    # 主页/工具面板
│   └── index.vue
│
├── database/                # 数据库管理视图
│   └── index.vue
│
├── connection/              # 数据库连接模块
│   └── index.vue
│
└── monitor/                 # 服务监控模块
    ├── index.vue
    └── components/
        └── ServiceMonitorDlg.vue
```

## 推荐方案

建议采用 **替代方案（扁平结构）**，因为：
1. 更简洁，减少目录层级
2. 每个功能模块都是独立的视图/组件
3. 便于后续扩展和维护

