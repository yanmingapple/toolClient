import { DatabaseType } from '../enum'

export type IconName =
  | 'mysql'
  | 'postgresql'
  | 'mongodb'
  | 'redis'
  | 'sqlserver'
  | 'sqlite'
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

export { DatabaseType }
