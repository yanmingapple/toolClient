import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionStatus, ConnectionInfo, ConnectionConfig, ConnectionType } from '../model/database';
import { ClientService } from '../service/ClientService';
import { TreeNode } from '../model/database/TreeNode';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';
import * as fs from 'fs';
import * as path from 'path';
import { SQLStatements } from '../dataService/sql';

/**
 * 数据库连接缓存管理类
 * 提供连接池管理、连接复用、健康检查等功能
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections: Map<string, ConnectionInfo> = new Map();
    //添加ServiceMonitor数组列表
    private serviceMonitors: Map<string, ServiceMonitor> = new Map();
    private healthCheckInterval: number = 30000; // 30秒健康检查间隔
    private maxIdleTime: number = 300000; // 5分钟最大空闲时间
    private pingInterval: number = 60000; // 1分钟ping间隔
    private healthCheckTimer: NodeJS.Timeout | null = null;
    private databaseService: ClientService | null = null;
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
            this.databaseService = await this.initializeSQLiteDatabase();
            this.isInitialized = true;
            console.log('DatabaseManager initialized successfully');

            //获取监控中的连接
            const monitorConnections = await this.databaseService.getAllServiceMonitors();
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
 * @returns ClientService实例
 */
    private async initializeSQLiteDatabase(): Promise<ClientService> {
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
        try {
            await fs.promises.access(dbPath);
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
        await sqliteClient.connect();

        // 创建表结构
        try {
            // 创建connections表
            await sqliteClient.execute(SQLStatements.CREATE_CONNECTIONS_TABLE);
            console.log('创建connections表成功');

            // 创建service_monitor表
            await sqliteClient.execute(SQLStatements.CREATE_SERVICE_MONITOR_TABLE);
            console.log('创建service_monitor表成功');
        } catch (error) {
            console.error('创建数据库表失败:', error);
            await sqliteClient.disconnect();
            throw error;
        }

        // 创建ClientService实例
        const databaseService = ClientService.create(sqliteClient);
        return databaseService;
    }

    /**
     * 确保数据库管理器已初始化
     * @throws 如果未初始化则抛出错误
     */
    private ensureInitialized(): void {
        if (!this.isInitialized || !this.databaseService) {
            throw new Error('DatabaseManager is not initialized. Call initialize() first.');
        }
    }

    /**
     * 获取数据库连接
     * @param config 连接配置
     * @returns 数据库客户端实例
     */
    public async getConnection(config: ConnectionConfig): Promise<DatabaseClient> {
        this.ensureInitialized(); // 确保已初始化

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
     * 关闭所有连接并清理资源
     */
    public async shutdown(): Promise<void> {
        // 停止健康检查
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }

        // 关闭所有数据库连接
        if (this.databaseService) {
            await this.databaseService.close();
            this.databaseService = null;
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
    private async performHealthCheck(): Promise<void> {
        //定时执行检查监控的服务是否正常再当前系统中端口是存在
        for (const monitor of this.serviceMonitors.values()) {
            const { host, port } = monitor;
            try {
                await this.checkServiceHealth(host, port);
                // 更新服务状态为正常
                await this.databaseService.updateServiceMonitorStatus(monitor.id, ConnectionStatus.CONNECTED);
            } catch (error) {
                // 更新服务状态为异常
                await this.databaseService.updateServiceMonitorStatus(monitor.id, ConnectionStatus.ERROR);
            }
        }
    }

    //引入PortChecker检查指定服务的端口，同步给前端刷新列表 
    private async checkServiceHealth(host: string, port: number): Promise<void> {
        const portChecker = new PortChecker();
        await portChecker.checkPort(host, port);
    }


}

// 导出单例实例
export const clientManager = DatabaseManager.getInstance();