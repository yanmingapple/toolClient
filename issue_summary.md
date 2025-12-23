# 项目代码问题汇总与解决方案

## 一、硬编码数据问题

### 1. AppLayout.tsx 中的 mockFunctions
**位置**: `src/components/AppLayout/AppLayout.tsx` 第23-27行
**问题**: 使用硬编码的函数列表数据
**解决方案**: 
- 替换为通过 `useDatabaseOperations` 钩子从数据库动态获取的函数列表
- 修改 `handleFunctionClick` 方法，使用实际的函数数据而非 mock 数据

### 2. MainPanel.tsx 中的默认面板数据
**位置**: `src/components/MainPanel/MainPanel.tsx` 第38-45行
**问题**: 硬编码默认面板内容
**解决方案**: 
- 可以考虑从配置文件或初始设置中获取默认面板配置
- 或允许用户自定义默认面板

## 二、硬编码交互逻辑问题

### 1. QueryEditor.tsx 中的 connections[0].id
**位置**: `src/components/QueryEditor.tsx` 第40行
**问题**: 直接使用第一个连接作为默认连接
**解决方案**: 
- 使用 `useConnection` 钩子获取当前激活的连接ID
- 或让用户明确选择要使用的连接

### 2. ObjectPanel.tsx 中的 selectedTables[0] 和 dataSource[0]
**位置**: `src/components/ObjectPanel/ObjectPanel.tsx` 第211行
**问题**: 当没有选中表时，直接使用数据源中的第一个表
**解决方案**: 
- 当没有选中表时，禁用打开表按钮
- 或显示提示信息，要求用户先选择表

## 三、工具函数抽取

### 已完成的抽取
- `formatBytes` 函数已抽取到 `src/utils/formatUtils.ts`
- `generateUUID` 函数已抽取到 `src/utils/formatUtils.ts`

### 可进一步抽取的函数
- 检查各组件中是否有重复使用的格式化函数
- 检查是否有通用的验证函数可以抽取

## 四、状态管理问题

### 已完成的状态封装
- `useSelection` 钩子封装了选择状态管理
- `useTreeData` 钩子封装了树状结构的展开和选择状态管理

### 可进一步优化的状态管理
- 检查各组件中是否有分散的状态可以进一步封装
- 确保所有 `useMemo` 和 `useCallback` 都有完整的依赖项

## 五、具体修复建议

### 1. 修复 AppLayout.tsx 中的 mockFunctions
```typescript
// 删除硬编码的 mockFunctions
// const mockFunctions: FunctionData[] = [
//   { name: 'get_format', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: true, comment: 'Format a date or time value' },
//   { name: 'uuid', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Generate a UUID value' },
//   { name: 'version', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Return version of MySQL server' },
// ]

// 修改 handleFunctionClick 方法
const handleFunctionClick = () => {
  // 使用实际的函数数据，而非 mock 数据
  mainPanelRef.current?.createPanel('function', '函数', (
    <FunctionPanel
      dataSource={[]} // 后续替换为实际的函数数据
    />
  ))
}
```

### 2. 修复 QueryEditor.tsx 中的 connections[0].id
```typescript
const handleAddTab = () => {
  if (connections.length === 0) {
    message.warning('Please add a connection first')
    return
  }
  // 使用当前激活的连接，而非第一个连接
  const activeConnection = connections.find(conn => conn.id === activeConnectionId) || connections[0]
  const newTabId = addTab(activeConnection.id)
  setActiveTab(newTabId)
}
```

### 3. 修复 ObjectPanel.tsx 中的硬编码表选择
```typescript
<Button 
  onClick={async () => {
    if (selectedTables.length === 0 && dataSource.length === 0) {
      message.warning('Please select a table first')
      return
    }
    const tableToOpen = selectedTables.length > 0 ? selectedTables[0] : dataSource[0];
    // ... 其余代码
  }}
  disabled={selectedTables.length === 0 && dataSource.length === 0}
>
  打开表
</Button>
```

## 六、总结

本项目中主要存在以下几类问题：
1. 硬编码的数据和默认值
2. 依赖数组索引的交互逻辑
3. 状态管理可以进一步优化和封装
4. 工具函数可以进一步抽取以提高复用性

建议按照上述解决方案逐步修复这些问题，提高代码的可维护性、灵活性和用户体验。