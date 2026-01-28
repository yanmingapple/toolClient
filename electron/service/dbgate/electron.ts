import { BrowserWindow, Menu, ipcMain, app, shell, dialog } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs'
import * as os from 'os'
import { isMac, ensureBoundsVisible, findDbgatePath } from './utils'
import { isProApp } from './proTools'
import { loadConfig, saveConfig, getInitialConfig, getSettingsJson } from './config'
import { buildMenu, setCommands, setDbgateWindow, setRunCommandOnLoad, getCommands, getDbgateWindow, getRunCommandOnLoad } from './menu'

// 全局变量
let dbgateApi: any = null
let dbgateMainModule: any = null
let isDbgateInitialized = false
let dbgateMenu: typeof Menu | null = null
let saveConfigOnExit = true

/**
 * 创建 dbgate 窗口
 */
export function createWindow() {
  // 如果窗口已存在，则聚焦它
  const existingWindow = getDbgateWindow()
  if (existingWindow && !existingWindow.isDestroyed()) {
    existingWindow.focus()
    return existingWindow
  }

  // 加载配置
  loadConfig()
  const initialConfig = getInitialConfig()
  const settingsJson = getSettingsJson()

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
  const window = new BrowserWindow({
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

  // 设置全局窗口引用
  setDbgateWindow(window)

  // 恢复窗口状态
  if (initialConfig['winIsMaximized']) {
    window.maximize()
  } else if (!bounds) {
    // 如果没有保存的配置，默认最大化窗口
    window.maximize()
  }
  if (settingsJson['app.fullscreen']) {
    window.setFullScreen(true)
  }
  if (initialConfig['winZoomLevel'] != null) {
    window.webContents.zoomLevel = initialConfig['winZoomLevel']
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
      // 在加载之前，确保 Node.js 可以找到项目的 node_modules
      // 这样 volatile packages（如 activedirectory2）才能被正确解析
      const projectRoot = path.join(__dirname, '../../..')
      const projectNodeModules = path.join(projectRoot, 'node_modules')
      
      // 将项目的 node_modules 添加到模块解析路径的最前面
      // 这样 require() 会优先从项目的 node_modules 查找模块
      const Module = require('module')
      const originalPaths = Module._nodeModulePaths
      
      Module._nodeModulePaths = function(from: string) {
        const paths = originalPaths.call(this, from)
        // 将项目根目录的 node_modules 添加到路径列表的最前面
        if (!paths.includes(projectNodeModules)) {
          paths.unshift(projectNodeModules)
        }
        return paths
      }
      
      try {
        dbgateApi = require(dbgateApiPath)
      } finally {
        // 恢复原始的模块路径解析函数
        Module._nodeModulePaths = originalPaths
      }
      
      // 配置日志
      dbgateApi.configureLogger()
      
      // 获取主模块
      dbgateMainModule = dbgateApi.getMainModule()
      
      // 启动 API 服务（传入 electron 对象以支持 IPC）
      // 与原始代码保持一致：在创建窗口之后调用 useAllControllers
      const electron = require('electron')
      
      console.log('Registering dbgate IPC handlers (in createWindow)...')
      
      // 注册所有控制器（这会自动注册所有 IPC 处理程序）
      dbgateMainModule.useAllControllers(null, electron)
      
      console.log('✓ Dbgate IPC handlers registered (config-get, config-get-settings, etc.)')
      
      isDbgateInitialized = true
    }
  }

  // 设置 Electron sender（用于 IPC 通信）
  // 必须在 useAllControllers 之后调用
  if (dbgateMainModule) {
    dbgateMainModule.setElectronSender(window.webContents)
  }

  // 注意：菜单不在窗口创建时立即构建
  // 原始代码中菜单构建被注释掉了，菜单会在收到 update-commands 后构建
  // 这样可以确保命令数据和翻译数据都已加载
  // dbgateMenu = buildMenu(false, createWindow)
  // window.setMenu(dbgateMenu)
  // Menu.setApplicationMenu(dbgateMenu)
  console.log('✓ Dbgate window created, menu will be built after commands are loaded')

  // 加载 dbgate 页面
  const startUrl = url.format({
    pathname: indexPath,
    protocol: 'file:',
    slashes: true,
  })

  window.loadURL(startUrl)

  // 窗口事件处理
  window.on('maximize', () => {
    const win = getDbgateWindow()
    if (win) {
      win.webContents.send('setIsMaximized', true)
    }
  })

  window.on('unmaximize', () => {
    const win = getDbgateWindow()
    if (win) {
      win.webContents.send('setIsMaximized', false)
    }
  })

  window.on('close', () => {
    saveConfig(window, saveConfigOnExit)
  })

  // 窗口关闭时清理
  window.on('closed', () => {
    setDbgateWindow(null)
    if (dbgateMainModule) {
      dbgateMainModule.setElectronSender(null)
    }
    saveConfig(window, saveConfigOnExit)
  })

  // 应用启动完成
  window.webContents.once('did-finish-load', () => {
    const runCmd = getRunCommandOnLoad()
    if (runCmd) {
      window?.webContents.send('run-command', runCmd)
      setRunCommandOnLoad(null)
    }

    if (initialConfig['winIsMaximized']) {
      window?.webContents.send('setIsMaximized', true)
    }

    if (initialConfig['winZoomLevel'] != null) {
      window.webContents.zoomLevel = initialConfig['winZoomLevel']
    }
  })

  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    window.webContents.openDevTools()
  }

  return window
}

/**
 * 注册 IPC 处理程序
 */
export function registerIpcHandlers() {
  // 更新命令（从渲染进程接收命令状态更新）
  ipcMain.on('update-commands', async (event, arg) => {
    // 检查是否是 dbgate 窗口发送的消息
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      await handleUpdateCommands(arg)
    }
  })
  
  // 也支持带前缀的版本（以防万一）
  ipcMain.on('dbgate-update-commands', async (event, arg) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      await handleUpdateCommands(arg)
    }
  })

  // 退出应用
  ipcMain.on('quit-app', async (event) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      if (isMac()) {
        app.quit()
      } else {
        closeWindow()
      }
    }
  })

  // 重置设置
  ipcMain.on('reset-settings', async (event) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
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
        closeWindow()
      }
    }
  })

  // 设置窗口标题
  ipcMain.on('set-title', async (event, title: string) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      window.setTitle(title)
    }
  })

  // 打开外部链接
  ipcMain.on('open-link', async (event, url: string) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      shell.openExternal(url)
    }
  })

  // 打开开发者工具
  ipcMain.on('open-dev-tools', (event) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      window.webContents.openDevTools()
    }
  })

  // 应用启动完成
  ipcMain.on('app-started', async (event) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      const runCmd = getRunCommandOnLoad()
      if (runCmd) {
        window.webContents.send('run-command', runCmd)
        setRunCommandOnLoad(null)
      }

      const initialConfig = getInitialConfig()
      if (initialConfig['winIsMaximized']) {
        window.webContents.send('setIsMaximized', true)
      }
    }
  })

  // 窗口操作
  ipcMain.on('window-action', async (event, action: string) => {
    const window = getDbgateWindow()
    if (!window || event.sender !== window.webContents) {
      return
    }

    switch (action) {
      case 'minimize':
        window.minimize()
        break
      case 'maximize':
        window.isMaximized() ? window.unmaximize() : window.maximize()
        break
      case 'close':
        closeWindow()
        break
      case 'fullscreen-on':
        window.setFullScreen(true)
        break
      case 'fullscreen-off':
        window.setFullScreen(false)
        break
      case 'devtools':
        window.webContents.toggleDevTools()
        break
      case 'reload':
        window.webContents.reloadIgnoringCache()
        break
      case 'zoomin':
        window.webContents.zoomLevel += 0.5
        break
      case 'zoomout':
        window.webContents.zoomLevel -= 0.5
        break
      case 'zoomreset':
        window.webContents.zoomLevel = 0
        break
      case 'undo':
        window.webContents.undo()
        break
      case 'redo':
        window.webContents.redo()
        break
      case 'cut':
        window.webContents.cut()
        break
      case 'copy':
        window.webContents.copy()
        break
      case 'paste':
        window.webContents.paste()
        break
      case 'selectAll':
        window.webContents.selectAll()
        break
    }
  })

  // 对话框处理
  ipcMain.handle('showOpenDialog', async (event, options: any) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      return dialog.showOpenDialogSync(window, options)
    }
    return null
  })

  ipcMain.handle('showSaveDialog', async (event, options: any) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      return dialog.showSaveDialogSync(window, options)
    }
    return null
  })

  ipcMain.handle('showItemInFolder', async (event, filePath: string) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      shell.showItemInFolder(filePath)
    }
  })

  ipcMain.handle('openExternal', async (event, url: string) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      shell.openExternal(url)
    }
  })

  // 翻译数据
  ipcMain.on('translation-data', async (event, arg) => {
    const window = getDbgateWindow()
    if (window && event.sender === window.webContents) {
      ;(global as any).TRANSLATION_DATA = typeof arg === 'string' ? JSON.parse(arg) : arg
      if (window) {
        dbgateMenu = buildMenu(false, createWindow)
        window.setMenu(dbgateMenu)
        Menu.setApplicationMenu(dbgateMenu)
      }
    }
  })
}

/**
 * 处理命令更新
 */
async function handleUpdateCommands(arg: any) {
  const parsed = typeof arg === 'string' ? JSON.parse(arg) : arg
  setCommands(parsed.commands || {})
  const isModalOpened = parsed.isModalOpened
  const dbgatePage = parsed.dbgatePage

  const window = getDbgateWindow()
  if (!window) {
    return
  }

  // 如果菜单不存在，先构建一个基础菜单
  if (!dbgateMenu) {
    dbgateMenu = buildMenu(isModalOpened || !!dbgatePage, createWindow)
    window.setMenu(dbgateMenu)
    Menu.setApplicationMenu(dbgateMenu)
  }

  // 更新菜单项状态
  let needRebuild = false
  const commands = getCommands()
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
    dbgateMenu = buildMenu(isModalOpened || !!dbgatePage, createWindow)
    window.setMenu(dbgateMenu)
    Menu.setApplicationMenu(dbgateMenu)
  }
}

/**
 * 关闭窗口
 */
function closeWindow() {
  const window = getDbgateWindow()
  if (window && !window.isDestroyed()) {
    saveConfig(window, saveConfigOnExit)
    window.close()
    setDbgateWindow(null)
    if (dbgateMainModule) {
      dbgateMainModule.setElectronSender(null)
    }
  }
}

/**
 * 获取窗口实例
 */
export function getWindow(): typeof BrowserWindow | null {
  return getDbgateWindow()
}

/**
 * 检查窗口是否存在
 */
export function hasWindow(): boolean {
  const window = getDbgateWindow()
  return window !== null && !window.isDestroyed()
}

