import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import { Connection, Request } from 'tedious';

/**
 * SQL Server客户端实现
 */
export class SQLServerClient implements DatabaseClient {
    private config: ConnectionConfig;
    private connection: Connection | null = null;
    private isConnected: boolean = false;

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    /**
     * 连接到SQL Server数据库
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const connectionConfig = {
                server: this.config.host,
                options: {
                    port: this.config.port,
                    database: this.config.database,
                    encrypt: true,
                    trustServerCertificate: true,
                },
                authentication: {
                    type: 'default',
                    options: {
                        userName: this.config.username,
                        password: this.config.password,
                    },
                },
            };

            this.connection = new Connection(connectionConfig);

            this.connection.on('connect', (err) => {
                if (err) {
                    reject(new Error(`SQL Server connection failed: ${err.message}`));
                } else {
                    this.isConnected = true;
                    resolve();
                }
            });

            this.connection.on('error', (err) => {
                reject(new Error(`SQL Server connection error: ${err.message}`));
            });

            this.connection.connect();
        });
    }

    /**
     * 断开SQL Server数据库连接
     */
    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.connection) {
                this.connection.close();
                this.connection = null;
                this.isConnected = false;
            }
            resolve();
        });
    }

    /**
     * 执行SQL查询
     * @param sql SQL查询语句
     * @param params 查询参数
     */
    async execute(sql: string, _params?: any[]): Promise<any> {
        if (!this.connection || !this.isConnected) {
            throw new Error('Not connected to SQL Server database');
        }

        return new Promise((resolve, reject) => {
            const request = new Request(sql, (err, _rowCount) => {
                if (err) {
                    reject(new Error(`SQL Server query execution failed: ${err.message}`));
                }
            });

            const results: any[] = [];

            request.on('row', (columns) => {
                const row: any = {};
                columns.forEach((column) => {
                    row[column.metadata.colName] = column.value;
                });
                results.push(row);
            });

            request.on('requestCompleted', () => {
                resolve(results);
            });

            request.on('error', (err) => {
                reject(new Error(`SQL Server request error: ${err.message}`));
            });

            this.connection!.execSql(request);
        });
    }

    /**
     * 执行多个SQL语句
     * @param sql SQL查询语句
     */
    async executeBatch(sql: string): Promise<any> {
        return this.execute(sql);
    }

    /**
     * 获取SQL Server数据库版本信息
     */
    async getVersion(): Promise<string> {
        if (!this.connection || !this.isConnected) {
            throw new Error('Not connected to SQL Server database');
        }

        try {
            const results = await this.execute('SELECT @@VERSION as version');
            return results[0].version;
        } catch (error) {
            throw new Error(`Failed to get SQL Server version: ${error}`);
        }
    }

    /**
     * 测试SQL Server连接是否有效
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.connection || !this.isConnected) {
                return false;
            }

            await this.execute('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取SQL Server数据库列表
     */
    async getDatabaseList(): Promise<any[]> {
        if (!this.connection || !this.isConnected) {
            throw new Error('Not connected to SQL Server database');
        }

        try {
            const results = await this.execute(`
                SELECT name, database_id, create_date, state_desc
                FROM sys.databases
                WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
                ORDER BY name
            `);

            return results.map((db, index) => ({
                id: `db_${this.config.id}_${index}`,
                name: db.name,
                type: 'database',
                parentId: this.config.id,
                metadata: {
                    databaseId: db.database_id,
                    createDate: db.create_date,
                    state: db.state_desc
                }
            }));
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取SQL Server表列表
     * @param databaseName 数据库名称（对于SQL Server通常不需要，因为连接时已指定）
     */
    async getTableList(databaseName?: string): Promise<any[]> {
        if (!this.connection || !this.isConnected) {
            throw new Error('Not connected to SQL Server database');
        }

        try {
            const dbName = databaseName || this.config.database;
            const results = await this.execute(`
                SELECT 
                    s.name AS schemaName,
                    t.name AS tableName,
                    t.create_date,
                    t.modify_date,
                    t.is_heap,
                    t.is_tracked_by_cdc,
                    p.rows
                FROM sys.tables t
                INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
                LEFT JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
                WHERE t.type = 'U'
                ORDER BY s.name, t.name
            `);

            return results.map((table, index) => ({
                id: `table_${this.config.id}_${index}`,
                name: table.tableName,
                type: 'table',
                parentId: this.config.id,
                metadata: {
                    schema: table.schemaName,
                    createDate: table.create_date,
                    modifyDate: table.modify_date,
                    isHeap: table.is_heap,
                    trackedByCdc: table.is_tracked_by_cdc,
                    rowCount: table.rows
                }
            }));
        } catch (error) {
            throw new Error(`Failed to get table list: ${error}`);
        }
    }
}