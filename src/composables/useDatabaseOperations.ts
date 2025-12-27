import { ref } from 'vue'
import { useConnectionStore } from '../stores/connection'
import { ConnectionStatus } from '../enum/database'
import { getSafeIpcRenderer } from '../utils/electronUtils'

export interface FetchDatabasesResult {
  success: boolean
  data?: any[]
  error?: string
}

export interface FetchTablesResult {
  success: boolean
  data?: any[]
  error?: string
}

export interface ExecuteSqlResult {
  success: boolean
  data?: any
  error?: string
}

export const useDatabaseOperations = () => {
  const connectionStore = useConnectionStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchDatabases = async (connectionId: string): Promise<any[]> => {
    isLoading.value = true
    error.value = null

    try {
      const connection = connectionStore.connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStore.connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      const databases = await connectionStore.getDatabaseList(connectionId)
      return databases
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch databases'
      error.value = errorMsg
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchTables = async (connectionId: string, databaseName: string, databaseId: string): Promise<any[]> => {
    isLoading.value = true
    error.value = null

    try {
      const connection = connectionStore.connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStore.connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      const tables = await connectionStore.getTableList(connectionId, databaseName, databaseId)
      return tables
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tables'
      error.value = errorMsg
      return []
    } finally {
      isLoading.value = false
    }
  }

  const executeSql = async (connectionId: string, databaseName: string, sql: string): Promise<any> => {
    isLoading.value = true
    error.value = null

    try {
      const connection = connectionStore.connections.find(conn => conn.id === connectionId)
      const connectionStatus = connectionStore.connectionStates.get(connectionId) || ConnectionStatus.DISCONNECTED

      if (!connection) {
        throw new Error('Connection not found')
      }

      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        throw new Error('Connection is not connected')
      }

      const ipcRenderer = getSafeIpcRenderer()
      if (!ipcRenderer) {
        throw new Error('ipcRenderer is not available')
      }

      const result = await ipcRenderer.invoke('execute-sql', {
        connectionId,
        databaseName,
        sql
      })

      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to execute SQL'
      error.value = errorMsg
      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    isLoading,
    error,
    fetchDatabases,
    fetchTables,
    executeSql,
    clearError
  }
}
