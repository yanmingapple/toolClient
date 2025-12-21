export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  SQLSERVER = 'sqlserver',
  SQLITE = 'sqlite',
}

export interface ConnectionConfig {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  ssl?: boolean;
  ssh?: boolean;
  sshHost?: string;
  sshPort?: number;
  sshUsername?: string;
  sshPassword?: string;
  sshPrivateKey?: string;
  sshPassphrase?: string;
  timeout?: number;
  charset?: string;
  maxConnections?: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export enum DatabaseStatus {
  DISCONNECTED = 'disconnected',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  EMPTY = 'empty',
}

export interface ConnectionState {
  id: string;
  status: ConnectionStatus;
  error?: string;
  connectedAt?: Date;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  affectedRows?: number;
  insertId?: number;
  executionTime?: number;
}

export interface QueryHistory {
  id: string;
  connectionId: string;
  database?: string;
  query: string;
  executedAt: Date;
  executionTime?: number;
  error?: string;
}
