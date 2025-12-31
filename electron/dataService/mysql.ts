import { ConnectionConfig, TreeNodeFactory, TreeNode } from '../model/database';
import { DatabaseClient } from './database';
import * as mysql from 'mysql2/promise';

/**
 * MySQL管理连接池，用于获取数据库列表等系统级操作
 */
class MySQLManagementPool {
    private static instance: MySQLManagementPool;
    private pool: mysql.Pool | null = null;
    private connectionConfig: ConnectionConfig | null = null;
    private lastRefreshTime: number = 0;
    private cacheTimeout: number = 5 * 60 * 1000; // 缓存5分钟
    private databaseCache: any[] | null = null;

    private constructor() { }

    static getInstance(): MySQLManagementPool {
        if (!MySQLManagementPool.instance) {
            MySQLManagementPool.instance = new MySQLManagementPool();
        }
        return MySQLManagementPool.instance;
    }

    async initialize(config: ConnectionConfig): Promise<void> {
        // 检查配置是否变化
        const configChanged = !this._isConfigEqual(this.connectionConfig, config);

        // 如果配置变化或连接池不存在，则重建连接池
        if (configChanged || !this.pool) {
            // 先关闭旧的连接池
            if (this.pool) {
                await this.close();
            }

            // 更新配置
            this.connectionConfig = config;

            // 创建新的连接池
            const poolConfig: mysql.ConnectionOptions = {
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                database: config.database,
                ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
                charset: config.charset,
                connectionLimit: config.maxConnections || 10
            };

            this.pool = mysql.createPool(poolConfig);

            // 清理缓存，因为配置可能已变化
            await this.clearCache();
        }
    }

    /**
     * 比较两个配置是否相等
     */
    private _isConfigEqual(config1: ConnectionConfig | null, config2: ConnectionConfig | null): boolean {
        if (!config1 || !config2) return false;

        return config1.host === config2.host &&
            config1.port === config2.port &&
            config1.username === config2.username &&
            config1.password === config2.password &&
            config1.database === config2.database &&
            config1.ssl === config2.ssl &&
            config1.charset === config2.charset &&
            config1.maxConnections === config2.maxConnections;
    }

    async getDatabaseList(): Promise<TreeNode[]> {
        // 检查缓存是否有效
        const now = Date.now();
        if (this.databaseCache && (now - this.lastRefreshTime) < this.cacheTimeout) {
            return this.databaseCache;
        }

        if (!this.pool || !this.connectionConfig) {
            throw new Error('MySQL management pool not initialized');
        }

        try {
            const connection = await this.pool.getConnection();
            try {
                const [rows] = await connection.query('SHOW DATABASES') as [Array<{ Database: string }>, any];

                // 更新缓存
                this.databaseCache = rows.map((db, index) =>
                    TreeNodeFactory.createDatabase(
                        `db_${this.connectionConfig!.host}_${index}`,
                        db.Database,
                        this.connectionConfig!.host,
                        {
                            databaseType: 'mysql'
                        }
                    )
                );

                this.lastRefreshTime = now;
                return this.databaseCache;
            } finally {
                connection.release();
            }
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    async clearCache(): Promise<void> {
        this.databaseCache = null;
        this.lastRefreshTime = 0;
    }

    async close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

/**
 * MySQL客户端实现
 */
export class MySQLClient implements DatabaseClient {
    private config: ConnectionConfig;
    private connection: mysql.Connection | null = null;
    private managementPool: MySQLManagementPool = MySQLManagementPool.getInstance();

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到MySQL数据库
     */
    async connect(): Promise<void> {
        try {
            // 先关闭旧的主连接（如果存在）
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
            }

            // 初始化管理连接池（连接到mysql系统数据库）
            await this.managementPool.initialize({
                ...this.config,
                database: '',
            });

            // 只有当database不为空时才创建主连接
            if (this.config.database) {
                const connectionConfig: mysql.ConnectionOptions = {
                    host: this.config.host,
                    port: this.config.port,
                    user: this.config.username,
                    password: this.config.password,
                    database: this.config.database,
                };

                this.connection = await mysql.createConnection(connectionConfig);
            }
        } catch (error) {
            throw new Error(`MySQL connection failed: ${error}`);
        }
    }

    /**
     * 断开MySQL数据库连接
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }

        // 清理缓存，以便连接配置变化时重新获取
        await this.managementPool.clearCache();
    }

    /**
     * 执行SQL查询
     * @param sql SQL查询语句
     * @param params 查询参数
     */
    async execute(sql: string, params?: any[]): Promise<any> {
        if (!this.connection) {
            throw new Error('Not connected to MySQL database. Please specify a database in connection config.');
        }

        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (error) {
            throw new Error(`MySQL query execution failed: ${error}`);
        }
    }

    /**
     * 执行多个SQL语句
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        if (!this.connection) {
            throw new Error('Not connected to MySQL database');
        }

        try {
            const [results] = await this.connection.query(sql);
            return results;
        } catch (error) {
            throw new Error(`MySQL batch execution failed: ${error}`);
        }
    }

    /**
     * 获取MySQL数据库版本信息
     */
    async getVersion(): Promise<string> {
        try {
            // 通过管理连接池获取版本信息
            const pool = await this._getManagementPool();
            const connection = await pool.getConnection();
            try {
                const [rows] = await connection.execute('SELECT VERSION() as version');
                return (rows as any)[0].version;
            } finally {
                connection.release();
            }
        } catch (error) {
            throw new Error(`Failed to get MySQL version: ${error}`);
        }
    }

    /**
     * 获取管理连接池
     */
    private async _getManagementPool(): Promise<mysql.Pool> {
        const pool = (this.managementPool as any)['pool'];
        if (!pool) {
            throw new Error('Management pool not initialized');
        }
        return pool;
    }

    /**
     * 测试MySQL连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            // 优先测试主连接
            if (this.connection) {
                await this.connection.execute('SELECT 1');
                return true;
            } else {
                // 如果没有主连接，测试管理连接池
                const pool = await this._getManagementPool();
                const connection = await pool.getConnection();
                try {
                    await connection.execute('SELECT 1');
                    return true;
                } finally {
                    connection.release();
                }
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取MySQL数据库列表
     */
    async getDatabaseList(): Promise<TreeNode[]> {
        try {
            // 使用管理连接池获取数据库列表（带缓存）
            const databaseList = await this.managementPool.getDatabaseList();

            // 更新ID和父ID以匹配当前连接配置
            return databaseList.map((db, index) => ({
                ...db,
                id: `db_${this.config.id}_${index}`,
                parentId: this.config.id,
                // 确保 metadata 保持不变
                metadata: db.metadata
            }));
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取MySQL表列表
     * @param database 数据库名称（当连接时未指定数据库时必须提供）
     */
    async getTableList(): Promise<TreeNode[]> {
        if (!this.connection) {
            throw new Error('Not connected to MySQL database');
        }

        // 如果连接时没有指定数据库，需要提供database参数
        if (!this.config.database) {
            throw new Error('Database name is required when not specified in connection config');
        }

        const targetDatabase = this.config.database;

        try {
            const [tables] = await this.connection.query(`SHOW TABLE STATUS FROM \`${targetDatabase}\``) as [any[], any];
            return tables.map((table: any, index: number) =>
                TreeNodeFactory.createTable(
                    `table_${this.config.id}_${index}`,
                    table.Name,
                    this.config.id,
                    {
                        recordCount: table.Rows,
                        size: table.Data_length,
                        engine: table.Engine,
                        info: {
                            updateTime: table.Update_time,
                            comment: table.Comment,
                            database: targetDatabase
                        }
                    }
                )
            );
        } catch (error) {
            throw new Error(`Failed to get table list: ${error}`);
        }
    }
}