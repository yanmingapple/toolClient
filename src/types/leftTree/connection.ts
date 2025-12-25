import { DatabaseType, ConnectionStatus, DatabaseStatus } from '../../enum'

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

export { DatabaseType, ConnectionStatus, DatabaseStatus }
