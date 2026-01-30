# AI 上下文持久化实现说明

## 一、功能概述

已实现AI对话上下文的本地持久化功能，上下文会自动保存到SQLite数据库，并在应用启动时自动加载。

## 二、数据库表结构

### 2.1 ai_context 表

```sql
CREATE TABLE IF NOT EXISTS ai_context (
  session_id TEXT PRIMARY KEY,
  messages TEXT NOT NULL,              -- JSON格式的消息列表
  metadata TEXT,                        -- JSON格式的元数据
  create_time TEXT NOT NULL,            -- 创建时间
  update_time TEXT NOT NULL,            -- 更新时间
  last_access_time TEXT NOT NULL        -- 最后访问时间
)
```

**字段说明**:
- `session_id`: 会话ID（主键）
- `messages`: JSON格式的消息列表，包含所有对话历史
- `metadata`: JSON格式的元数据（目标、计划ID等）
- `create_time`: 上下文创建时间
- `update_time`: 上下文最后更新时间
- `last_access_time`: 最后访问时间（用于清理过期上下文）

## 三、核心功能

### 3.1 自动保存

**触发时机**:
- ✅ 添加新消息时自动保存
- ✅ 压缩上下文后自动保存
- ✅ 更新上下文元数据时自动保存

**实现方式**:
```typescript
async addMessage(sessionId: string, message: ConversationMessage, aiService?: any): Promise<void> {
  // ... 添加消息到内存
  
  // 自动保存到数据库
  if (this.autoSave && this.databaseClient) {
    await this.saveContextToDatabase(sessionId, context);
  }
}
```

### 3.2 自动加载

**加载时机**:
- ✅ 应用启动时自动加载所有上下文
- ✅ 首次访问会话时从数据库加载
- ✅ 使用 `getOrCreateContextAsync` 时优先从数据库加载

**实现方式**:
```typescript
// 应用启动时
async initializeContextManager(client: DatabaseClient): Promise<void> {
  const contextManager = await this.getContextManager();
  contextManager.setDatabaseClient(client);
  
  // 确保表已创建
  await client.execute(SQLStatements.CREATE_AI_CONTEXT_TABLE);
  
  // 加载所有上下文
  await contextManager.loadAllContextsFromDatabase();
  
  // 清理过期上下文
  await contextManager.cleanupExpiredContexts();
}
```

### 3.3 过期清理

**清理策略**:
- ✅ 默认保留30天的上下文
- ✅ 应用启动时自动清理过期上下文
- ✅ 基于 `last_access_time` 判断是否过期

**配置**:
```typescript
// 设置过期天数（默认30天）
contextManager.setContextExpireDays(30);
```

## 四、API 方法

### 4.1 保存相关

```typescript
// 自动保存（在addMessage中自动调用）
private async saveContextToDatabase(sessionId: string, context: ConversationContext): Promise<void>

// 手动保存
await contextManager.addMessage(sessionId, message, aiService);
```

### 4.2 加载相关

```typescript
// 加载单个上下文
async loadContextFromDatabase(sessionId: string): Promise<ConversationContext | null>

// 加载所有上下文（应用启动时调用）
async loadAllContextsFromDatabase(): Promise<void>

// 获取或创建上下文（优先从数据库加载）
async getOrCreateContextAsync(sessionId: string, systemPrompt?: string): Promise<ConversationContext>
```

### 4.3 清理相关

```typescript
// 清理过期上下文
async cleanupExpiredContexts(): Promise<number>

// 清除单个上下文（同时从内存和数据库删除）
async clearContext(sessionId: string): Promise<void>
```

### 4.4 配置相关

```typescript
// 设置数据库客户端
setDatabaseClient(client: any): void

// 设置自动保存开关
setAutoSave(enabled: boolean): void

// 设置上下文过期天数
setContextExpireDays(days: number): void
```

## 五、使用示例

### 5.1 基本使用（自动持久化）

```typescript
// 1. 初始化（应用启动时）
const aiService = AIService.getInstance();
aiService.setDatabaseClient(databaseClient); // 自动初始化上下文管理器

// 2. 使用上下文（自动保存和加载）
const agent = new PlanAndSolveAgent(aiService, toolRegistry, "session_123");
const plan = await agent.execute("创建明天的会议");

// 3. 应用重启后，上下文自动恢复
// 下次调用时，AI会记住之前的对话
const plan2 = await agent.execute("修改会议时间");
```

### 5.2 手动管理

```typescript
const contextManager = ContextManager.getInstance();

// 设置数据库客户端
contextManager.setDatabaseClient(databaseClient);

// 加载所有上下文
await contextManager.loadAllContextsFromDatabase();

// 加载特定上下文
const context = await contextManager.loadContextFromDatabase("session_123");

// 清理过期上下文
const deletedCount = await contextManager.cleanupExpiredContexts();
console.log(`清理了 ${deletedCount} 个过期上下文`);
```

### 5.3 配置选项

```typescript
const contextManager = ContextManager.getInstance();

// 禁用自动保存
contextManager.setAutoSave(false);

// 设置过期天数为7天
contextManager.setContextExpireDays(7);
```

## 六、数据流程

### 6.1 保存流程

```
用户输入
  ↓
addMessage()
  ↓
保存到内存 (contexts Map)
  ↓
自动保存到数据库 (ai_context表)
  ↓
完成
```

### 6.2 加载流程

```
应用启动
  ↓
initializeContextManager()
  ↓
创建表（如果不存在）
  ↓
loadAllContextsFromDatabase()
  ↓
从数据库加载所有上下文
  ↓
保存到内存 (contexts Map)
  ↓
清理过期上下文
  ↓
完成
```

### 6.3 访问流程

```
getOrCreateContextAsync()
  ↓
检查内存中是否存在
  ↓ (不存在)
从数据库加载
  ↓ (数据库也没有)
创建新上下文
  ↓
保存到内存和数据库
  ↓
返回上下文
```

## 七、性能优化

### 7.1 延迟加载

- ✅ 上下文按需加载（首次访问时）
- ✅ 不加载所有上下文到内存（除非调用 `loadAllContextsFromDatabase`）

### 7.2 异步保存

- ✅ 保存操作是异步的，不阻塞主流程
- ✅ 使用 `INSERT OR REPLACE` 避免重复插入

### 7.3 过期清理

- ✅ 应用启动时自动清理过期上下文
- ✅ 减少数据库存储空间

## 八、注意事项

### 8.1 数据格式

- `messages` 和 `metadata` 字段使用JSON格式存储
- 需要确保JSON序列化和反序列化正确

### 8.2 并发安全

- ✅ 使用 `INSERT OR REPLACE` 避免并发冲突
- ✅ 内存中的 `contexts Map` 是单例，线程安全

### 8.3 错误处理

- ✅ 数据库操作失败时不影响内存操作
- ✅ 错误会记录到控制台，不会抛出异常

### 8.4 数据迁移

- ✅ 表结构变更时，需要手动迁移数据
- ✅ 建议在迁移前备份数据库

## 九、未来改进

1. **增量保存**: 只保存新增的消息，而不是整个上下文
2. **压缩存储**: 对消息内容进行压缩，减少存储空间
3. **索引优化**: 为 `last_access_time` 添加索引，加快查询速度
4. **批量操作**: 支持批量保存和加载
5. **版本控制**: 支持上下文版本管理

---

**最后更新**: 2026-01-30
**状态**: ✅ 实现完成

