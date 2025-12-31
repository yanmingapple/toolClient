import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import * as sqlite3 from 'sqlite3';
import type { Database } from 'sqlite3';
import { SQLStatements } from './sql';

/**
 * SQLite客户端实现
 */
export class SQLiteClient implements DatabaseClient {
    private config: ConnectionConfig;
    private db: Database | null = null;

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到SQLite数据库
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            // SQLite使用文件路径作为数据库连接
            // 如果database属性为空，使用内存数据库
            const dbPath = this.config.database || ':memory:';

            this.db = new sqlite3.Database(dbPath, (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 断开SQLite数据库连接
     */
    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err: Error | null) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.db = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 执行SQL查询
     * @param sql SQL查询语句
     * @param params 查询参数
     */
    async execute(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Not connected to database'));
                return;
            }

            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 执行多个SQL语句
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Not connected to database'));
                return;
            }

            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true });
                }
            });
        });
    }

    /**
     * 获取SQLite版本信息
     */
    async getVersion(): Promise<string> {
        const result = await this.execute('SELECT sqlite_version() as version');
        return result[0]?.version || 'unknown';
    }

    /**
     * 测试连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            await this.getVersion();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取SQLite数据库列表
     * SQLite通常只有一个数据库文件，返回当前数据库信息
     */
    async getDatabaseList(): Promise<any[]> {
        if (!this.db) {
            throw new Error('Not connected to SQLite database');
        }

        try {
            const dbPath = this.config.database || ':memory:';
            return [{
                id: `db_${this.config.id}_0`,
                name: dbPath === ':memory:' ? 'memory' : dbPath.split(/[\\/]/).pop() || 'database',
                type: 'database',
                parentId: this.config.id,
                metadata: {
                    path: dbPath,
                    isMemory: dbPath === ':memory:'
                }
            }];
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取SQLite表列表
     * @param database 数据库名称（对于SQLite通常不需要，因为连接时已指定）
     */
    async getTableList(): Promise<any[]> {
        if (!this.db) {
            throw new Error('Not connected to SQLite database');
        }

        try {
            const tables = await this.execute(SQLStatements.SELECT_SQLITE_TABLES) as Array<{ name: string }>;
            return tables.map((table, index) => ({
                id: `table_${this.config.id}_${index}`,
                name: table.name,
                type: 'table',
                parentId: this.config.id,
                metadata: {}
            }));
        } catch (error) {
            throw new Error(`Failed to get table list: ${error}`);
        }
    }
}