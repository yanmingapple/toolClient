const { ipcMain } = require('electron');
// import * as path from 'path';
import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionType, ConnectionConfig } from '../model/database';
import { SQLStatements } from '../dataService/sql';
import { DatabaseManager } from '../manager/databaseMananger';
import { TreeNode, TreeNodeFactory } from '../model/database/TreeNode';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 统一数据库服务
 * 专门处理连接配置的持久化存储、数据库连接测试、数据库列表获取、表列表获取等操作
 */
export class DatabaseService {
    private database: DatabaseClient;

    private constructor(database: DatabaseClient) {
        this.database = database;
    }

    /**
     * 创建并初始化 SQLite 数据库连接
     * 如果数据库目录不存在则创建目录，如果数据库文件不存在则创建空文件
     * @returns Promise<DatabaseService> 数据库服务实例
     */
    public static async initializeSQLiteDatabase(): Promise<DatabaseService> {
        const { join } = require('path');
        const fs = require('fs').promises;
        const dbPath = join(process.cwd(), 'database', 'dbmanager.db');
        const dbDir = join(process.cwd(), 'database');

        try {
            // 1. 确保数据库目录存在
            try {
                await fs.access(dbDir);
                console.log('Database directory exists:', dbDir);
            } catch (error) {
                // 目录不存在，创建目录
                await fs.mkdir(dbDir, { recursive: true });
                console.log('Created database directory:', dbDir);
            }

            // 2. 确保数据库文件存在
            try {
                await fs.access(dbPath);
                console.log('Database file exists:', dbPath);
            } catch (error) {
                // 数据库文件不存在，创建一个空的SQLite文件
                await fs.writeFile(dbPath, '');
                console.log('Created empty database file:', dbPath);
            }

            // 3. 创建SQLite连接配置
            const sqliteConfig: ConnectionConfig = {
                id: 'internal-sqlite',
                name: 'Internal SQLite Database',
                type: ConnectionType.SQLite,
                host: 'localhost',
                port: 0,
                username: '',
                password: '',
                database: dbPath
            };

            // 4. 创建数据库连接
            const client = createDatabaseClient(sqliteConfig);
            await client.connect();

            try {
                console.log('Connected to SQLite database at:', dbPath);

                // 5. 创建连接配置表
                await client.executeBatch(SQLStatements.CREATE_CONNECTIONS_TABLE);
                console.log('Connections table initialized successfully');

                // 6. 创建数据库服务实例
                const service = new DatabaseService(client);
                return service;
            } catch (error) {
                console.error('Failed to create connections table:', error);
                await client.disconnect();
                throw error;
            }
        } catch (error) {
            console.error('Failed to initialize SQLite database:', error);
            throw error;
        }
    }

    /**
     * 获取所有连接配置
     * @returns TreeNode 数组
     */
    public async getAllConnections(): Promise<TreeNode[]> {
        const connections = await this.database.execute(SQLStatements.SELECT_ALL_CONNECTIONS);

        // 将连接配置转换为 TreeNode 格式
        const treeNodes: TreeNode[] = connections.map((connection: ConnectionConfig) => {
            return TreeNodeFactory.createConnection(connection);
        });

        return treeNodes;
    }

    /**
     * 提取连接配置参数数组
     * @param connection 连接配置
     * @returns 参数数组
     */
    private extractConnectionParams(connection: any): any[] {
        return [
            connection.id,
            connection.name,
            connection.type,
            connection.host,
            connection.port,
            connection.username,
            connection.password,
            connection.database,
            connection.sshHost,
            connection.sshPort,
            connection.sshUsername,
            connection.sshPassword,
            connection.sshPassphrase,
            connection.sshKeyPath
        ];
    }

    /**
     * 保存连接配置列表
     * @param connections 连接配置数组
     * @returns 操作结果
     */
    public async saveConnections(connections: Array<any>): Promise<void> {
        console.log('[DatabaseService] Starting to save connections:', connections.length);

        // 批量插入或替换连接配置
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            console.log(`[DatabaseService] Saving connection ${i + 1}/${connections.length}:`, conn.id, conn.name);

            try {
                const params = this.extractConnectionParams(conn);
                console.log(`[DatabaseService] Extracted params for connection ${conn.id}:`, params);

                const result = await this.database.execute(
                    SQLStatements.INSERT_OR_REPLACE_CONNECTION,
                    params
                );

                console.log(`[DatabaseService] Successfully saved connection ${conn.id}, result:`, result);
            } catch (error) {
                console.error(`[DatabaseService] Failed to save connection ${conn.id}:`, error);
                throw error;
            }
        }

        console.log('[DatabaseService] All connections saved successfully');
    }

    /**
     * 删除连接配置
     * @param connectionId 连接ID
     */
    public async deleteConnection(connectionId: string): Promise<void> {
        await this.database.execute(SQLStatements.DELETE_CONNECTION_BY_ID, [connectionId]);
    }

    /**
     * 获取单个连接配置
     * @param connectionId 连接ID
     * @returns 连接配置
     */
    public async getConnection(connectionId: string): Promise<any> {
        const result = await this.database.execute(SQLStatements.SELECT_CONNECTION_BY_ID, [connectionId]);
        return result[0] || null;
    }

    /**
     * 测试数据库连接
     * @param config 数据库配置
     * @returns 连接测试结果
     */
    public static async testConnection(config: any): Promise<ServiceResult<boolean>> {
        return await DatabaseManager.testConnection(config);
    }

    /**
     * 获取数据库列表
     * @param config 数据库配置
     * @returns 数据库列表结果
     */
    public static async getDatabaseList(config: any): Promise<ServiceResult<any[]>> {
        try {
            // 使用 DatabaseManager 获取连接
            const connection = await DatabaseManager.getInstance().getConnection(config);

            try {
                // 使用 DatabaseClient 接口的方法
                const databases = await connection.getDatabaseList();

                return ServiceResultFactory.success(databases);
            } finally {
                // 释放连接回到连接池
                DatabaseManager.getInstance().releaseConnection(config);
            }
        } catch (error) {
            console.error('Get databases error:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 获取表列表
     * @param config 数据库配置
     * @returns 表列表结果
     */
    public static async getTableList(config: any): Promise<ServiceResult<any[]>> {
        try {
            // 使用 DatabaseManager 获取连接
            const connection = await DatabaseManager.getInstance().getConnection(config);

            try {
                // 使用 DatabaseClient 接口的方法
                const tables = await connection.getTableList();

                return ServiceResultFactory.success(tables);
            } finally {
                // 释放连接回到连接池
                DatabaseManager.getInstance().releaseConnection(config);
            }
        } catch (error) {
            console.error('Get tables error:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 处理数据库连接测试
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 连接测试结果
     */
    public static async handleDatabaseConnection(_event: any, config: any) {
        try {
            const result = await this.testConnection(config);
            return result;
        } catch (error) {
            console.error('Connection error:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 获取数据库列表
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 数据库列表结果
     */
    public static async handleGetDatabaseList(_event: any, config: any) {
        try {
            const result = await this.getDatabaseList(config);
            return result;
        } catch (error) {
            console.error('Get databases error:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 获取表列表
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 表列表结果
     */
    public static async handleGetTableList(_event: any, config: any) {
        try {
            const result = await this.getTableList(config);
            return result;
        } catch (error) {
            console.error('Get tables error:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 获取连接列表
     */
    public static async getConnectionList(): Promise<ServiceResult<TreeNode[]>> {
        try {
            const connections = await DatabaseManager.getInstance().getAllConnections();
            return ServiceResultFactory.success(connections);
        } catch (error) {
            console.error('Failed to get connections:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 保存连接列表
     * @param connections 连接列表
     */
    public static async saveConnectionList(connections: ConnectionConfig[]): Promise<ServiceResult<void>> {
        try {
            await DatabaseManager.getInstance().saveConnections(connections);
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to save connections:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 注册数据库服务相关的 IPC 处理程序
     */
    public static registerIpcHandlers() {
        // 数据库操作相关
        ipcMain.handle('database:test-connection', async (_: any, config: ConnectionConfig) => {
            return await this.handleDatabaseConnection(_, config);
        });

        ipcMain.handle('database:get-databases', async (_: any, config: ConnectionConfig) => {
            return await this.handleGetDatabaseList(_, config);
        });

        ipcMain.handle('database:get-tables', async (_: any, config: ConnectionConfig) => {
            return await this.handleGetTableList(_, config);
        });

        // 连接配置相关
        ipcMain.handle('database:save-connections', async (_: any, connections: Array<ConnectionConfig>) => {
            return await this.saveConnectionList(connections);
        });

        ipcMain.handle('database:get-all-connections', async () => {
            return await this.getConnectionList();
        });

        ipcMain.handle('database:delete-connection', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            // 实现删除连接逻辑
            console.log('Delete connection:', connectionId);
            return ServiceResultFactory.success<void>();
        });

        // 查询执行相关
        ipcMain.handle('database:execute-query', async (_: any, config: ConnectionConfig, sql: string, params?: any[]): Promise<ServiceResult<any>> => {
            try {
                const client = createDatabaseClient(config);
                await client.connect();
                const result = await client.execute(sql, params);
                await client.disconnect();
                return ServiceResultFactory.success(result);
            } catch (error) {
                return ServiceResultFactory.error((error as Error).message);
            }
        });

        // 连接状态相关
        ipcMain.handle('database:get-connection-status', async (_: any, connectionId: string): Promise<ServiceResult<any>> => {
            // 实现获取连接状态逻辑
            try {
                console.log('Get connection status:', connectionId);
                return ServiceResultFactory.success({ status: 'connected', id: connectionId });
            } catch (error) {
                return ServiceResultFactory.error((error as Error).message);
            }
        });

        ipcMain.handle('database:refresh-connection', async (_: any, connectionId: string): Promise<ServiceResult<boolean>> => {
            // 实现刷新连接逻辑
            try {
                console.log('Refresh connection:', connectionId);
                return ServiceResultFactory.success(true);
            } catch (error) {
                return ServiceResultFactory.error((error as Error).message);
            }
        });

        ipcMain.handle('database:disconnect', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            // 实现断开连接逻辑
            try {
                console.log('Disconnect:', connectionId);
                return ServiceResultFactory.success<void>();
            } catch (error) {
                console.error('Failed to disconnect:', error);
                return ServiceResultFactory.error((error as Error).message);
            }
        });
    }

    /**
     * 关闭数据库连接
     */
    public async close(): Promise<void> {
        if (this.database) {
            await this.database.disconnect();
            console.log('SQLite database closed successfully');
        }
    }

    /**
     * 获取内部的数据库客户端实例
     * @returns 数据库客户端实例
     */
    public getDatabaseClient(): DatabaseClient {
        return this.database;
    }
}