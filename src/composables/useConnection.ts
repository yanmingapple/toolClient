/**
 * 数据库连接管理组合式函数
 * 提供连接状态管理、连接测试、数据库列表获取等核心功能
 * 封装了与 connection store 的交互逻辑
 */
import { computed, watch, onMounted } from 'vue'
import { useConnectionStore } from '../stores/connection'
import type { ConnectionConfig } from '../types/leftTree/connection'
import { ConnectionStatus } from '../enum/database'
import { ensureConnectionStatesMap } from '../utils/connectionUtils'
import { ElMessage } from 'element-plus'

export const useConnection = () => {
  const connectionStore = useConnectionStore()

  /** 已保存的数据库连接配置列表 */
  const connections = computed(() => connectionStore.connections)

  /** 所有连接的状态映射，key 为连接 ID，value 为 ConnectionStatus */
  const connectionStates = computed(() => connectionStore.connectionStates)

  /** 当前激活的连接 ID，用于标识当前正在操作的连接 */
  const activeConnectionId = computed(() => connectionStore.activeConnectionId)

  /**
   * 设置当前激活的连接
   * @param id 连接 ID，设为 null 表示取消激活
   */
  const setActiveConnection = (id: string | null) => {
    connectionStore.setActiveConnection(id)
  }

  /**
   * 设置指定连接的状态
   * @param id 连接 ID
   * @param status 新的连接状态
   */
  const setConnectionStatus = (id: string, status: ConnectionStatus) => {
    connectionStore.setConnectionStatus(id, status)
  }

  /**
   * 测试数据库连接配置是否有效
   * @param config 连接配置信息
   * @returns 测试结果，包含 success 标识和可选的 error 错误信息
   */
  const testConnection = async (config: ConnectionConfig): Promise<{ success: boolean; error?: string }> => {
    return connectionStore.testConnection(config)
  }

  /**
   * 获取指定连接的数据库列表
   * @param connectionId 连接 ID
   * @returns 数据库对象数组
   */
  const getDatabaseList = async (connectionId: string) => {
    return connectionStore.getDatabaseList(connectionId)
  }

  /**
   * 确保所有连接都有正确的初始状态
   * 将处于 CONNECTING 状态或无状态的连接重置为 DISCONNECTED
   * @returns 是否有状态发生改变
   */
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

  /**
   * 连接数据库并加载数据库列表
   * 处理完整的连接流程：状态检查 → 连接测试 → 状态更新 → 加载数据库
   * @param connection 连接配置对象
   */
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

  /**
   * 处理连接选择事件
   * @param key 被选择的连接 ID
   */
  const handleSelectConnection = (key: string) => {
    setActiveConnection(key)
  }

  /**
   * 断开数据库连接
   * 将指定连接的状态设置为 DISCONNECTED，并清除当前激活的连接
   * @param connection 连接配置对象
   */
  const handleDisconnect = (connection: ConnectionConfig) => {
    setConnectionStatus(connection.id, ConnectionStatus.DISCONNECTED)
    if (activeConnectionId.value === connection.id) {
      setActiveConnection(null)
    }
    ElMessage.success('已断开连接')
  }

  const removeConnection = (id: string) => {
    connectionStore.removeConnection(id)
  }

  /**
   * 打开数据库连接
   * 如果连接未建立，则先建立连接；如果已连接，则刷新数据库列表
   * @param connection 连接配置对象
   */
  const openConnection = async (connection: ConnectionConfig) => {
    await handleConnectAndLoadDatabases(connection)
  }

  /**
   * 打开数据库（加载表列表）
   * @param connectionId 连接 ID
   * @param databaseName 数据库名称
   * @param databaseId 数据库 ID
   */
  const openDatabase = async (connectionId: string, databaseName: string, databaseId: string) => {
    try {
      await connectionStore.getTableList(connectionId, databaseName, databaseId)
    } catch (error) {
      console.error('Failed to open database:', error)
      ElMessage.error('打开数据库失败: ' + (error as Error).message)
    }
  }

  /** 组件挂载时确保所有连接状态正确初始化 */
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
    handleDisconnect,
    setConnectionStatus,
    testConnection,
    getDatabaseList,
    removeConnection,
    openConnection,
    openDatabase
  }
}
