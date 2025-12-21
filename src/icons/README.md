# 图标使用规范

## 目录结构
```
/src/icons/
├── svg/                # SVG图标文件目录
├── Icon.tsx           # 图标组件
├── index.ts           # 入口文件
├── svg.d.ts           # SVG类型声明
├── types.ts           # 图标类型定义
└── README.md          # 此文档
```

## 图标命名规范

### 数据库类型图标
- MySQL: `mysql.svg`
- PostgreSQL: `postgresql.svg`
- MongoDB: `mongodb.svg`
- Redis: `redis.svg`
- SQL Server: `sqlserver.svg`
- SQLite: `sqlite.svg`

### 通用图标
- 数据库: `database.svg` (默认/未连接), `database-filled.svg` (已连接)
- 文件夹: `folder.svg` (关闭), `folder-open.svg` (打开)
- 表: `table.svg` (默认), `table-filled.svg` (选中)
- 云: `cloud.svg` (默认), `cloud-filled.svg` (选中)
- 文件: `file-text.svg` (默认), `file-text-filled.svg` (选中)
- 设置: `settings.svg` (默认), `settings-filled.svg` (选中)
- 警告: `warning.svg` (默认), `warning-filled.svg` (选中)
- 错误: `error.svg` (默认), `error-filled.svg` (选中)
- 成功: `success.svg` (默认), `success-filled.svg` (选中)
- 加载: `loading.svg`

## 图标使用方式

### 导入图标组件
```typescript
import { Icon } from '@/icons';
```

### 基本使用
```typescript
// 使用数据库图标
<Icon name="mysql" size={24} color="#4CAF50" />

// 使用文件夹图标
<Icon name="folder" size={16} color="#2196F3" />

// 使用表格图标
<Icon name="table" size={18} color="#FF9800" />
```

### 结合连接状态使用
```typescript
import { Icon, ConnectionStatus } from '@/icons';

// 根据连接状态显示不同颜色
<Icon 
  name="mysql" 
  size={16} 
  color={connectionStatus === ConnectionStatus.CONNECTED ? '#52c41a' : '#d9d9d9'} 
/>
```

### 在App.tsx中使用
```typescript
// 替换数据库节点图标
const getDatabaseIcon = (type: DatabaseType, isConnected: boolean) => {
  return <Icon 
    name={type as unknown as IconName} 
    size={16} 
    color={isConnected ? '#52c41a' : '#d9d9d9'} 
    style={{ marginRight: '8px' }} 
  />;
};
```

## 添加新图标

1. 将SVG文件放入 `src/icons/svg/` 目录
2. 按照命名规范命名文件
3. 在 `src/icons/types.ts` 中添加图标名称到 `IconName` 类型
4. 在 `src/icons/Icon.tsx` 中的 `IconMap` 中添加图标映射

## 注意事项

- SVG文件应保持简洁，建议使用单色SVG
- 避免使用复杂的渐变和滤镜效果
- 确保SVG文件有合适的 viewBox 属性，以便正确缩放
- 图标颜色会通过 CSS color 属性控制，所以SVG内部不应硬编码颜色