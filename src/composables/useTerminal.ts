import { ref, readonly } from 'vue'

export interface TerminalCommand {
  command: string
  shell?: 'cmd' | 'powershell'
  cwd?: string
  timeout?: number
}

export interface CommandExecutionResult {
  command: string
  shell: string
  exitCode: number
  stdout: string
  stderr: string
  executionTime: number
  timestamp: Date
}

/**
 * 终端命令执行 Hook
 * 提供在 Vue 组件中使用终端命令的功能
 */
export function useTerminal() {
  const isExecuting = ref(false)
  const lastResult = ref<CommandExecutionResult | null>(null)
  const error = ref<string | null>(null)

  /**
   * 执行单个命令
   */
  const executeCommand = async (
    command: string,
    shell: 'cmd' | 'powershell' = 'powershell',
    cwd?: string,
    timeout?: number
  ) => {
    isExecuting.value = true
    error.value = null

    try {
      const result = await window.electronAPI.terminal.executeCommand(command, shell, cwd, timeout)
      
      if (result.success) {
        lastResult.value = result.data
        return result.data
      } else {
        error.value = result.message || '命令执行失败'
        throw new Error(result.message)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isExecuting.value = false
    }
  }

  /**
   * 批量执行命令
   */
  const executeCommands = async (commands: TerminalCommand[], parallel: boolean = false) => {
    isExecuting.value = true
    error.value = null

    try {
      const result = await window.electronAPI.terminal.executeCommands(commands, parallel)
      
      if (result.success) {
        return result.data
      } else {
        error.value = result.message || '批量命令执行失败'
        throw new Error(result.message)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isExecuting.value = false
    }
  }

  /**
   * 获取系统信息
   */
  const getSystemInfo = async () => {
    try {
      const result = await window.electronAPI.terminal.getSystemInfo()
      
      if (result.success) {
        return result.data
      } else {
        error.value = result.message || '获取系统信息失败'
        throw new Error(result.message)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  /**
   * 常用命令快速执行
   */
  const quickCommands = {
    /**
     * 获取当前目录
     */
    getCurrentDirectory: () => executeCommand('pwd', 'powershell'),
    
    /**
     * 列出目录内容
     */
    listDirectory: (path?: string) => executeCommand(path ? `ls ${path}` : 'ls', 'powershell'),
    
    /**
     * 查看系统信息 (PowerShell)
     */
    getSystemInfoPS: () => executeCommand('Get-ComputerInfo', 'powershell', undefined, 10000),
    
    /**
     * 查看系统信息 (cmd)
     */
    getSystemInfoCMD: () => executeCommand('systeminfo', 'cmd', undefined, 15000),
    
    /**
     * 检查网络连接
     */
    checkNetwork: (host: string = '8.8.8.8') => executeCommand(`ping -n 4 ${host}`, 'cmd'),
    
    /**
     * 查看进程列表
     */
    getProcesses: () => executeCommand('Get-Process | Select-Object ProcessName, Id, CPU', 'powershell', undefined, 10000),
    
    /**
     * 查看磁盘使用情况
     */
    getDiskUsage: () => executeCommand('Get-PSDrive -PSProvider FileSystem', 'powershell')
  }

  return {
    // 状态
    isExecuting: readonly(isExecuting),
    lastResult: readonly(lastResult),
    error: readonly(error),

    // 方法
    executeCommand,
    executeCommands,
    getSystemInfo,
    quickCommands
  }
}