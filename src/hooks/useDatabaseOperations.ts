/**
 * 数据库操作相关Hook
 */
import { useCallback, useState } from 'react'
import { useConnectionStore } from '../store/connectionStore'

import { ConnectionStatus } from '../types/leftTree/connection'

/**
 * 数据库操作Hook
 * @returns 数据库操作相关的状态和操作函数
 */
export const useDatabaseOperations = () => {
  // 从store获取相关状态
  const connections = useConnectionStore((state) => state.connections)
  const connectionStates = useConnectionStore((state) => state.connectionStates)
  // const activeConnectionId = useConnectionStore((state) => state.activeConnectionId) // 暂时未使用

  // 从store获取相关操作
  const getDatabaseList = useConnectionStore((state) => state.getDatabaseList)
  const getTableList = useConnectionStore((state) => state.getTableList)

  // 本地状态
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取指定连接的数据库列表
   * @param connectionId 连接ID
   */
  const fetchDatabases = useCallback(async (connectionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // 检查连接是否存在且已连接
      const connection = connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      const databases = await getDatabaseList(connectionId)
      return databases
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch databases'
      setError(errorMsg)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [connections, connectionStates, getDatabaseList])

  /**
   * 获取指定数据库的表列表
   * @param connectionId 连接ID
   * @param databaseName 数据库名称
   * @param databaseId 数据库ID
   */
  const fetchTables = useCallback(async (connectionId: string, databaseName: string, databaseId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // 检查连接是否存在且已连接
      const connection = connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      const tables = await getTableList(connectionId, databaseName, databaseId)
      return tables
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tables'
      setError(errorMsg)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [connections, connectionStates, getTableList])

  /**
   * 执行SQL查询
   * @param connectionId 连接ID
   * @param databaseName 数据库名称
   * @param sql SQL语句
   */
  const executeSql = useCallback(async (connectionId: string, databaseName: string, sql: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // 检查连接是否存在且已连接
      const connection = connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      // 这里需要调用IPC通信来执行SQL查询
      // 注意：此功能需要在主进程实现
      const ipcRenderer = (window as any).require('electron').ipcRenderer
      const result = await ipcRenderer.invoke('execute-sql', {
        connectionId,
        databaseName,
        sql
      })

      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to execute SQL'
      setError(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [connections, connectionStates])

  return {
    isLoading,
    error,
    fetchDatabases,
    fetchTables,
    executeSql
  }
}
