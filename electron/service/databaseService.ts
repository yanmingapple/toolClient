const { ipcMain } = require('electron');
import * as path from 'path';
import { DatabaseClient, createDatabaseClient } from '../dataService/database';
import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { ConnectionType } from '../model/database';
import { SQLStatements } from '../dataService/sql';
import { databaseManager } from '../manager/databaseMananger';

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
     * @returns Promise<DatabaseService> 数据库服务实例
     */
    public static async initializeSQLiteDatabase(): Promise<DatabaseService> {
        const { app } = require('electron');
        const dbPath = path.join(app.getPath('userData'), 'dbmanager.db');

        // 创建SQLite连接配置
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

        // 创建数据库连接
        const client = createDatabaseClient(sqliteConfig);
        await client.connect();

        try {
            console.log('Connected to SQLite database at:', dbPath);

            // 创建连接配置表
            await client.executeBatch(SQLStatements.CREATE_CONNECTIONS_TABLE);
            console.log('Connections table initialized successfully');

            // 创建数据库服务实例
            const service = new DatabaseService(client);
            return service;
        } catch (error) {
            console.error('Failed to create connections table:', error);
            throw error;
        }
    }

    /**
     * 获取所有连接配置
     * @returns 连接配置数组
     */
    public async getAllConnections(): Promise<Array<any>> {
        return await this.database.execute(SQLStatements.SELECT_ALL_CONNECTIONS);
    }

    /**
     * 保存连接配置列表
     * @param connections 连接配置数组
     * @returns 操作结果
     */
    public async saveConnections(connections: Array<any>): Promise<void> {
        // 清空现有连接表
        await this.database.execute(SQLStatements.DELETE_ALL_CONNECTIONS);

        // 插入所有连接
        for (const conn of connections) {
            await this.database.execute(
                SQLStatements.INSERT_OR_REPLACE_CONNECTION,
                [
                    conn.id,
                    conn.name,
                    conn.type,
                    conn.host,
                    conn.port,
                    conn.username,
                    conn.password,
                    conn.database,
                    conn.sshHost,
                    conn.sshPort,
                    conn.sshUsername,
                    conn.sshPassword,
                    conn.sshPassphrase,
                    conn.sshKeyPath
                ]
            );
        }
    }

    /**
     * 添加单个连接配置
     * @param connection 连接配置
     */
    public async addConnection(connection: any): Promise<void> {
        await this.database.execute(
            SQLStatements.INSERT_OR_REPLACE_CONNECTION,
            [
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
            ]
        );
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
    public static async testConnection(config: any): Promise<{ success: boolean; message: string }> {
        try {
            switch (config.type) {
                case 'mysql':
                    const mysql2 = await import('mysql2/promise');
                    const mysqlConn = await mysql2.createConnection({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        database: config.database,
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    await mysqlConn.end();
                    break;

                case 'postgresql':
                    const pg = await import('pg');
                    const pgClient = new pg.Client({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        database: config.database,
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    await pgClient.connect();
                    await pgClient.end();
                    break;

                case 'mongodb':
                    const mongodb = await import('mongodb');
                    const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`;
                    const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
                        authSource: 'admin'
                    });
                    await mongoClient.connect();
                    await mongoClient.close();
                    break;

                case 'redis':
                    const RedisModule = await import('ioredis');
                    const Redis = RedisModule.default;
                    const redis = new Redis({
                        host: config.host,
                        port: config.port,
                        password: config.password,
                    });
                    await redis.ping();
                    await redis.quit();
                    break;

                case 'sqlserver':
                    const tedious = await import('tedious');
                    const sqlConfig = {
                        server: config.host,
                        port: config.port,
                        authentication: {
                            type: 'default',
                            options: {
                                userName: config.username,
                                password: config.password,
                            },
                        },
                        options: {
                            database: config.database,
                            encrypt: config.ssl,
                        },
                    };
                    await new Promise((resolve, reject) => {
                        const connection = new tedious.Connection(sqlConfig);
                        connection.on('connect', (error) => {
                            if (error) reject(error);
                            else resolve(true);
                        });
                        connection.on('error', reject);
                    });
                    break;

                case 'sqlite':
                    const sqlite3 = await import('sqlite3');
                    await new Promise((resolve, reject) => {
                        const dbPath = config.database || ':memory:';
                        const db = new sqlite3.Database(dbPath, (err) => {
                            if (err) reject(err);
                            else resolve(true);
                        });
                        db.close();
                    });
                    break;
            }
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            console.error('Connection error:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 获取数据库列表
     * @param config 数据库配置
     * @returns 数据库列表结果
     */
    public static async getDatabaseList(config: any): Promise<{ success: boolean; data?: any[]; message?: string }> {
        try {
            switch (config.type) {
                case 'mysql':
                    const mysql2 = await import('mysql2/promise');
                    const mysqlConn = await mysql2.createConnection({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    const [databases] = await mysqlConn.query('SHOW DATABASES') as [Array<{ Database: string }>, any];
                    await mysqlConn.end();
                    return {
                        success: true,
                        data: databases.map((db, index) => ({
                            id: `db_${config.id}_${index}`,
                            name: db.Database,
                            type: 'database',
                            parentId: config.id,
                            metadata: {}
                        }))
                    };

                case 'postgresql':
                    const pg = await import('pg');
                    const pgClient = new pg.Client({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        database: 'postgres',
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    await pgClient.connect();
                    const result = await pgClient.query(SQLStatements.SELECT_POSTGRESQL_DATABASES);
                    await pgClient.end();
                    return {
                        success: true,
                        data: result.rows.map((row, index) => ({
                            id: `db_${config.id}_${index}`,
                            name: row.datname,
                            type: 'database',
                            parentId: config.id,
                            metadata: {}
                        }))
                    };

                case 'mongodb':
                    const mongodb = await import('mongodb');
                    const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`;
                    const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
                        authSource: 'admin'
                    });
                    await mongoClient.connect();
                    const dbs = await mongoClient.db().admin().listDatabases();
                    await mongoClient.close();
                    return {
                        success: true,
                        data: dbs.databases.map((db, index) => ({
                            id: `db_${config.id}_${index}`,
                            name: db.name,
                            type: 'database',
                            parentId: config.id,
                            metadata: { sizeOnDisk: db.sizeOnDisk, empty: db.empty }
                        }))
                    };

                case 'sqlite':
                    const dbName = config.database ? path.basename(config.database) : 'memory';
                    return {
                        success: true,
                        data: [{
                            id: `db_${config.id}_0`,
                            name: dbName,
                            type: 'database',
                            parentId: config.id,
                            metadata: {
                                path: config.database || ':memory:'
                            }
                        }]
                    };

                default:
                    return {
                        success: true,
                        data: []
                    };
            }
        } catch (error) {
            console.error('Get databases error:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 获取表列表
     * @param config 数据库配置
     * @returns 表列表结果
     */
    public static async getTableList(config: any): Promise<{ success: boolean; data?: any[]; message?: string }> {
        try {
            switch (config.type) {
                case 'mysql':
                    const mysql2 = await import('mysql2/promise');
                    const mysqlConn = await mysql2.createConnection({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        database: config.databaseName,
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    const [tables] = await mysqlConn.query('SHOW TABLE STATUS') as [any[], any];
                    await mysqlConn.end();
                    return {
                        success: true,
                        data: tables.map((table: any, index: number) => ({
                            id: `table_${config.databaseId}_${index}`,
                            name: table.Name,
                            type: 'table',
                            parentId: config.databaseId,
                            metadata: {
                                rows: table.Rows,
                                dataLength: table.Data_length,
                                engine: table.Engine,
                                updateTime: table.Update_time,
                                comment: table.Comment
                            }
                        }))
                    };

                case 'postgresql':
                    const pg = await import('pg');
                    const pgClient = new pg.Client({
                        host: config.host,
                        port: config.port,
                        user: config.username,
                        password: config.password,
                        database: config.databaseName,
                        ssl: config.ssl ? { rejectUnauthorized: true } : undefined
                    });
                    await pgClient.connect();
                    const result = await pgClient.query(
                        `SELECT 
                            t.table_name,
                            c.reltuples AS rows,
                            pg_total_relation_size(t.table_name::regclass) AS data_length,
                            t.table_type,
                            t.last_ddl_time AS update_time,
                            d.description AS comment
                        FROM 
                            information_schema.tables t
                        LEFT JOIN 
                            pg_class c ON c.relname = t.table_name
                        LEFT JOIN 
                            pg_description d ON d.objoid = c.oid AND d.objsubid = 0
                        WHERE 
                            t.table_schema = 'public'
                        ORDER BY 
                            t.table_name`
                    );
                    await pgClient.end();
                    return {
                        success: true,
                        data: result.rows.map((row, index) => ({
                            id: `table_${config.databaseId}_${index}`,
                            name: row.table_name,
                            type: 'table',
                            parentId: config.databaseId,
                            metadata: {
                                rows: Math.round(row.rows || 0),
                                dataLength: row.data_length || 0,
                                engine: row.table_type,
                                updateTime: row.update_time,
                                comment: row.comment || ''
                            }
                        }))
                    };

                case 'mongodb':
                    const mongodb = await import('mongodb');
                    const mongoConnectionString = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}`;
                    const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
                        authSource: 'admin'
                    });
                    await mongoClient.connect();
                    const db = mongoClient.db(config.databaseName);
                    const collections = await db.listCollections().toArray();

                    const tableData = [];
                    for (const collection of collections) {
                        const stats = await db.command({ collStats: collection.name });
                        const options = await db.collection(collection.name).options();

                        tableData.push({
                            id: `table_${config.databaseId}_${tableData.length}`,
                            name: collection.name,
                            type: 'table',
                            parentId: config.databaseId,
                            metadata: {
                                rows: stats.count || 0,
                                dataLength: stats.size || 0,
                                engine: 'mongodb',
                                updateTime: options.creationDate || '--',
                                comment: options.comment || ''
                            }
                        });
                    }

                    await mongoClient.close();
                    return {
                        success: true,
                        data: tableData
                    };

                case 'sqlite':
                    const sqlite3 = await import('sqlite3');

                    return new Promise((resolve, reject) => {
                        const dbPath = config.databaseName || ':memory:';
                        const db = new sqlite3.Database(dbPath);

                        db.all(SQLStatements.SELECT_SQLITE_TABLES, [], async (err, tables) => {
                            if (err) {
                                db.close();
                                reject({ success: false, message: err.message });
                                return;
                            }

                            const tableData = [];

                            for (const table of tables as Array<{ name: string }>) {
                                try {
                                    const rowCountResult = await new Promise<any[]>((resolveCount, rejectCount) => {
                                        db.all(SQLStatements.SELECT_SQLITE_TABLE_COUNT(table.name), [], (countErr, countRows) => {
                                            if (countErr) rejectCount(countErr);
                                            else resolveCount(countRows);
                                        });
                                    });

                                    const rowCount = rowCountResult[0]?.count || 0;

                                    tableData.push({
                                        id: `table_${config.databaseId}_${tableData.length}`,
                                        name: table.name,
                                        type: 'table',
                                        parentId: config.databaseId,
                                        metadata: {
                                            rows: rowCount,
                                            dataLength: 0,
                                            engine: 'sqlite',
                                            updateTime: null,
                                            comment: ''
                                        }
                                    });
                                } catch (tableErr) {
                                    console.error(`Error getting metadata for table ${table.name}:`, tableErr);

                                    tableData.push({
                                        id: `table_${config.databaseId}_${tableData.length}`,
                                        name: table.name,
                                        type: 'table',
                                        parentId: config.databaseId,
                                        metadata: {
                                            rows: 0,
                                            dataLength: 0,
                                            engine: 'sqlite',
                                            updateTime: null,
                                            comment: ''
                                        }
                                    });
                                }
                            }

                            db.close();
                            resolve({ success: true, data: tableData });
                        });
                    });

                default:
                    return {
                        success: true,
                        data: []
                    };
            }
        } catch (error) {
            console.error('Get tables error:', error);
            return { success: false, message: (error as Error).message };
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
    public static async getConnectionList() {
        try {
            const connections = await databaseManager.getAllConnections();
            return { success: true, data: connections };
        } catch (error) {
            console.error('Failed to get connections:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 保存连接列表
     * @param connections 连接列表
     */
    public static async saveConnectionList(connections: any[]) {
        try {
            await databaseManager.saveConnections(connections);
            return { success: true };
        } catch (error) {
            console.error('Failed to save connections:', error);
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * 注册数据库服务相关的 IPC 处理程序
     */
    public static registerIpcHandlers() {
        // 数据库操作相关
        ipcMain.handle('test-database-connection', this.handleDatabaseConnection);
        ipcMain.handle('get-database-list', this.handleGetDatabaseList);
        ipcMain.handle('get-table-list', this.handleGetTableList);

        // 连接列表相关
        ipcMain.handle('get-connection-list', async () => {
            return await this.getConnectionList();
        });

        ipcMain.handle('save-connection-list', async (_: any, connections: any[]) => {
            return await this.saveConnectionList(connections);
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