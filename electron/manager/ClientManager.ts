import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionStatus, ConnectionInfo, ConnectionConfig, ConnectionType } from '../model/database';
import * as fs from 'fs';
import * as path from 'path';
import { SQLStatements } from '../dataService/sql';
import { PortCheckerImpl } from '../healthCheck/portChecker';
import { PortCheckConfig } from '../model/healthCheck/portCheckConfig';
import { CheckResult } from '../model/healthCheck/checkResult';
import { WebContentsService } from '../service/webContentsService';
import { ServiceMonitor } from '../model/database/ServiceMonitor';
import { TreeNode, TreeNodeFactory } from '../model/database/TreeNode';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';
import { EventService, Event, Todo } from '../service/eventService';
import { AIService }  from '../service/aiService'; 
const { ipcMain } = require('electron');

/**
 * 数据库连接缓存管理类
 * 提供连接池管理、连接复用、健康检查等功能
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections: Map<string, ConnectionInfo> = new Map();
    //添加ServiceMonitor数组列表
    private serviceMonitors: Map<number, ServiceMonitor> = new Map();
    private healthCheckInterval: number = 30000; // 30秒健康检查间隔
    private maxIdleTime: number = 300000; // 5分钟最大空闲时间
    private pingInterval: number = 60000; // 1分钟ping间隔
    private healthCheckTimer: NodeJS.Timeout | null = null;
    private databaseClient: DatabaseClient | null = null;
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

    /**
     * 单例模式获取实例
     */
    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }


    /**
     * 显式初始化数据库管理器
     * @returns Promise<void>
     */
    public async initialize(): Promise<void> {
        // 如果已经初始化，直接返回
        if (this.isInitialized) {
            return;
        }

        // 如果正在初始化，返回现有的Promise
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // 开始新的初始化过程
        this.initializationPromise = this.performInitialization();
        await this.initializationPromise;
    }


    /**
     * 执行实际的初始化操作
     * @returns Promise<void>
     */
    private async performInitialization(): Promise<void> {
        try {
            console.log('Initializing DatabaseManager...');
            this.databaseClient = await this.initializeSQLiteDatabase();
            this.isInitialized = true;
            console.log('DatabaseManager initialized successfully');

            //获取监控中的连接
            const serviceResult = await this.handleGetAllServiceMonitors();
            let monitorConnections: ServiceMonitor[] = [];
            if (serviceResult.success && Array.isArray(serviceResult.data)) {
                monitorConnections = serviceResult.data;
            }
            this.serviceMonitors = new Map(monitorConnections.map(monitor => [monitor.id, monitor]));
            // 启动健康检查定时器
            this.startHealthCheck();
        } catch (error) {
            console.error('Failed to initialize DatabaseManager:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
    }


    /**
 * 初始化SQLite数据库
 * @returns DatabaseClient实例
 */
    private async initializeSQLiteDatabase(): Promise<DatabaseClient> {
        const dbPath = path.join(process.cwd(), 'database', 'dbmanager.db');
        const dbDir = path.dirname(dbPath);

        // 确保数据库目录存在
        try {
            await fs.promises.access(dbDir);
        } catch (err) {
            await fs.promises.mkdir(dbDir, { recursive: true });
            console.log(`创建数据库目录: ${dbDir}`);
        }

        // 确保数据库文件存在
        let dbExists = false;
        try {
            await fs.promises.access(dbPath);
            dbExists = true;
            console.log(`数据库文件已存在: ${dbPath}`);
        } catch (err) {
            // 创建空的数据库文件
            await fs.promises.writeFile(dbPath, '');
            console.log(`创建数据库文件: ${dbPath}`);
        }

        // 创建SQLite数据库客户端
        const sqliteConfig = {
            id: 'sqlite-internal',
            name: 'SQLite Internal Database',
            type: ConnectionType.SQLite,
            host: 'localhost',
            port: 0,
            username: '',
            password: '',
            database: dbPath
        };

        const sqliteClient = createDatabaseClient(sqliteConfig);
        
        // 尝试连接并检查数据库完整性
        try {
            await sqliteClient.connect();
            
            // 如果数据库已存在，检查完整性
            if (dbExists) {
                try {
                    const integrityCheck = await sqliteClient.execute('PRAGMA integrity_check') as any[];
                    const result = integrityCheck && integrityCheck.length > 0 ? integrityCheck[0] : null;
                    
                    if (result && typeof result === 'object' && 'integrity_check' in result) {
                        const checkResult = (result as any).integrity_check;
                        if (checkResult !== 'ok') {
                            console.warn('数据库完整性检查失败:', checkResult);
                            throw new Error('数据库已损坏');
                        }
                    }
                    console.log('数据库完整性检查通过');
                } catch (checkError: any) {
                    // 数据库可能损坏，尝试恢复
                    console.error('数据库完整性检查失败，尝试恢复...', checkError);
                    await sqliteClient.disconnect();
                    
                    // 备份损坏的数据库
                    const backupPath = `${dbPath}.corrupted.${Date.now()}`;
                    try {
                        await fs.promises.copyFile(dbPath, backupPath);
                        console.log(`已备份损坏的数据库到: ${backupPath}`);
                    } catch (backupError) {
                        console.error('备份数据库失败:', backupError);
                    }
                    
                    // 删除损坏的数据库文件
                    try {
                        await fs.promises.unlink(dbPath);
                        console.log('已删除损坏的数据库文件');
                    } catch (unlinkError) {
                        console.error('删除损坏的数据库文件失败:', unlinkError);
                    }
                    
                    // 创建新的数据库文件
                    await fs.promises.writeFile(dbPath, '');
                    console.log('已创建新的数据库文件');
                    
                    // 重新连接
                    await sqliteClient.connect();
                }
            }
        } catch (connectError: any) {
            // 如果连接失败且数据库存在，可能是损坏了
            if (dbExists && (connectError.code === 'SQLITE_CORRUPT' || connectError.message?.includes('malformed'))) {
                console.error('数据库已损坏，尝试恢复...', connectError);
                await sqliteClient.disconnect().catch(() => {});
                
                // 备份损坏的数据库
                const backupPath = `${dbPath}.corrupted.${Date.now()}`;
                try {
                    await fs.promises.copyFile(dbPath, backupPath);
                    console.log(`已备份损坏的数据库到: ${backupPath}`);
                } catch (backupError) {
                    console.error('备份数据库失败:', backupError);
                }
                
                // 删除损坏的数据库文件（如果文件被占用，稍后重试）
                let deleted = false;
                for (let i = 0; i < 5; i++) {
                    try {
                        await fs.promises.unlink(dbPath);
                        deleted = true;
                        console.log('已删除损坏的数据库文件');
                        break;
                    } catch (unlinkError: any) {
                        if (i < 4) {
                            console.log(`删除数据库文件失败，等待后重试 (${i + 1}/5)...`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            console.error('删除损坏的数据库文件失败，请手动删除:', unlinkError);
                            // 尝试重命名而不是删除
                            try {
                                const renamedPath = `${dbPath}.old.${Date.now()}`;
                                await fs.promises.rename(dbPath, renamedPath);
                                console.log(`已重命名损坏的数据库文件为: ${renamedPath}`);
                                deleted = true;
                            } catch (renameError) {
                                console.error('重命名数据库文件也失败:', renameError);
                            }
                        }
                    }
                }
                
                // 创建新的数据库文件
                if (deleted) {
                    await fs.promises.writeFile(dbPath, '');
                    console.log('已创建新的数据库文件');
                    
                    // 重新连接
                    await sqliteClient.connect();
                } else {
                    throw new Error('无法删除或重命名损坏的数据库文件，请手动处理');
                }
            } else {
                throw connectError;
            }
        }

        // 创建表结构
        try {
            // 创建connections表
            await sqliteClient.execute(SQLStatements.CREATE_CONNECTIONS_TABLE);
            console.log('创建connections表成功');

            // 创建service_monitor表
            await sqliteClient.execute(SQLStatements.CREATE_SERVICE_MONITOR_TABLE);
            console.log('创建service_monitor表成功');

            // 创建events表
            await sqliteClient.execute(SQLStatements.CREATE_EVENTS_TABLE);
            console.log('创建events表成功');

            // 创建todos表
            await sqliteClient.execute(SQLStatements.CREATE_TODOS_TABLE);
            console.log('创建todos表成功');

            // 创建AI相关表
            await sqliteClient.execute(SQLStatements.CREATE_AI_CONFIG_TABLE);
            console.log('创建ai_config表成功');

            await sqliteClient.execute(SQLStatements.CREATE_AI_CACHE_TABLE);
            console.log('创建ai_cache表成功');

            await sqliteClient.execute(SQLStatements.CREATE_AI_CONTEXT_TABLE);
            console.log('创建ai_context表成功');

            await sqliteClient.execute(SQLStatements.CREATE_EVENT_AI_METADATA_TABLE);
            console.log('创建event_ai_metadata表成功');

            await sqliteClient.execute(SQLStatements.CREATE_TAGS_TABLE);
            console.log('创建tags表成功');

            await sqliteClient.execute(SQLStatements.CREATE_EVENT_TAGS_TABLE);
            console.log('创建event_tags表成功');

            // 创建记忆索引表
            await sqliteClient.execute(SQLStatements.CREATE_MEMORY_INDEX_TABLE);
            console.log('创建memory_index表成功');

            // 创建 FTS5 虚拟表（如果 SQLite 支持）
            try {
                await sqliteClient.execute(SQLStatements.CREATE_MEMORY_FTS5_TABLE);
                console.log('创建memory_fts5表成功');
            } catch (error) {
                console.warn('FTS5 表创建失败（可能 SQLite 版本不支持）:', error);
            }

            // 创建AI智能体自我学习方案相关表
            await sqliteClient.execute(SQLStatements.CREATE_AI_MODULES_TABLE);
            console.log('创建ai_modules表成功');

            await sqliteClient.execute(SQLStatements.CREATE_USER_BEHAVIOR_LOG_TABLE);
            console.log('创建user_behavior_log表成功');

            await sqliteClient.execute(SQLStatements.CREATE_USER_PREFERENCES_TABLE);
            console.log('创建user_preferences表成功');

            await sqliteClient.execute(SQLStatements.CREATE_AI_LEARNED_PATTERNS_TABLE);
            console.log('创建ai_learned_patterns表成功');

            // 创建打断记录表
            await sqliteClient.execute(SQLStatements.CREATE_INTERRUPTIONS_TABLE);
            console.log('创建interruptions表成功');

            // 检查serverName列是否存在
            try {
                const result = await sqliteClient.execute('PRAGMA table_info(service_monitor)');
                const hasServerNameColumn = (result as any[]).some(col => col.name === 'serverName');

                if (!hasServerNameColumn) {
                    // 添加serverName列
                    await sqliteClient.execute(SQLStatements.ALTER_SERVICE_MONITOR_ADD_SERVERNAME);
                    console.log('添加serverName列成功');
                } else {
                    console.log('serverName列已存在，跳过添加操作');
                }
            } catch (error) {
                console.error('检查或添加serverName列时出错:', error);
            }
        } catch (error) {
            console.error('创建数据库表失败:', error);
            await sqliteClient.disconnect();
            throw error;
        }

        // 初始化 EventService
        const eventService = EventService.getInstance();
        eventService.setDatabaseClient(sqliteClient);
        console.log('EventService 初始化成功');

        // 初始化 AIService
        const aiService = AIService.getInstance();
        aiService.setDatabaseClient(sqliteClient);
        console.log('AIService 初始化成功');

        // 初始化 MemoryService
        const { MemoryService } = await import('../service/memoryService');
        const memoryService = MemoryService.getInstance();
        memoryService.setDatabaseClient(sqliteClient);
        // 启动文件监听（可选，如果 chokidar 未安装会跳过）
        await memoryService.initializeWatcher();
        console.log('MemoryService 初始化成功');

        // 返回数据库客户端实例
        return sqliteClient;
    }

    /**
     * 确保数据库管理器已初始化
     * 如果未初始化，则自动初始化
     * @throws 如果初始化失败则抛出错误
     */
    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized && this.databaseClient) {
            return;
        }
        
        // 如果正在初始化，等待初始化完成
        if (this.initializationPromise) {
            await this.initializationPromise;
            return;
        }
        
        // 如果未初始化，自动初始化
        await this.initialize();
    }

    /**
     * 获取数据库连接
     * @param config 连接配置
     * @returns 数据库客户端实例
     */
    public async getConnection(config: ConnectionConfig): Promise<DatabaseClient> {
        await this.ensureInitialized(); // 确保已初始化

        const connectionKey = this.generateConnectionKey(config);
        let connectionInfo = this.connections.get(connectionKey);

        if (connectionInfo) {
            // 检查连接是否仍然有效
            if (connectionInfo.status === ConnectionStatus.CONNECTED) {
                connectionInfo.lastUsedAt = new Date();
                connectionInfo.useCount++;
                return connectionInfo.client;
            } else if (connectionInfo.status === ConnectionStatus.ERROR ||
                connectionInfo.status === ConnectionStatus.TIMEOUT) {
                // 移除失效的连接
                await this.removeConnection(connectionKey);
            }
        }

        // 创建新连接
        const client = createDatabaseClient(config);
        await client.connect();

        // 缓存连接信息
        connectionInfo = {
            config,
            client,
            status: ConnectionStatus.CONNECTED,
            createdAt: new Date(),
            lastUsedAt: new Date(),
            lastPingAt: new Date(),
            pingInterval: this.pingInterval,
            maxIdleTime: this.maxIdleTime,
            useCount: 1
        };

        this.connections.set(connectionKey, connectionInfo);
        return client;
    }

    /**
     * 关闭并移除连接
     * @param config 连接配置
     */
    public async removeConnection(configOrKey: ConnectionConfig | string): Promise<void> {
        const connectionKey = typeof configOrKey === 'string' ? configOrKey : this.generateConnectionKey(configOrKey);
        const connectionInfo = this.connections.get(connectionKey);

        if (connectionInfo) {
            try {
                await connectionInfo.client.disconnect();
            } catch (error) {
                console.warn(`Error disconnecting client: ${error}`);
            }
            this.connections.delete(connectionKey);
        }
    }

    /**
     * 释放连接（与removeConnection功能相同，用于兼容旧代码）
     * @param config 连接配置
     */
    public async releaseConnection(config: ConnectionConfig): Promise<void> {
        await this.removeConnection(config);
    }


    /**
     * 关闭所有连接并清理资源
     */
    public async shutdown(): Promise<void> {
        // 停止健康检查
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }

        // 关闭所有数据库连接
        if (this.databaseClient) {
            await this.databaseClient.disconnect();
            this.databaseClient = null;
        }

        // 清空连接缓存
        this.connections.clear();
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    /**
     * 生成连接唯一标识键
     * @param config 连接配置
     * @returns 连接键
     */
    private generateConnectionKey(config: ConnectionConfig): string {
        return `${config.type}_${config.host}_${config.port}_${config.username}_${config.database || 'default'}`;
    }

    /**
     * 启动健康检查定时器
     */
    private startHealthCheck(): void {
        this.healthCheckTimer = setInterval(async () => {
            await this.performHealthCheck();
        }, this.healthCheckInterval);
    }



    /**
     * 执行健康检查
     */
    public async performHealthCheck(): Promise<void> {
        //定时执行检查监控的服务是否正常再当前系统中端口是存在
        for (const [id, monitor] of this.serviceMonitors.entries()) {
            try {
                // 从URL中解析出主机和端口
                let host = "127.0.0.1";
                const port = monitor.port;

                // 调用健康检查方法，传递monitor的id
                await this.checkServiceHealth(host, port, id);
            } catch (error) { }
        }
    }

    //引入PortChecker检查指定服务的端口，同步给前端刷新列表 
    private async checkServiceHealth(host: string, port: number, id: number): Promise<void> {
        const portChecker = new PortCheckerImpl();
        const protocol = 'netstat';

        // netstat模式下只检查本地端口，忽略传入的host
        const configHost = protocol === 'netstat' ? 'localhost' : host;

        const config: PortCheckConfig = {
            host: configHost,
            port: port,
            protocol: protocol,
            timeout: 5000
        };

        try {
            const result: CheckResult = await portChecker.checkPort(config);

            // 将检查结果通知到前端，包含monitor的id
            WebContentsService.sendToRenderer('service-monitor:health-check-result', {
                id: id,
                host: configHost,
                port: port,
                status: result.status,
                responseTime: result.responseTime,
                error: result.error,
                timestamp: result.timestamp
            });
        } catch (error) {
            // 处理异常情况，包含monitor的id
            WebContentsService.sendToRenderer('service-monitor:health-check-result', {
                id: id,
                host: configHost,
                port: port,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date()
            });
        }
    }

    /**
     * 处理数据库连接测试
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 连接测试结果
     */
    public static async handleTestConnection(_event: any, config: any): Promise<ServiceResult<boolean>> {
        try {
            // 使用工厂方法创建数据库客户端
            const client = createDatabaseClient(config);

            // 连接到数据库
            await client.connect();

            // 测试连接是否有效
            const isHealthy = await client.ping();

            // 断开连接
            await client.disconnect();

            if (isHealthy) {
                return ServiceResultFactory.success(true, 'Connection successful');
            } else {
                return ServiceResultFactory.success(false, 'Connection test failed');
            }
        } catch (error) {
            console.error('Connection test error:', error);
            return ServiceResultFactory.error((error as Error).message, false);
        }
    }

    /**
     * 获取所有连接配置
     * @returns TreeNode 数组
     */
    public async handleGetAllConnections(): Promise<ServiceResult<TreeNode[]>> {
        await this.ensureInitialized();
        try {
            const connections = await this.databaseClient!.execute(SQLStatements.SELECT_ALL_CONNECTIONS);

            // 将连接配置转换为 TreeNode 格式
            const treeNodes: TreeNode[] = connections.map((connection: ConnectionConfig) => {
                return TreeNodeFactory.createConnection(connection);
            });

            return ServiceResultFactory.success(treeNodes);
        } catch (error) {
            console.error('Failed to get connections:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 获取数据库列表
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 数据库列表结果
     */
    public async handleGetDatabaseList(config: any): Promise<ServiceResult<any[]>> {
        try {
            // 使用 DatabaseManager 获取连接
            const connection = await this.getConnection(config);

            try {
                // 使用 DatabaseClient 接口的方法
                const databases = await connection.getDatabaseList();

                return ServiceResultFactory.success(databases);
            } finally {
                // 释放连接回到连接池
                await this.releaseConnection(config);
            }
        } catch (error) {
            console.error('Get databases error:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 获取表列表
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 表列表结果
     */
    public async handleGetTableList(config: any) {
        try {
            // 使用 DatabaseManager 获取连接
            const connection = await this.getConnection(config);

            try {
                // 使用 DatabaseClient 接口的方法
                const tables = await connection.getTableList();

                return ServiceResultFactory.success(tables);
            } finally {
                // 释放连接回到连接池
                await this.releaseConnection(config);
            }
        } catch (error) {
            console.error('Get tables error:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 保存连接列表
     * @param connections 连接列表
     */
    public async handleSaveConnectionList(connections: ConnectionConfig[]): Promise<ServiceResult<void>> {
        await this.ensureInitialized();
        try {
            // 由于没有批量插入的SQL语句，我们需要逐个插入
            for (const connection of connections) {
                // 使用正确的ConnectionConfig属性名
                await this.databaseClient!.execute(
                    SQLStatements.INSERT_OR_REPLACE_CONNECTION,
                    [connection.id, connection.name, connection.type, connection.host, connection.port,
                    connection.username, connection.password, connection.database, connection.sshHost,
                    connection.sshPort, connection.sshUsername, connection.sshPassword,
                    connection.sshPassphrase, connection.sshPrivateKey]
                );
            }
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to save connections:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 删除连接
     * @param connectionId 连接ID
     */
    public async handleDeleteConnection(connectionId: string): Promise<ServiceResult<void>> {
        await this.ensureInitialized();
        try {
            await this.databaseClient!.execute(SQLStatements.DELETE_CONNECTION_BY_ID, [connectionId]);
            //删除ClientMananger中的连接
            await this.removeConnection(connectionId);
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to delete connection:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 断开连接
     * @param connectionId 连接ID
     */
    public async handleDisconnect(connectionId: string): Promise<ServiceResult<void>> {
        try {
            // 从 ClientManager 中移除连接
            await this.removeConnection(connectionId);
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to disconnect connection:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 查询所有服务监控
     */
    public async handleGetAllServiceMonitors(): Promise<ServiceResult<ServiceMonitor[]>> {
        await this.ensureInitialized();
        try {
            const monitors = await this.databaseClient!.execute(SQLStatements.SELECT_ALL_SERVICE_MONITORS);
            return ServiceResultFactory.success(monitors);
        } catch (error) {
            console.error('Failed to get service monitors:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 保存服务监控列表
     * @param monitors 服务监控列表
     */
    public async handleSaveServiceMonitors(monitors: ServiceMonitor[]): Promise<ServiceResult<void>> {
        await this.ensureInitialized();
        try {
            // 根据id判断是插入还是更新
            for (const monitor of monitors) {
                if (monitor.id === 0 || monitor.id === undefined) {
                    // 插入新记录
                    await this.databaseClient!.execute(SQLStatements.INSERT_SERVICE_MONITOR, [
                        monitor.name,
                        monitor.serverName,
                        monitor.type,
                        monitor.port,
                        monitor.status,
                        monitor.workspace,
                        monitor.url,
                        monitor.createTime,
                        monitor.updateTime
                    ]);
                } else {
                    // 更新现有记录
                    await this.databaseClient!.execute(SQLStatements.UPDATE_SERVICE_MONITOR, [
                        monitor.name,
                        monitor.serverName,
                        monitor.type,
                        monitor.port,
                        monitor.status,
                        monitor.workspace,
                        monitor.url,
                        monitor.updateTime,
                        monitor.id
                    ]);
                }
            }
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to save service monitors:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 删除一个服务监控
     * @param ids 服务监控ID数组
     */
    public async handleDeleteServiceMonitors(ids: number[]): Promise<ServiceResult<void>> {
        await this.ensureInitialized();
        try {
            // 由于没有批量删除的SQL语句，我们需要逐个删除
            for (const id of ids) {
                await this.databaseClient!.execute(SQLStatements.DELETE_SERVICE_MONITOR_BY_ID, [id]);
            }
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to delete service monitors:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 删除所有服务监控
     */
    public async handleDeleteAllServiceMonitors(): Promise<ServiceResult<void>> {
        await this.ensureInitialized();
        try {
            await this.databaseClient!.execute(SQLStatements.DELETE_ALL_SERVICE_MONITORS);
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to delete service monitors:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 注册数据库服务相关的 IPC 处理程序
     */
    public static async registerIpcHandlers() {
        const instance = DatabaseManager.getInstance();
        
        // 数据库操作相关
        ipcMain.handle('database:test-connection', async (_: any, config: ConnectionConfig) => {
            return await DatabaseManager.handleTestConnection(_, config);
        });

        // 获取所有连接配置
        ipcMain.handle('database:get-all-connections', async () => {
            return await instance.handleGetAllConnections();
        });

        ipcMain.handle('database:get-databases', async (_: any, config: ConnectionConfig) => {
            return await instance.handleGetDatabaseList(config);
        });

        ipcMain.handle('database:get-tables', async (_: any, config: ConnectionConfig) => {
            return await instance.handleGetTableList(config);
        });

        // 连接配置相关
        ipcMain.handle('database:save-connections', async (_: any, connections: Array<ConnectionConfig>) => {
            return await instance.handleSaveConnectionList(connections);
        });

        // 删除连接逻辑
        ipcMain.handle('database:delete-connection', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            return await instance.handleDeleteConnection(connectionId);
        });

        // 断开连接逻辑
        ipcMain.handle('database:disconnect', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            return await instance.handleDisconnect(connectionId);
        });

        // 服务监控相关
        ipcMain.handle('service-monitor:get-all', async () => {
            return await instance.handleGetAllServiceMonitors();
        });

        ipcMain.handle('service-monitor:save', async (_: any, monitors: ServiceMonitor[]) => {
            return await instance.handleSaveServiceMonitors(monitors);
        });

        ipcMain.handle('service-monitor:delete-service-monitors', async (_: any, ids: number[]) => {
            return await instance.handleDeleteServiceMonitors(ids);
        });

        ipcMain.handle('service-monitor:delete-all', async () => {
            return await instance.handleDeleteAllServiceMonitors();
        });

        // 手动触发健康检查
        ipcMain.handle('service-monitor:perform-health-check', async () => {
            try {
                await instance.performHealthCheck();
                return { success: true, message: '健康检查执行完成' };
            } catch (error) {
                return { 
                    success: false, 
                    message: error instanceof Error ? error.message : '健康检查执行失败' 
                };
            }
        });

        // 事件相关
        const eventService = EventService.getInstance();
        
        ipcMain.handle('event:get-all', async () => {
            return await eventService.getAllEvents();
        });

        ipcMain.handle('event:get-by-date', async (_: any, date: string) => {
            return await eventService.getEventsByDate(date);
        });

        ipcMain.handle('event:save', async (_: any, event: Event) => {
            return await eventService.saveEvent(event);
        });

        ipcMain.handle('event:delete', async (_: any, eventId: string) => {
            return await eventService.deleteEvent(eventId);
        });

        ipcMain.handle('event:complete', async (_: any, eventId: string, options?: any) => {
            return await eventService.completeEvent(eventId, options);
        });

        // 代办事项相关
        ipcMain.handle('todo:get-all', async () => {
            return await eventService.getAllTodos();
        });

        ipcMain.handle('todo:get-by-date', async (_: any, date: string) => {
            return await eventService.getTodosByDate(date);
        });

        ipcMain.handle('todo:save', async (_: any, todo: Todo) => {
            return await eventService.saveTodo(todo);
        });

        ipcMain.handle('todo:delete', async (_: any, todoId: string) => {
            return await eventService.deleteTodo(todoId);
        });

        // AI相关处理器已移至 AIServiceIPC，此处不再注册

        // Memory相关
        const { MemoryService: MemoryServiceClass } = await import('../service/memoryService');
        const memoryService = MemoryServiceClass.getInstance();
        
        ipcMain.handle('memory:append-today-log', async (_: any, content: string) => {
            return await memoryService.appendToTodayLog(content);
        });

        ipcMain.handle('memory:read-today-log', async () => {
            return await memoryService.readTodayLog();
        });

        ipcMain.handle('memory:read-log-by-date', async (_: any, date: string) => {
            return await memoryService.readLogByDate(date);
        });

        ipcMain.handle('memory:read-long-term-memory', async () => {
            return await memoryService.readLongTermMemory();
        });

        ipcMain.handle('memory:write-long-term-memory', async (_: any, content: string) => {
            return await memoryService.writeLongTermMemory(content);
        });

        ipcMain.handle('memory:get-session-memory', async () => {
            return await memoryService.getSessionMemory();
        });

        ipcMain.handle('memory:search', async (_: any, query: string, limit?: number) => {
            return await memoryService.searchMemory(query, limit);
        });

        ipcMain.handle('memory:reindex-all', async () => {
            return await memoryService.reindexAll();
        });

        ipcMain.handle('memory:get-file-list', async () => {
            return await memoryService.getMemoryFileList();
        });

        ipcMain.handle('memory:get-index-stats', async () => {
            return await memoryService.getIndexStats();
        });

        ipcMain.handle('memory:clear-file-index', async (_: any, filePath: string) => {
            return await memoryService.clearFileIndex(filePath);
        });

        // 打断相关
        const { InterruptionService } = await import('../service/interruptionService');
        const interruptionService = InterruptionService.getInstance();
        const dbClient = instance.getDatabaseClient();
        if (!dbClient) {
            throw new Error('数据库客户端未初始化');
        }
        interruptionService.setDatabaseClient(dbClient);

        ipcMain.handle('interruption:record', async (_: any, interruption: any) => {
            return await interruptionService.recordInterruption(interruption);
        });

        ipcMain.handle('interruption:get-pending-reminders', async () => {
            return await interruptionService.getPendingReminders();
        });

        ipcMain.handle('interruption:get-by-event', async (_: any, eventId: string) => {
            return await interruptionService.getInterruptionsByEvent(eventId);
        });

        ipcMain.handle('interruption:mark-handled', async (_: any, interruptionId: string) => {
            return await interruptionService.markReminderHandled(interruptionId);
        });

        ipcMain.handle('interruption:delete', async (_: any, interruptionId: string) => {
            return await interruptionService.deleteInterruption(interruptionId);
        });

        // 智能提醒相关
        const { SmartReminderService } = await import('../service/smartReminderService');
        const { AIAgentCore } = await import('../service/ai/AIAgentCore');
        const smartReminderService = SmartReminderService.getInstance();
        smartReminderService.setDatabaseClient(dbClient);
        const aiAgentCore = AIAgentCore.getInstance();
        smartReminderService.setAIAgentCore(aiAgentCore);

        ipcMain.handle('smart-reminder:generate', async (_: any, event: any) => {
            return await smartReminderService.generateSmartReminders(event);
        });

        ipcMain.handle('smart-reminder:check-and-trigger', async () => {
            return await smartReminderService.checkAndTriggerReminders();
        });

        // 工作日志相关
        const { WorkLogService } = await import('../service/workLogService');
        const workLogService = WorkLogService.getInstance();
        workLogService.setDatabaseClient(dbClient);
        const aiService = AIService.getInstance();
        workLogService.setAIService(aiService);

        ipcMain.handle('work-log:get-by-date', async (_: any, date: string) => {
            return await workLogService.getLogByDate(date);
        });

        ipcMain.handle('work-log:save', async (_: any, date: string, content: string) => {
            return await workLogService.saveLog(date, content);
        });

        ipcMain.handle('work-log:generate', async (_: any, date: string) => {
            return await workLogService.generateLog(date);
        });

        ipcMain.handle('work-log:export', async (_: any, date: string) => {
            return await workLogService.exportLog(date);
        });

        ipcMain.handle('work-log:get-today-stats', async () => {
            return await workLogService.getTodayStats();
        });

        // 数据分析相关
        const { DataAnalysisService } = await import('../service/dataAnalysisService');
        const dataAnalysisService = DataAnalysisService.getInstance();
        dataAnalysisService.setDatabaseClient(dbClient);

        ipcMain.handle('data-analysis:get-efficiency-stats', async () => {
            return await dataAnalysisService.getEfficiencyStats();
        });

        ipcMain.handle('data-analysis:get-completion-stats', async () => {
            return await dataAnalysisService.getTaskCompletionStats();
        });

        ipcMain.handle('data-analysis:get-work-patterns', async () => {
            return await dataAnalysisService.getWorkPatterns();
        });

        ipcMain.handle('data-analysis:get-all-stats', async () => {
            return await dataAnalysisService.getAllStats();
        });
    }

    /**
     * 获取内部的数据库客户端实例
     * @returns 数据库客户端实例
     */
    public getDatabaseClient(): DatabaseClient | null {
        return this.databaseClient;
    }

}

// 导出单例实例
export const clientManager = DatabaseManager.getInstance();