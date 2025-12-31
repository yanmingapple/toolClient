/**
 * Electron相关工具函数
 * 使用 preload 脚本暴露的安全API与主进程通信
 */

// 导入类型
import type { TreeNode, ConnectionConfig } from '../../electron/model/database'
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
  app: {
    showNewConnectionDialog: () => void
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void
    restartApp: () => void
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
  on: {
    connectionStatusChanged: (callback: (data: any) => void) => void
    databasesUpdated: (callback: (data: any) => void) => void
    tablesUpdated: (callback: (data: any) => void) => void
  }
  off: {
    connectionStatusChanged: () => void
    databasesUpdated: () => void
    tablesUpdated: () => void
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

  // 根据通道类型选择合适的监听器
  switch (channel) {
    case 'connection:status-changed':
      electronAPI.on.connectionStatusChanged(listener)
      return () => electronAPI.off.connectionStatusChanged()

    case 'database:databases-updated':
      electronAPI.on.databasesUpdated(listener)
      return () => electronAPI.off.databasesUpdated()

    case 'database:tables-updated':
      electronAPI.on.tablesUpdated(listener)
      return () => electronAPI.off.tablesUpdated()

    default:
      console.warn(`Unknown IPC channel: ${channel}`)
      return () => { }
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

    default:
      console.warn(`Unknown IPC channel: ${channel}`)
      break
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
