import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { DatabaseClient } from './database';
import { Connection, Request } from 'tedious';

/**
 * SQL Server管理连接池，用于获取数据库列表等系统级操作
 */
class SQLServerManagementPool {
    private static instance: SQLServerManagementPool;
    private connection: Connection | null = null;
    private connectionConfig: any = null;
    private lastRefreshTime: number = 0;
    private cacheTimeout: number = 5 * 60 * 1000; // 缓存5分钟
    private databaseCache: any[] | null = null;
    private initializingPromise: Promise<void> | null = null;

    private constructor() { }

    static getInstance(): SQLServerManagementPool {
        if (!SQLServerManagementPool.instance) {
            SQLServerManagementPool.instance = new SQLServerManagementPool();
        }
        return SQLServerManagementPool.instance;
    }

    async initialize(config: any): Promise<void> {
        // 如果已经在初始化中，等待现有的Promise
        if (this.initializingPromise) {
            return this.initializingPromise;
        }

        this.connectionConfig = config;

        // 如果连接已经存在，检查是否需要重新创建
        if (this.connection) {
            // 如果连接仍然有效，直接返回
            return;
        }

        // 创建新的初始化Promise
        this.initializingPromise = new Promise<void>((resolve, reject) => {
            try {
                // 临时连接配置，不指定数据库名称
                const tempConnectionConfig = {
                    server: config.host,
                    options: {
                        port: config.port,
                        encrypt: true,
                        trustServerCertificate: true,
                    },
                    authentication: {
                        type: 'default',
                        options: {
                            userName: config.username,
                            password: config.password,
                        },
                    },
                };

                this.connection = new Connection(tempConnectionConfig);

                this.connection.on('connect', (err) => {
                    if (err) {
                        reject(new Error(`Failed to connect to SQL Server: ${err.message}`));
                        this.initializingPromise = null;
                    } else {
                        resolve();
                        this.initializingPromise = null;
                    }
                });

                this.connection.on('error', (err) => {
                    reject(new Error(`SQL Server connection error: ${err.message}`));
                    this.initializingPromise = null;
                });

                this.connection.connect();
            } catch (error) {
                reject(error);
                this.initializingPromise = null;
            }
        });

        return this.initializingPromise;
    }

    async getDatabaseList(): Promise<any[]> {
        // 检查缓存是否有效
        const now = Date.now();
        if (this.databaseCache && (now - this.lastRefreshTime) < this.cacheTimeout) {
            return this.databaseCache;
        }

        if (!this.connection) {
            throw new Error('SQL Server management pool not initialized');
        }

        return new Promise((resolve, reject) => {
            try {
                // 使用临时连接执行查询
                const results: any[] = [];

                const request = new Request(`
                    SELECT name, database_id, create_date, state_desc
                    FROM sys.databases
                    WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
                    ORDER BY name
                `, (err) => {
                    if (err) {
                        reject(new Error(`SQL Server query failed: ${err.message}`));
                        return;
                    }
                });

                request.on('row', (columns) => {
                    const row: any = {};
                    columns.forEach((column) => {
                        row[column.metadata.colName] = column.value;
                    });
                    results.push(row);
                });

                request.on('requestCompleted', () => {
                    // 更新缓存
                    this.databaseCache = results.map((db, index) => ({
                        id: `db_${this.connectionConfig!.host}_${index}`,
                        name: db.name,
                        type: 'database',
                        parentId: this.connectionConfig!.host,
                        metadata: {
                            databaseId: db.database_id,
                            createDate: db.create_date,
                            state: db.state_desc
                        }
                    }));

                    this.lastRefreshTime = now;
                    resolve(this.databaseCache);
                });

                request.on('error', (err) => {
                    reject(new Error(`SQL Server request error: ${err.message}`));
                });

                this.connection!.execSql(request);
            } catch (error) {
                reject(error);
            }
        });
    }

    async clearCache(): Promise<void> {
        this.databaseCache = null;
        this.lastRefreshTime = 0;
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            if (this.connection) {
                this.connection.close();
                this.connection = null;
            }
            resolve();
        });
    }
}

/**
 * SQL Server客户端实现
 */
export class SQLServerClient implements DatabaseClient {
    private config: ConnectionConfig;
    private connection: Connection | null = null;
    private isConnected: boolean = false;

    /**
     * SQL Server管理连接池，用于获取数据库列表等系统级操作
     */
    private managementPool: SQLServerManagementPool;

    /**
     * 构造函数
     * @param config 连接配置
     */
    constructor(config: ConnectionConfig) {
        this.config = config;
        this.managementPool = SQLServerManagementPool.getInstance();
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
        try {
            // 初始化管理连接池
            await this.managementPool.initialize(this.config);

            // 使用管理连接池获取数据库列表（带缓存）
            const databaseList = await this.managementPool.getDatabaseList();

            // 更新ID和父ID以匹配当前连接配置
            return databaseList.map((db, index) => ({
                ...db,
                id: `db_${this.config.id}_${index}`,
                parentId: this.config.id
            }));
        } catch (error) {
            throw new Error(`Failed to get database list: ${error}`);
        }
    }

    /**
     * 获取SQL Server表列表
     * @param database 数据库名称（对于SQL Server通常不需要，因为连接时已指定）
     */
    async getTableList(): Promise<any[]> {
        if (!this.connection || !this.isConnected) {
            throw new Error('Not connected to SQL Server database');
        }

        try {
            // const dbName = database || this.config.database;
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

            return results.map((table: any, index: number) => ({
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