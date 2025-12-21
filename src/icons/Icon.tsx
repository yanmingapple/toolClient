import React, { SVGProps, lazy, Suspense } from 'react';
import { IconProps, IconName } from './types';

// 动态导入SVG图标组件
type IconComponent = React.FC<SVGProps<SVGSVGElement>>;

// 图标映射表，用于动态导入图标
const IconMap: Record<IconName, () => Promise<{ default: IconComponent }>> = {
  // 数据库类型图标
  mysql: () => import('./svg/mysql.svg'),
  postgresql: () => import('./svg/postgresql.svg'),
  mongodb: () => import('./svg/mongodb.svg'),
  redis: () => import('./svg/redis.svg'),
  sqlserver: () => import('./svg/sqlserver.svg'),
  sqlite: () => import('./svg/sqlite.svg'),
  // 通用图标
  database: () => import('./svg/database.svg'),
  "folder": () => import('./svg/folder.svg'),
  "folder-open": () => import('./svg/folder-open.svg'),
  "table": () => import('./svg/table.svg'),
  "cloud": () => import('./svg/cloud.svg'),
  'cloud-filled': () => import('./svg/cloud-filled.svg'),
  'file-text-filled': () => import('./svg/file-text-filled.svg'),
  settings: () => import('./svg/settings.svg'),
  warning: () => import('./svg/warning.svg'),
  'warning-filled': () => import('./svg/warning-filled.svg'),
  error: () => import('./svg/error.svg'),
  'error-filled': () => import('./svg/error-filled.svg'),
  success: () => import('./svg/success.svg'),
  'success-filled': () => import('./svg/success-filled.svg'),
  loading: () => import('./svg/loading.svg'),
};

// 默认图标组件，用于在图标未找到时显示
const DefaultIcon: React.FC<IconProps> = ({ name, size = 16, color, className }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    color,
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: `${size}px`,
    textAlign: 'center' as const,
    lineHeight: `${size}px`,
  };
  return <span className={`icon-default ${className}`} style={style}>{name}</span>;
};

// 图标组件
const Icon: React.FC<IconProps> = ({ name, size = 16, color, className }) => {
  const IconComponent = IconMap[name] ? lazy(IconMap[name]) : null;
  const style = {
    width: size,
    height: size,
    color,
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  return IconComponent ? (
    <Suspense fallback={<DefaultIcon name={name} size={size} color={color} className={className} />}>
      <IconComponent style={style} className={className} />
    </Suspense>
  ) : (
    <DefaultIcon name={name} size={size} color={color} className={className} />
  );
};

export default Icon;
