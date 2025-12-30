import { ConnectionType } from './connectionType';

/**
 * 数据库连接配置接口
 * 定义了建立数据库连接所需的所有参数，包括基本连接信息、SSL配置、SSH隧道配置等
 */
export interface ConnectionConfig {
    // ===== 基本标识信息 =====
    /** 连接唯一标识符 */
    id: string;
    /** 连接名称，用于显示和识别 */
    name: string;
    /** 数据库类型，对应 ConnectionType 枚举 */
    type: ConnectionType;

    // ===== 连接基本信息 =====
    /** 数据库服务器地址 */
    host: string;
    /** 数据库服务器端口 */
    port: number;
    /** 数据库用户名 */
    username: string;
    /** 数据库密码 */
    password: string;
    /** 默认数据库名称（可选） */
    database?: string;

    // ===== SSL 安全连接配置 =====
    /** 是否使用 SSL 连接（可选） */
    ssl?: boolean;

    // ===== SSH 隧道配置 =====
    /** 是否使用 SSH 隧道（可选） */
    ssh?: boolean;
    /** SSH 服务器地址（可选） */
    sshHost?: string;
    /** SSH 服务器端口（可选） */
    sshPort?: number;
    /** SSH 用户名（可选） */
    sshUsername?: string;
    /** SSH 密码（可选） */
    sshPassword?: string;
    /** SSH 私钥内容（可选） */
    sshPrivateKey?: string;
    /** SSH 私钥密码短语（可选） */
    sshPassphrase?: string;

    // ===== 其他配置选项 =====
    /** 连接超时时间（毫秒，可选） */
    timeout?: number;
    /** 字符集（可选） */
    charset?: string;
    /** 最大连接数（可选） */
    maxConnections?: number;
}