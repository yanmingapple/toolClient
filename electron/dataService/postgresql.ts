import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
<<<<<<< HEAD
import { TreeNodeFactory, TreeNode } from '../model/database';
=======
>>>>>>> 791f739b6f8bc2f0cc0347c51f03791688868a31
import { Pool } from 'pg';
import { SQLStatements } from './sql';

/**
 * PostgreSQL管理连接池，用于获取数据库列表等系统级操作
 */
class PostgreSQLManagementPool {
    private static instance: PostgreSQLManagementPool;
    private pool: Pool | null = null;
    private connectionConfig: any = null;
    private lastRefreshTime: number = 0;
    private cacheTimeout: number = 5 * 60 * 1000; // 缓存5分钟
    private databaseCache: any[] | null = null;

    private constructor() { }

    static getInstance(): PostgreSQLManagementPool {
        if (!PostgreSQLManagementPool.instance) {
            PostgreSQLManagementPool.instance = new PostgreSQLManagementPool();
        }
        return PostgreSQLManagementPool.instance;
    }

    async initialize(config: any): Promise<void> {
        this.connectionConfig = config;
        if (!this.pool) {
            this.pool = new Pool({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                database: 'postgres', // PostgreSQL系统数据库
            });
        }
    }

    async getDatabaseList(): Promise<TreeNode[]> {
        // 检查缓存是否有效
        const now = Date.now();
        if (this.databaseCache && (now - this.lastRefreshTime) < this.cacheTimeout) {
            return this.databaseCache;
        }

        if (!this.pool || !this.connectionConfig) {
            throw new Error('PostgreSQL management pool not initialized');
        }

        try {
            const client = await this.pool.connect();
            try {
                const result = await client.query(SQLStatements.SELECT_POSTGRESQL_DATABASES);

                // 更新缓存
                this.databaseCache = result.rows.map((db, index) =>
                    TreeNodeFactory.createDatabase(
                        `db_${this.connectionConfig!.host}_${index}`,
                        db.datname,
                        this.connectionConfig!.host,
                        {
                            databaseType: 'postgresql'
                        }
                    )
                );

                this.lastRefreshTime = now;
                return this.databaseCache;
            } finally {
                client.release();
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
 * PostgreSQL客户端实现
 */
export class PostgreSQLClient implements DatabaseClient {
    private config: ConnectionConfig;
    private pool: Pool | null = null;
    private managementPool: PostgreSQLManagementPool = PostgreSQLManagementPool.getInstance();

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到PostgreSQL数据库
     */
    async connect(): Promise<void> {
        try {
            this.pool = new Pool({
                host: this.config.host,
                port: this.config.port,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database,
            });

            // 初始化管理连接池
            await this.managementPool.initialize({
                host: this.config.host,
                port: this.config.port,
                user: this.config.username,
                password: this.config.password,
            });
        } catch (error) {
            throw new Error(`PostgreSQL connection failed: ${error}`);
        }
    }

    /**
     * 断开PostgreSQL数据库连接
     */
    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
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
        if (!this.pool) {
            throw new Error('Not connected to PostgreSQL database');
        }

        try {
            const client = await this.pool.connect();
            const result = await client.query(sql, params);
            client.release();
            return result.rows;
        } catch (error) {
            throw new Error(`PostgreSQL query execution failed: ${error}`);
        }
    }

    /**
     * 执行多个SQL语句
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        if (!this.pool) {
            throw new Error('Not connected to PostgreSQL database');
        }

        try {
            const client = await this.pool.connect();
            const result = await client.query(sql);
            client.release();
            return result.rows;
        } catch (error) {
            throw new Error(`PostgreSQL batch execution failed: ${error}`);
        }
    }

    /**
     * 获取PostgreSQL数据库版本信息
     */
    async getVersion(): Promise<string> {
        if (!this.pool) {
            throw new Error('Not connected to PostgreSQL database');
        }

        try {
            const client = await this.pool.connect();
            const result = await client.query('SELECT version() as version');
            client.release();
            return result.rows[0].version;
        } catch (error) {
            throw new Error(`Failed to get PostgreSQL version: ${error}`);
        }
    }

    /**
     * 测试PostgreSQL连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.pool) {
                return false;
            }

            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取PostgreSQL数据库列表
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
     * 获取PostgreSQL表列表
     * @param _database 数据库名称（对于PostgreSQL通常不需要，因为连接时已指定）
     */
<<<<<<< HEAD
    async getTableList(databaseName?: string): Promise<TreeNode[]> {
=======
    async getTableList(): Promise<any[]> {
>>>>>>> 791f739b6f8bc2f0cc0347c51f03791688868a31
        if (!this.pool) {
            throw new Error('Not connected to PostgreSQL database');
        }

        try {
            const client = await this.pool.connect();
            const result = await client.query(`
                SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
                FROM pg_tables 
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
            `);
            client.release();
            return result.rows.map((table, index) =>
                TreeNodeFactory.createTable(
                    `table_${this.config.id}_${index}`,
                    table.tablename,
                    this.config.id,
                    {
                        info: {
                            schema: table.schemaname,
                            owner: table.tableowner,
                            hasIndexes: table.hasindexes,
                            hasRules: table.hasrules,
                            hasTriggers: table.hastriggers
                        }
                    }
                )
            );
        } catch (error) {
            throw new Error(`Failed to get table list: ${error}`);
        }
    }
}