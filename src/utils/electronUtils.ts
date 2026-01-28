/**
 * Electron相关工具函数
 * 使用 preload 脚本暴露的安全API与主进程通信
 */

// 导入类型
import type { TreeNode, ConnectionConfig } from '../../electron/model/database'
import type { ServiceMonitor } from '../../electron/model/database/ServiceMonitor'
import type { ServiceResult } from '../../electron/model/result/ServiceResult'

// 定义 electronAPI 的类型
interface ElectronAPI {
  database: {
    testConnection: (config: ConnectionConfig) => Promise<ServiceResult<boolean>>
    saveConnections: (connections: ConnectionConfig[]) => Promise<ServiceResult<void>>
    getAllConnections: () => Promise<ServiceResult<TreeNode[]>>
    deleteConnection: (connectionId: string) => Promise<ServiceResult<void>>
    getDatabases: (config: ConnectionConfig) => Promise<ServiceResult<string[]>>
    getTables: (config: ConnectionConfig) => Promise<ServiceResult<string[]>>
    executeQuery: (config: ConnectionConfig, sql: string, params: any[]) => Promise<ServiceResult<any>>
    getConnectionStatus: (connectionId: string) => Promise<ServiceResult<any>>
    refreshConnection: (connectionId: string) => Promise<ServiceResult<boolean>>
    disconnect: (connectionId: string) => Promise<ServiceResult<void>>
  }
  serviceMonitor: {
    getAll: () => Promise<ServiceResult<ServiceMonitor[]>>
    save: (monitors: ServiceMonitor[]) => Promise<ServiceResult<void>>
    deleteAll: () => Promise<ServiceResult<void>>
    delete: (id: number) => Promise<ServiceResult<void>>
    performHealthCheck: () => Promise<ServiceResult<void>>
  }
  app: {
    showNewConnectionDialog: () => void
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void
    restartApp: () => void
    switchMenuType: (menuType: string) => Promise<boolean>
  }
  window: {
    create: (options: {
      page: string
      title?: string
      width?: number
      height?: number
      engine?: string
      ocrTitle?: string
    }) => Promise<string>
    close: (windowId: string) => Promise<void>
    getAll: () => Promise<string[]>
  }
  file: {
    selectFile: (filters: string[]) => Promise<string>
    selectFolder: () => Promise<string>
    saveFile: (defaultPath: string, content: string) => Promise<boolean>
    readFile: (filePath: string) => Promise<string>
  }
  notification: {
    show: (title: string, body: string) => void
  }
  /**
   * 监听 IPC 事件
   */
  on: (channel: string, callback: (...args: any[]) => void) => void
  /**
   * 移除 IPC 事件监听器
   */
  off: (channel: string, callback?: (...args: any[]) => void) => void
  /**
   * 一次性监听 IPC 事件
   */
  once: (channel: string, callback: (...args: any[]) => void) => void
  terminal: {
    executeCommand: (command: string, shell: 'cmd' | 'powershell', cwd?: string, timeout?: number) => Promise<ServiceResult<any>>
    executeCommands: (commands: any[], parallel: boolean) => Promise<ServiceResult<any[]>>
    getSystemInfo: () => Promise<ServiceResult<any>>
  }
  sidebar: {
    openOCRPage: (engine: string) => void
    toggle: () => void
    close: () => void
    expand: () => void
    collapse: () => void
    getSystemResources: () => Promise<ServiceResult<any>>
    openCalendar: () => void
    openCreditCard: () => void
  }
  dbgate: {
    open: () => Promise<{success: boolean, windowId?: number, error?: string}>
    close: () => Promise<{success: boolean}>
    isOpen: () => Promise<boolean>
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

/**
 * 安全获取Electron API实例
 * @returns ElectronAPI实例或null
 */
export const getSafeIpcRenderer = () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI
  }
  return null
}

/**
 * 监听来自主进程的IPC消息
 * @param channel 消息通道
 * @param listener 事件监听器
 * @returns 清理函数，用于移除监听器
 */
export const listenToIpcMessage = (channel: string, listener: (...args: any[]) => void) => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return () => { }
  }

  // 使用通用的 on 方法注册监听器
  electronAPI.on(channel, listener)

  // 返回清理函数
  return () => {
    electronAPI.off(channel, listener)
  }
}

/**
 * 向主进程发送IPC消息
 * @param channel 消息通道
 * @param args 消息参数
 */
export const sendIpcMessage = (channel: string, ...args: any[]) => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }

  // 根据通道类型选择合适的API方法
  switch (channel) {
    case 'open-new-connection-dialog':
      electronAPI.app.showNewConnectionDialog()
      break

    case 'window:minimize':
      electronAPI.app.minimizeWindow()
      break

    case 'window:maximize':
      electronAPI.app.maximizeWindow()
      break

    case 'window:close':
      electronAPI.app.closeWindow()
      break

    case 'app:restart':
      electronAPI.app.restartApp()
      break

    case 'menu:switch-type':
      if (args.length > 0) {
        electronAPI.app.switchMenuType(args[0])
      }
      break

    case 'file:select-file':
      if (args.length > 0) {
        electronAPI.file.selectFile(args[0])
      }
      break

    case 'file:select-folder':
      electronAPI.file.selectFolder()
      break

    case 'file:save-file':
      if (args.length >= 2) {
        electronAPI.file.saveFile(args[0], args[1])
      }
      break

    case 'file:read-file':
      if (args.length > 0) {
        electronAPI.file.readFile(args[0])
      }
      break

    case 'notification:show':
      if (args.length >= 2) {
        electronAPI.notification.show(args[0], args[1])
      }
      break

    case 'terminal-execute-command':
      if (args.length > 0) {
        electronAPI.terminal.executeCommand(
          args[0].command,
          args[0].shell || 'powershell',
          args[0].cwd,
          args[0].timeout
        )
      }
      break

    case 'terminal-execute-commands':
      if (args.length > 1) {
        electronAPI.terminal.executeCommands(args[0], args[1])
      }
      break

    case 'terminal-get-system-info':
      electronAPI.terminal.getSystemInfo()
      break

    default:
      console.warn(`Unknown IPC channel: ${channel}`)
  }
}

/**
 * 数据库操作便利函数
 */

// 测试数据库连接
export const testDatabaseConnection = async (config: ConnectionConfig): Promise<ServiceResult<boolean>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.testConnection(config)
}

// 保存连接配置
export const saveDatabaseConnections = async (connections: ConnectionConfig[]): Promise<ServiceResult<void>> => {
  console.log('[ElectronUtils] Starting to save connections:', connections.length);

  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }

  console.log('[ElectronUtils] Electron API available, calling saveConnections');
  console.log('[ElectronUtils] Connections to save:', connections);

  try {
    const result = await electronAPI.database.saveConnections(connections);
    console.log('[ElectronUtils] Save result:', result);
    return result;
  } catch (error) {
    console.error('[ElectronUtils] Failed to save connections:', error);
    throw error;
  }
}

// 获取所有连接配置
export const getAllDatabaseConnections = async (): Promise<ServiceResult<TreeNode[]>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.getAllConnections()
}

// 删除连接配置
export const deleteDatabaseConnection = async (connectionId: string): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.deleteConnection(connectionId)
}

// 获取数据库列表
export const getDatabases = async (config: ConnectionConfig): Promise<ServiceResult<string[]>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.getDatabases(config)
}

// 获取表列表
export const getTables = async (config: ConnectionConfig): Promise<ServiceResult<string[]>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.getTables(config)
}

// 执行SQL查询
export const executeQuery = async (config: ConnectionConfig, sql: string, params: any[] = []): Promise<ServiceResult<any>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.executeQuery(config, sql, params)
}

// 获取连接状态
export const getConnectionStatus = async (connectionId: string): Promise<ServiceResult<any>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.getConnectionStatus(connectionId)
}

// 刷新连接
export const refreshConnection = async (connectionId: string): Promise<ServiceResult<boolean>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.refreshConnection(connectionId)
}

// 断开连接
export const disconnectDatabase = async (connectionId: string): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.database.disconnect(connectionId)
}

// 切换菜单类型
export const switchMenuType = async (menuType: string): Promise<boolean> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return false
  }
  return electronAPI.app.switchMenuType(menuType)
}

// 服务监控相关函数

// 获取所有服务监控
export const getAllServiceMonitors = async (): Promise<ServiceResult<ServiceMonitor[]>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.serviceMonitor.getAll()
}

// 保存服务监控
export const saveServiceMonitors = async (monitors: ServiceMonitor[]): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.serviceMonitor.save(monitors)
}

// 删除所有服务监控
export const deleteAllServiceMonitors = async (): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.serviceMonitor.deleteAll()
}

// 删除一个服务监控
export const deleteServiceMonitor = async (id: number): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.serviceMonitor.delete(id)
}

// 执行健康检查
export const performServiceHealthCheck = async (): Promise<ServiceResult<void>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.serviceMonitor.performHealthCheck()
}

// 执行服务控制命令
export const controlService = async (serviceName: string, action: 'start' | 'stop' | 'restart'): Promise<ServiceResult<any>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }

  // 构建服务控制命令
  const command = `net  ${action} ${serviceName}`

  // 执行命令
  return electronAPI.terminal.executeCommand(command, 'cmd')
}

// 文件操作便利函数

// 选择文件夹
export const selectFolder = async (): Promise<string> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.file.selectFolder()
}

// 侧边栏相关函数

/**
 * 打开OCR页面
 * @param engine OCR引擎名称
 */
export const openOCRPage = (engine: string): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.sidebar.openOCRPage(engine)
}

/**
 * 切换侧边栏显示/隐藏
 */
export const toggleSidebar = (): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.sidebar.toggle()
}

/**
 * 关闭侧边栏
 */
export const closeSidebar = (): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.sidebar.close()
}

/**
 * 展开侧边栏
 */
export const expandSidebar = (): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.sidebar.expand()
}

/**
 * 收起侧边栏
 */
export const collapseSidebar = (): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.sidebar.collapse()
}

/**
 * 获取系统资源信息（CPU和内存使用率）
 * @returns Promise<ServiceResult<any>> 系统资源信息
 */
export const getSystemResources = async (): Promise<ServiceResult<any>> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    throw new Error('Electron API not available')
  }
  return electronAPI.sidebar.getSystemResources()
}

/**
 * 打开日历提醒 - 直接打开对话框窗口
 */
export const openCalendarReminder = async (): Promise<void> => {
  await openEventReminderDialog()
}

/**
 * 打开信用卡提醒工具 - 直接打开对话框窗口
 */
export const openCreditCardReminder = async (): Promise<void> => {
  await openCreditCardDialog()
}

/**
 * 创建新窗口
 * @param options 窗口选项
 * @returns Promise<string> 窗口ID
 */
export const createWindow = async (options: {
  page: 'toolpanel' | 'workspace' | 'ocr' | 'sidebar' | 'dialog-connection' | 'dialog-command-result' | 'dialog-terminal' | 'dialog-event-reminder' | 'dialog-credit-card'
  title?: string
  width?: number
  height?: number
  engine?: string
  ocrTitle?: string
  params?: Record<string, any>
}): Promise<string | null> => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    console.warn('Electron API not available')
    return null
  }
  try {
    return await electronAPI.window.create(options)
  } catch (error) {
    console.error('Failed to create window:', error)
    return null
  }
}

/**
 * 打开连接对话框窗口
 */
export const openConnectionDialog = async (connection?: any): Promise<string | null> => {
  return await createWindow({
    page: 'dialog-connection',
    title: connection ? '编辑数据库连接' : '新建数据库连接',
    width: 700,
    height: 600,
    params: {
      connection
    }
  })
}

/**
 * 打开命令结果对话框窗口
 */
export const openCommandResultDialog = async (title: string, result: any): Promise<string | null> => {
  return await createWindow({
    page: 'dialog-command-result',
    title: title || '命令执行结果',
    width: 900,
    height: 700,
    params: {
      title,
      result
    }
  })
}

/**
 * 打开终端控制台窗口
 */
export const openTerminalDialog = async (): Promise<string | null> => {
  return await createWindow({
    page: 'dialog-terminal',
    title: '终端控制台',
    width: 1000,
    height: 700
  })
}

/**
 * 打开日历提醒窗口
 */
export const openEventReminderDialog = async (): Promise<string | null> => {
  return await createWindow({
    page: 'dialog-event-reminder',
    title: '日历提醒',
    width: 800,
    height: 600
  })
}

/**
 * 打开信用卡提醒窗口
 */
export const openCreditCardDialog = async (): Promise<string | null> => {
  return await createWindow({
    page: 'dialog-credit-card',
    title: '信用卡提醒',
    width: 800,
    height: 600
  })
}

/**
 * 关闭当前窗口
 */
export const closeCurrentWindow = (): void => {
  const electronAPI = getSafeIpcRenderer()
  if (!electronAPI) {
    return
  }
  electronAPI.app.closeWindow()
}
