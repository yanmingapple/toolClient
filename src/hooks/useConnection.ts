/**
 * 连接管理相关Hook
 */
import { useCallback, useEffect } from 'react'
import { useConnectionStore } from '../store/connectionStore'
import { ConnectionConfig, ConnectionStatus } from '../types/leftTree/connection'
import { ensureConnectionStatesMap } from '../utils/connectionUtils'
import { message } from 'antd'

/**
 * 连接管理Hook
 * @returns 连接相关的状态和操作函数
 */
export const useConnection = () => {
  // 从store获取连接相关的状态和操作
  const connections = useConnectionStore((state) => state.connections)
  const connectionStates = useConnectionStore((state) => state.connectionStates)
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)

  const setActiveConnection = useConnectionStore((state) => state.setActiveConnection)
  const setConnectionStatus = useConnectionStore((state) => state.setConnectionStatus)
  const testConnection = useConnectionStore((state) => state.testConnection)
  const getDatabaseList = useConnectionStore((state) => state.getDatabaseList)

  /**
   * 确保所有连接都有正确的初始状态（DISCONNECTED）
   */
  useEffect(() => {
    // 确保connectionStates是Map对象
    const safeConnectionStates = ensureConnectionStatesMap(connectionStates)

    let hasChanges = false
    connections.forEach(connection => {
      // 检查连接是否有状态，或者状态是否为CONNECTING
      // 如果没有状态或状态为CONNECTING，则设置为DISCONNECTED
      const currentStatus = safeConnectionStates.get(connection.id)
      if (!currentStatus || currentStatus === ConnectionStatus.CONNECTING) {
        hasChanges = true
        setConnectionStatus(connection.id, ConnectionStatus.DISCONNECTED)
      }
    })

    // 如果没有需要更改的状态，不做任何操作
    if (!hasChanges) return
  }, [connections, connectionStates, setConnectionStatus])

  /**
   * 连接并加载数据库
   * @param connection 连接配置
   */
  const handleConnectAndLoadDatabases = useCallback(async (connection: ConnectionConfig) => {
    // 检查当前状态，如果已经连接则不重复连接
    let currentStatus = ConnectionStatus.DISCONNECTED
    try {
      if (connectionStates instanceof Map) {
        currentStatus = connectionStates.get(connection.id) || ConnectionStatus.DISCONNECTED
      }
    } catch (error) {
      console.error('Failed to get connection status:', error)
    }

    if (currentStatus === ConnectionStatus.CONNECTED) {
      message.info('连接已建立')
      // 加载数据库列表
      await getDatabaseList(connection.id)
      return
    }

    if (currentStatus === ConnectionStatus.CONNECTING) {
      message.info('正在连接中，请稍候...')
      return
    }

    setConnectionStatus(connection.id, ConnectionStatus.CONNECTING)
    try {
      const success = await testConnection(connection)
      if (success) {
        setConnectionStatus(connection.id, ConnectionStatus.CONNECTED)
        setActiveConnection(connection.id)
        message.success('连接成功')

        // 加载数据库列表
        await getDatabaseList(connection.id)
      } else {
        setConnectionStatus(connection.id, ConnectionStatus.ERROR)
        message.error('连接失败: 用户名或密码错误')
      }
    } catch (error) {
      setConnectionStatus(connection.id, ConnectionStatus.ERROR)
      message.error('连接失败: ' + error)
    }
  }, [connectionStates, testConnection, setConnectionStatus, setActiveConnection, getDatabaseList])

  /**
   * 处理节点选择
   * @param key 节点key
   */
  const handleSelectConnection = useCallback((key: string) => {
    setActiveConnection(key)
  }, [setActiveConnection])

  return {
    connections,
    connectionStates,
    activeConnectionId,
    setActiveConnection,
    handleConnectAndLoadDatabases,
    handleSelectConnection
  }
}
