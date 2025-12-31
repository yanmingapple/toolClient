/**
 * 统一的树节点模型
 * 用于表示数据库管理工具中的所有树形结构节点
 * 包括：连接、数据库、集合/表、索引等
 */
export interface TreeNode {
    /** 节点唯一标识符 */
    id: string;
    /** 节点显示名称 */
    name: string;
    /** 节点类型 */
    type: TreeNodeType;
    /** 父节点ID (根节点为空字符串) */
    parentId: string;
    /** 是否可展开 (有子节点) */
    expandable: boolean;
    /** 是否已加载子节点 */
    loaded: boolean;
    /** 节点状态 */
    status?: TreeNodeStatus;
    /** 节点元数据 */
    metadata: TreeNodeMetadata;
    /** 子节点列表 (懒加载时为空) */
    children?: TreeNode[];
}

/**
 * 树节点类型枚举
 */
export enum TreeNodeType {
    // 根级别
    CONNECTION = 'connection',      // 数据库连接

    // 数据库级别
    DATABASE = 'database',          // 数据库

    // 数据对象级别
    COLLECTION = 'collection',      // MongoDB 集合
    TABLE = 'table',                // 关系型数据库表
    VIEW = 'view',                  // 视图
    INDEX = 'index',                // 索引
    KEY_GROUP = 'key-group',        // Redis 键组

    // 其他对象
    SCHEMA = 'schema',              // 模式 (PostgreSQL等)
    FUNCTION = 'function',          // 函数
    PROCEDURE = 'procedure',        // 存储过程
    TRIGGER = 'trigger',            // 触发器
    SEQUENCE = 'sequence',          // 序列
}

/**
 * 树节点状态
 */
export enum TreeNodeStatus {
    CONNECTED = 'connected',        // 已连接
    DISCONNECTED = 'disconnected',  // 已断开
    CONNECTING = 'connecting',      // 连接中
    ERROR = 'error',                // 错误状态
    LOADING = 'loading',            // 加载中
    EMPTY = 'empty',                // 空 (无数据)
}

/**
 * 树节点元数据
 */
export interface TreeNodeMetadata {
    /** 数据库类型 (mongodb, mysql, postgresql等) */
    databaseType?: string;
    /** 对象类型 (用于细粒度分类) */
    objectType?: string;
    /** 详细信息 */
    info?: any;
    /** 状态信息 */
    status?: string;
    /** 大小信息 */
    size?: number;
    /** 数量信息 */
    count?: number;

    // 连接级别元数据
    host?: string;                  // 主机地址
    port?: number;                  // 端口
    username?: string;              // 用户名
    ssl?: boolean;                  // 是否使用SSL

    // MongoDB 特有元数据
    documentCount?: number;         // 文档数量
    indexCount?: number;            // 索引数量
    storageSize?: number;           // 存储大小
    createdAt?: Date;              // 创建时间
    lastModified?: Date;           // 最后修改时间

    // 关系型数据库特有元数据
    recordCount?: number;           // 记录数量
    columnCount?: number;           // 列数量
    rowCount?: number;              // 行数量

    // 索引特有元数据
    indexType?: string;             // 索引类型 (B-tree, Hash等)
    unique?: boolean;               // 是否唯一索引
    columns?: string[];             // 索引列名

    // 视图特有元数据
    definition?: string;            // 视图定义SQL

    // 函数/存储过程特有元数据
    returnType?: string;            // 返回类型
    parameters?: ParameterInfo[];   // 参数信息

    // 其他元数据
    engine?: string;                // 存储引擎
    charset?: string;               // 字符集
    collation?: string;             // 排序规则

    // Redis 特有元数据
    dbNumber?: number;              // Redis 数据库编号
    keyCount?: number;              // Redis 键数量
    isCurrent?: boolean;            // Redis 是否为当前数据库
    keyType?: string;               // Redis 键类型 (string, list, set, hash, zset, stream)
    sampleKeys?: string[];          // Redis 示例键名

    // SQLite 特有元数据
    path?: string;                  // SQLite 文件路径
    isMemory?: boolean;             // SQLite 是否为内存数据库

    // SQL Server 特有元数据
    databaseId?: number;            // SQL Server 数据库ID
    createDate?: Date;              // SQL Server 创建日期
    state?: string;                 // SQL Server 数据库状态
}

/**
 * 参数信息
 */
export interface ParameterInfo {
    name: string;
    type: string;
    mode?: 'IN' | 'OUT' | 'INOUT';
    defaultValue?: any;
}

/**
 * 创建树节点的工厂函数
 */
export class TreeNodeFactory {
    /**
     * 创建连接节点
     */
    static createConnection(
        id: string,
        name: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        return {
            id,
            name,
            type: TreeNodeType.CONNECTION,
            parentId: '',
            expandable: true,
            loaded: false,
            status: TreeNodeStatus.DISCONNECTED,
            metadata: {
                databaseType: metadata.databaseType,
                host: metadata.host,
                port: metadata.port,
                username: metadata.username,
                ssl: metadata.ssl,
                ...metadata
            }
        };
    }

    /**
     * 创建数据库节点
     */
    static createDatabase(
        id: string,
        name: string,
        parentId: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        return {
            id,
            name,
            type: TreeNodeType.DATABASE,
            parentId,
            expandable: true,
            loaded: false,
            metadata: {
                databaseType: metadata.databaseType,
                size: metadata.size,
                recordCount: metadata.recordCount,
                ...metadata
            }
        };
    }

    /**
     * 创建集合节点 (MongoDB)
     */
    static createCollection(
        id: string,
        name: string,
        parentId: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        return {
            id,
            name,
            type: TreeNodeType.COLLECTION,
            parentId,
            expandable: true,
            loaded: false,
            metadata: {
                databaseType: 'mongodb',
                objectType: metadata.objectType,
                documentCount: metadata.documentCount,
                indexCount: metadata.indexCount,
                storageSize: metadata.storageSize,
                ...metadata
            }
        };
    }

    /**
     * 创建表节点 (关系型数据库)
     */
    static createTable(
        id: string,
        name: string,
        parentId: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        return {
            id,
            name,
            type: TreeNodeType.TABLE,
            parentId,
            expandable: true,
            loaded: false,
            metadata: {
                recordCount: metadata.recordCount,
                columnCount: metadata.columnCount,
                engine: metadata.engine,
                charset: metadata.charset,
                ...metadata
            }
        };
    }

    /**
     * 创建索引节点
     */
    static createIndex(
        id: string,
        name: string,
        parentId: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        return {
            id,
            name,
            type: TreeNodeType.INDEX,
            parentId,
            expandable: false,
            loaded: true,
            metadata: {
                indexType: metadata.indexType,
                unique: metadata.unique,
                columns: metadata.columns,
                ...metadata
            }
        };
    }

    /**
     * 创建通用节点
     */
    static createGeneric(
        id: string,
        name: string,
        type: TreeNodeType,
        parentId: string,
        metadata: Partial<TreeNodeMetadata> = {}
    ): TreeNode {
        const expandable = type !== TreeNodeType.INDEX &&
            type !== TreeNodeType.FUNCTION &&
            type !== TreeNodeType.PROCEDURE;

        return {
            id,
            name,
            type,
            parentId,
            expandable,
            loaded: !expandable,
            metadata
        };
    }
}

/**
 * 获取节点类型的显示名称
 */
export function getTreeNodeTypeDisplayName(type: TreeNodeType): string {
    const displayNames: Record<TreeNodeType, string> = {
        [TreeNodeType.CONNECTION]: '连接',
        [TreeNodeType.DATABASE]: '数据库',
        [TreeNodeType.COLLECTION]: '集合',
        [TreeNodeType.TABLE]: '表',
        [TreeNodeType.VIEW]: '视图',
        [TreeNodeType.INDEX]: '索引',
        [TreeNodeType.KEY_GROUP]: '键组',
        [TreeNodeType.SCHEMA]: '模式',
        [TreeNodeType.FUNCTION]: '函数',
        [TreeNodeType.PROCEDURE]: '存储过程',
        [TreeNodeType.TRIGGER]: '触发器',
        [TreeNodeType.SEQUENCE]: '序列'
    };
    return displayNames[type] || type;
}

/**
 * 获取节点状态的显示名称和颜色
 */
export function getTreeNodeStatusInfo(status?: TreeNodeStatus): { name: string; color: string } {
    const statusInfo: Record<TreeNodeStatus, { name: string; color: string }> = {
        [TreeNodeStatus.CONNECTED]: { name: '已连接', color: '#52c41a' },
        [TreeNodeStatus.DISCONNECTED]: { name: '未连接', color: '#d9d9d9' },
        [TreeNodeStatus.CONNECTING]: { name: '连接中', color: '#1890ff' },
        [TreeNodeStatus.ERROR]: { name: '错误', color: '#ff4d4f' },
        [TreeNodeStatus.LOADING]: { name: '加载中', color: '#faad14' },
        [TreeNodeStatus.EMPTY]: { name: '空', color: '#d9d9d9' }
    };

    return statusInfo[status || TreeNodeStatus.DISCONNECTED];
}