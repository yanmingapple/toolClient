// SQL 语句定义
export const SQLStatements = {
  // 创建连接配置表
  CREATE_CONNECTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      host TEXT,
      port INTEGER,
      username TEXT,
      password TEXT,
      database TEXT,
      sshHost TEXT,
      sshPort INTEGER,
      sshUsername TEXT,
      sshPassword TEXT,
      sshPassphrase TEXT,
      sshKeyPath TEXT
    )
  `,

  // 连接配置相关操作
  SELECT_ALL_CONNECTIONS: 'SELECT * FROM connections',
  DELETE_ALL_CONNECTIONS: 'DELETE FROM connections',
  INSERT_OR_REPLACE_CONNECTION: 'INSERT OR REPLACE INTO connections (id, name, type, host, port, username, password, database, sshHost, sshPort, sshUsername, sshPassword, sshPassphrase, sshKeyPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  DELETE_CONNECTION_BY_ID: 'DELETE FROM connections WHERE id = ?',
  SELECT_CONNECTION_BY_ID: 'SELECT * FROM connections WHERE id = ?',

  // PostgreSQL 相关查询
  SELECT_POSTGRESQL_DATABASES: 'SELECT datname FROM pg_database WHERE datistemplate = false',

  // SQLite 相关查询
  SELECT_SQLITE_TABLES: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  SELECT_SQLITE_TABLE_COUNT: (tableName: string) => `SELECT COUNT(*) as count FROM ${tableName}`,

  // 创建服务监控表
  CREATE_SERVICE_MONITOR_TABLE: `
    CREATE TABLE IF NOT EXISTS service_monitor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      serverName TEXT,
      type TEXT NOT NULL,
      port INTEGER,
      status TEXT,
      workspace TEXT,
      url TEXT,
      createTime TEXT,
      updateTime TEXT
    )
  `,

  // 添加serverName列（用于现有表结构更新）
  ALTER_SERVICE_MONITOR_ADD_SERVERNAME: `
    ALTER TABLE service_monitor ADD COLUMN serverName TEXT
  `,

  // 服务监控相关操作
  SELECT_ALL_SERVICE_MONITORS: 'SELECT * FROM service_monitor',
  SELECT_SERVICE_MONITOR_BY_ID: 'SELECT * FROM service_monitor WHERE id = ?',
  INSERT_SERVICE_MONITOR: 'INSERT INTO service_monitor (name, serverName, type, port, status, workspace, url, createTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  INSERT_OR_REPLACE_SERVICE_MONITOR: 'INSERT OR REPLACE INTO service_monitor (id, name, serverName, type, port, status, workspace, url, createTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_SERVICE_MONITOR: 'UPDATE service_monitor SET name = ?, serverName = ?, type = ?, port = ?, status = ?, workspace = ?, url = ?, updateTime = ? WHERE id = ?',
  DELETE_SERVICE_MONITOR_BY_ID: 'DELETE FROM service_monitor WHERE id = ?',
  DELETE_ALL_SERVICE_MONITORS: 'DELETE FROM service_monitor',

  // 创建事件表
  CREATE_EVENTS_TABLE: `
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reminder INTEGER DEFAULT 0,
      createTime TEXT,
      updateTime TEXT
    )
  `,

  // 事件相关操作
  SELECT_ALL_EVENTS: 'SELECT * FROM events',
  SELECT_EVENT_BY_ID: 'SELECT * FROM events WHERE id = ?',
  SELECT_EVENTS_BY_DATE: 'SELECT * FROM events WHERE date = ?',
  INSERT_OR_REPLACE_EVENT: 'INSERT OR REPLACE INTO events (id, title, type, date, time, reminder, createTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_EVENT: 'UPDATE events SET title = ?, type = ?, date = ?, time = ?, reminder = ?, updateTime = ? WHERE id = ?',
  DELETE_EVENT_BY_ID: 'DELETE FROM events WHERE id = ?',
  DELETE_ALL_EVENTS: 'DELETE FROM events',

  // 创建代办事项表
  CREATE_TODOS_TABLE: `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      createTime TEXT,
      updateTime TEXT
    )
  `,

  // 代办事项相关操作
  SELECT_ALL_TODOS: 'SELECT * FROM todos',
  SELECT_TODO_BY_ID: 'SELECT * FROM todos WHERE id = ?',
  SELECT_TODOS_BY_DATE: 'SELECT * FROM todos WHERE date = ?',
  INSERT_OR_REPLACE_TODO: 'INSERT OR REPLACE INTO todos (id, text, date, done, createTime, updateTime) VALUES (?, ?, ?, ?, ?, ?)',
  UPDATE_TODO: 'UPDATE todos SET text = ?, date = ?, done = ?, updateTime = ? WHERE id = ?',
  DELETE_TODO_BY_ID: 'DELETE FROM todos WHERE id = ?',
  DELETE_ALL_TODOS: 'DELETE FROM todos'
};