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
  SELECT_SQLITE_TABLE_COUNT: (tableName: string) => `SELECT COUNT(*) as count FROM ${tableName}`
};