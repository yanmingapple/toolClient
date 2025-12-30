import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import Redis from 'ioredis';

/**
 * Redis客户端实现
 */
export class RedisClient implements DatabaseClient {
    private config: ConnectionConfig;
    private redis: Redis | null = null;

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到Redis数据库
     */
    async connect(): Promise<void> {
        try {
            this.redis = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password,
                db: this.config.database ? parseInt(this.config.database) : 0,
            });
        } catch (error) {
            throw new Error(`Redis connection failed: ${error}`);
        }
    }

    /**
     * 断开Redis数据库连接
     */
    async disconnect(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
            this.redis = null;
        }
    }

    /**
     * 执行Redis命令（模拟SQL查询）
     * @param sql SQL查询语句（将被转换为Redis命令）
     * @param params 查询参数
     */
    async execute(sql: string, _params?: any[]): Promise<any> {
        if (!this.redis) {
            throw new Error('Not connected to Redis database');
        }

        try {
            const trimmedSql = sql.trim().toLowerCase();

            // 解析简单的SQL命令并转换为Redis命令
            if (trimmedSql.startsWith('get ')) {
                const key = trimmedSql.substring(4).trim();
                return await this.redis.get(key);
            }

            if (trimmedSql.startsWith('set ')) {
                const parts = trimmedSql.substring(4).trim().split(' ');
                if (parts.length >= 2) {
                    const key = parts[0];
                    const value = parts.slice(1).join(' ');
                    return await this.redis.set(key, value);
                }
            }

            if (trimmedSql.startsWith('keys ')) {
                const pattern = trimmedSql.substring(5).trim();
                return await this.redis.keys(pattern);
            }

            if (trimmedSql.startsWith('info')) {
                return await this.redis.info();
            }

            // 默认返回OK
            return 'OK';
        } catch (error) {
            throw new Error(`Redis command execution failed: ${error}`);
        }
    }

    /**
     * 执行多个Redis命令
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        return this.execute(sql);
    }

    /**
     * 获取Redis数据库版本信息
     */
    async getVersion(): Promise<string> {
        if (!this.redis) {
            throw new Error('Not connected to Redis database');
        }

        try {
            const info = await this.redis.info('server');
            const versionMatch = info.match(/redis_version:([^\r\n]+)/);
            return versionMatch ? versionMatch[1] : 'Unknown';
        } catch (error) {
            throw new Error(`Failed to get Redis version: ${error}`);
        }
    }

    /**
     * 测试Redis连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.redis) {
                return false;
            }

            const result = await this.redis.ping();
            return result === 'PONG';
        } catch (error) {
            return false;
        }
    }
}