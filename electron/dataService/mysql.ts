import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import * as mysql from 'mysql2/promise';

/**
 * MySQL客户端实现
 */
export class MySQLClient implements DatabaseClient {
    private config: ConnectionConfig;
    private connection: mysql.Connection | null = null;

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
            this.connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database,
            });
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
    }

    /**
     * 执行SQL查询
     * @param sql SQL查询语句
     * @param params 查询参数
     */
    async execute(sql: string, params?: any[]): Promise<any> {
        if (!this.connection) {
            throw new Error('Not connected to MySQL database');
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
        if (!this.connection) {
            throw new Error('Not connected to MySQL database');
        }

        try {
            const [rows] = await this.connection.execute('SELECT VERSION() as version');
            return (rows as any)[0].version;
        } catch (error) {
            throw new Error(`Failed to get MySQL version: ${error}`);
        }
    }

    /**
     * 测试MySQL连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.connection) {
                return false;
            }

            await this.connection.execute('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }
}