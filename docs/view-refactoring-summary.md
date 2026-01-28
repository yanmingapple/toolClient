# View 目录重构总结

## 重构完成

已成功重构 `src/view/` 目录结构，使其更加清晰和易于维护。

## 新的目录结构

```
src/view/
├── home/                    # 主页/工具面板（原 workspace）
│   └── index.vue           # 工具面板主页面
│
├── database/                # 数据库管理视图（工作区模式）
│   └── index.vue           # 数据库管理主界面
│
├── connection/              # 数据库连接管理模块（原 dataConnection）
│   └── index.vue           # 连接列表组件
│
└── monitor/                 # 服务监控模块（原 serviceMonitor）
    ├── index.vue           # 监控列表组件
    └── components/
        └── ServiceMonitorDlg.vue  # 监控对话框组件
```

## 变更说明

### 1. 重命名和重组
- `workspace/` → `home/`：更准确地反映这是主页/工具面板
- `dataConnection/` → `connection/`：更简洁的命名
- `serviceMonitor/` → `monitor/`：更简洁的命名

### 2. 导入路径更新
以下文件中的导入路径已更新：

**src/App.vue**
```typescript
// 旧路径
import ToolPanel from './view/workspace/index.vue'

// 新路径
import ToolPanel from './view/home/index.vue'
```

**src/view/home/index.vue**
```typescript
// 旧路径
import DataConnection from '../dataConnection/index.vue'
import ServiceMonitor from '../serviceMonitor/index.vue'

// 新路径
import DataConnection from '../connection/index.vue'
import ServiceMonitor from '../monitor/index.vue'
```

## 目录命名规则

1. **视图页面**（顶层目录）：
   - `home/`：主页/工具面板
   - `database/`：数据库管理视图

2. **功能模块**（可被多个视图复用）：
   - `connection/`：数据库连接管理
   - `monitor/`：服务监控

3. **组件**（模块内的子组件）：
   - 放在各自模块的 `components/` 目录下

## 优势

1. **命名更清晰**：`home` 比 `workspace` 更准确地表达了主页的含义
2. **结构更扁平**：减少了不必要的嵌套层级
3. **功能划分明确**：每个目录都有明确的职责
4. **易于扩展**：新功能可以按相同模式添加

## 后续建议

### 清理旧文件（可选）
在确认所有功能正常后，可以删除旧目录：
- `src/view/workspace/`
- `src/view/dataConnection/`
- `src/view/serviceMonitor/`

### 未来扩展
如果添加新功能模块，遵循相同的命名规则：
- 视图页面：使用功能名称（如 `query/`、`backup/`）
- 功能模块：使用简洁的名称（如 `settings/`、`export/`）

