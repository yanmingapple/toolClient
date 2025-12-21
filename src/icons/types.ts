export enum DatabaseType {
  MySQL = 'mysql',
  PostgreSQL = 'postgresql',
  MongoDB = 'mongodb',
  Redis = 'redis',
  SQLServer = 'sqlserver',
  SQLite = 'sqlite'
}

// ConnectionStatus moved to src/types/connection.ts

export type IconName = 
  // 数据库类型图标
  | 'mysql'
  | 'postgresql'
  | 'mongodb'
  | 'redis'
  | 'sqlserver'
  | 'sqlite'
  // 通用图标
  | 'database'
  | 'folder'
  | 'folder-open'
  | 'table'
  | 'cloud'
  | 'cloud-filled'
  | 'file-text-filled'
  | 'settings'
  | 'warning'
  | 'warning-filled'
  | 'error'
  | 'error-filled'
  | 'success'
  | 'success-filled'
  | 'loading';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}
