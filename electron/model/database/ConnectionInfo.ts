import { DatabaseClient } from '../../dataService/database';
import { ConnectionConfig } from './Connection';
import { ConnectionStatus } from './connectionStatus';
/**
 * 连接信息接口
 * 描述数据库连接的完整信息，包括配置、状态、统计和时间戳等
 */
export interface ConnectionInfo {
    config: ConnectionConfig;           // 数据库连接配置信息，包含主机、端口、用户名等
    client: DatabaseClient;             // 数据库客户端实例，用于执行具体操作
    status: ConnectionStatus;           // 当前连接状态（活跃、空闲、断开等）
    createdAt: Date;                    // 连接创建时间
    lastUsedAt: Date;                   // 最后使用时间，用于判断连接空闲状态
    lastPingAt: Date;                   // 最后一次心跳检测时间
    pingInterval: number;               // 心跳检测间隔（毫秒），用于保持连接活跃
    maxIdleTime: number;                // 最大空闲时间（毫秒），超过此时间连接将被释放
    useCount: number;                   // 连接使用次数，统计连接的使用频率
}