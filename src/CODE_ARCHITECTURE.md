# 代码架构规划文档

## 1. 功能模块分析

通过对App.tsx的分析，识别出以下核心功能模块：

| 功能模块 | 主要职责 | 代码位置 |
|---------|---------|---------|
| 应用布局 | 整体页面结构、布局管理 | App.tsx 441-499行 |
| 头部导航 | 操作按钮栏、功能入口 | App.tsx 443-458行 |
| 连接树形菜单 | 数据库连接、数据库、表的树形展示与交互 | App.tsx 80-222行，259-432行 |
| 连接管理 | 连接创建、测试、状态管理 | App.tsx 298-347行，349-362行 |
| 数据库操作 | 数据库列表加载、表列表加载 | App.tsx 399行，417行 |
| 连接对话框 | 新建/编辑连接配置 | 现有组件 ConnectionDialog |
| 查询编辑器 | SQL查询编辑与执行 | 现有组件 QueryEditor |
| IPC通信 | 与Electron主进程通信 | App.tsx 32-60行 |
| 工具函数 | 数据库图标获取、树形数据生成等 | App.tsx 75-80行，80-222行 |

## 2. 代码组织结构规划

### 2.1 组件拆分方案

将集中在App.tsx中的UI组件拆分为独立的功能组件：

| 组件名称 | 职责 | 文件位置 |
|---------|------|---------|
| App | 应用主入口，整体布局容器 | src/App.tsx |
| HeaderBar | 顶部导航栏，包含操作按钮 | src/components/HeaderBar/index.tsx |
| ConnectionTree | 左侧连接树形菜单 | src/components/ConnectionTree/index.tsx |
| AppLayout | 应用整体布局结构 | src/components/AppLayout/index.tsx |
| ConnectionDialog | 新建/编辑连接对话框 | src/components/ConnectionDialog/index.tsx (保留现有) |
| QueryEditor | SQL查询编辑器 | src/components/QueryEditor/index.tsx (保留现有) |

### 2.2 逻辑与状态拆分方案

将业务逻辑从UI组件中分离，使用自定义Hooks管理：

| Hook名称 | 职责 | 文件位置 |
|---------|------|---------|
| useConnection | 管理连接相关操作与状态 | src/hooks/useConnection.ts |
| useTreeData | 管理树形菜单数据与操作 | src/hooks/useTreeData.ts |
| useDatabaseOperations | 管理数据库和表的操作 | src/hooks/useDatabaseOperations.ts |
| useIpcCommunication | 管理Electron IPC通信 | src/hooks/useIpcCommunication.ts |

### 2.3 工具函数拆分方案

将通用工具函数提取到独立文件：

| 工具函数集合 | 职责 | 文件位置 |
|------------|------|---------|
| treeUtils | 树形数据处理相关工具 | src/utils/treeUtils.ts |
| connectionUtils | 连接管理相关工具 | src/utils/connectionUtils.ts |
| electronUtils | Electron相关工具 | src/utils/electronUtils.ts |

### 2.4 现有文件保留

- 状态管理：src/store/connectionStore.ts (保留现有)
- 类型定义：src/types/connection.ts、src/types/tree.ts (保留现有)
- 图标组件：src/icons/index.ts (保留现有)

## 3. 最终文件结构

```
src/
├── App.tsx                    # 应用主入口
├── App.css                    # 全局样式
├── CODE_ARCHITECTURE.md       # 代码架构规划文档
├── components/                # UI组件目录
│   ├── AppLayout/            # 应用布局组件
│   │   ├── index.tsx
│   │   └── styles.css
│   ├── HeaderBar/            # 顶部导航栏
│   │   ├── index.tsx
│   │   └── styles.css
│   ├── ConnectionTree/       # 连接树形菜单
│   │   ├── index.tsx
│   │   └── styles.css
│   ├── ConnectionDialog/     # 连接对话框 (现有)
│   │   ├── index.tsx
│   │   └── styles.css
│   └── QueryEditor/          # 查询编辑器 (现有)
│       ├── index.tsx
│       └── styles.css
├── hooks/                    # 自定义Hooks
│   ├── useConnection.ts      # 连接管理Hook
│   ├── useTreeData.ts        # 树形数据Hook
│   ├── useDatabaseOperations.ts  # 数据库操作Hook
│   └── useIpcCommunication.ts    # IPC通信Hook
├── store/                    # 状态管理 (现有)
│   └── connectionStore.ts
├── types/                    # 类型定义 (现有)
│   ├── connection.ts
│   └── tree.ts
├── utils/                    # 工具函数
│   ├── treeUtils.ts          # 树形数据工具
│   ├── connectionUtils.ts    # 连接工具
│   └── electronUtils.ts      # Electron工具
└── icons/                    # 图标组件 (现有)
    └── index.ts
```

## 4. 代码拆分优势

1. **提高可维护性**：代码按功能模块化，职责清晰，便于维护和扩展
2. **增强可读性**：每个文件专注于单一功能，代码量减少，易于理解
3. **便于测试**：模块间解耦，可独立测试每个组件和功能
4. **团队协作**：明确的文件结构和职责划分，便于团队成员并行开发
5. **性能优化**：支持按需加载，减少初始加载时间

## 5. 实施步骤

1. 创建代码规划文档记录方案
2. 创建组件目录结构
3. 创建hooks目录结构
4. 创建utils目录结构
5. 实现HeaderBar组件
6. 实现ConnectionTree组件
7. 实现AppLayout组件
8. 实现useConnection hook
9. 实现useTreeData hook
10. 实现useDatabaseOperations hook
11. 实现useIpcCommunication hook
12. 实现treeUtils工具函数
13. 实现connectionUtils工具函数
14. 实现electronUtils工具函数
15. 重构App.tsx整合所有组件和hooks
16. 测试应用功能确保正常运行