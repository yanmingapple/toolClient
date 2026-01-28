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
    // 显式初始化数据库管理器
    await clientManager.initialize()
    console.log('Database manager initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database manager:', error)
    throw error
  }
}

function createWindow() {
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
      preload: join(process.cwd(), 'dist/electron/preload.js'),
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
  const icon = nativeImage.createEmpty()
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
  tray.setToolTip('数据库管理器')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

function createSidebarWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const sidebarWidth = 120;
  const sidebarHeight = height;

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
      preload: join(process.cwd(), 'dist/electron/preload.js'),
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
    // 初始化 dbgate API 服务（在数据库管理器之前）
    await DbgateWindowService.initialize()
    
    // 初始化数据库管理器
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