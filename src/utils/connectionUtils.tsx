/**
 * 连接管理相关工具函数
 */
import { ConnectionType as DatabaseType, ConnectionStatus } from '../../electron/model/database'
import { Icon, IconName } from '../icons'

/**
 * 根据数据库类型选择图标
 * @param type 数据库类型
 * @param isConnected 是否已连接
 * @returns React组件
 */
export const getDatabaseIcon = (type: DatabaseType, isConnected: boolean) => {
  return <Icon name={type as unknown as IconName} size={16} color={isConnected ? '#52c41a' : '#d9d9d9'} style={{ marginRight: '8px' }} />
}

/**
 * 确保连接状态是Map对象
 * @param connectionStates 连接状态对象
 * @returns 安全的Map对象
 */
export const ensureConnectionStatesMap = (connectionStates: any): Map<string, ConnectionStatus> => {
  let safeConnectionStates: Map<string, ConnectionStatus> = new Map()
  try {
    if (connectionStates instanceof Map) {
      safeConnectionStates = connectionStates
    } else if (Array.isArray(connectionStates)) {
      safeConnectionStates = new Map(connectionStates as Array<[string, ConnectionStatus]>)
    } else if (connectionStates && typeof connectionStates === 'object') {
      // 如果是普通对象，尝试转换为Map
      safeConnectionStates = new Map(Object.entries(connectionStates))
    }
  } catch (error) {
    console.error('Failed to create safeConnectionStates:', error)
    safeConnectionStates = new Map()
  }
  return safeConnectionStates
}
