import { computed, watch, onMounted } from 'vue'
import { useConnectionStore } from '../stores/connection'
import type { ConnectionConfig } from '../types/leftTree/connection'
import { ConnectionStatus } from '../enum/database'
import { ensureConnectionStatesMap } from '../utils/connectionUtils'
import { ElMessage } from 'element-plus'

export const useConnection = () => {
  const connectionStore = useConnectionStore()

  const connections = computed(() => connectionStore.connections)
  const connectionStates = computed(() => connectionStore.connectionStates)
  const activeConnectionId = computed(() => connectionStore.activeConnectionId)

  const setActiveConnection = (id: string | null) => {
    connectionStore.setActiveConnection(id)
  }

  const setConnectionStatus = (id: string, status: ConnectionStatus) => {
    connectionStore.setConnectionStatus(id, status)
  }

  const testConnection = async (config: ConnectionConfig): Promise<{ success: boolean; error?: string }> => {
    return connectionStore.testConnection(config)
  }

  const getDatabaseList = async (connectionId: string) => {
    return connectionStore.getDatabaseList(connectionId)
  }

  const ensureConnectionStates = () => {
    const safeConnectionStates = ensureConnectionStatesMap(connectionStates.value)

    let hasChanges = false
    connections.value.forEach(connection => {
      const currentStatus = safeConnectionStates.get(connection.id)
      if (!currentStatus || currentStatus === ConnectionStatus.CONNECTING) {
        hasChanges = true
        setConnectionStatus(connection.id, ConnectionStatus.DISCONNECTED)
      }
    })

    return hasChanges
  }

  const handleConnectAndLoadDatabases = async (connection: ConnectionConfig) => {
    let currentStatus = ConnectionStatus.DISCONNECTED
    try {
      if (connectionStates.value instanceof Map) {
        currentStatus = connectionStates.value.get(connection.id) || ConnectionStatus.DISCONNECTED
      }
    } catch (error) {
      console.error('Failed to get connection status:', error)
    }

    if (currentStatus === ConnectionStatus.CONNECTED) {
      ElMessage.info('连接已建立')
      await getDatabaseList(connection.id)
      return
    }

    if (currentStatus === ConnectionStatus.CONNECTING) {
      ElMessage.info('正在连接中，请稍候...')
      return
    }

    setConnectionStatus(connection.id, ConnectionStatus.CONNECTING)
    try {
      const result = await testConnection(connection)
      if (result.success) {
        setConnectionStatus(connection.id, ConnectionStatus.CONNECTED)
        setActiveConnection(connection.id)
        ElMessage.success('连接成功')
        await getDatabaseList(connection.id)
      } else {
        setConnectionStatus(connection.id, ConnectionStatus.ERROR)
        ElMessage.error(`连接失败: ${result.error || '用户名或密码错误'}`)
      }
    } catch (error) {
      setConnectionStatus(connection.id, ConnectionStatus.ERROR)
      ElMessage.error('连接失败: ' + error)
    }
  }

  const handleSelectConnection = (key: string) => {
    setActiveConnection(key)
  }

  onMounted(() => {
    ensureConnectionStates()
  })

  return {
    connections,
    connectionStates,
    activeConnectionId,
    setActiveConnection,
    handleConnectAndLoadDatabases,
    handleSelectConnection,
    setConnectionStatus,
    testConnection,
    getDatabaseList
  }
}
