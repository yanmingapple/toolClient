import * as fs from 'fs';
import * as path from 'path';
const { app } = require('electron');
import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 记忆文件类型
 */
export type MemoryFileType = 'daily' | 'memory' | 'tasks' | 'habits';

/**
 * 记忆块（Chunk）
 */
export interface MemoryChunk {
  id: string;
  filePath: string;
  content: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  tokenCount: number;
  createdAt: string;
}

/**
 * 搜索结果
 */
export interface MemorySearchResult {
  chunk: MemoryChunk;
  score: number;
  matchType: 'keyword' | 'vector' | 'hybrid';
}

/**
 * 记忆服务类
 * 负责管理 Markdown 记忆文件的存储、索引和搜索
 */
export class MemoryService {
  private static instance: MemoryService;
  private databaseClient: DatabaseClient | null = null;
  private memoryBasePath: string;
  private watcher: any = null; // Chokidar watcher

  private constructor() {
    // 设置记忆文件存储路径：用户数据目录下的 memory 文件夹
    const userDataPath = app.getPath('userData');
    this.memoryBasePath = path.join(userDataPath, 'memory');
    this.ensureMemoryDirectory();
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 确保记忆目录结构存在
   */
  private ensureMemoryDirectory(): void {
    const dirs = [
      this.memoryBasePath,
      path.join(this.memoryBasePath, 'daily'),
      path.join(this.memoryBasePath, 'tasks'),
      path.join(this.memoryBasePath, 'habits')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 创建根目录的 MEMORY.md 文件（如果不存在）
    const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
    if (!fs.existsSync(memoryFile)) {
      fs.writeFileSync(memoryFile, '# 长期记忆\n\n这里是整理后的重要信息。\n', 'utf-8');
    }
  }

  /**
   * 获取记忆文件路径
   */
  public getMemoryPath(): string {
    return this.memoryBasePath;
  }

  /**
   * 获取今日日志文件路径
   */
  public getTodayLogPath(): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.memoryBasePath, 'daily', `${today}.md`);
  }

  /**
   * 追加内容到今日日志
   */
  public async appendToTodayLog(content: string): Promise<ServiceResult<void>> {
    try {
      const logPath = this.getTodayLogPath();
      const timestamp = new Date().toLocaleString('zh-CN');
      const logEntry = `\n## ${timestamp}\n\n${content}\n`;

      if (fs.existsSync(logPath)) {
        fs.appendFileSync(logPath, logEntry, 'utf-8');
      } else {
        fs.writeFileSync(logPath, `# ${new Date().toISOString().split('T')[0]} 工作日志\n\n${logEntry}`, 'utf-8');
      }

      return ServiceResultFactory.success(undefined, '日志已追加');
    } catch (error: any) {
      console.error('追加日志失败:', error);
      return ServiceResultFactory.error(`追加日志失败: ${error.message}`);
    }
  }

  /**
   * 记录事件到工作日志
   * 当事件创建、更新或完成时自动调用
   * 注意：这只是日志记录，不影响数据存储（数据存储在SQLite中）
   */
  public async logEvent(action: 'created' | 'updated' | 'completed', event: any): Promise<ServiceResult<void>> {
    try {
      const actionMap = {
        created: '创建',
        updated: '更新',
        completed: '完成',
        deleted: '删除'
      };

      const eventTypeMap: { [key: string]: string } = {
        '工作': '💼',
        '会议': '📅',
        '学习': '📚',
        '生活': '🏠',
        '其他': '📝'
      };

      const emoji = eventTypeMap[event.type] || '📝';
      const timeStr = event.time ? `${event.date} ${event.time}` : event.date;
      const logContent = `${emoji} **${event.title}** (${actionMap[action]})\n` +
        `- 类型: ${event.type}\n` +
        `- 时间: ${timeStr}\n` +
        (event.description ? `- 描述: ${event.description}\n` : '') +
        `- 事件ID: ${event.id}\n`;

      return await this.appendToTodayLog(logContent);
    } catch (error: any) {
      console.error('记录事件日志失败:', error);
      // 日志记录失败不影响主数据存储，只返回错误但不抛出异常
      return ServiceResultFactory.error(`记录事件日志失败: ${error.message}`);
    }
  }

  /**
   * 记录代办事项到工作日志
   * 当代办创建、更新、完成或删除时自动调用
   * 注意：这只是日志记录，不影响数据存储（数据存储在SQLite中）
   */
  public async logTodo(action: 'created' | 'updated' | 'completed' | 'deleted', todo: any): Promise<ServiceResult<void>> {
    try {
      const actionMap = {
        created: '创建',
        updated: '更新',
        completed: '完成',
        deleted: '删除'
      };

      const statusEmoji = todo.done ? '✅' : '⏳';
      const logContent = `${statusEmoji} **${todo.text || todo.title}** (${actionMap[action]})\n` +
        `- 日期: ${todo.date}\n` +
        `- 状态: ${todo.done ? '已完成' : '未完成'}\n` +
        `- 代办ID: ${todo.id}\n`;

      return await this.appendToTodayLog(logContent);
    } catch (error: any) {
      console.error('记录代办日志失败:', error);
      // 日志记录失败不影响主数据存储，只返回错误但不抛出异常
      return ServiceResultFactory.error(`记录代办日志失败: ${error.message}`);
    }
  }

  /**
   * 读取今日日志
   */
  public async readTodayLog(): Promise<ServiceResult<string>> {
    try {
      const logPath = this.getTodayLogPath();
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf-8');
        return ServiceResultFactory.success(content);
      } else {
        return ServiceResultFactory.success('');
      }
    } catch (error: any) {
      console.error('读取日志失败:', error);
      return ServiceResultFactory.error(`读取日志失败: ${error.message}`);
    }
  }

  /**
   * 读取指定日期的日志
   */
  public async readLogByDate(date: string): Promise<ServiceResult<string>> {
    try {
      const logPath = path.join(this.memoryBasePath, 'daily', `${date}.md`);
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf-8');
        return ServiceResultFactory.success(content);
      } else {
        return ServiceResultFactory.success('');
      }
    } catch (error: any) {
      console.error('读取日志失败:', error);
      return ServiceResultFactory.error(`读取日志失败: ${error.message}`);
    }
  }

  /**
   * 读取长期记忆文件（MEMORY.md）
   */
  public async readLongTermMemory(): Promise<ServiceResult<string>> {
    try {
      const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
      if (fs.existsSync(memoryFile)) {
        const content = fs.readFileSync(memoryFile, 'utf-8');
        return ServiceResultFactory.success(content);
      } else {
        return ServiceResultFactory.success('');
      }
    } catch (error: any) {
      console.error('读取长期记忆失败:', error);
      return ServiceResultFactory.error(`读取长期记忆失败: ${error.message}`);
    }
  }

  /**
   * 写入长期记忆文件
   */
  public async writeLongTermMemory(content: string): Promise<ServiceResult<void>> {
    try {
      const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
      fs.writeFileSync(memoryFile, content, 'utf-8');
      return ServiceResultFactory.success(undefined, '长期记忆已更新');
    } catch (error: any) {
      console.error('写入长期记忆失败:', error);
      return ServiceResultFactory.error(`写入长期记忆失败: ${error.message}`);
    }
  }

  /**
   * 初始化文件监听（使用 Chokidar）
   * 注意：需要先安装 chokidar: npm install chokidar
   */
  public async initializeWatcher(): Promise<ServiceResult<void>> {
    try {
      // 动态导入 chokidar（可选依赖）
      const chokidar = await import('chokidar');
      
      // 监听所有 Markdown 文件
      const watchPattern = [
        path.join(this.memoryBasePath, '**/*.md'),
        path.join(this.memoryBasePath, '..', 'MEMORY.md')
      ];

      this.watcher = chokidar.watch(watchPattern, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 1500, // 1.5秒防抖
          pollInterval: 100
        }
      });

      // 文件变化时重新索引
      this.watcher.on('change', (filePath: string) => {
        console.log('记忆文件变化:', filePath);
        // TODO: 触发重新索引
        this.indexFile(filePath).catch(err => {
          console.error('索引文件失败:', err);
        });
      });

      // 新文件添加时索引
      this.watcher.on('add', (filePath: string) => {
        console.log('新记忆文件添加:', filePath);
        this.indexFile(filePath).catch(err => {
          console.error('索引文件失败:', err);
        });
      });

      // 文件删除时清理索引
      this.watcher.on('unlink', (filePath: string) => {
        console.log('记忆文件删除:', filePath);
        this.removeFileIndex(filePath).catch((err: any) => {
          console.error('清理文件索引失败:', err);
        });
      });

      // 启动时索引所有现有文件
      this.watcher.on('ready', async () => {
        console.log('文件监听器就绪，开始索引现有文件...');
        await this.indexAllExistingFiles();
      });

      return ServiceResultFactory.success(undefined, '文件监听已启动');
    } catch (error: any) {
      // 如果 chokidar 未安装，返回警告但不失败
      console.warn('Chokidar 未安装，文件监听功能不可用:', error.message);
      return ServiceResultFactory.success(undefined, '文件监听未启用（chokidar 未安装）');
    }
  }

  /**
   * 估算文本的 token 数量
   * 简单估算：中文 1 token ≈ 1.5 字符，英文 1 token ≈ 0.75 单词
   */
  private estimateTokenCount(text: string): number {
    // 统计中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 统计英文单词
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    // 统计其他字符（标点、数字等）
    const otherChars = text.length - chineseChars - (text.match(/[a-zA-Z]/g) || []).length;
    
    // 估算：中文 1.5 字符/token，英文 0.75 单词/token，其他 4 字符/token
    const tokens = Math.ceil(chineseChars / 1.5 + englishWords * 0.75 + otherChars / 4);
    return tokens;
  }

  /**
   * 将文本分块（400 tokens，80 tokens 重叠）
   */
  private chunkText(text: string, targetTokens: number = 400, overlapTokens: number = 80): MemoryChunk[] {
    const lines = text.split('\n');
    const chunks: MemoryChunk[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;
    let startLine = 0;
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.estimateTokenCount(line);
      
      // 如果当前行加上去会超过目标 token 数，且当前块不为空
      if (currentTokens + lineTokens > targetTokens && currentChunk.length > 0) {
        // 保存当前块
        const chunkContent = currentChunk.join('\n');
        const chunk: MemoryChunk = {
          id: `${Date.now()}-${chunkIndex}`,
          filePath: '', // 将在调用时设置
          content: chunkContent,
          chunkIndex: chunkIndex++,
          startLine: startLine,
          endLine: i - 1,
          tokenCount: currentTokens,
          createdAt: new Date().toISOString()
        };
        chunks.push(chunk);

        // 开始新块，保留重叠部分
        // 从当前块末尾开始，保留约 overlapTokens 的 token
        const overlapLines: string[] = [];
        let overlapTokenCount = 0;
        for (let j = currentChunk.length - 1; j >= 0 && overlapTokenCount < overlapTokens; j--) {
          const overlapLine = currentChunk[j];
          const overlapLineTokens = this.estimateTokenCount(overlapLine);
          if (overlapTokenCount + overlapLineTokens <= overlapTokens) {
            overlapLines.unshift(overlapLine);
            overlapTokenCount += overlapLineTokens;
            startLine = i - (currentChunk.length - j);
          } else {
            break;
          }
        }

        currentChunk = overlapLines;
        currentTokens = overlapTokenCount;
      }

      currentChunk.push(line);
      currentTokens += lineTokens;
    }

    // 添加最后一个块
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join('\n');
      const chunk: MemoryChunk = {
        id: `${Date.now()}-${chunkIndex}`,
        filePath: '', // 将在调用时设置
        content: chunkContent,
        chunkIndex: chunkIndex,
        startLine: startLine,
        endLine: lines.length - 1,
        tokenCount: currentTokens,
        createdAt: new Date().toISOString()
      };
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * 索引单个文件
   */
  private async indexFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn('文件不存在，跳过索引:', filePath);
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const chunks = this.chunkText(content);
      
      // 设置文件路径
      chunks.forEach(chunk => {
        chunk.filePath = filePath;
        chunk.id = `${filePath}-${chunk.chunkIndex}-${Date.now()}`;
      });

      if (!this.databaseClient) {
        console.warn('数据库客户端未初始化，无法索引文件');
        return;
      }

      // 删除该文件的旧索引
      await this.databaseClient.execute(SQLStatements.DELETE_MEMORY_CHUNKS_BY_FILE, [filePath]);

      // 插入新索引
      for (const chunk of chunks) {
        await this.databaseClient.execute(SQLStatements.INSERT_OR_REPLACE_MEMORY_CHUNK, [
          chunk.id,
          chunk.filePath,
          chunk.chunkIndex,
          chunk.content,
          chunk.startLine,
          chunk.endLine,
          chunk.tokenCount,
          chunk.createdAt
        ]);
      }

      // 更新 FTS5 索引（如果已创建）
      try {
        // FTS5 会自动同步，但我们可以手动触发
        await this.databaseClient.execute('INSERT INTO memory_fts5(memory_fts5) VALUES(\'rebuild\')');
      } catch (error) {
        // FTS5 表可能不存在，忽略错误
        console.warn('FTS5 表不存在或重建失败:', error);
      }

      console.log(`文件索引完成: ${filePath}，共 ${chunks.length} 个块`);
    } catch (error: any) {
      console.error('索引文件失败:', filePath, error);
      throw error;
    }
  }

  /**
   * 删除文件的索引
   */
  private async removeFileIndex(filePath: string): Promise<void> {
    try {
      if (!this.databaseClient) {
        console.warn('数据库客户端未初始化，无法删除索引');
        return;
      }

      await this.databaseClient.execute(SQLStatements.DELETE_MEMORY_CHUNKS_BY_FILE, [filePath]);
      console.log(`文件索引已删除: ${filePath}`);
    } catch (error: any) {
      console.error('删除文件索引失败:', filePath, error);
      throw error;
    }
  }

  /**
   * 索引所有现有的记忆文件
   */
  private async indexAllExistingFiles(): Promise<void> {
    try {
      const filesToIndex: string[] = [];

      // 收集所有需要索引的文件
      const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
      if (fs.existsSync(memoryFile)) {
        filesToIndex.push(memoryFile);
      }

      // 索引 daily 目录下的所有文件
      const dailyDir = path.join(this.memoryBasePath, 'daily');
      if (fs.existsSync(dailyDir)) {
        const dailyFiles = fs.readdirSync(dailyDir)
          .filter(file => file.endsWith('.md'))
          .map(file => path.join(dailyDir, file));
        filesToIndex.push(...dailyFiles);
      }

      // 索引 tasks 目录下的所有文件
      const tasksDir = path.join(this.memoryBasePath, 'tasks');
      if (fs.existsSync(tasksDir)) {
        const taskFiles = this.getAllMarkdownFiles(tasksDir);
        filesToIndex.push(...taskFiles);
      }

      // 索引 habits 目录下的所有文件
      const habitsDir = path.join(this.memoryBasePath, 'habits');
      if (fs.existsSync(habitsDir)) {
        const habitFiles = this.getAllMarkdownFiles(habitsDir);
        filesToIndex.push(...habitFiles);
      }

      console.log(`找到 ${filesToIndex.length} 个文件需要索引`);

      // 批量索引文件（避免并发过多）
      for (const filePath of filesToIndex) {
        try {
          await this.indexFile(filePath);
        } catch (error: any) {
          console.error(`索引文件失败: ${filePath}`, error);
        }
      }

      console.log('所有现有文件索引完成');
    } catch (error: any) {
      console.error('索引现有文件失败:', error);
    }
  }

  /**
   * 递归获取目录下所有 Markdown 文件
   */
  private getAllMarkdownFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 递归处理子目录
          files.push(...this.getAllMarkdownFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`读取目录失败: ${dir}`, error);
    }
    
    return files;
  }

  /**
   * 停止文件监听
   */
  public stopWatcher(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * 搜索记忆（关键词搜索，使用 FTS5）
   */
  public async searchMemory(query: string, limit: number = 10): Promise<ServiceResult<MemorySearchResult[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库客户端未初始化');
      }

      if (!query || !query.trim()) {
        return ServiceResultFactory.success([]);
      }

      // 转义 FTS5 查询字符串（简单处理）
      const escapedQuery = query.trim().replace(/"/g, '""');

      try {
        // 尝试使用 FTS5 搜索
        const rows = await this.databaseClient.execute(SQLStatements.SEARCH_MEMORY_FTS5, [`"${escapedQuery}"`, limit]) as any[];
        
        const results: MemorySearchResult[] = rows.map((row: any) => ({
          chunk: {
            id: row.id,
            filePath: row.file_path,
            content: row.content,
            chunkIndex: row.chunk_index,
            startLine: row.start_line,
            endLine: row.end_line,
            tokenCount: row.token_count,
            createdAt: row.created_at
          },
          score: row.rank || 0,
          matchType: 'keyword' as const
        }));

        return ServiceResultFactory.success(results);
      } catch (error: any) {
        // 如果 FTS5 不可用，使用简单的 LIKE 搜索作为后备
        console.warn('FTS5 搜索失败，使用 LIKE 搜索:', error);
        const likeQuery = `%${query}%`;
        const rows = await this.databaseClient.execute(
          'SELECT * FROM memory_index WHERE content LIKE ? LIMIT ?',
          [likeQuery, limit]
        ) as any[];

        const results: MemorySearchResult[] = rows.map((row: any) => ({
          chunk: {
            id: row.id,
            filePath: row.file_path,
            content: row.content,
            chunkIndex: row.chunk_index,
            startLine: row.start_line,
            endLine: row.end_line,
            tokenCount: row.token_count,
            createdAt: row.created_at
          },
          score: 1, // LIKE 搜索没有评分
          matchType: 'keyword' as const
        }));

        return ServiceResultFactory.success(results);
      }
    } catch (error: any) {
      console.error('搜索记忆失败:', error);
      return ServiceResultFactory.error(`搜索记忆失败: ${error.message}`);
    }
  }

  /**
   * 手动触发索引所有文件
   */
  public async reindexAll(): Promise<ServiceResult<{ indexed: number; errors: number }>> {
    try {
      let indexed = 0;
      let errors = 0;

      const filesToIndex: string[] = [];

      // 收集所有需要索引的文件
      const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
      if (fs.existsSync(memoryFile)) {
        filesToIndex.push(memoryFile);
      }

      // 索引 daily 目录下的所有文件
      const dailyDir = path.join(this.memoryBasePath, 'daily');
      if (fs.existsSync(dailyDir)) {
        const dailyFiles = fs.readdirSync(dailyDir)
          .filter(file => file.endsWith('.md'))
          .map(file => path.join(dailyDir, file));
        filesToIndex.push(...dailyFiles);
      }

      // 索引 tasks 目录下的所有文件
      const tasksDir = path.join(this.memoryBasePath, 'tasks');
      if (fs.existsSync(tasksDir)) {
        const taskFiles = this.getAllMarkdownFiles(tasksDir);
        filesToIndex.push(...taskFiles);
      }

      // 索引 habits 目录下的所有文件
      const habitsDir = path.join(this.memoryBasePath, 'habits');
      if (fs.existsSync(habitsDir)) {
        const habitFiles = this.getAllMarkdownFiles(habitsDir);
        filesToIndex.push(...habitFiles);
      }

      console.log(`开始重新索引 ${filesToIndex.length} 个文件...`);

      // 批量索引文件
      for (const filePath of filesToIndex) {
        try {
          await this.indexFile(filePath);
          indexed++;
        } catch (error: any) {
          console.error(`索引文件失败: ${filePath}`, error);
          errors++;
        }
      }

      console.log(`重新索引完成: 成功 ${indexed} 个，失败 ${errors} 个`);

      return ServiceResultFactory.success({ indexed, errors });
    } catch (error: any) {
      console.error('重新索引失败:', error);
      return ServiceResultFactory.error(`重新索引失败: ${error.message}`);
    }
  }

  /**
   * 获取所有记忆文件列表
   */
  public async getMemoryFileList(): Promise<ServiceResult<{
    daily: string[];
    tasks: string[];
    habits: string[];
    memory: string | null;
  }>> {
    try {
      const result: {
        daily: string[];
        tasks: string[];
        habits: string[];
        memory: string | null;
      } = {
        daily: [],
        tasks: [],
        habits: [],
        memory: null
      };

      // 获取 MEMORY.md
      const memoryFile = path.join(this.memoryBasePath, '..', 'MEMORY.md');
      if (fs.existsSync(memoryFile)) {
        result.memory = memoryFile;
      }

      // 获取 daily 目录下的文件
      const dailyDir = path.join(this.memoryBasePath, 'daily');
      if (fs.existsSync(dailyDir)) {
        result.daily = fs.readdirSync(dailyDir)
          .filter(file => file.endsWith('.md'))
          .map(file => path.join(dailyDir, file))
          .sort()
          .reverse(); // 最新的在前
      }

      // 获取 tasks 目录下的文件
      const tasksDir = path.join(this.memoryBasePath, 'tasks');
      if (fs.existsSync(tasksDir)) {
        result.tasks = this.getAllMarkdownFiles(tasksDir).sort();
      }

      // 获取 habits 目录下的文件
      const habitsDir = path.join(this.memoryBasePath, 'habits');
      if (fs.existsSync(habitsDir)) {
        result.habits = this.getAllMarkdownFiles(habitsDir).sort();
      }

      return ServiceResultFactory.success(result);
    } catch (error: any) {
      console.error('获取记忆文件列表失败:', error);
      return ServiceResultFactory.error(`获取记忆文件列表失败: ${error.message}`);
    }
  }

  /**
   * 获取会话启动时需要加载的记忆
   * 根据 Clawdbot 规则：SOUL.md, USER.md, 今日和昨日的日志, MEMORY.md
   */
  public async getSessionMemory(): Promise<ServiceResult<{ [key: string]: string }>> {
    try {
      const memory: { [key: string]: string } = {};

      // 读取 MEMORY.md（长期记忆）
      const longTermResult = await this.readLongTermMemory();
      if (longTermResult.success && longTermResult.data) {
        memory['MEMORY.md'] = longTermResult.data;
      }

      // 读取今日日志
      const today = new Date().toISOString().split('T')[0];
      const todayResult = await this.readLogByDate(today);
      if (todayResult.success && todayResult.data) {
        memory[`daily/${today}.md`] = todayResult.data;
      }

      // 读取昨日日志
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdayResult = await this.readLogByDate(yesterdayStr);
      if (yesterdayResult.success && yesterdayResult.data) {
        memory[`daily/${yesterdayStr}.md`] = yesterdayResult.data;
      }

      return ServiceResultFactory.success(memory);
    } catch (error: any) {
      console.error('获取会话记忆失败:', error);
      return ServiceResultFactory.error(`获取会话记忆失败: ${error.message}`);
    }
  }
}

