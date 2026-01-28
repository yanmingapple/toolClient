const { contextBridge, ipcRenderer } = require('electron');
import { ConnectionConfig } from './model/database'
import { ServiceResult } from './model/result/ServiceResult'
import { TreeNode } from './model/database/TreeNode'
import type { ServiceMonitor } from './model/database/ServiceMonitor'
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

  // 服务监控相关
  serviceMonitor: {
    /**
     * 获取所有服务监控
     */
    getAll: (): Promise<ServiceResult<ServiceMonitor[]>> => {
      return ipcRenderer.invoke('service-monitor:get-all');
    },

    /**
     * 保存服务监控
     */
    save: (monitors: ServiceMonitor[]): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('service-monitor:save', monitors);
    },

    /**
     * 删除所有服务监控
     */
    deleteAll: (): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('service-monitor:delete-all');
    },

    /**
     * 执行健康检查
     */
    performHealthCheck: (): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('service-monitor:perform-health-check');
    },

    /**
     * 删除一个服务监控
     */
    delete: (id: number): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('service-monitor:delete', id);
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

  // 窗口管理相关
  window: {
    /**
     * 创建新窗口
     * @param {Object} options 窗口选项
     * @param {string} options.page 页面类型: 'toolpanel' | 'workspace' | 'ocr' | 'sidebar'
     * @param {string} [options.title] 窗口标题
     * @param {number} [options.width] 窗口宽度，默认1200
     * @param {number} [options.height] 窗口高度，默认800
     * @param {string} [options.engine] OCR引擎（仅当page为ocr时使用）
     * @param {string} [options.ocrTitle] OCR页面标题（仅当page为ocr时使用）
     * @returns {Promise<string>} 窗口ID
     */
    create: (options: {
      page: string;
      title?: string;
      width?: number;
      height?: number;
      engine?: string;
      ocrTitle?: string;
      params?: Record<string, any>;
    }): Promise<string> => {
      return ipcRenderer.invoke('window:create', options);
    },

    /**
     * 关闭指定窗口
     * @param {string} windowId 窗口ID
     */
    close: (windowId: string): Promise<void> => {
      return ipcRenderer.invoke('window:close-by-id', windowId);
    },

    /**
     * 获取所有窗口ID
     * @returns {Promise<string[]>} 窗口ID数组
     */
    getAll: (): Promise<string[]> => {
      return ipcRenderer.invoke('window:get-all');
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

  // 通用事件监听器
  /**
   * 监听 IPC 事件
   * @param channel 事件通道名称
   * @param callback 回调函数
   */
  on: (channel: string, callback: (...args: any[]) => void): void => {
    ipcRenderer.on(channel, (_event: any, ...args: any[]) => callback(...args));
  },

  /**
   * 移除 IPC 事件监听器
   * @param channel 事件通道名称
   * @param callback 可选，指定要移除的回调函数。如果不提供，将移除该通道的所有监听器
   */
  off: (channel: string, callback?: (...args: any[]) => void): void => {
    if (callback) {
      ipcRenderer.removeListener(channel, callback);
    } else {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  /**
   * 一次性监听 IPC 事件（只触发一次后自动移除）
   * @param channel 事件通道名称
   * @param callback 回调函数
   */
  once: (channel: string, callback: (...args: any[]) => void): void => {
    const validChannels = [
      'connection:status-changed',
      'database:databases-updated',
      'database:tables-updated',
      'open-new-connection-dialog',
      'terminal:open-console',
      'terminal:result',
      'service-monitor:health-check-result',
      'sidebar-open-calendar',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (_event: any, ...args: any[]) => callback(...args));
    } else {
      console.warn(`[IPC] Invalid channel: ${channel}`);
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
  },

  // 侧边栏相关
  sidebar: {
    /**
     * 打开OCR页面
     * @param engine OCR引擎名称
     */
    openOCRPage: (engine: string): void => {
      ipcRenderer.send('sidebar:open-ocr-page', engine);
    },

    /**
     * 切换侧边栏显示/隐藏
     */
    toggle: (): void => {
      ipcRenderer.send('sidebar:toggle');
    },

    /**
     * 关闭侧边栏
     */
    close: (): void => {
      ipcRenderer.send('sidebar:close');
    },

    /**
     * 展开侧边栏
     */
    expand: (): void => {
      ipcRenderer.send('sidebar:expand');
    },

    /**
     * 收起侧边栏
     */
    collapse: (): void => {
      ipcRenderer.send('sidebar:collapse');
    },

    /**
     * 获取系统资源信息（CPU和内存使用率）
     * @returns Promise<ServiceResult<any>> 系统资源信息
     */
    getSystemResources: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('sidebar:get-system-resources');
    },

    /**
     * 打开日历提醒
     */
    openCalendar: (): void => {
      ipcRenderer.send('sidebar:open-calendar');
    },

    /**
     * 打开信用卡提醒工具
     */
    openCreditCard: (): void => {
      ipcRenderer.send('sidebar:open-credit-card');
    }
  },

  // Dbgate 相关
  dbgate: {
    /**
     * 打开 dbgate 窗口
     * @returns Promise<{success: boolean, windowId?: number, error?: string}>
     */
    open: (): Promise<{success: boolean, windowId?: number, error?: string}> => {
      return ipcRenderer.invoke('dbgate:open');
    },

    /**
     * 关闭 dbgate 窗口
     * @returns Promise<{success: boolean}>
     */
    close: (): Promise<{success: boolean}> => {
      return ipcRenderer.invoke('dbgate:close');
    },

    /**
     * 检查 dbgate 窗口是否打开
     * @returns Promise<boolean>
     */
    isOpen: (): Promise<boolean> => {
      return ipcRenderer.invoke('dbgate:is-open');
    }
  },

});

// 控制台输出预加载脚本加载成功的消息
console.log('✅ Preload script loaded successfully');
console.log('🌐 Electron API exposed to renderer process');