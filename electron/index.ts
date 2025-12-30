// 使用 require 语法避免与本地 electron 目录冲突
const electron = require('electron')
const { app, BrowserWindow, Menu, Tray, nativeImage } = electron
import * as path from 'path'
import * as url from 'url'
import { databaseManager } from './manager/databaseMananger'
import { DatabaseService } from './service/databaseService'

let mainWindow: typeof BrowserWindow | null
let tray: typeof Tray | null

// 初始化数据库管理类
function initializeDatabase() {
  try {
    console.log('Database manager initialized successfully')
    // 数据库管理类会自动处理 SQLite 数据库的初始化
    // 这里可以添加其他初始化逻辑
  } catch (error) {
    console.error('Failed to initialize database manager:', error)
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
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    )
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const template: any[] = [
    {
      label: '文件(F)',
      submenu: [
        { label: '新建项目...', click: () => { } },
        { label: '新建连接...', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('open-new-connection-dialog') },
        { type: 'separator' },
        { label: '使用 Navicat URI 打开...', accelerator: 'Ctrl+U', click: () => { } },
        { label: '打开外部文件', click: () => { } },
        { type: 'separator' },
        {
          label: '打开最近使用的',
          submenu: [
            { label: '最近连接1', click: () => { } },
            { label: '最近连接2', click: () => { } },
            { type: 'separator' },
            { label: '清除最近记录', click: () => { } },
          ]
        },
        { type: 'separator' },
        { label: '关闭连接', click: () => { } },
        { type: 'separator' },
        { label: '导入连接...', click: () => { } },
        { label: '导出连接...', click: () => { } },
        { type: 'separator' },
        { label: '管理...', click: () => { } },
        { type: 'separator' },
        { label: '关闭窗口', click: () => mainWindow?.close() },
        { label: '退出 Navicat', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: '编辑(E)',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        { type: 'separator' },
        { label: '查找', accelerator: 'CmdOrCtrl+F', click: () => { } },
        { label: '替换', accelerator: 'CmdOrCtrl+H', click: () => { } },
      ],
    },
    {
      label: '查看(V)',
      submenu: [
        { label: '导航窗格', click: () => { } },
        { label: '信息窗格', click: () => { } },
        { type: 'separator' },
        { label: '网格视图', click: () => { } },
        { label: '单元视图', click: () => { } },
        { type: 'separator' },
        { label: '表格数据编辑器', click: () => { } },
        { label: '数据分析', click: () => { } },
        { type: 'separator' },
        { label: '显示/隐藏筛选及排序', click: () => { } },
        {
          label: '筛选器和排序布局', submenu: [
            { label: '布局1', click: () => { } },
            { label: '布局2', click: () => { } },
            { label: '重置布局', click: () => { } },
          ]
        },
        { type: 'separator' },
        {
          label: '显示', submenu: [
            { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
            { label: '状态栏', click: () => { } },
            { type: 'separator' },
            {
              label: '缩放', submenu: [
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow?.webContents.setZoomLevel((mainWindow.webContents.getZoomLevel() || 0) + 0.5) },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.setZoomLevel((mainWindow.webContents.getZoomLevel() || 0) - 0.5) },
                { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.setZoomLevel(0) },
              ]
            },
          ]
        },
        { type: 'separator' },
        { label: '页眉', click: () => { } },
        { type: 'separator' },
        { label: '全屏模式', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
        { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: '收藏(A)',
      submenu: [
        { label: '添加到收藏夹', accelerator: 'CmdOrCtrl+T', click: () => { } },
        { label: '管理收藏夹', click: () => { } },
        { type: 'separator' },
        { label: '收藏夹1', click: () => { } },
        { label: '收藏夹2', click: () => { } },
      ],
    },
    {
      label: '工具(T)',
      submenu: [
        { label: '数据传输', click: () => { } },
        { label: '数据同步', click: () => { } },
        { label: '结构同步', click: () => { } },
        { type: 'separator' },
        { label: '导入向导', click: () => { } },
        { label: '导出向导', click: () => { } },
        { type: 'separator' },
        { label: '查询创建工具', click: () => { } },
        { label: '报表创建工具', click: () => { } },
        { type: 'separator' },
        { label: '模型', click: () => { } },
        { type: 'separator' },
        { label: '服务器监控', click: () => { } },
        { type: 'separator' },
        { label: '选项', click: () => { } },
      ],
    },
    {
      label: '帮助(H)',
      submenu: [
        { label: '帮助主题', click: () => { } },
        { label: 'Navicat 教程', click: () => { } },
        { type: 'separator' },
        { label: '检查更新', click: () => { } },
        { type: 'separator' },
        { label: '关于 Navicat', click: () => { } },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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



app.on('ready', () => {
  initializeDatabase()
  createWindow()
  createTray()
  DatabaseService.registerIpcHandlers()
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