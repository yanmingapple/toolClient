import { app, BrowserWindow, Menu, Tray, nativeImage, MenuItemConstructorOptions, ipcMain } from 'electron'
import path from 'path'
import url from 'url'

let mainWindow: BrowserWindow | null
let tray: Tray | null

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
    mainWindow.webContents.openDevTools()
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

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Connection', accelerator: 'CmdOrCtrl+N', click: () => {} },
        { label: 'Open Connection', accelerator: 'CmdOrCtrl+O', click: () => {} },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
        { label: 'Toggle Full Screen', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About', click: () => {} },
        { label: 'Documentation', click: () => {} },
        { label: 'Check for Updates', click: () => {} },
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
  ] as MenuItemConstructorOptions[])
  tray.setToolTip('DBManager Pro')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

// 数据库连接处理函数
async function handleDatabaseConnection(_event: any, config: any) {
  try {
    // 根据数据库类型创建测试连接
    switch (config.type) {
      case 'mysql':
        const mysql2 = await import('mysql2/promise')
        const mysqlConn = await mysql2.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        await mysqlConn.end()
        break
      case 'postgresql':
        const pg = await import('pg')
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        await pgClient.connect()
        await pgClient.end()
        break
      case 'mongodb':
        const mongodb = await import('mongodb')
        const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`
        const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
          authSource: 'admin'
        })
        await mongoClient.connect()
        await mongoClient.close()
        break
      case 'redis':
        const RedisModule = await import('ioredis')
        const Redis = RedisModule.default
        const redis = new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
        })
        await redis.ping()
        await redis.quit()
        break
      case 'sqlserver':
        const tedious = await import('tedious')
        const sqlConfig = {
          server: config.host,
          port: config.port,
          authentication: {
            type: 'default',
            options: {
              userName: config.username,
              password: config.password,
            },
          },
          options: {
            database: config.database,
            encrypt: config.ssl,
          },
        }
        await new Promise((resolve, reject) => {
          const connection = new tedious.Connection(sqlConfig)
          connection.on('connect', (error) => {
            if (error) reject(error)
            else resolve(true)
          })
          connection.on('error', reject)
        })
        break
      case 'sqlite':
        const sqlite3 = await import('sqlite3')
        await new Promise((resolve, reject) => {
          const db = new sqlite3.Database(config.path, (err) => {
            if (err) reject(err)
            else resolve(true)
          })
          db.close()
        })
        break
    }
    return { success: true, message: 'Connection successful' }
  } catch (error) {
    console.error('Connection error:', error)
    return { success: false, message: (error as Error).message }
  }
}

// 设置IPC处理程序
ipcMain.handle('test-database-connection', handleDatabaseConnection)

app.on('ready', () => {
  createWindow()
  createTray()
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

app.on('before-quit', () => {
  tray?.destroy()
})