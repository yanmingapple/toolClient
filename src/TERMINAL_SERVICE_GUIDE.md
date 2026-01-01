# 终端服务 (Terminal Service) 使用指南

## 概述

为 Electron 应用添加了完整的 cmd 和 PowerShell 命令执行功能，支持实时命令执行、批量命令处理和系统信息获取。

## 功能特性

- ✅ **多 Shell 支持**: 支持 Windows CMD 和 PowerShell
- ✅ **命令执行**: 单个命令和批量命令执行
- ✅ **异步处理**: 非阻塞式命令执行，支持超时控制
- ✅ **输出捕获**: 完整捕获 stdout 和 stderr 输出
- ✅ **错误处理**: 详细的错误信息和退出码处理
- ✅ **安全隔离**: 通过 IPC 安全通信
- ✅ **系统集成**: Vue 组合式 API 和完整组件界面

## 核心组件

### 1. TerminalService (`electron/service/terminalService.ts`)

主服务类，负责命令执行的核心逻辑：

```typescript
// 获取服务实例
const terminalService = TerminalService.getInstance();

// 执行单个命令
const result = await terminalService.executeCommand({
  command: 'dir',
  shell: 'cmd',
  cwd: 'C:\\',
  timeout: 5000
});

// 批量执行命令
const results = await terminalService.executeCommands([
  { command: 'ver', shell: 'cmd' },
  { command: 'hostname', shell: 'cmd' }
], false); // false = 串行执行
```

### 2. IPC 通信接口

通过以下 IPC 通道进行通信：

- `terminal-execute-command`: 执行单个命令
- `terminal-execute-commands`: 批量执行命令
- `terminal-get-system-info`: 获取系统信息

### 3. Vue 组合式 API (`src/composables/useTerminal.ts`)

在 Vue 组件中使用终端服务：

```typescript
import { useTerminal } from '@/composables/useTerminal'

const { 
  isExecuting, 
  lastResult, 
  error,
  executeCommand,
  executeCommands,
  quickCommands 
} = useTerminal()

// 执行命令
const result = await executeCommand('dir', 'cmd')

// 快速命令
const processes = await quickCommands.getProcesses()
```

### 4. 终端控制台组件 (`src/components/TerminalConsole.vue`)

完整的图形化终端界面：

```vue
<template>
  <TerminalConsole />
</template>

<script setup lang="ts">
import TerminalConsole from '@/components/TerminalConsole.vue'
</script>
```

## 使用示例

### 在 Vue 组件中使用

```vue
<template>
  <div class="system-monitor">
    <el-button @click="checkSystem">检查系统状态</el-button>
    <div v-if="result">
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTerminal } from '@/composables/useTerminal'

const { executeCommand } = useTerminal()
const result = ref('')

const checkSystem = async () => {
  try {
    const systemInfo = await executeCommand('systeminfo', 'cmd')
    result.value = systemInfo.stdout
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}
</script>
```

### 批量命令执行

```typescript
const { executeCommands } = useTerminal()

const setupProject = async () => {
  const commands = [
    { command: 'npm install', shell: 'powershell' },
    { command: 'npm run build', shell: 'powershell' },
    { command: 'echo "构建完成"', shell: 'cmd' }
  ]
  
  const results = await executeCommands(commands, false) // 串行执行
  
  results.forEach((result, index) => {
    console.log(`命令 ${index + 1} 结果:`, result.exitCode)
  })
}
```

### 快速命令使用

```typescript
const { quickCommands } = useTerminal()

// 各种常用命令
await quickCommands.getCurrentDirectory()     // 获取当前目录
await quickCommands.listDirectory()           // 列出目录
await quickCommands.getSystemInfoPS()         // PowerShell系统信息
await quickCommands.getSystemInfoCMD()        // CMD系统信息
await quickCommands.checkNetwork()            // 网络测试
await quickCommands.getProcesses()            // 进程列表
await quickCommands.getDiskUsage()            // 磁盘使用
```

## API 参考

### TerminalCommand 接口

```typescript
interface TerminalCommand {
  command: string        // 要执行的命令
  shell?: 'cmd' | 'powershell'  // Shell类型，默认powershell
  cwd?: string          // 工作目录
  timeout?: number      // 超时时间（毫秒），默认30000
  encoding?: string     // 编码，默认utf8
}
```

### CommandExecutionResult 接口

```typescript
interface CommandExecutionResult {
  command: string        // 执行的命令
  shell: string         // 使用的Shell
  exitCode: number      // 退出码
  stdout: string        // 标准输出
  stderr: string        // 错误输出
  executionTime: number // 执行时间（毫秒）
  timestamp: Date       // 执行时间戳
}
```

### ServiceResult 接口

```typescript
interface ServiceResult<T = any> {
  success: boolean      // 操作是否成功
  data?: T             // 返回数据
  message?: string     // 错误信息
  metadata?: any       // 其他元数据
}
```

## 快速命令列表

终端控制台提供了以下快速命令按钮：

| 按钮 | 命令 | Shell | 描述 |
|------|------|-------|------|
| 当前目录 | `pwd` | PowerShell | 显示当前工作目录 |
| 列出目录 | `ls` | PowerShell | 列出目录内容 |
| 系统信息 | `Get-ComputerInfo` | PowerShell | 获取详细系统信息 |
| 进程列表 | `Get-Process...` | PowerShell | 显示进程信息 |
| 网络测试 | `ping -n 4 8.8.8.8` | CMD | 测试网络连接 |
| 磁盘使用 | `Get-PSDrive...` | PowerShell | 显示磁盘使用情况 |
| CMD当前目录 | `cd` | CMD | 显示CMD当前目录 |
| CMD目录列表 | `dir` | CMD | CMD目录列表 |

## 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await executeCommand('some-command', 'powershell')
  if (result.exitCode !== 0) {
    console.error('命令执行失败:', result.stderr)
  }
} catch (error) {
  console.error('执行异常:', error.message)
}
```

### 2. 超时设置

```typescript
// 对于可能运行较长时间的命令
const result = await executeCommand('long-running-command', 'powershell', undefined, 60000)
```

### 3. 工作目录

```typescript
// 在特定目录执行命令
const result = await executeCommand('npm run build', 'powershell', 'C:\\my-project')
```

### 4. 批量执行策略

```typescript
// 串行执行（一个失败就停止）
const results = await executeCommands(commands, false)

// 并行执行（所有命令同时运行）
const results = await executeCommands(commands, true)
```

## 安全注意事项

1. **命令注入防护**: 避免直接拼接用户输入到命令中
2. **权限控制**: 根据应用需求限制可执行的命令类型
3. **超时设置**: 为所有命令设置合理的超时时间
4. **输出验证**: 验证命令输出的安全性

## 故障排除

### 常见问题

1. **命令执行失败**
   - 检查命令语法是否正确
   - 确认Shell类型选择
   - 验证工作目录权限

2. **超时问题**
   - 增加timeout参数值
   - 考虑使用异步处理

3. **编码问题**
   - 检查输出内容的编码格式
   - 必要时指定encoding参数

### 调试技巧

```typescript
// 启用详细日志
console.log('命令执行结果:', result)

// 检查错误输出
if (result.stderr) {
  console.error('错误信息:', result.stderr)
}
```

## 扩展功能

终端服务支持以下扩展：

- 添加更多Shell支持（如Git Bash）
- 实现命令历史记录
- 添加实时输出流
- 支持交互式命令
- 命令别名和宏支持

---

通过这个终端服务系统，你可以在 Electron 应用中安全、高效地执行各种系统命令，实现系统监控、文件管理、网络诊断等功能。