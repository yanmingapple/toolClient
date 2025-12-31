import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionStatus, ConnectionInfo, ConnectionConfig } from '../model/database';
import { DatabaseService } from '../service/databaseService';
import { TreeNode } from '../model/database/TreeNode';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 数据库连接缓存管理类
 * 提供连接池管理、连接复用、健康检查等功能
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private connections: Map<string, ConnectionInfo> = new Map();
    private healthCheckInterval: number = 30000; // 30秒健康检查间隔
    private maxIdleTime: number = 300000; // 5分钟最大空闲时间
    private pingInterval: number = 60000; // 1分钟ping间隔
    private healthCheckTimer: NodeJS.Timeout | null = null;
    private databaseService: DatabaseService | null = null;
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
     * 构造函数，只初始化基本属性，不进行异步操作
     */
    private constructor() {
        // 不在构造函数中进行异步操作
        this.startHealthCheck();
    }

    /**
     * 显式初始化数据库管理器
     * @returns Promise<void>
     */
    public async initialize(): Promise<void> {
        // 如果已经初始化，直接返回
        if (this.isInitialized && this.initializationPromise) {
            return this.initializationPromise;
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
            this.databaseService = await DatabaseService.initializeSQLiteDatabase();
            this.isInitialized = true;
            console.log('DatabaseManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize DatabaseManager:', error);
            this.isInitialized = false;
            this.initializationPromise = null;
            throw error;
        }
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
        const client = await this.createConnection(config);

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
     * 创建新的数据库连接
     * @param config 连接配置
     * @returns 数据库客户端实例
     */
    private async createConnection(config: ConnectionConfig): Promise<DatabaseClient> {
        const client = createDatabaseClient(config);

        try {
            await client.connect();
            return client;
        } catch (error) {
            throw new Error(`Failed to create database connection: ${error}`);
        }
    }

    /**
     * 释放连接（不关闭，只标记为可复用）
     * @param config 连接配置
     */
    public releaseConnection(config: ConnectionConfig): void {
        const connectionKey = this.generateConnectionKey(config);
        const connectionInfo = this.connections.get(connectionKey);

        if (connectionInfo) {
            connectionInfo.lastUsedAt = new Date();
        }
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
     * 获取连接状态
     * @param config 连接配置
     * @returns 连接状态
     */
    public getConnectionStatus(config: ConnectionConfig): ConnectionStatus | null {
        const connectionKey = this.generateConnectionKey(config);
        const connectionInfo = this.connections.get(connectionKey);
        return connectionInfo ? connectionInfo.status : null;
    }

    /**
     * 获取所有连接统计信息
     * @returns 连接统计信息
     */
    public getConnectionStats(): {
        total: number;
        connected: number;
        disconnected: number;
        error: number;
        connecting: number;
        timeout: number;
    } {
        const stats = {
            total: this.connections.size,
            connected: 0,
            disconnected: 0,
            error: 0,
            connecting: 0,
            timeout: 0
        };

        this.connections.forEach(info => {
            stats[info.status]++;
        });

        return stats;
    }

    /**
     * 获取连接使用详情
     * @returns 连接使用详情数组
     */
    public getConnectionDetails(): Array<{
        key: string;
        name: string;
        type: string;
        status: ConnectionStatus;
        createdAt: Date;
        lastUsedAt: Date;
        useCount: number;
        idleTime: number; // 空闲时间（毫秒）
    }> {
        const details: Array<{
            key: string;
            name: string;
            type: string;
            status: ConnectionStatus;
            createdAt: Date;
            lastUsedAt: Date;
            useCount: number;
            idleTime: number;
        }> = [];
        const now = new Date();

        this.connections.forEach((info, key) => {
            details.push({
                key,
                name: info.config.name,
                type: info.config.type,
                status: info.status,
                createdAt: info.createdAt,
                lastUsedAt: info.lastUsedAt,
                useCount: info.useCount,
                idleTime: now.getTime() - info.lastUsedAt.getTime()
            });
        });

        return details.sort((a, b) => b.useCount - a.useCount);
    }

    /**
     * 清理空闲连接
     * @param maxIdleTime 最大空闲时间（毫秒），默认使用实例配置
     */
    public async cleanupIdleConnections(maxIdleTime?: number): Promise<number> {
        const idleTime = maxIdleTime || this.maxIdleTime;
        const now = new Date();
        let cleanedCount = 0;

        const connectionsToRemove: string[] = [];

        this.connections.forEach((info, key) => {
            const idleDuration = now.getTime() - info.lastUsedAt.getTime();
            if (idleDuration > idleTime && info.status === ConnectionStatus.CONNECTED) {
                connectionsToRemove.push(key);
            }
        });

        for (const key of connectionsToRemove) {
            await this.removeConnection(key);
            cleanedCount++;
        }

        return cleanedCount;
    }

    /**
     * 测试数据库连接
     * @param config 连接配置
     * @returns 连接测试结果
     */
    public static async testConnection(config: ConnectionConfig): Promise<ServiceResult<boolean>> {
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
     * 测试连接健康状态
     * @param config 连接配置
     * @returns 连接是否健康
     */
    public async testConnectionHealth(config: ConnectionConfig): Promise<boolean> {
        const connectionKey = this.generateConnectionKey(config);
        const connectionInfo = this.connections.get(connectionKey);

        if (!connectionInfo || connectionInfo.status !== ConnectionStatus.CONNECTED) {
            return false;
        }

        try {
            const isHealthy = await connectionInfo.client.ping();
            if (isHealthy) {
                connectionInfo.lastPingAt = new Date();
                connectionInfo.status = ConnectionStatus.CONNECTED;
            } else {
                connectionInfo.status = ConnectionStatus.ERROR;
            }
            return isHealthy;
        } catch (error) {
            connectionInfo.status = ConnectionStatus.ERROR;
            return false;
        }
    }

    /**
     * 强制重新连接
     * @param config 连接配置
     * @returns 新的数据库客户端实例
     */
    public async reconnect(config: ConnectionConfig): Promise<DatabaseClient> {
        await this.removeConnection(config);
        return this.getConnection(config);
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
        const now = new Date();
        const connectionsToRemove: string[] = [];

        this.connections.forEach((info, key) => {
            // 检查ping超时
            const pingDuration = now.getTime() - info.lastPingAt.getTime();
            if (pingDuration > info.pingInterval && info.status === ConnectionStatus.CONNECTED) {
                // 异步ping检查，不阻塞主流程
                this.testConnectionHealth(info.config).then(isHealthy => {
                    if (!isHealthy) {
                        console.warn(`Connection ${key} is unhealthy, marking as error`);
                        info.status = ConnectionStatus.ERROR;
                    }
                }).catch(() => {
                    info.status = ConnectionStatus.ERROR;
                });
            }

            // 检查空闲超时
            const idleDuration = now.getTime() - info.lastUsedAt.getTime();
            if (idleDuration > info.maxIdleTime) {
                connectionsToRemove.push(key);
            }
        });

        // 清理超时的空闲连接
        for (const key of connectionsToRemove) {
            await this.removeConnection(key);
        }
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
     * 获取所有连接配置（向后兼容代理方法）
     * @returns TreeNode 数组
     */
    public async getAllConnections(): Promise<TreeNode[]> {
        this.ensureInitialized();
        if (!this.databaseService) {
            throw new Error('DatabaseService not initialized');
        }
        return await this.databaseService.getAllConnections();
    }

    /**
     * 保存连接配置列表（向后兼容代理方法）
     * @param connections 连接配置数组
     */
    public async saveConnections(connections: Array<any>): Promise<void> {
        this.ensureInitialized();
        if (!this.databaseService) {
            throw new Error('DatabaseService not initialized');
        }
        await this.databaseService.saveConnections(connections);
    }

    /**
     * 获取数据库服务实例
     * @returns 数据库服务
     */
    public getDatabaseService(): DatabaseService {
        this.ensureInitialized();
        if (!this.databaseService) {
            throw new Error('DatabaseService not initialized');
        }
        return this.databaseService;
    }

    /**
     * 配置管理器参数
     * @param options 配置选项
     */
    public configure(options: {
        healthCheckInterval?: number;
        maxIdleTime?: number;
        pingInterval?: number;
    }): void {
        if (options.healthCheckInterval) {
            this.healthCheckInterval = options.healthCheckInterval;
            // 重新启动健康检查
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
                this.startHealthCheck();
            }
        }

        if (options.maxIdleTime) {
            this.maxIdleTime = options.maxIdleTime;
        }

        if (options.pingInterval) {
            this.pingInterval = options.pingInterval;
        }
    }
}

// 导出单例实例
export const databaseManager = DatabaseManager.getInstance();