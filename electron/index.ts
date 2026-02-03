// 使用 require 语法避免与本地 electron 目录冲突
const electron = require('electron')
const { app, BrowserWindow, Menu, Tray, nativeImage } = electron
import * as path from 'path'
import * as url from 'url'
import { clientManager } from './manager/ClientManager'
import { MenuService } from './service/menuService'
import { IpcService } from './service/ipcService'
import { SidebarService } from './service/sidebarService'
import { DbgateWindowService } from './service/dbgateWindowService'
import { join } from 'path'

let mainWindow: typeof BrowserWindow | null
let tray: typeof Tray | null
let sidebarWindow: typeof BrowserWindow | null

// 初始化数据库管理类
async function initializeDatabase() {
  try {
    console.log('Initializing database manager...')
    // 显式初始化工具
    await clientManager.initialize()
    console.log('Database manager initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database manager:', error)
    throw error
  }
}

function createWindow() {
  // 获取 preload 脚本路径（兼容开发和生产环境）
  const isDev = process.env.NODE_ENV === 'development'
  let preloadPath: string
  const fs = require('fs')
  
  if (isDev) {
    // 开发环境：使用 process.cwd()
    preloadPath = join(process.cwd(), 'dist/electron/preload.js')
  } else {
    // 生产环境：优先使用 __dirname，如果不存在则尝试其他路径
    preloadPath = join(__dirname, 'preload.js')
    
    // 如果文件不存在，尝试从 app.getAppPath() 获取
    if (!fs.existsSync(preloadPath)) {
      const appPath = app.getAppPath()
      const altPath = join(appPath, 'dist/electron/preload.js')
      if (fs.existsSync(altPath)) {
        preloadPath = altPath
      } else {
        // 最后尝试从 resources 目录
        const resourcesPath = join(appPath, '..', 'dist/electron/preload.js')
        if (fs.existsSync(resourcesPath)) {
          preloadPath = resourcesPath
        }
      }
    }
  }
  
  console.log('[createWindow] Preload path:', preloadPath)
  console.log('[createWindow] __dirname:', __dirname)
  console.log('[createWindow] process.cwd():', process.cwd())
  console.log('[createWindow] app.getAppPath():', app.getAppPath())
  console.log('[createWindow] File exists:', fs.existsSync(preloadPath))
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000#toolpanel')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: '#toolpanel'
      })
    )
  }

  // 主窗口关闭时隐藏而不是退出
  mainWindow.on('close', (event: any) => {
    if (mainWindow) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 创建并设置应用程序菜单
  const menuService = new MenuService(mainWindow);
  menuService.setApplicationMenu();
}

function createTray() {
  // 根据平台和运行环境选择图标文件
  let iconPath: string
  const isDev = process.env.NODE_ENV === 'development'
  
  // 获取应用根目录
  const appPath = isDev ? process.cwd() : path.join(__dirname, '..')
  
  if (process.platform === 'win32') {
    // Windows 使用 .ico 文件
    iconPath = path.join(appPath, 'public/favicon.ico')
  } else if (process.platform === 'darwin') {
    // macOS 使用 .png 文件
    iconPath = path.join(appPath, 'public/favicon.ico')
  } else {
    // Linux 使用 .png 文件
    iconPath = path.join(appPath, 'public/favicon.ico')
  }

  // 尝试加载图标，如果失败则使用默认图标
  let icon: typeof nativeImage
  try {
    console.log('[Tray] 尝试加载图标:', iconPath)
    icon = nativeImage.createFromPath(iconPath)
    // 如果图标为空或无效，尝试使用备用路径
    if (icon.isEmpty()) {
      throw new Error('Icon is empty')
    }
    console.log('[Tray] 图标加载成功')
  } catch (error) {
    console.warn('[Tray] 加载图标失败:', iconPath, error)
    // 尝试使用 dbgate 的图标作为备用
    try {
      const fallbackPath = path.join(appPath, 'dbgate-master/app/icon.png')
      console.log('[Tray] 尝试备用图标:', fallbackPath)
      icon = nativeImage.createFromPath(fallbackPath)
      if (icon.isEmpty()) {
        // 如果还是失败，创建一个简单的默认图标
        icon = nativeImage.createEmpty()
        console.warn('[Tray] 使用空图标作为备用')
      } else {
        console.log('[Tray] 备用图标加载成功')
      }
    } catch (fallbackError) {
      console.warn('[Tray] 备用图标加载失败:', fallbackError)
      icon = nativeImage.createEmpty()
    }
  }

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示应用', click: () => mainWindow?.show() },
    { label: '切换侧边栏', click: () => toggleSidebar() },
    {
      label: '退出',
      click: () => {
        // 先关闭侧边栏窗口
        if (sidebarWindow) {
          sidebarWindow.close()
        }
        // 再关闭主窗口
        if (mainWindow) {
          mainWindow.removeAllListeners('close')
          mainWindow.close()
        }
        // 最后退出应用
        app.quit()
      }
    },
  ] as any[])
  tray.setToolTip('工具')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

function createSidebarWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const sidebarWidth = 120;
  const sidebarHeight = height;

  // 获取 preload 脚本路径（兼容开发和生产环境）
  const isDev = process.env.NODE_ENV === 'development'
  const fs = require('fs')
  let preloadPath: string
  
  if (isDev) {
    preloadPath = join(process.cwd(), 'dist/electron/preload.js')
  } else {
    preloadPath = join(__dirname, 'preload.js')
    
    // 如果文件不存在，尝试从 app.getAppPath() 获取
    if (!fs.existsSync(preloadPath)) {
      const appPath = app.getAppPath()
      const altPath = join(appPath, 'dist/electron/preload.js')
      if (fs.existsSync(altPath)) {
        preloadPath = altPath
      } else {
        const resourcesPath = join(appPath, '..', 'dist/electron/preload.js')
        if (fs.existsSync(resourcesPath)) {
          preloadPath = resourcesPath
        }
      }
    }
  }

  sidebarWindow = new BrowserWindow({
    width: sidebarWidth,
    height: sidebarHeight,
    x: width - 5,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true,
    },
  });

  // 加载侧边栏页面
  if (process.env.NODE_ENV === 'development') {
    sidebarWindow.loadURL('http://localhost:3000/sidebar')
  } else {
    sidebarWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: '#sidebar'
      })
    )
  }

  sidebarWindow.on('closed', () => {
    sidebarWindow = null
  });

  return sidebarWindow;
}

function toggleSidebar() {
  if (sidebarWindow) {
    if (sidebarWindow.isVisible()) {
      sidebarWindow.hide();
    } else {
      sidebarWindow.show();
    }
  } else {
    createSidebarWindow();
  }
}

app.on('ready', async () => {
  try {
    // 初始化 dbgate API 服务（在工具之前）
    await DbgateWindowService.initialize()
    
    // 初始化工具
    await initializeDatabase()

    createWindow()
    createTray()
    createSidebarWindow()
    // 注册主进程相关的 IPC 处理程序
    IpcService.registerHandlers(mainWindow, sidebarWindow)
    // 设置侧边栏窗口事件监听
    SidebarService.setupWindowEventListeners()
    console.log('Application startup completed successfully')
  } catch (error) {
    console.error('Failed to start application:', error)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', async () => {
  tray?.destroy()
  sidebarWindow?.close()
  
  // 关闭 dbgate 窗口
  DbgateWindowService.closeDbgateWindow()

  // 关闭数据库连接并清理资源
  if (clientManager) {
    await clientManager.shutdown()
  }
})