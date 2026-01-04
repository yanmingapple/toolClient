const { contextBridge, ipcRenderer } = require('electron');
import { ConnectionConfig } from './model/database'
import { ServiceResult } from './model/result/ServiceResult'
import { TreeNode } from './model/database/TreeNode'
/**
 * Preload 脚本
 * 使用 contextBridge 安全地向渲染进程暴露主进程 API
 */

// 暴露数据库管理 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 数据库连接相关
  database: {
    /**
     * 测试数据库连接
     * @param {Object} config 连接配置
     * @returns {Promise<ServiceResult<boolean>>} 连接是否成功
     */
    testConnection: (config: ConnectionConfig): Promise<ServiceResult<boolean>> => {
      return ipcRenderer.invoke('database:test-connection', config);
    },

    /**
     * 保存连接配置
     * @param {Array} connections 连接配置数组
     * @returns {Promise<ServiceResult<void>>}
     */
    saveConnections: (connections: ConnectionConfig[]): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('database:save-connections', connections);
    },

    /**
     * 获取所有连接配置
     * @returns {Promise<ServiceResult<TreeNode[]>>}
     */
    getAllConnections: (): Promise<ServiceResult<TreeNode[]>> => {
      return ipcRenderer.invoke('database:get-all-connections');
    },

    /**
     * 删除连接配置
     * @param {string} connectionId 连接ID
     * @returns {Promise<ServiceResult<void>>}
     */
    deleteConnection: (connectionId: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('database:delete-connection', connectionId);
    },

    /**
     * 获取数据库列表
     * @param {Object} config 连接配置
     * @returns {Promise<ServiceResult<string[]>>} 数据库名列表
     */
    getDatabases: (config: ConnectionConfig): Promise<ServiceResult<string[]>> => {
      return ipcRenderer.invoke('database:get-databases', config);
    },

    /**
     * 获取表列表
     * @param {Object} config 连接配置
     * @returns {Promise<ServiceResult<string[]>>} 表名列表
     */
    getTables: (config: ConnectionConfig): Promise<ServiceResult<string[]>> => {
      return ipcRenderer.invoke('database:get-tables', config);
    },

    /**
     * 执行 SQL 查询
     * @param {Object} config 连接配置
     * @param {string} sql SQL 语句
     * @param {Array} params 参数
     * @returns {Promise<ServiceResult<any>>} 查询结果
     */
    executeQuery: (config: ConnectionConfig, sql: string, params: any[]): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('database:execute-query', config, sql, params);
    },

    /**
     * 获取连接状态
     * @param {string} connectionId 连接ID
     * @returns {Promise<ServiceResult<any>>} 连接状态信息
     */
    getConnectionStatus: (connectionId: string): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('database:get-connection-status', connectionId);
    },

    /**
     * 刷新连接
     * @param {string} connectionId 连接ID
     * @returns {Promise<ServiceResult<boolean>>} 是否成功
     */
    refreshConnection: (connectionId: string): Promise<ServiceResult<boolean>> => {
      return ipcRenderer.invoke('database:refresh-connection', connectionId);
    },

    /**
     * 断开连接
     * @param {string} connectionId 连接ID
     * @returns {Promise<ServiceResult<void>>}
     */
    disconnect: (connectionId: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('database:disconnect', connectionId);
    }
  },

  // 应用程序相关
  app: {
    /**
     * 显示新连接对话框
     */
    showNewConnectionDialog: (): void => {
      ipcRenderer.send('open-new-connection-dialog');
    },

    /**
     * 最小化窗口
     */
    minimizeWindow: (): void => {
      ipcRenderer.send('window:minimize');
    },

    /**
     * 最大化/还原窗口
     */
    maximizeWindow: (): void => {
      ipcRenderer.send('window:maximize');
    },

    /**
     * 关闭窗口
     */
    closeWindow: (): void => {
      ipcRenderer.send('window:close');
    },

    /**
     * 重启应用
     */
    restartApp: (): void => {
      ipcRenderer.send('app:restart');
    },

    /**
     * 切换菜单类型
     * @param {string} menuType 菜单类型 ('workspace' 或 'database')
     * @returns {Promise<boolean>} 是否成功
     */
    switchMenuType: (menuType: string): Promise<boolean> => {
      return ipcRenderer.invoke('menu:switch-type', menuType);
    }
  },

  // 文件操作相关
  file: {
    /**
     * 选择文件
     * @param {Array} filters 文件过滤器
     * @returns {Promise<string>} 选择的文件路径
     */
    selectFile: (filters: string[]): Promise<string> => {
      return ipcRenderer.invoke('file:select-file', filters);
    },

    /**
     * 选择文件夹
     * @returns {Promise<string>} 选择的文件夹路径
     */
    selectFolder: (): Promise<string> => {
      return ipcRenderer.invoke('file:select-folder');
    },

    /**
     * 保存文件
     * @param {string} defaultPath 默认路径
     * @param {string} content 文件内容
     * @returns {Promise<boolean>} 是否成功
     */
    saveFile: (defaultPath: string, content: string): Promise<boolean> => {
      return ipcRenderer.invoke('file:save-file', defaultPath, content);
    },

    /**
     * 读取文件
     * @param {string} filePath 文件路径
     * @returns {Promise<string>} 文件内容
     */
    readFile: (filePath: string): Promise<string> => {
      return ipcRenderer.invoke('file:read-file', filePath);
    }
  },

  // 消息通知
  notification: {
    /**
     * 显示通知
     * @param title 标题
     * @param body 内容
     */
    show: (title: string, body: string): void => {
      ipcRenderer.send('notification:show', title, body);
    }
  },

  // 事件监听
  on: {
    /**
     * 监听连接状态变化
     * @param callback 回调函数
     */
    connectionStatusChanged: (callback: (data: any) => void): void => {
      ipcRenderer.on('connection:status-changed', (_: any, data: any) => callback(data));
    },

    /**
     * 监听数据库列表更新
     * @param callback 回调函数
     */
    databasesUpdated: (callback: (data: any) => void): void => {
      ipcRenderer.on('database:databases-updated', (_: any, data: any) => callback(data));
    },

    /**
     * 监听表列表更新
     * @param callback 回调函数
     */
    tablesUpdated: (callback: (data: any) => void): void => {
      ipcRenderer.on('database:tables-updated', (_: any, data: any) => callback(data));
    },

    /**
     * 监听打开新连接对话框
     * @param callback 回调函数
     */
    openNewConnectionDialog: (callback: () => void): void => {
      ipcRenderer.on('open-new-connection-dialog', () => callback());
    },

    /**
     * 监听打开终端控制台
     * @param callback 回调函数
     */
    openTerminalConsole: (callback: () => void): void => {
      ipcRenderer.on('terminal:open-console', () => callback());
    },

    /**
     * 监听终端命令结果
     * @param callback 回调函数
     */
    terminalResult: (callback: (data: any) => void): void => {
      ipcRenderer.on('terminal:result', (_: any, data: any) => callback(data));
    }
  },

  // 移除监听器
  off: {
    /**
     * 移除连接状态变化监听
     */
    connectionStatusChanged: (): void => {
      ipcRenderer.removeAllListeners('connection:status-changed');
    },

    /**
     * 移除数据库列表更新监听
     */
    databasesUpdated: (): void => {
      ipcRenderer.removeAllListeners('database:databases-updated');
    },

    /**
     * 移除表列表更新监听
     */
    tablesUpdated: (): void => {
      ipcRenderer.removeAllListeners('database:tables-updated');
    },

    /**
     * 移除打开新连接对话框监听
     */
    openNewConnectionDialog: (): void => {
      ipcRenderer.removeAllListeners('open-new-connection-dialog');
    },

    /**
     * 移除打开终端控制台监听
     */
    openTerminalConsole: (): void => {
      ipcRenderer.removeAllListeners('terminal:open-console');
    },

    /**
     * 移除终端命令结果监听
     */
    terminalResult: (): void => {
      ipcRenderer.removeAllListeners('terminal:result');
    }
  },

  // 终端命令相关
  terminal: {
    /**
     * 执行单个终端命令
     * @param command 命令字符串
     * @param shell shell类型 ('cmd' 或 'powershell')
     * @param cwd 工作目录
     * @param timeout 超时时间（毫秒）
     * @returns Promise<ServiceResult<CommandExecutionResult>> 执行结果
     */
    executeCommand: (command: string, shell: 'cmd' | 'powershell' = 'powershell', cwd?: string, timeout?: number): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('terminal-execute-command', { command, shell, cwd, timeout });
    },

    /**
     * 批量执行终端命令
     * @param commands 命令配置数组
     * @param parallel 是否并行执行
     * @returns Promise<ServiceResult<CommandExecutionResult[]>> 执行结果数组
     */
    executeCommands: (commands: any[], parallel: boolean = false): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('terminal-execute-commands', commands, parallel);
    },

    /**
     * 获取系统信息
     * @returns Promise<ServiceResult<any>> 系统信息
     */
    getSystemInfo: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('terminal-get-system-info');
    }
  }
});

// 控制台输出预加载脚本加载成功的消息
console.log('✅ Preload script loaded successfully');
console.log('🌐 Electron API exposed to renderer process');