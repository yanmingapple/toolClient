<template>
  <div class="terminal-console">
    <div class="terminal-header">
      <h3>终端控制台</h3>
      <div class="shell-selector">
        <el-select v-model="selectedShell" placeholder="选择Shell">
          <el-option label="PowerShell" value="powershell" />
          <el-option label="CMD" value="cmd" />
        </el-select>
      </div>
    </div>

    <div class="terminal-content">
      <div class="output-area">
        <div class="output-header">
          <span>执行输出</span>
          <el-button size="small" @click="clearOutput">清空</el-button>
        </div>
        <div class="output-content" ref="outputRef">
          <div v-for="(line, index) in outputLines" :key="index" class="output-line" :class="line.type">
            <span class="timestamp">{{ line.timestamp }}</span>
            <span class="command">{{ line.content }}</span>
          </div>
        </div>
      </div>

      <div class="command-input">
        <el-input
          v-model="currentCommand"
          placeholder="输入命令..."
          :disabled="isExecuting"
          @keyup.enter="executeCurrentCommand"
        >
          <template #append>
            <el-button 
              :loading="isExecuting" 
              @click="executeCurrentCommand"
              :disabled="!currentCommand.trim()"
            >
              执行
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="quick-commands">
      <div class="quick-commands-header">
        <span>快速命令</span>
      </div>
      <div class="quick-buttons">
        <el-button 
          v-for="cmd in quickCommandList" 
          :key="cmd.key"
          size="small" 
          @click="executeQuickCommand(cmd.command, cmd.shell)"
          :disabled="isExecuting"
        >
          {{ cmd.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useTerminal } from '@/composables/useTerminal'

interface OutputLine {
  timestamp: string
  content: string
  type: 'info' | 'success' | 'error' | 'command'
}

// 组件状态
const selectedShell = ref<'cmd' | 'powershell'>('powershell')
const currentCommand = ref('')
const outputLines = ref<OutputLine[]>([])
const outputRef = ref<HTMLElement>()

// 使用终端Hook
const { 
  isExecuting, 
  lastResult, 
  error, 
  executeCommand, 
  quickCommands 
} = useTerminal()

// 快速命令列表
const quickCommandList = [
  { key: 'pwd', label: '当前目录', command: 'pwd', shell: 'powershell' },
  { key: 'ls', label: '列出目录', command: 'ls', shell: 'powershell' },
  { key: 'systeminfo', label: '系统信息', command: 'Get-ComputerInfo', shell: 'powershell' },
  { key: 'processes', label: '进程列表', command: 'Get-Process | Select-Object ProcessName, Id, CPU | Format-Table -AutoSize', shell: 'powershell' },
  { key: 'network', label: '网络测试', command: 'ping -n 4 8.8.8.8', shell: 'cmd' },
  { key: 'disk', label: '磁盘使用', command: 'Get-PSDrive -PSProvider FileSystem | Format-Table -AutoSize', shell: 'powershell' },
  { key: 'cmd-pwd', label: 'CMD当前目录', command: 'cd', shell: 'cmd' },
  { key: 'cmd-dir', label: 'CMD目录列表', command: 'dir', shell: 'cmd' },
]

// 方法
const addOutputLine = (content: string, type: OutputLine['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  outputLines.value.push({ timestamp, content, type })
  
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

const clearOutput = () => {
  outputLines.value = []
}

const executeCurrentCommand = async () => {
  if (!currentCommand.value.trim() || isExecuting.value) return

  const command = currentCommand.value.trim()
  const shell = selectedShell.value

  // 添加到输出
  addOutputLine(`PS ${command}`, 'command')

  try {
    const result = await executeCommand(command, shell)
    
    if (result.stdout) {
      addOutputLine(result.stdout, 'info')
    }
    if (result.stderr) {
      addOutputLine(result.stderr, 'error')
    }
    
    if (result.exitCode === 0) {
      addOutputLine(`命令执行成功 (${result.executionTime}ms)`, 'success')
    } else {
      addOutputLine(`命令执行失败，退出码: ${result.exitCode}`, 'error')
    }
    
  } catch (err: any) {
    addOutputLine(`执行错误: ${err.message}`, 'error')
    ElMessage.error(err.message)
  }

  currentCommand.value = ''
}

const executeQuickCommand = async (command: string, shell: 'cmd' | 'powershell') => {
  if (isExecuting.value) return

  addOutputLine(`${shell.toUpperCase()}> ${command}`, 'command')
  selectedShell.value = shell

  try {
    const result = await executeCommand(command, shell)
    
    if (result.stdout) {
      addOutputLine(result.stdout, 'info')
    }
    if (result.stderr) {
      addOutputLine(result.stderr, 'error')
    }
    
    if (result.exitCode === 0) {
      addOutputLine(`命令执行成功 (${result.executionTime}ms)`, 'success')
    } else {
      addOutputLine(`命令执行失败，退出码: ${result.exitCode}`, 'error')
    }
    
  } catch (err: any) {
    addOutputLine(`执行错误: ${err.message}`, 'error')
    ElMessage.error(err.message)
  }
}

// 组件挂载时初始化
onMounted(() => {
  addOutputLine('终端控制台已启动', 'info')
  addOutputLine('选择Shell并输入命令开始使用', 'info')
})
</script>

<style scoped>
.terminal-console {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #ffffff;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.terminal-header h3 {
  margin: 0;
  color: #ffffff;
}

.shell-selector {
  width: 150px;
}

.terminal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.output-area {
  flex: 1;
  background: #1e1e1e;
  border: 1px solid #404040;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  font-size: 14px;
  color: #cccccc;
}

.output-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.output-line {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
}

.output-line .timestamp {
  color: #888888;
  font-size: 12px;
  min-width: 80px;
}

.output-line .command {
  color: #00ff00;
  font-weight: bold;
}

.output-line.success .command {
  color: #00ff00;
}

.output-line.error .command {
  color: #ff6b6b;
}

.output-line.info .command {
  color: #ffffff;
}

.command-input {
  display: flex;
}

.quick-commands {
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 4px;
  padding: 12px;
}

.quick-commands-header {
  margin-bottom: 8px;
  font-size: 14px;
  color: #cccccc;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-buttons .el-button {
  background: #404040;
  border-color: #555555;
  color: #ffffff;
}

.quick-buttons .el-button:hover {
  background: #505050;
  border-color: #666666;
}
</style>