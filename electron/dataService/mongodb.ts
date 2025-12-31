import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import { MongoClient } from 'mongodb';
import { TreeNodeFactory, TreeNode } from '../model/database';

/**
 * MongoDB客户端实现
 */
export class MongoDBClient implements DatabaseClient {
    private config: ConnectionConfig;
    private client: MongoClient | null = null;
    private db: any = null;

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到MongoDB数据库
     */
    async connect(): Promise<void> {
        try {
            const connectionString = `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`;
            this.client = new MongoClient(connectionString);
            await this.client.connect();
            this.db = this.client.db(this.config.database);
        } catch (error) {
            throw new Error(`MongoDB connection failed: ${error}`);
        }
    }

    /**
     * 断开MongoDB数据库连接
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    /**
     * 执行MongoDB查询（模拟SQL查询）
     * @param sql SQL查询语句（将被转换为MongoDB操作）
     * @param params 查询参数
     */
    async execute(sql: string, _params?: any[]): Promise<any> {
        if (!this.client || !this.db) {
            throw new Error('Not connected to MongoDB database');
        }

        try {
            // 这里实现一个简单的SQL到MongoDB的转换
            // 实际应用中可能需要更复杂的查询解析器
            if (sql.trim().toUpperCase().startsWith('SHOW')) {
                // 处理SHOW命令
                if (sql.toUpperCase().includes('DATABASES')) {
                    const dbs = await this.client.db().admin().listDatabases();
                    return dbs.databases.map((db: any) => ({ name: db.name }));
                }
                if (sql.toUpperCase().includes('TABLES')) {
                    const collections = await this.db.listCollections().toArray();
                    return collections.map((col: any) => ({ name: col.name }));
                }
            }

            // 默认返回空结果
            return [];
        } catch (error) {
            throw new Error(`MongoDB query execution failed: ${error}`);
        }
    }

    /**
     * 执行多个MongoDB操作
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        return this.execute(sql);
    }

    /**
     * 获取MongoDB数据库版本信息
     */
    async getVersion(): Promise<string> {
        if (!this.client) {
            throw new Error('Not connected to MongoDB database');
        }

        try {
            const db = this.client.db('admin');
            const result = await db.command({ buildinfo: 1 });
            return result.version;
        } catch (error) {
            throw new Error(`Failed to get MongoDB version: ${error}`);
        }
    }

    /**
     * 测试MongoDB连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.client) {
                return false;
            }

            await this.client.db('admin').command({ ping: 1 });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取MongoDB数据库列表
     */
    async getDatabaseList(): Promise<TreeNode[]> {
        if (!this.client) {
            throw new Error('Not connected to MongoDB database');
        }

        try {
            const dbs = await this.client.db().admin().listDatabases();
            return dbs.databases.map((db, index) =>
                TreeNodeFactory.createDatabase(
                    `db_${this.config.id}_${index}`,
                    db.name,
                    this.config.id,
                    {
                        databaseType: 'mongodb',
                        size: db.sizeOnDisk,
                        status: db.empty ? 'empty' : 'normal',
                        info: {
                            sizeOnDisk: db.sizeOnDisk,
                            empty: db.empty
                        }
                    }
                )
            );
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取MongoDB集合列表（相当于表）
     * @param database 数据库名称（MongoDB需要指定数据库）
     */
    async getTableList(): Promise<any[]> {
        if (!this.client) {
            throw new Error('Not connected to MongoDB database');
        }

        try {
            // 使用指定的数据库名称或默认数据库
            const dbName = this.config.database;
            const targetDb = this.client.db(dbName);

            const collections = await targetDb.listCollections().toArray();
<<<<<<< HEAD
            return collections.map((collection, index) =>
                TreeNodeFactory.createCollection(
                    `table_${this.config.id}_${index}`,
                    collection.name,
                    this.config.id,
                    {
                        objectType: collection.type,
                        info: (collection as any).info
                    }
                )
            );
=======
            return collections.map((collection, index) => ({
                id: `table_${this.config.id}_${index}`,
                name: collection.name,
                type: 'collection',
                parentId: this.config.id,
                metadata: {
                    type: collection.type,
                    info: (collection as any).info
                }
            }));
>>>>>>> 791f739b6f8bc2f0cc0347c51f03791688868a31
        } catch (error) {
            throw new Error(`Failed to get collection list: ${error}`);
        }
    }
}