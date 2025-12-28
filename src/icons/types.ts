import { ConnectionType } from '../enum/database'

export type IconName =
  | 'mysql'
  | 'mysql-filled'
  | 'postgresql'
  | 'mongodb'
  | 'redis'
  | 'sqlserver'
  | 'sqlite'
  | 'database'
  | 'folder'
  | 'folder-open'
  | 'table'
  | 'table-filled'
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
  style?: Record<string, any>;
}

export { ConnectionType }
