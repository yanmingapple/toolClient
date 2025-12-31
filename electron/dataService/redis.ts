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

    /**
     * 获取Redis数据库列表
     * Redis中的数据库通过 db 编号区分
     */
    async getDatabaseList(): Promise<any[]> {
        if (!this.redis) {
            throw new Error('Not connected to Redis database');
        }

        try {
            // Redis 默认有 16 个数据库（0-15）
            const databases = [];
            const maxDatabases = 16;
            const currentDb = await this.redis.get('db') || '0';

            for (let i = 0; i < maxDatabases; i++) {
                try {
                    await this.redis.select(i);
                    const keyCount = await this.redis.dbsize();
                    databases.push({
                        id: `db_${this.config.id}_${i}`,
                        name: `Database ${i}`,
                        type: 'database',
                        parentId: this.config.id,
                        metadata: {
                            dbNumber: i,
                            keyCount: keyCount,
                            isCurrent: i.toString() === currentDb
                        }
                    });
                } catch (err) {
                    // 如果某个数据库不可访问，跳过
                    continue;
                }
            }

            // 恢复到原来的数据库
            await this.redis.select(parseInt(currentDb));

            return databases;
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取Redis键列表（相当于表）
     * @param database 数据库名称（Redis需要指定数据库编号）
     */
    async getTableList(): Promise<any[]> {
        if (!this.redis) {
            throw new Error('Not connected to Redis database');
        }

        try {
            // 如果指定了数据库编号，先切换到该数据库
            let currentDb = await this.redis.get('db') || '0';
            if (this.config.database) {
                const dbMatch = this.config.database.match(/Database (\d+)/);
                if (dbMatch) {
                    await this.redis.select(parseInt(dbMatch[1]));
                }
            }

            try {
                // 获取所有键
                const keys = await this.redis.keys('*');

                // 按键类型分组
                const groupedKeys = new Map<string, { count: number; keys: string[] }>();

                for (const key of keys.slice(0, 100)) { // 限制数量以避免性能问题
                    const keyType = await this.redis.type(key);
                    const typeName = keyType || 'string';

                    if (!groupedKeys.has(typeName)) {
                        groupedKeys.set(typeName, { count: 0, keys: [] });
                    }

                    const group = groupedKeys.get(typeName)!;
                    group.count++;
                    if (group.keys.length < 5) { // 只保存前5个键作为示例
                        group.keys.push(key);
                    }
                }

                return Array.from(groupedKeys.entries()).map(([type, data], index) => ({
                    id: `table_${this.config.id}_${index}`,
                    name: `${type.toUpperCase()} Keys`,
                    type: 'key-group',
                    parentId: this.config.id,
                    metadata: {
                        keyType: type,
                        keyCount: data.count,
                        sampleKeys: data.keys
                    }
                }));
            } finally {
                // 恢复原来的数据库
                await this.redis.select(parseInt(currentDb));
            }
        } catch (error) {
            throw new Error(`Failed to get key list: ${error}`);
        }
    }
}