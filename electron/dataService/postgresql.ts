import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import { Pool } from 'pg';

/**
 * PostgreSQL客户端实现
 */
export class PostgreSQLClient implements DatabaseClient {
    private config: ConnectionConfig;
    private pool: Pool | null = null;

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
}