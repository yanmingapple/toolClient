/**
 * 连接状态枚举
 * 描述数据库连接的当前状态
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}