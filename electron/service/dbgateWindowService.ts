const electron = require('electron')
const { BrowserWindow, Menu, ipcMain, app, shell, dialog } = electron
import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs'
import * as os from 'os'

let dbgateWindow: typeof BrowserWindow | null = null
let dbgateApi: any = null
let dbgateMainModule: any = null
let isDbgateInitialized = false
let dbgateMenu: typeof Menu | null = null
let commands: Record<string, any> = {}
let runCommandOnLoad: string | null = null
let saveConfigOnExit = true
let initialConfig: any = {}
let settingsJson: any = {}

// ==================== 工具函数 ====================

/**
 * 检查是否为 Mac 系统
 */
function isMac(): boolean {
  return os.platform() === 'darwin'
}

/**
 * 检查是否为专业版应用（始终返回 false）
 */
function isProApp(): boolean {
  return false
}

/**
 * 获取翻译文本
 */
function getTranslated(key: any): string {
  if (typeof key === 'string' && (global as any).TRANSLATION_DATA?.[key]) {
    return (global as any).TRANSLATION_DATA[key]
  }
  if (typeof key?._transKey === 'string') {
    return (global as any).TRANSLATION_DATA?.[key._transKey] ?? key._transOptions?.defaultMessage
  }
  return key
}

/**
 * 格式化快捷键文本
 */
function formatKeyText(keyText?: string): string | undefined {
  if (!keyText) {
    return keyText
  }
  if (os.platform() === 'darwin') {
    return keyText.replace('CtrlOrCommand+', 'Command+')
  }
  return keyText.replace('CtrlOrCommand+', 'Ctrl+')
}

/**
 * 确保窗口边界在可见区域内
 */
function ensureBoundsVisible(bounds: any): any {
  const { screen } = require('electron')
  const area = screen.getDisplayMatching(bounds).workArea

  let { x, y, width, height } = bounds

  const isWithinDisplay =
    x >= area.x && x + width <= area.x + area.width && y >= area.y && y + height <= area.y + area.height

  if (!isWithinDisplay) {
    width = Math.min(width, area.width)
    height = Math.min(height, area.height)

    if (width < 400) width = 400
    if (height < 300) height = 300

    x = area.x
    y = area.y
  }

  return { x, y, width, height }
}

/**
 * 填充缺失的设置
 */
function fillMissingSettings(value: any): any {
  const res = { ...value }
  if (value['app.useNativeMenu'] !== true && value['app.useNativeMenu'] !== false) {
    res['app.useNativeMenu'] = false
  }
  return res
}

// ==================== 菜单定义 ====================

/**
 * 菜单项翻译函数
 */
function _t(key: string, options: { defaultMessage?: string; currentTranslations?: any } = {}): string {
  return options.currentTranslations?.[key] || (global as any).TRANSLATION_DATA?.[key] || options.defaultMessage || key
}

/**
 * 菜单定义
 */
function getMainMenuDefinition(editMenu: boolean = true): any[] {
  return [
    {
      label: _t('menu.file', { defaultMessage: 'File' }),
      submenu: [
        { command: 'new.connection', hideDisabled: true },
        { command: 'new.sqliteDatabase', hideDisabled: true },
        { command: 'new.duckdbDatabase', hideDisabled: true },
        { divider: true },
        { command: 'new.query', hideDisabled: true },
        { command: 'new.queryDesign', hideDisabled: true },
        { command: 'new.diagram', hideDisabled: true },
        { command: 'new.perspective', hideDisabled: true },
        { command: 'new.application', hideDisabled: true },
        { command: 'new.shell', hideDisabled: true },
        { command: 'new.jsonl', hideDisabled: true },
        { command: 'new.modelTransform', hideDisabled: true },
        { divider: true },
        { command: 'file.open', hideDisabled: true },
        { command: 'file.openArchive', hideDisabled: true },
        { divider: true },
        { command: 'group.save', hideDisabled: true },
        { command: 'group.saveAs', hideDisabled: true },
        { divider: true },
        { command: 'file.exit', hideDisabled: true },
        { command: 'app.logout', hideDisabled: true, skipInApp: true },
        { command: 'app.disconnect', hideDisabled: true, skipInApp: true },
      ],
    },
    editMenu
      ? {
          label: _t('menu.edit', { defaultMessage: 'Edit' }),
          submenu: [
            { command: 'edit.undo' },
            { command: 'edit.redo' },
            { divider: true },
            { command: 'edit.cut' },
            { command: 'edit.copy' },
            { command: 'edit.paste' },
            { command: 'edit.selectAll' },
          ],
        }
      : null,
    {
      label: _t('menu.view', { defaultMessage: 'View' }),
      submenu: [
        { command: 'app.reload', hideDisabled: true },
        { command: 'app.toggleDevTools', hideDisabled: true },
        { command: 'app.toggleFullScreen', hideDisabled: true },
        { command: 'app.minimize', hideDisabled: true },
        { command: 'toggle.sidebar' },
        { divider: true },
        { command: 'theme.changeTheme', hideDisabled: true },
        { command: 'settings.show' },
        { divider: true },
        { command: 'tabs.closeTab', hideDisabled: false },
        { command: 'tabs.closeAll', hideDisabled: false },
        { command: 'tabs.closeTabsWithCurrentDb', hideDisabled: false },
        { command: 'tabs.closeTabsButCurrentDb', hideDisabled: false },
        { divider: true },
        { command: 'app.zoomIn', hideDisabled: true },
        { command: 'app.zoomOut', hideDisabled: true },
        { command: 'app.zoomReset', hideDisabled: true },
        { divider: true },
        { command: 'app.showLogs', hideDisabled: true },
      ],
    },
    {
      label: _t('menu.tools', { defaultMessage: 'Tools' }),
      submenu: [
        { command: 'database.search', hideDisabled: true },
        { command: 'commandPalette.show', hideDisabled: true },
        { command: 'database.switch', hideDisabled: true },
        { divider: true },
        { command: 'sql.generator', hideDisabled: true },
        { command: 'file.import', hideDisabled: true },
        { command: 'new.modelCompare', hideDisabled: true },
        { divider: true },
        { command: 'folder.showLogs', hideDisabled: true },
        { command: 'folder.showData', hideDisabled: true },
        { command: 'app.resetSettings', hideDisabled: true },
        { divider: true },
        { command: 'app.exportConnections', hideDisabled: true },
        { command: 'app.importConnections', hideDisabled: true },
        { divider: true },
        { command: 'app.managePlugins', hideDisabled: true },
      ],
    },
    ...(isMac()
      ? [
          {
            role: 'window',
            submenu: [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }],
          },
        ]
      : []),
    {
      label: _t('menu.help', { defaultMessage: 'Help' }),
      submenu: [
        { command: 'app.openDocs', hideDisabled: true },
        { command: 'app.openWeb', hideDisabled: true },
        { command: 'app.openIssue', hideDisabled: true },
        { command: 'app.openSponsoring', hideDisabled: true },
        { divider: true },
        { command: 'settings.commands', hideDisabled: true },
        { command: 'tabs.changelog', hideDisabled: true },
        { command: 'about.show', hideDisabled: true },
        { divider: true },
        { command: 'app.checkForUpdates', hideDisabled: true },
      ],
    },
  ].filter(Boolean)
}

/**
 * 创建命令菜单项
 */
function commandItem(item: any, disableAll: boolean = false): any {
  const id = item.command
  const command = commands[id]
  
  if (item.skipInApp) {
    return { skip: true }
  }
  
  // 如果命令不存在，仍然创建菜单项但禁用（这样菜单结构会显示）
  // 当收到 update-commands 后，菜单会被更新
  if (!command) {
    return {
      id,
      label: id, // 使用命令 ID 作为临时标签
      enabled: false,
      visible: true, // 确保菜单项可见
      click() {
        // 空函数，命令未加载时不做任何事
      },
    }
  }
  
  return {
    id,
    label: getTranslated(command.menuName) || getTranslated(command.toolbarName) || getTranslated(command.name) || id,
    accelerator: formatKeyText(command.keyText),
    enabled: command.enabled && (!disableAll || command.systemCommand),
    click() {
      if (dbgateWindow) {
        dbgateWindow.webContents.send('run-command', id)
      } else {
        // 如果窗口还没创建，记录命令并创建窗口
        runCommandOnLoad = id
        DbgateWindowService.createDbgateWindow()
      }
    },
  }
}

/**
 * 简单的深拷贝函数（用于菜单构建）
 */
function cloneDeepWith(obj: any, customizer: (value: any) => any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map(item => {
      const result = customizer ? customizer(item) : undefined
      return result !== undefined ? result : cloneDeepWith(item, customizer)
    })
  }
  const cloned: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = customizer ? customizer(obj[key]) : undefined
      cloned[key] = result !== undefined ? result : cloneDeepWith(obj[key], customizer)
    }
  }
  return cloned
}

/**
 * 构建菜单
 */
function buildMenu(disableAll: boolean = false): typeof Menu {
  // 使用简单的深拷贝函数
  const _cloneDeepWith = cloneDeepWith
  
  let template = _cloneDeepWith(getMainMenuDefinition(true), (item: any) => {
    if (item.divider) {
      return { type: 'separator' }
    }
    if (item.command) {
      return commandItem(item, disableAll)
    }
  })

  template = _cloneDeepWith(template, (item: any) => {
    if (Array.isArray(item) && item.find((x: any) => x.skip)) {
      return item.filter((x: any) => x && !x.skip)
    }
  })

  if (isMac()) {
    template = [
      {
        label: 'DbGate',
        submenu: [
          commandItem({ command: 'about.show' }, disableAll),
          { role: 'services' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { role: 'quit' },
        ],
      },
      ...template,
    ]
  }

  return Menu.buildFromTemplate(template)
}

// ==================== 配置管理 ====================

/**
 * 加载配置
 */
function loadConfig(): void {
  const configRootPath = path.join(app.getPath('userData'), 'dbgate-config-root.json')
  
  try {
    initialConfig = JSON.parse(fs.readFileSync(configRootPath, { encoding: 'utf-8' }))
  } catch (err: any) {
    console.log('Error loading dbgate config-root:', err.message)
    initialConfig = {}
  }

  // 加载设置
  const datadir = path.join(os.homedir(), '.dbgate')
  try {
    settingsJson = fillMissingSettings(
      JSON.parse(fs.readFileSync(path.join(datadir, 'settings.json'), { encoding: 'utf-8' }))
    )
  } catch (err: any) {
    console.log('Error loading dbgate settings.json:', err.message)
    settingsJson = fillMissingSettings({})
  }
}

/**
 * 保存配置
 */
function saveConfig(): void {
  if (!dbgateWindow || !saveConfigOnExit) {
    return
  }

  try {
    const configRootPath = path.join(app.getPath('userData'), 'dbgate-config-root.json')
    fs.writeFileSync(
      configRootPath,
      JSON.stringify({
        winBounds: dbgateWindow.getBounds(),
        winIsMaximized: dbgateWindow.isMaximized(),
        winZoomLevel: dbgateWindow.webContents.zoomLevel,
      }),
      'utf-8'
    )
  } catch (err: any) {
    console.log('Error saving dbgate config-root:', err.message)
  }
}

// ==================== 路径查找函数 ====================

/**
 * 智能查找 dbgate 文件路径
 * 支持开发环境和生产环境（打包后）
 */
function findDbgatePath(relativePath: string): string | null {
  // 可能的根目录路径（从 dist/electron/service 向上查找）
  const possibleRoots = [
    // 开发环境：从 dist/electron/service 向上三级到达项目根目录
    path.join(__dirname, '../../..'),
    // 生产环境：从 resources/app/electron/service 向上三级
    path.join(__dirname, '../../../..'),
    // 如果打包在 app.asar 中，从 resources 目录查找
    (process as any).resourcesPath ? path.join((process as any).resourcesPath, 'app') : null,
    // 当前工作目录
    process.cwd(),
    // 从 app.getAppPath() 查找（Electron 应用路径）
    app ? app.getAppPath() : null,
  ].filter(Boolean) as string[]

  // 需要查找的路径模式
  const searchPatterns = [
    // 模式1：直接在根目录下的 dbgate-master
    (root: string) => path.join(root, 'dbgate-master', relativePath),
    // 模式2：在 dist 目录下的 dbgate-master（开发环境构建后）
    (root: string) => path.join(root, 'dist', 'dbgate-master', relativePath),
    // 模式3：在 app/packages 中（dbgate app 打包后的结构）
    (root: string) => path.join(root, 'dbgate-master', 'app', relativePath),
    // 模式4：直接在根目录（如果 relativePath 已经包含 dbgate-master）
    (root: string) => path.join(root, relativePath),
  ]

  for (const root of possibleRoots) {
    for (const pattern of searchPatterns) {
      const fullPath = pattern(root)
      if (fs.existsSync(fullPath)) {
        return fullPath
      }
    }
  }

  return null
}

// ==================== DbgateWindowService 类 ====================

export class DbgateWindowService {
  /**
   * 初始化 dbgate API 服务（预检查）
   * 注意：实际的 API 加载和 IPC 注册在 createDbgateWindow() 中进行，
   * 与原始代码保持一致（在 createWindow() 内部调用 useAllControllers）
   */
  static async initialize() {
    // 这个方法现在只做预检查，实际的初始化在 createDbgateWindow() 中进行
    // 这样可以确保在创建窗口之后才注册 IPC 处理程序，与原始代码保持一致
    console.log('DbgateWindowService.initialize() called (pre-check only)')
    console.log('Actual API initialization will happen in createDbgateWindow()')
  }

  /**
   * 创建并显示 dbgate 窗口
   */
  static async createDbgateWindow() {
    // 如果窗口已存在，则聚焦它
    if (dbgateWindow && !dbgateWindow.isDestroyed()) {
      dbgateWindow.focus()
      return dbgateWindow
    }

    // 加载配置
    loadConfig()

    // 智能查找 dbgate web 文件路径（支持开发和生产环境）
    // 优先查找 app/packages/web/public（dbgate app 打包后的结构）
    // 然后查找 packages/web/public（开发环境）
    const dbgateWebPath = findDbgatePath('app/packages/web/public') ||
      findDbgatePath('packages/web/public') ||
      path.join(__dirname, '../../../dbgate-master/app/packages/web/public')

    if (!dbgateWebPath) {
      throw new Error('Dbgate web path not found. Please ensure dbgate files are copied to dist.')
    }

    const indexPath = path.join(dbgateWebPath, 'index.html')

    // 检查文件是否存在
    if (!fs.existsSync(indexPath)) {
      console.error('Dbgate index.html not found at:', indexPath)
      throw new Error('Dbgate files not found. Please build dbgate first.')
    }

    // 获取窗口边界
    let bounds = initialConfig['winBounds']
    if (bounds) {
      bounds = ensureBoundsVisible(bounds)
    }

    const useNativeMenu = settingsJson['app.useNativeMenu'] || false

    // 创建窗口
    dbgateWindow = new BrowserWindow({
      width: bounds?.width || 1400,
      height: bounds?.height || 900,
      x: bounds?.x,
      y: bounds?.y,
      minWidth: 1000,
      minHeight: 700,
      title: isProApp() ? 'DbGate Premium' : 'DbGate - 数据库管理工具',
      frame: useNativeMenu,
      titleBarStyle: useNativeMenu ? undefined : 'default',
      backgroundColor: '#ffffff',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        spellcheck: false,
        // 允许访问本地文件
        webSecurity: false,
      },
    })

    // 恢复窗口状态
    if (initialConfig['winIsMaximized']) {
      dbgateWindow.maximize()
    } else if (!bounds) {
      // 如果没有保存的配置，默认最大化窗口
      dbgateWindow.maximize()
    }
    if (settingsJson['app.fullscreen']) {
      dbgateWindow.setFullScreen(true)
    }
    if (initialConfig['winZoomLevel'] != null) {
      dbgateWindow.webContents.zoomLevel = initialConfig['winZoomLevel']
    }

    // 确保 API 已初始化（在创建窗口之后，与原始代码保持一致）
    // 原始代码中，useAllControllers 是在 createWindow() 内部调用的
    if (!isDbgateInitialized) {
      // 智能查找 dbgate API 包路径（支持开发和生产环境）
      const dbgateApiPath = findDbgatePath('packages/api/dist/bundle.js') ||
        findDbgatePath('app/packages/api/dist/bundle.js') ||
        path.join(__dirname, '../../../dbgate-master/packages/api/dist/bundle.js')

      if (!fs.existsSync(dbgateApiPath)) {
        console.warn('Dbgate API bundle not found, skipping initialization')
        console.warn('Tried path:', dbgateApiPath)
        console.warn('__dirname:', __dirname)
        console.warn('process.cwd():', process.cwd())
      } else {
        console.log('Found dbgate API at:', dbgateApiPath)
        
        // 设置全局变量（dbgate 需要这些）
        // 必须在加载 API 之前设置，因为 API 可能在加载时读取这些变量
        ;(global as any).API_PACKAGE = dbgateApiPath
        
        // 智能查找插件目录路径（支持开发和生产环境）
        const pluginsDir = findDbgatePath('plugins') ||
          findDbgatePath('app/packages/plugins') ||
          path.join(__dirname, '../../../dbgate-master/plugins')
        
        ;(global as any).PLUGINS_DIR = pluginsDir
        
        // 设置 IS_NPM_DIST = true，这样 dbgate 会使用 global.PLUGINS_DIR
        // 而不是根据 __dirname 计算路径（因为我们的目录结构与 dbgate 预期不同）
        ;(global as any).IS_NPM_DIST = true
        
        console.log('Setting dbgate global variables:')
        console.log('  API_PACKAGE:', dbgateApiPath)
        console.log('  PLUGINS_DIR:', pluginsDir)
        console.log('  IS_NPM_DIST: true')
        
        // 验证插件目录是否存在
        if (!fs.existsSync(pluginsDir)) {
          console.warn('⚠ PLUGINS_DIR does not exist:', pluginsDir)
          console.warn('  Creating directory...')
          try {
            fs.mkdirSync(pluginsDir, { recursive: true })
            console.log('  ✓ Directory created')
          } catch (err: any) {
            console.error('  ✗ Failed to create directory:', err.message)
          }
        } else {
          console.log('  ✓ PLUGINS_DIR exists')
        }

        // 加载 dbgate API（必须在设置全局变量之后）
        dbgateApi = require(dbgateApiPath)
        
        // 配置日志
        dbgateApi.configureLogger()
        
        // 获取主模块
        dbgateMainModule = dbgateApi.getMainModule()
        
        // 启动 API 服务（传入 electron 对象以支持 IPC）
        // 与原始代码保持一致：在创建窗口之后调用 useAllControllers
        const electron = require('electron')
        
        console.log('Registering dbgate IPC handlers (in createDbgateWindow)...')
        
        // 注册所有控制器（这会自动注册所有 IPC 处理程序）
        dbgateMainModule.useAllControllers(null, electron)
        
        console.log('✓ Dbgate IPC handlers registered (config-get, config-get-settings, etc.)')
        
        isDbgateInitialized = true
      }
    }

    // 设置 Electron sender（用于 IPC 通信）
    // 必须在 useAllControllers 之后调用
    if (dbgateMainModule) {
      dbgateMainModule.setElectronSender(dbgateWindow.webContents)
    }

    // 构建并设置菜单（即使命令为空，也要先显示基础菜单结构）
    dbgateMenu = buildMenu()
    dbgateWindow.setMenu(dbgateMenu)
    Menu.setApplicationMenu(dbgateMenu)
    console.log('✓ Dbgate menu created and set')

    // 加载 dbgate 页面
    const startUrl = url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true,
    })

    dbgateWindow.loadURL(startUrl)

    // 窗口事件处理
    dbgateWindow.on('maximize', () => {
      dbgateWindow?.webContents.send('setIsMaximized', true)
    })

    dbgateWindow.on('unmaximize', () => {
      dbgateWindow?.webContents.send('setIsMaximized', false)
    })

    dbgateWindow.on('close', () => {
      saveConfig()
    })

    // 窗口关闭时清理
    dbgateWindow.on('closed', () => {
      dbgateWindow = null
      if (dbgateMainModule) {
        dbgateMainModule.setElectronSender(null)
      }
      saveConfig()
    })

    // 应用启动完成
    dbgateWindow.webContents.once('did-finish-load', () => {
      if (runCommandOnLoad) {
        dbgateWindow?.webContents.send('run-command', runCommandOnLoad)
        runCommandOnLoad = null
      }

      if (initialConfig['winIsMaximized']) {
        dbgateWindow?.webContents.send('setIsMaximized', true)
      }

      if (initialConfig['winZoomLevel'] != null) {
        dbgateWindow.webContents.zoomLevel = initialConfig['winZoomLevel']
      }
    })

    // 开发模式下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      dbgateWindow.webContents.openDevTools()
    }

    return dbgateWindow
  }

  /**
   * 检查 dbgate 窗口是否存在
   */
  static hasDbgateWindow(): boolean {
    return dbgateWindow !== null && !dbgateWindow.isDestroyed()
  }

  /**
   * 关闭 dbgate 窗口
   */
  static closeDbgateWindow() {
    if (dbgateWindow && !dbgateWindow.isDestroyed()) {
      saveConfig()
      dbgateWindow.close()
      dbgateWindow = null
      if (dbgateMainModule) {
        dbgateMainModule.setElectronSender(null)
      }
    }
  }

  /**
   * 获取 dbgate 窗口实例
   */
  static getDbgateWindow(): typeof BrowserWindow | null {
    return dbgateWindow
  }

  /**
   * 注册 dbgate 相关的 IPC 处理程序
   */
  static registerIpcHandlers() {
    // 更新命令（从渲染进程接收命令状态更新）
    // 注意：dbgate 渲染进程发送的是 'update-commands'，不是 'dbgate-update-commands'
    ipcMain.on('update-commands', async (event: any, arg: any) => {
      // 检查是否是 dbgate 窗口发送的消息
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        await this.handleUpdateCommands(arg)
      }
    })
    
    // 也支持带前缀的版本（以防万一）
    ipcMain.on('dbgate-update-commands', async (event: any, arg: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        await this.handleUpdateCommands(arg)
      }
    })

    // 退出应用
    ipcMain.on('quit-app', async (event: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        if (isMac()) {
          app.quit()
        } else {
          this.closeDbgateWindow()
        }
      }
    })

    // 重置设置
    ipcMain.on('reset-settings', async (event: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        try {
          saveConfigOnExit = false
          const configRootPath = path.join(app.getPath('userData'), 'dbgate-config-root.json')
          fs.unlinkSync(configRootPath)
          console.log('Deleted dbgate config file:', configRootPath)
        } catch (err: any) {
          console.log('Error deleting dbgate config-root:', err.message)
        }

        if (isMac()) {
          app.quit()
        } else {
          this.closeDbgateWindow()
        }
      }
    })

    // 设置窗口标题
    ipcMain.on('set-title', async (event: any, title: string) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        dbgateWindow.setTitle(title)
      }
    })

    // 打开外部链接
    ipcMain.on('open-link', async (event: any, url: string) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        shell.openExternal(url)
      }
    })

    // 打开开发者工具
    ipcMain.on('open-dev-tools', (event: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        dbgateWindow.webContents.openDevTools()
      }
    })

    // 应用启动完成
    ipcMain.on('app-started', async (event: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        if (runCommandOnLoad) {
          dbgateWindow.webContents.send('run-command', runCommandOnLoad)
          runCommandOnLoad = null
        }

        if (initialConfig['winIsMaximized']) {
          dbgateWindow.webContents.send('setIsMaximized', true)
        }
      }
    })

    // 窗口操作
    ipcMain.on('window-action', async (event: any, action: string) => {
      if (!dbgateWindow || event.sender !== dbgateWindow.webContents) {
        return
      }

      switch (action) {
        case 'minimize':
          dbgateWindow.minimize()
          break
        case 'maximize':
          dbgateWindow.isMaximized() ? dbgateWindow.unmaximize() : dbgateWindow.maximize()
          break
        case 'close':
          this.closeDbgateWindow()
          break
        case 'fullscreen-on':
          dbgateWindow.setFullScreen(true)
          break
        case 'fullscreen-off':
          dbgateWindow.setFullScreen(false)
          break
        case 'devtools':
          dbgateWindow.webContents.toggleDevTools()
          break
        case 'reload':
          dbgateWindow.webContents.reloadIgnoringCache()
          break
        case 'zoomin':
          dbgateWindow.webContents.zoomLevel += 0.5
          break
        case 'zoomout':
          dbgateWindow.webContents.zoomLevel -= 0.5
          break
        case 'zoomreset':
          dbgateWindow.webContents.zoomLevel = 0
          break
        case 'undo':
          dbgateWindow.webContents.undo()
          break
        case 'redo':
          dbgateWindow.webContents.redo()
          break
        case 'cut':
          dbgateWindow.webContents.cut()
          break
        case 'copy':
          dbgateWindow.webContents.copy()
          break
        case 'paste':
          dbgateWindow.webContents.paste()
          break
        case 'selectAll':
          dbgateWindow.webContents.selectAll()
          break
      }
    })

    // 对话框处理
    ipcMain.handle('showOpenDialog', async (event: any, options: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        return dialog.showOpenDialogSync(dbgateWindow, options)
      }
      return null
    })

    ipcMain.handle('showSaveDialog', async (event: any, options: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        return dialog.showSaveDialogSync(dbgateWindow, options)
      }
      return null
    })

    ipcMain.handle('showItemInFolder', async (event: any, filePath: string) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        shell.showItemInFolder(filePath)
      }
    })

    ipcMain.handle('openExternal', async (event: any, url: string) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        shell.openExternal(url)
      }
    })

    // 翻译数据
    ipcMain.on('translation-data', async (event: any, arg: any) => {
      if (dbgateWindow && event.sender === dbgateWindow.webContents) {
        ;(global as any).TRANSLATION_DATA = typeof arg === 'string' ? JSON.parse(arg) : arg
        if (dbgateWindow) {
          dbgateMenu = buildMenu()
          dbgateWindow.setMenu(dbgateMenu)
          Menu.setApplicationMenu(dbgateMenu)
        }
      }
    })
  }

  /**
   * 处理命令更新
   */
  private static async handleUpdateCommands(arg: any) {
    const parsed = typeof arg === 'string' ? JSON.parse(arg) : arg
    commands = parsed.commands || {}
    const isModalOpened = parsed.isModalOpened
    const dbgatePage = parsed.dbgatePage

    if (!dbgateWindow) {
      return
    }

    // 如果菜单不存在，先构建一个基础菜单
    if (!dbgateMenu) {
      dbgateMenu = buildMenu(isModalOpened || !!dbgatePage)
      dbgateWindow.setMenu(dbgateMenu)
      Menu.setApplicationMenu(dbgateMenu)
    }

    // 更新菜单项状态
    let needRebuild = false
    for (const key of Object.keys(commands)) {
      const menu = dbgateMenu.getMenuItemById(key)
      if (!menu) continue
      const command = commands[key]

      // 如果翻译或快捷键改变，需要重建菜单
      if (
        (global as any).TRANSLATION_DATA &&
        (menu.label !== command.text || menu.accelerator !== command.keyText)
      ) {
        needRebuild = true
        break
      }

      menu.enabled = command.enabled && !isModalOpened && !dbgatePage
    }

    // 如果需要重建菜单
    if (needRebuild) {
      dbgateMenu = buildMenu(isModalOpened || !!dbgatePage)
      dbgateWindow.setMenu(dbgateMenu)
      Menu.setApplicationMenu(dbgateMenu)
    }
  }
}
