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

  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件(F)',
      submenu: [
        { label: '新建项目...', click: () => {} },
        { label: '新建连接...', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('open-new-connection-dialog') },
        { type: 'separator' },
        { label: '使用 Navicat URI 打开...', accelerator: 'Ctrl+U', click: () => {} },
        { label: '打开外部文件', click: () => {} },
        { type: 'separator' },
        { 
          label: '打开最近使用的', 
          submenu: [
            { label: '最近连接1', click: () => {} },
            { label: '最近连接2', click: () => {} },
            { type: 'separator' },
            { label: '清除最近记录', click: () => {} },
          ]
        },
        { type: 'separator' },
        { label: '关闭连接', click: () => {} },
        { type: 'separator' },
        { label: '导入连接...', click: () => {} },
        { label: '导出连接...', click: () => {} },
        { type: 'separator' },
        { label: '管理...', click: () => {} },
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
        { label: '查找', accelerator: 'CmdOrCtrl+F', click: () => {} },
        { label: '替换', accelerator: 'CmdOrCtrl+H', click: () => {} },
      ],
    },
    {
      label: '查看(V)',
      submenu: [
        { label: '导航窗格', click: () => {} },
        { label: '信息窗格', click: () => {} },
        { type: 'separator' },
        { label: '网格视图', click: () => {} },
        { label: '单元视图', click: () => {} },
        { type: 'separator' },
        { label: '表格数据编辑器', click: () => {} },
        { label: '数据分析', click: () => {} },
        { type: 'separator' },
        { label: '显示/隐藏筛选及排序', click: () => {} },
        { label: '筛选器和排序布局', submenu: [
          { label: '布局1', click: () => {} },
          { label: '布局2', click: () => {} },
          { label: '重置布局', click: () => {} },
        ]},
        { type: 'separator' },
        { label: '显示', submenu: [
          { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
          { label: '状态栏', click: () => {} },
          { type: 'separator' },
          { label: '缩放', submenu: [
            { label: '放大', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow?.webContents.setZoomLevel((mainWindow.webContents.getZoomLevel() || 0) + 0.5) },
            { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.setZoomLevel((mainWindow.webContents.getZoomLevel() || 0) - 0.5) },
            { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.setZoomLevel(0) },
          ]},
        ]},
        { type: 'separator' },
        { label: '页眉', click: () => {} },
        { type: 'separator' },
        { label: '全屏模式', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
        { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: '收藏(A)',
      submenu: [
        { label: '添加到收藏夹', accelerator: 'CmdOrCtrl+T', click: () => {} },
        { label: '管理收藏夹', click: () => {} },
        { type: 'separator' },
        { label: '收藏夹1', click: () => {} },
        { label: '收藏夹2', click: () => {} },
      ],
    },
    {
      label: '工具(T)',
      submenu: [
        { label: '数据传输', click: () => {} },
        { label: '数据同步', click: () => {} },
        { label: '结构同步', click: () => {} },
        { type: 'separator' },
        { label: '导入向导', click: () => {} },
        { label: '导出向导', click: () => {} },
        { type: 'separator' },
        { label: '查询创建工具', click: () => {} },
        { label: '报表创建工具', click: () => {} },
        { type: 'separator' },
        { label: '模型', click: () => {} },
        { type: 'separator' },
        { label: '服务器监控', click: () => {} },
        { type: 'separator' },
        { label: '选项', click: () => {} },
      ],
    },
    {
      label: '帮助(H)',
      submenu: [
        { label: '帮助主题', click: () => {} },
        { label: 'Navicat 教程', click: () => {} },
        { type: 'separator' },
        { label: '检查更新', click: () => {} },
        { type: 'separator' },
        { label: '关于 Navicat', click: () => {} },
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
          const db = new sqlite3.Database(config.host, (err) => {
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

// 获取数据库列表
async function handleGetDatabaseList(_event: any, config: any) {
  try {
    switch (config.type) {
      case 'mysql':
        const mysql2 = await import('mysql2/promise')
        const mysqlConn = await mysql2.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        const [databases] = await mysqlConn.query('SHOW DATABASES') as [Array<{ Database: string }>, any]
        await mysqlConn.end()
        return {
          success: true,
          data: databases.map((db, index) => ({
            id: `db_${config.id}_${index}`,
            name: db.Database,
            type: 'database',
            parentId: config.id,
            metadata: {}
          }))
        }
      case 'postgresql':
        const pg = await import('pg')
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: 'postgres', // 默认数据库
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        await pgClient.connect()
        const result = await pgClient.query('SELECT datname FROM pg_database WHERE datistemplate = false')
        await pgClient.end()
        return {
          success: true,
          data: result.rows.map((row, index) => ({
            id: `db_${config.id}_${index}`,
            name: row.datname,
            type: 'database',
            parentId: config.id,
            metadata: {}
          }))
        }
      case 'mongodb':
        const mongodb = await import('mongodb')
        const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`
        const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
          authSource: 'admin'
        })
        await mongoClient.connect()
        const dbs = await mongoClient.db().admin().listDatabases()
        await mongoClient.close()
        return {
          success: true,
          data: dbs.databases.map((db, index) => ({
            id: `db_${config.id}_${index}`,
            name: db.name,
            type: 'database',
            parentId: config.id,
            metadata: { sizeOnDisk: db.sizeOnDisk, empty: db.empty }
          }))
        }
      default:
        return {
          success: true,
          data: []
        }
    }
  } catch (error) {
    console.error('Get databases error:', error)
    return { success: false, message: (error as Error).message }
  }
}

// 获取表列表
async function handleGetTableList(_event: any, config: any) {
  try {
    switch (config.type) {
      case 'mysql':
        const mysql2 = await import('mysql2/promise')
        const mysqlConn = await mysql2.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.databaseName,
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        const [tables] = await mysqlConn.query('SHOW TABLE STATUS') as [any[], any]
        await mysqlConn.end()
        return {
          success: true,
          data: tables.map((table: any, index: number) => ({
            id: `table_${config.databaseId}_${index}`,
            name: table.Name,
            type: 'table',
            parentId: config.databaseId,
            metadata: {
              rows: table.Rows,
              dataLength: table.Data_length,
              engine: table.Engine,
              updateTime: table.Update_time,
              comment: table.Comment
            }
          }))
        }
      case 'postgresql':
        const pg = await import('pg')
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.databaseName,
          ssl: config.ssl ? { rejectUnauthorized: true } : undefined
        })
        await pgClient.connect()
        const result = await pgClient.query(
          `SELECT 
            t.table_name,
            c.reltuples AS rows,
            pg_total_relation_size(t.table_name::regclass) AS data_length,
            t.table_type,
            t.last_ddl_time AS update_time,
            d.description AS comment
          FROM 
            information_schema.tables t
          LEFT JOIN 
            pg_class c ON c.relname = t.table_name
          LEFT JOIN 
            pg_description d ON d.objoid = c.oid AND d.objsubid = 0
          WHERE 
            t.table_schema = 'public'
          ORDER BY 
            t.table_name`
        )
        await pgClient.end()
        return {
          success: true,
          data: result.rows.map((row, index) => ({
            id: `table_${config.databaseId}_${index}`,
            name: row.table_name,
            type: 'table',
            parentId: config.databaseId,
            metadata: {
              rows: Math.round(row.rows || 0),
              dataLength: row.data_length || 0,
              engine: row.table_type,
              updateTime: row.update_time,
              comment: row.comment || ''
            }
          }))
        }
      case 'mongodb':
        const mongodb = await import('mongodb')
        const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`
        const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
          authSource: 'admin'
        })
        await mongoClient.connect()
        const db = mongoClient.db(config.databaseName)
        const collections = await db.listCollections().toArray()
        
        // 获取每个集合的详细元数据
        const tableData = []
        for (const collection of collections) {
          // 获取集合统计信息
          const stats = await db.command({ collStats: collection.name })
          // 获取集合创建信息
          const options = await db.collection(collection.name).options()
          
          tableData.push({
            id: `table_${config.databaseId}_${tableData.length}`,
            name: collection.name,
            type: 'table',
            parentId: config.databaseId,
            metadata: {
              rows: stats.count || 0,
              dataLength: stats.size || 0,
              engine: 'mongodb',
              updateTime: options.creationDate || '--',
              comment: options.comment || ''
            }
          })
        }
        
        await mongoClient.close()
        return {
          success: true,
          data: tableData
        }
      default:
        return {
          success: true,
          data: []
        }
    }
  } catch (error) {
    console.error('Get tables error:', error)
    return { success: false, message: (error as Error).message }
  }
}

// 设置IPC处理程序
ipcMain.handle('test-database-connection', handleDatabaseConnection)
ipcMain.handle('get-database-list', handleGetDatabaseList)
ipcMain.handle('get-table-list', handleGetTableList)

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