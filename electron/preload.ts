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
     * @returns {Promise<string>} 窗口ID
     */
    create: (options: {
      page: string;
      title?: string;
      width?: number;
      height?: number;
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
   * 监听打开AI配置对话框事件
   * @param callback 回调函数
   */
  onOpenAIConfig: (callback: () => void): void => {
    ipcRenderer.on('open-ai-config-dialog', () => callback());
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

  // 事件相关 API
  event: {
    /**
     * 获取所有事件
     * @returns {Promise<ServiceResult<Event[]>>}
     */
    getAll: (): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('event:get-all');
    },

    /**
     * 根据日期获取事件
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<Event[]>>}
     */
    getByDate: (date: string): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('event:get-by-date', date);
    },

    /**
     * 保存事件
     * @param {Event} event 事件对象
     * @returns {Promise<ServiceResult<void>>}
     */
    save: (event: any): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('event:save', event);
    },

    /**
     * 删除事件
     * @param {string} eventId 事件ID
     * @returns {Promise<ServiceResult<void>>}
     */
    delete: (eventId: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('event:delete', eventId);
    },

    /**
     * 标记事件为完成（自动生成工作日志）
     * @param {string} eventId 事件ID
     * @param {Object} options 完成选项（实际耗时、打断次数等）
     * @returns {Promise<ServiceResult<void>>}
     */
    complete: (eventId: string, options?: {
      actualMinutes?: number;
      interruptionCount?: number;
      notes?: string;
    }): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('event:complete', eventId, options);
    }
  },

  // 代办事项相关 API
  todo: {
    /**
     * 获取所有代办事项
     * @returns {Promise<ServiceResult<Todo[]>>}
     */
    getAll: (): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('todo:get-all');
    },

    /**
     * 根据日期获取代办事项
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<Todo[]>>}
     */
    getByDate: (date: string): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('todo:get-by-date', date);
    },

    /**
     * 保存代办事项
     * @param {Todo} todo 代办事项对象
     * @returns {Promise<ServiceResult<void>>}
     */
    save: (todo: any): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('todo:save', todo);
    },

    /**
     * 删除代办事项
     * @param {string} todoId 代办事项ID
     * @returns {Promise<ServiceResult<void>>}
     */
    delete: (todoId: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('todo:delete', todoId);
    }
  },

  // AI相关 API
  ai: {
    /**
     * 解析自然语言为事件（传统模式）
     * @param {string} text 自然语言文本
     * @param {Object} context 上下文信息
     * @returns {Promise<ServiceResult<NaturalLanguageParseResult>>}
     */
    parseNaturalLanguage: (text: string, context?: any): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:parse-natural-language', text, context);
    },

    /**
     * 解析自然语言（Plan-and-Solve 模式）
     * 先规划后执行，支持复杂任务分解
     * @param {string} text 自然语言文本
     * @param {Object} context 上下文信息
     * @returns {Promise<ServiceResult<NaturalLanguageParseResult>>}
     */
    parseNaturalLanguageWithPlanAndSolve: (text: string, context?: any): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:parse-with-plan-solve', text, context);
    },

    /**
     * 获取AI配置
     * @returns {Promise<ServiceResult<AIProvider | null>>}
     */
    getConfig: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:get-config');
    },

    /**
     * 配置AI服务
     * @param {Object} config AI配置
     * @returns {Promise<ServiceResult<void>>}
     */
    configure: (config: any): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('ai:configure', config);
    },

    /**
     * 检查网络状态
     * @returns {Promise<ServiceResult<{online: boolean}>>}
     */
    checkNetworkStatus: (): Promise<ServiceResult<{online: boolean}>> => {
      return ipcRenderer.invoke('ai:check-network-status');
    },

    /**
     * 智能分类事件
     * @param {Object} event 事件对象
     * @returns {Promise<ServiceResult<{type: string, tags: string[], priority: number, energyLevel: string}>>}
     */
    classifyEvent: (event: any): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:classify-event', event);
    },

    /**
     * 检测事件冲突
     * @param {Object} newEvent 新事件
     * @param {Array} existingEvents 现有事件列表
     * @returns {Promise<ServiceResult<{hasConflict: boolean, conflicts: Array}>>}
     */
    detectConflicts: (newEvent: any, existingEvents: any[]): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:detect-conflicts', newEvent, existingEvents);
    },

    /**
     * 优化日程安排
     * @param {Array} events 事件列表
     * @returns {Promise<ServiceResult<{suggestions: Array, insights: Object}>>}
     */
    optimizeSchedule: (events: any[]): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('ai:optimize-schedule', events);
    },

    /**
     * 生成日程摘要
     * @param {Array} events 事件列表
     * @param {string} period 时间段 ('day' | 'week' | 'month')
     * @returns {Promise<ServiceResult<string>>}
     */
    generateSummary: (events: any[], period: 'day' | 'week' | 'month'): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('ai:generate-summary', events, period);
    },

    /**
     * 监听Plan-and-Solve执行事件
     * @param {Function} callback 回调函数
     */
    onPlanExecutionEvent: (callback: (event: any) => void): void => {
      ipcRenderer.on('ai:plan-execution-event', (_event: any, data: any) => callback(data));
    },

    /**
     * 移除Plan-and-Solve执行事件监听器
     * @param {Function} callback 可选，指定要移除的回调函数
     */
    offPlanExecutionEvent: (callback?: (event: any) => void): void => {
      if (callback) {
        ipcRenderer.removeListener('ai:plan-execution-event', callback);
      } else {
        ipcRenderer.removeAllListeners('ai:plan-execution-event');
      }
    }
  },

  // 智能提醒相关 API
  smartReminder: {
    /**
     * 为事件生成智能提醒
     * @param {Object} event 事件对象
     * @returns {Promise<ServiceResult<SmartReminder[]>>}
     */
    generateReminders: (event: any): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('smart-reminder:generate', event);
    },

    /**
     * 检查并触发待处理的提醒
     * @returns {Promise<ServiceResult<SmartReminder[]>>}
     */
    checkAndTrigger: (): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('smart-reminder:check-and-trigger');
    }
  },

  // Memory相关 API
  memory: {
    /**
     * 追加内容到今日日志
     * @param {string} content 日志内容
     * @returns {Promise<ServiceResult<void>>}
     */
    appendToTodayLog: (content: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('memory:append-today-log', content);
    },

    /**
     * 读取今日日志
     * @returns {Promise<ServiceResult<string>>}
     */
    readTodayLog: (): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('memory:read-today-log');
    },

    /**
     * 读取指定日期的日志
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<string>>}
     */
    readLogByDate: (date: string): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('memory:read-log-by-date', date);
    },

    /**
     * 读取长期记忆
     * @returns {Promise<ServiceResult<string>>}
     */
    readLongTermMemory: (): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('memory:read-long-term-memory');
    },

    /**
     * 写入长期记忆
     * @param {string} content 记忆内容
     * @returns {Promise<ServiceResult<void>>}
     */
    writeLongTermMemory: (content: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('memory:write-long-term-memory', content);
    },

    /**
     * 获取会话记忆（启动时加载）
     * @returns {Promise<ServiceResult<{[key: string]: string}>>}
     */
    getSessionMemory: (): Promise<ServiceResult<{[key: string]: string}>> => {
      return ipcRenderer.invoke('memory:get-session-memory');
    },

    /**
     * 搜索记忆
     * @param {string} query 搜索查询
     * @param {number} limit 结果数量限制
     * @returns {Promise<ServiceResult<MemorySearchResult[]>>}
     */
    search: (query: string, limit?: number): Promise<ServiceResult<any[]>> => {
      return ipcRenderer.invoke('memory:search', query, limit);
    },

    /**
     * 重新索引所有记忆文件
     * @returns {Promise<ServiceResult<{indexed: number, errors: number}>>}
     */
    reindexAll: (): Promise<ServiceResult<{indexed: number, errors: number}>> => {
      return ipcRenderer.invoke('memory:reindex-all');
    },

    /**
     * 获取记忆文件列表
     * @returns {Promise<ServiceResult<{daily: string[], tasks: string[], habits: string[], memory: string | null}>>}
     */
    getFileList: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('memory:get-file-list');
    },

    /**
     * 获取索引统计信息
     * @returns {Promise<ServiceResult<{totalChunks: number, totalFiles: number, totalTokens: number, lastIndexed: string | null}>>}
     */
    getIndexStats: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('memory:get-index-stats');
    },

    /**
     * 清理指定文件的索引
     * @param {string} filePath 文件路径
     * @returns {Promise<ServiceResult<void>>}
     */
    clearFileIndex: (filePath: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('memory:clear-file-index', filePath);
    }
  },

  // 工作日志相关 API
  workLog: {
    /**
     * 获取指定日期的日志
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<string>>}
     */
    getLogByDate: (date: string): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('work-log:get-by-date', date);
    },

    /**
     * 保存日志
     * @param {string} date 日期 (YYYY-MM-DD)
     * @param {string} content 日志内容
     * @returns {Promise<ServiceResult<void>>}
     */
    saveLog: (date: string, content: string): Promise<ServiceResult<void>> => {
      return ipcRenderer.invoke('work-log:save', date, content);
    },

    /**
     * AI生成日志
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<string>>}
     */
    generateLog: (date: string): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('work-log:generate', date);
    },

    /**
     * 导出日志
     * @param {string} date 日期 (YYYY-MM-DD)
     * @returns {Promise<ServiceResult<string>>}
     */
    exportLog: (date: string): Promise<ServiceResult<string>> => {
      return ipcRenderer.invoke('work-log:export', date);
    },

    /**
     * 获取今日统计
     * @returns {Promise<ServiceResult<{completedTasks: number, totalTasks: number, totalHours: number, efficiencyScore: number, interruptions: number}>>}
     */
    getTodayStats: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('work-log:get-today-stats');
    }
  },

  // 数据分析相关 API
  dataAnalysis: {
    /**
     * 获取效率统计
     * @returns {Promise<ServiceResult<{weekEfficiency: number, monthEfficiency: number, bestTimeSlots: Array}>}
     */
    getEfficiencyStats: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('data-analysis:get-efficiency-stats');
    },

    /**
     * 获取任务完成率统计
     * @returns {Promise<ServiceResult<Array<{name: string, total: number, completed: number, rate: number}>>>}
     */
    getCompletionStats: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('data-analysis:get-completion-stats');
    },

    /**
     * 获取工作模式
     * @returns {Promise<ServiceResult<Array<{type: string, avgMinutes: number, efficiency: number, sampleCount: number}>>>}
     */
    getWorkPatterns: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('data-analysis:get-work-patterns');
    },

    /**
     * 获取所有统计数据
     * @returns {Promise<ServiceResult<{efficiency: any, completion: any, patterns: any}>>}
     */
    getAllStats: (): Promise<ServiceResult<any>> => {
      return ipcRenderer.invoke('data-analysis:get-all-stats');
    }
  }

});

// 控制台输出预加载脚本加载成功的消息
console.log('✅ Preload script loaded successfully');
console.log('🌐 Electron API exposed to renderer process');