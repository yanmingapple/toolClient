/**
 * 数据库状态枚举
 * 描述数据库的加载和访问状态
 */
export enum DatabaseStatus {
  DISCONNECTED = 'disconnected',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  EMPTY = 'empty',
}