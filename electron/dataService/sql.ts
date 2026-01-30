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
  DELETE_ALL_TODOS: 'DELETE FROM todos',

  // AI配置表
  CREATE_AI_CONFIG_TABLE: `
    CREATE TABLE IF NOT EXISTS ai_config (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      base_url TEXT,
      model TEXT,
      enabled INTEGER DEFAULT 1,
      create_time TEXT,
      update_time TEXT
    )
  `,

  // AI缓存表
  CREATE_AI_CACHE_TABLE: `
    CREATE TABLE IF NOT EXISTS ai_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT UNIQUE NOT NULL,
      cache_value TEXT NOT NULL,
      expire_time TEXT,
      create_time TEXT
    )
  `,

  // AI上下文表
  CREATE_AI_CONTEXT_TABLE: `
    CREATE TABLE IF NOT EXISTS ai_context (
      session_id TEXT PRIMARY KEY,
      messages TEXT NOT NULL,
      metadata TEXT,
      create_time TEXT NOT NULL,
      update_time TEXT NOT NULL,
      last_access_time TEXT NOT NULL
    )
  `,

  // AI上下文相关操作
  SELECT_AI_CONTEXT_BY_SESSION: 'SELECT * FROM ai_context WHERE session_id = ?',
  SELECT_ALL_AI_CONTEXTS: 'SELECT * FROM ai_context ORDER BY last_access_time DESC',
  INSERT_OR_REPLACE_AI_CONTEXT: 'INSERT OR REPLACE INTO ai_context (session_id, messages, metadata, create_time, update_time, last_access_time) VALUES (?, ?, ?, ?, ?, ?)',
  DELETE_AI_CONTEXT_BY_SESSION: 'DELETE FROM ai_context WHERE session_id = ?',
  DELETE_OLD_AI_CONTEXTS: 'DELETE FROM ai_context WHERE last_access_time < ?',
  UPDATE_AI_CONTEXT_ACCESS_TIME: 'UPDATE ai_context SET last_access_time = ? WHERE session_id = ?',

  // 事件AI元数据表
  CREATE_EVENT_AI_METADATA_TABLE: `
    CREATE TABLE IF NOT EXISTS event_ai_metadata (
      event_id TEXT PRIMARY KEY,
      ai_classification TEXT,
      ai_tags TEXT,
      ai_priority INTEGER,
      ai_energy_level TEXT,
      ai_insights TEXT,
      ai_confidence REAL,
      create_time TEXT,
      update_time TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `,

  // 标签表
  CREATE_TAGS_TABLE: `
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT,
      usage_count INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    )
  `,

  // 事件标签关联表
  CREATE_EVENT_TAGS_TABLE: `
    CREATE TABLE IF NOT EXISTS event_tags (
      event_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (event_id, tag_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,

  // AI配置相关操作
  SELECT_AI_CONFIG: 'SELECT * FROM ai_config WHERE enabled = 1 LIMIT 1',
  SELECT_AI_CONFIG_BY_ID: 'SELECT * FROM ai_config WHERE id = ?',
  INSERT_OR_REPLACE_AI_CONFIG: 'INSERT OR REPLACE INTO ai_config (id, provider, api_key, base_url, model, enabled, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_AI_CONFIG: 'UPDATE ai_config SET provider = ?, api_key = ?, base_url = ?, model = ?, enabled = ?, update_time = ? WHERE id = ?',
  DELETE_AI_CONFIG: 'DELETE FROM ai_config WHERE id = ?',

  // AI缓存相关操作
  SELECT_AI_CACHE: 'SELECT * FROM ai_cache WHERE cache_key = ? AND (expire_time IS NULL OR expire_time > datetime("now"))',
  INSERT_OR_REPLACE_AI_CACHE: 'INSERT OR REPLACE INTO ai_cache (id, cache_key, cache_value, expire_time, create_time) VALUES (?, ?, ?, ?, ?)',
  DELETE_EXPIRED_AI_CACHE: 'DELETE FROM ai_cache WHERE expire_time IS NOT NULL AND expire_time < datetime("now")',

  // 事件AI元数据相关操作
  SELECT_EVENT_AI_METADATA: 'SELECT * FROM event_ai_metadata WHERE event_id = ?',
  INSERT_OR_REPLACE_EVENT_AI_METADATA: 'INSERT OR REPLACE INTO event_ai_metadata (event_id, ai_classification, ai_tags, ai_priority, ai_energy_level, ai_insights, ai_confidence, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  DELETE_EVENT_AI_METADATA: 'DELETE FROM event_ai_metadata WHERE event_id = ?',

  // 标签相关操作
  SELECT_ALL_TAGS: 'SELECT * FROM tags ORDER BY usage_count DESC',
  SELECT_TAG_BY_NAME: 'SELECT * FROM tags WHERE name = ?',
  INSERT_OR_REPLACE_TAG: 'INSERT OR REPLACE INTO tags (id, name, category, usage_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  UPDATE_TAG_USAGE: 'UPDATE tags SET usage_count = usage_count + 1, updated_at = ? WHERE id = ?',
  DELETE_TAG: 'DELETE FROM tags WHERE id = ?',

  // 事件标签相关操作
  SELECT_EVENT_TAGS: 'SELECT t.* FROM tags t INNER JOIN event_tags et ON t.id = et.tag_id WHERE et.event_id = ?',
  INSERT_EVENT_TAG: 'INSERT OR IGNORE INTO event_tags (event_id, tag_id) VALUES (?, ?)',
  DELETE_EVENT_TAGS: 'DELETE FROM event_tags WHERE event_id = ?',
  DELETE_EVENT_TAG: 'DELETE FROM event_tags WHERE event_id = ? AND tag_id = ?',

  // 记忆索引表（用于 FTS5 全文搜索）
  CREATE_MEMORY_INDEX_TABLE: `
    CREATE TABLE IF NOT EXISTS memory_index (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      start_line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      token_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(file_path, chunk_index)
    )
  `,

  // 创建 FTS5 虚拟表用于全文搜索
  CREATE_MEMORY_FTS5_TABLE: `
    CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts5 USING fts5(
      content,
      file_path,
      chunk_index UNINDEXED,
      content='memory_index',
      content_rowid='rowid'
    )
  `,

  // 记忆索引相关操作
  SELECT_MEMORY_CHUNK_BY_ID: 'SELECT * FROM memory_index WHERE id = ?',
  SELECT_MEMORY_CHUNKS_BY_FILE: 'SELECT * FROM memory_index WHERE file_path = ? ORDER BY chunk_index',
  INSERT_OR_REPLACE_MEMORY_CHUNK: 'INSERT OR REPLACE INTO memory_index (id, file_path, chunk_index, content, start_line, end_line, token_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  DELETE_MEMORY_CHUNKS_BY_FILE: 'DELETE FROM memory_index WHERE file_path = ?',
  DELETE_MEMORY_CHUNK_BY_ID: 'DELETE FROM memory_index WHERE id = ?',

  // FTS5 搜索（需要在 SQLite 中启用 FTS5）
  SEARCH_MEMORY_FTS5: `
    SELECT 
      mi.*,
      rank
    FROM memory_fts5 mf
    JOIN memory_index mi ON mi.rowid = mf.rowid
    WHERE memory_fts5 MATCH ?
    ORDER BY rank
    LIMIT ?
  `,

  // ========== AI智能体自我学习方案相关表 ==========
  
  // 功能模块注册表
  CREATE_AI_MODULES_TABLE: `
    CREATE TABLE IF NOT EXISTS ai_modules (
      id TEXT PRIMARY KEY,
      module_name TEXT UNIQUE NOT NULL,
      module_type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      version TEXT,
      enabled INTEGER DEFAULT 1,
      config TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `,

  // 通用行为记录表
  CREATE_USER_BEHAVIOR_LOG_TABLE: `
    CREATE TABLE IF NOT EXISTS user_behavior_log (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'default',
      module_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_category TEXT,
      action_data TEXT,
      context TEXT,
      timestamp TEXT NOT NULL,
      session_id TEXT,
      FOREIGN KEY (module_id) REFERENCES ai_modules(id)
    )
  `,

  // 通用偏好学习表
  CREATE_USER_PREFERENCES_TABLE: `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'default',
      module_id TEXT NOT NULL,
      preference_type TEXT NOT NULL,
      preference_key TEXT NOT NULL,
      preference_value TEXT,
      confidence REAL DEFAULT 0.5,
      sample_count INTEGER DEFAULT 1,
      last_updated TEXT,
      FOREIGN KEY (module_id) REFERENCES ai_modules(id),
      UNIQUE(user_id, module_id, preference_type, preference_key)
    )
  `,

  // 通用学习模式表
  CREATE_AI_LEARNED_PATTERNS_TABLE: `
    CREATE TABLE IF NOT EXISTS ai_learned_patterns (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'default',
      module_id TEXT NOT NULL,
      pattern_type TEXT NOT NULL,
      pattern_data TEXT NOT NULL,
      frequency INTEGER DEFAULT 1,
      confidence REAL DEFAULT 0.5,
      first_seen TEXT,
      last_seen TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (module_id) REFERENCES ai_modules(id)
    )
  `,

  // AI模块相关操作
  SELECT_ALL_AI_MODULES: 'SELECT * FROM ai_modules WHERE enabled = 1',
  SELECT_AI_MODULE_BY_ID: 'SELECT * FROM ai_modules WHERE id = ?',
  SELECT_AI_MODULE_BY_NAME: 'SELECT * FROM ai_modules WHERE module_name = ?',
  INSERT_OR_REPLACE_AI_MODULE: 'INSERT OR REPLACE INTO ai_modules (id, module_name, module_type, display_name, description, version, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_AI_MODULE: 'UPDATE ai_modules SET module_name = ?, module_type = ?, display_name = ?, description = ?, version = ?, enabled = ?, config = ?, updated_at = ? WHERE id = ?',
  DELETE_AI_MODULE: 'DELETE FROM ai_modules WHERE id = ?',

  // 行为记录相关操作
  SELECT_BEHAVIOR_LOG_BY_MODULE: 'SELECT * FROM user_behavior_log WHERE module_id = ? ORDER BY timestamp DESC LIMIT ?',
  SELECT_BEHAVIOR_LOG_BY_ACTION: 'SELECT * FROM user_behavior_log WHERE action_type = ? ORDER BY timestamp DESC LIMIT ?',
  INSERT_BEHAVIOR_LOG: 'INSERT INTO user_behavior_log (id, user_id, module_id, action_type, action_category, action_data, context, timestamp, session_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  DELETE_BEHAVIOR_LOG: 'DELETE FROM user_behavior_log WHERE id = ?',

  // 偏好相关操作
  SELECT_PREFERENCES_BY_MODULE: 'SELECT * FROM user_preferences WHERE module_id = ? AND user_id = ?',
  SELECT_PREFERENCE: 'SELECT * FROM user_preferences WHERE user_id = ? AND module_id = ? AND preference_type = ? AND preference_key = ?',
  INSERT_OR_REPLACE_PREFERENCE: 'INSERT OR REPLACE INTO user_preferences (id, user_id, module_id, preference_type, preference_key, preference_value, confidence, sample_count, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_PREFERENCE: 'UPDATE user_preferences SET preference_value = ?, confidence = ?, sample_count = sample_count + 1, last_updated = ? WHERE id = ?',
  DELETE_PREFERENCE: 'DELETE FROM user_preferences WHERE id = ?',

  // 学习模式相关操作
  SELECT_PATTERNS_BY_MODULE: 'SELECT * FROM ai_learned_patterns WHERE module_id = ? AND user_id = ? AND is_active = 1 ORDER BY frequency DESC',
  SELECT_PATTERN_BY_TYPE: 'SELECT * FROM ai_learned_patterns WHERE module_id = ? AND user_id = ? AND pattern_type = ? AND is_active = 1',
  INSERT_OR_REPLACE_PATTERN: 'INSERT OR REPLACE INTO ai_learned_patterns (id, user_id, module_id, pattern_type, pattern_data, frequency, confidence, first_seen, last_seen, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_PATTERN: 'UPDATE ai_learned_patterns SET frequency = frequency + 1, confidence = ?, last_seen = ? WHERE id = ?',
  DELETE_PATTERN: 'DELETE FROM ai_learned_patterns WHERE id = ?',

  // 打断记录表
  CREATE_INTERRUPTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS interruptions (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      task_title TEXT NOT NULL,
      last_action TEXT,
      notes TEXT,
      context TEXT,
      interrupt_time TEXT NOT NULL,
      reminder_scheduled INTEGER DEFAULT 0,
      reminder_time TEXT,
      created_at TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `,

  // 打断记录相关操作
  SELECT_INTERRUPTION_BY_ID: 'SELECT * FROM interruptions WHERE id = ?',
  SELECT_INTERRUPTIONS_BY_EVENT: 'SELECT * FROM interruptions WHERE event_id = ? ORDER BY interrupt_time DESC',
  SELECT_PENDING_REMINDERS: 'SELECT * FROM interruptions WHERE reminder_scheduled = 1 AND reminder_time <= datetime("now")',
  INSERT_INTERRUPTION: 'INSERT INTO interruptions (id, event_id, task_title, last_action, notes, context, interrupt_time, reminder_scheduled, reminder_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  UPDATE_INTERRUPTION: 'UPDATE interruptions SET reminder_scheduled = ?, reminder_time = ? WHERE id = ?',
  DELETE_INTERRUPTION: 'DELETE FROM interruptions WHERE id = ?'
};