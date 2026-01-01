// 使用 require 语法避免与本地 electron 目录冲突
const electron = require('electron')
const { app, BrowserWindow, Menu, Tray, nativeImage } = electron
import * as path from 'path'
import * as url from 'url'
import { databaseManager } from './manager/databaseMananger'
import { MenuService } from './service/menuService'
import { IpcService } from './service/ipcService'
import { join } from 'path'

let mainWindow: typeof BrowserWindow | null
let tray: typeof Tray | null

// 初始化数据库管理类
async function initializeDatabase() {
  try {
    console.log('Initializing database manager...')
    // 显式初始化数据库管理器
    await databaseManager.initialize()
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
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    )
  }

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
    { label: 'Show App', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => app.quit() },
  ] as any[])
  tray.setToolTip('DBManager Pro')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}



app.on('ready', async () => {
  try {
    // 初始化数据库管理器
    await initializeDatabase()
    createWindow()
    createTray()
    // 注册主进程相关的 IPC 处理程序
    IpcService.registerHandlers(mainWindow)
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
  // 关闭数据库连接并清理资源
  if (databaseManager) {
    await databaseManager.shutdown()
  }
})