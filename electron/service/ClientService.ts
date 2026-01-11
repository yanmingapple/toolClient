const { ipcMain } = require('electron');
// import * as path from 'path';
import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionConfig } from '../model/database';
import { SQLStatements } from '../dataService/sql';
import { DatabaseManager } from '../manager/ClientManager';
import { TreeNode, TreeNodeFactory } from '../model/database/TreeNode';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';
import { ServiceMonitor } from '../model/database/ServiceMonitor';

/**
 * 统一数据库服务
 * 专门处理连接配置的持久化存储、数据库连接测试、数据库列表获取、表列表获取等操作
 */
export class ClientService {
    private databaseClient: DatabaseClient;

    private constructor(database: DatabaseClient) {
        this.databaseClient = database;
    }

    /**
     * 创建DatabaseService实例的静态工厂方法
     * @param database 数据库客户端
     * @returns DatabaseService实例
     */
    public static create(database: DatabaseClient): ClientService {
        return new ClientService(database);
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
        try {
            const connections = await this.databaseClient.execute(SQLStatements.SELECT_ALL_CONNECTIONS);

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
    public static async handleGetDatabaseList(config: any): Promise<ServiceResult<any[]>> {
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
     * @param _event IPC 事件对象
     * @param config 数据库配置
     * @returns 表列表结果
     */
    public static async handleGetTableList(config: any) {
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
     * 保存连接列表
     * @param connections 连接列表
     */
    public static async handleSaveConnectionList(connections: ConnectionConfig[]): Promise<ServiceResult<void>> {
        try {
            // 由于没有批量插入的SQL语句，我们需要逐个插入
            for (const connection of connections) {
                // 获取DatabaseManager实例
                const dbManager = require('../manager/ClientManager').clientManager;
                await dbManager.initialize();
                const databaseService = dbManager['databaseService'];
                const databaseClient = databaseService['databaseClient'];

                // 使用正确的ConnectionConfig属性名
                await databaseClient.execute(
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
        try {
            await this.databaseClient.execute(SQLStatements.DELETE_CONNECTION_BY_ID, [connectionId]);
            //删除ClientMananger中的连接
            const dbManager = require('../manager/ClientManager').clientManager;
            dbManager.removeConnection(connectionId);
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
            const dbManager = require('../manager/ClientManager').clientManager;
            dbManager.removeConnection(connectionId);
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
        try {
            const monitors = await this.databaseClient.execute(SQLStatements.SELECT_ALL_SERVICE_MONITORS);
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
        try {
            // 根据id判断是插入还是更新
            for (const monitor of monitors) {
                if (monitor.id === 0 || monitor.id === undefined) {
                    // 插入新记录
                    await this.databaseClient.execute(SQLStatements.INSERT_SERVICE_MONITOR, [
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
                    await this.databaseClient.execute(SQLStatements.UPDATE_SERVICE_MONITOR, [
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
     * @param id 服务监控ID
     */
    public async handleDeleteServiceMonitors(ids: number[]): Promise<ServiceResult<void>> {
        try {
            // 由于没有批量删除的SQL语句，我们需要逐个删除
            for (const id of ids) {
                await this.databaseClient.execute(SQLStatements.DELETE_SERVICE_MONITOR_BY_ID, [id]);
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
        try {
            await this.databaseClient.execute(SQLStatements.DELETE_ALL_SERVICE_MONITORS);
            return ServiceResultFactory.success<void>();
        } catch (error) {
            console.error('Failed to delete service monitors:', error);
            return ServiceResultFactory.error((error as Error).message);
        }
    }

    /**
     * 注册数据库服务相关的 IPC 处理程序
     */
    public static registerIpcHandlers() {
        // 数据库操作相关
        ipcMain.handle('database:test-connection', async (_: any, config: ConnectionConfig) => {
            return await this.handleTestConnection(_, config);
        });

        // 获取所有连接配置
        ipcMain.handle('database:get-all-connections', async () => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleGetAllConnections();
        });

        ipcMain.handle('database:get-databases', async (_: any, config: ConnectionConfig) => {
            return await this.handleGetDatabaseList(config);
        });

        ipcMain.handle('database:get-tables', async (_: any, config: ConnectionConfig) => {
            return await this.handleGetTableList(config);
        });

        // 连接配置相关
        ipcMain.handle('database:save-connections', async (_: any, connections: Array<ConnectionConfig>) => {
            return await this.handleSaveConnectionList(connections);
        });

        // 删除连接逻辑
        ipcMain.handle('database:delete-connection', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleDeleteConnection(connectionId);
        });

        // 断开连接逻辑
        ipcMain.handle('database:disconnect', async (_: any, connectionId: string): Promise<ServiceResult<void>> => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleDisconnect(connectionId);
        });

        // 服务监控相关
        ipcMain.handle('service-monitor:get-all', async () => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleGetAllServiceMonitors();
        });

        ipcMain.handle('service-monitor:save', async (_: any, monitors: ServiceMonitor[]) => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleSaveServiceMonitors(monitors);
        });

        ipcMain.handle('service-monitor:delete-service-monitors', async (_: any, ids: number[]) => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleDeleteServiceMonitors(ids);
        });

        ipcMain.handle('service-monitor:delete-all', async () => {
            const clientManager = require('../manager/ClientManager').clientManager;
            await clientManager.initialize();
            const databaseService = clientManager['databaseService'];
            return await databaseService.handleDeleteAllServiceMonitors();
        });
    }

    /**
     * 关闭数据库连接
     */
    public async close(): Promise<void> {
        if (this.databaseClient) {
            await this.databaseClient.disconnect();
            console.log('SQLite database closed successfully');
        }
    }

    /**
     * 获取内部的数据库客户端实例
     * @returns 数据库客户端实例
     */
    public getDatabaseClient(): DatabaseClient {
        return this.databaseClient;
    }
}