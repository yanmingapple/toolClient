/**
 * 数据库连接状态管理 Store
 * 使用 Pinia 状态管理库实现
 * 负责管理所有数据库连接的配置、状态、数据等核心业务逻辑
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import CryptoJS from 'crypto-js'
import type { ConnectionConfig } from '../types/leftTree/connection'
import { ConnectionStatus, DatabaseStatus } from '../../electron/model/database'
import type { DatabaseObject } from '../types/leftTree/tree'
import { getSafeIpcRenderer } from '../utils/electronUtils'

/** 加密密钥，用于密码加密存储 */
const SECRET_KEY = 'dbmanager-pro-secret-key'
/** 本地存储键名，存储连接配置信息 */
const STORAGE_KEY = 'connection-storage'

/**
 * 使用 AES 算法加密密码
 * 将明文密码加密后存储到本地，提升安全性
 * @param password 明文密码
 * @returns 加密后的密码字符串
 */
const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
}

/**
 * 解密密码
 * 尝试解密存储的密码，如果解密失败则返回原密码
 * @param encryptedPassword 加密后的密码字符串
 * @returns 解密后的明文密码
 */
const decryptPassword = (encryptedPassword: string): string => {
  if (!encryptedPassword || typeof encryptedPassword !== 'string' || !encryptedPassword.startsWith('U2FsdGVkX1')) {
    return encryptedPassword
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || encryptedPassword
  } catch (error) {
    console.error('Password decryption failed:', error)
    return encryptedPassword
  }
}

/**
 * 从SQLite数据库加载持久化的连接状态
 * 尝试读取并解析SQLite数据库中的连接配置信息
 * @returns 包含连接配置的部分状态对象，如果加载失败则返回空对象
 */
const loadPersistedState = async (): Promise<Partial<{ connections: ConnectionConfig[] }>> => {
  try {
    const ipcRenderer = getSafeIpcRenderer()
    if (ipcRenderer) {
      const result = await ipcRenderer.invoke('get-connection-list')
      if (result.success && Array.isArray(result.data)) {
        return { connections: result.data }
      }
    }
  } catch (error) {
    console.error('Failed to load persisted state from SQLite:', error)
    // 如果SQLite加载失败，回退到localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.connections && Array.isArray(parsed.connections)) {
          return { connections: parsed.connections }
        }
      }
    } catch (localError) {
      console.error('Failed to load persisted state from localStorage:', localError)
    }
  }
  return {}
}

/**
 * 将连接配置保存到SQLite数据库
 * 持久化保存连接配置信息，以便下次打开应用时恢复
 * @param connections 连接配置数组
 */
const savePersistedState = async (connections: ConnectionConfig[]) => {
  try {
    const ipcRenderer = getSafeIpcRenderer()
    if (ipcRenderer) {
      await ipcRenderer.invoke('save-connection-list', connections)
      return
    }
  } catch (error) {
    console.error('Failed to save persisted state to SQLite:', error)
    // 如果SQLite保存失败，回退到localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ connections }))
    } catch (localError) {
      console.error('Failed to save persisted state to localStorage:', localError)
    }
  }
}

/**
 * 创建并导出连接状态管理 Store
 * 包含所有连接相关的状态变量和操作方法
 */
export const useConnectionStore = defineStore('connection', () => {
  /** 已保存的数据库连接配置列表 */
  const connections = ref<ConnectionConfig[]>([])

  /** 所有连接的状态映射，key 为连接 ID，value 为 ConnectionStatus */
  const connectionStates = ref<Map<string, ConnectionStatus>>(new Map())

  /** 当前激活的连接 ID，用于标识当前正在操作的连接 */
  const activeConnectionId = ref<string | null>(null)

  /** 所有数据库的状态映射，key 为数据库 ID，value 为 DatabaseStatus */
  const databaseStates = ref<Map<string, DatabaseStatus>>(new Map())

  /** 所有数据库对象映射，key 为数据库 ID，value 为 DatabaseObject */
  const databases = ref<Map<string, DatabaseObject>>(new Map())

  /** 所有表对象映射，key 为表 ID，value 为 DatabaseObject */
  const tables = ref<Map<string, DatabaseObject>>(new Map())

  /** 初始化连接数据，从SQLite数据库加载 */
  const initializeConnections = async () => {
    const persistedState = await loadPersistedState()
    if (persistedState.connections && Array.isArray(persistedState.connections)) {
      connections.value = persistedState.connections
      // 初始化连接状态
      const newStates = new Map(connectionStates.value)
      persistedState.connections.forEach(conn => {
        if (!newStates.has(conn.id)) {
          newStates.set(conn.id, ConnectionStatus.DISCONNECTED)
        }
      })
      connectionStates.value = newStates
    }
  }

  /** 监听连接配置变化，自动持久化保存到SQLite数据库 */
  watch(connections, (newConnections) => {
    savePersistedState(newConnections)
  }, { deep: true })

  /**
   * 计算属性：已建立的连接列表
   * 筛选出状态为 CONNECTED 的所有连接配置
   * @returns 已成功连接的配置数组
   */
  const connectedConnections = computed(() => {
    const result: ConnectionConfig[] = []
    connectionStates.value.forEach((status, id) => {
      if (status === ConnectionStatus.CONNECTED) {
        const conn = connections.value.find(c => c.id === id)
        if (conn) result.push(conn)
      }
    })
    return result
  })

  /**
   * 添加新的数据库连接配置
   * 自动生成唯一 ID，并对密码进行加密存储
   * @param config 连接配置（不包含 id）
   */
  const addConnection = (config: Omit<ConnectionConfig, 'id'>) => {
    const newConnection: ConnectionConfig = {
      ...config,
      id: `connection_${Date.now()}`,
      password: config.password ? encryptPassword(config.password) : '',
      sshPassword: config.sshPassword ? encryptPassword(config.sshPassword) : undefined,
      sshPassphrase: config.sshPassphrase ? encryptPassword(config.sshPassphrase) : undefined,
    }

    const newStates = new Map(connectionStates.value)
    newStates.set(newConnection.id, ConnectionStatus.DISCONNECTED)

    connections.value = [...connections.value, newConnection]
    connectionStates.value = newStates
  }

  /**
   * 更新指定连接的配置信息
   * 对更新的密码进行加密处理
   * @param id 要更新的连接 ID
   * @param config 新的配置信息（部分字段）
   */
  const updateConnection = (id: string, config: Partial<ConnectionConfig>) => {
    connections.value = connections.value.map((conn) => {
      if (conn.id === id) {
        return {
          ...conn,
          ...config,
          password: config.password ? encryptPassword(config.password) : conn.password,
          sshPassword: config.sshPassword ? encryptPassword(config.sshPassword) : conn.sshPassword,
          sshPassphrase: config.sshPassphrase ? encryptPassword(config.sshPassphrase) : conn.sshPassphrase,
        }
      }
      return conn
    })
  }

  /**
   * 删除指定连接及其关联数据
   * 同时删除该连接下的所有数据库和表数据
   * @param id 要删除的连接 ID
   */
  const removeConnection = (id: string) => {
    const newConnections = connections.value.filter((conn) => conn.id !== id)
    const newConnectionStates = new Map(connectionStates.value)
    newConnectionStates.delete(id)

    let newDatabases = new Map()
    for (const [key, obj] of databases.value.entries()) {
      if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
        newDatabases.set(key, obj)
      }
    }

    let newTables = new Map()
    for (const [key, obj] of tables.value.entries()) {
      if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
        newTables.set(key, obj)
      }
    }

    connections.value = newConnections
    connectionStates.value = newConnectionStates
    databases.value = newDatabases
    tables.value = newTables
    activeConnectionId.value = activeConnectionId.value === id ? null : activeConnectionId.value
  }

  const removeConnectionById = (id: string) => {
    const newConnections = connections.value.filter((conn) => conn.id !== id)
    const newConnectionStates = new Map(connectionStates.value)
    newConnectionStates.delete(id)

    connections.value = newConnections
    connectionStates.value = newConnectionStates
    if (activeConnectionId.value === id) {
      activeConnectionId.value = null
    }

    savePersistedState(newConnections)
  }

  /**
   * 解密连接配置中的密码字段
   * 将加密的密码转换为明文用于表单显示
   * @param connection 原始连接配置
   * @returns 解密后的连接配置
   */
  const decryptConnection = (connection: ConnectionConfig): ConnectionConfig => {
    return {
      ...connection,
      password: connection.password ? decryptPassword(connection.password) : '',
      sshPassword: connection.sshPassword ? decryptPassword(connection.sshPassword) : undefined,
      sshPassphrase: connection.sshPassphrase ? decryptPassword(connection.sshPassphrase) : undefined
    }
  }

  /**
   * 设置指定连接的状态
   * 当状态变为 DISCONNECTED 时，清除该连接下的数据库和表数据
   * @param id 连接 ID
   * @param status 新的连接状态
   */
  const setConnectionStatus = (id: string, status: ConnectionStatus) => {
    const currentStatus = connectionStates.value.get(id)
    if (currentStatus !== status) {
      const newStates = new Map(connectionStates.value)
      newStates.set(id, status)

      if (status === ConnectionStatus.DISCONNECTED) {
        let newDatabases = new Map()
        for (const [key, obj] of databases.value.entries()) {
          if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
            newDatabases.set(key, obj)
          }
        }

        let newTables = new Map()
        for (const [key, obj] of tables.value.entries()) {
          if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
            newTables.set(key, obj)
          }
        }

        connectionStates.value = newStates
        databases.value = newDatabases
        tables.value = newTables
      } else {
        connectionStates.value = newStates
      }
    }
  }

  /**
   * 设置当前激活的连接
   * @param id 连接 ID，设为 null 表示取消激活
   */
  const setActiveConnection = (id: string | null) => {
    activeConnectionId.value = id
  }

  /**
   * 测试数据库连接是否可用
   * 通过 IPC 调用主进程进行实际的连接测试
   * @param config 连接配置信息
   * @returns 测试结果，包含 success 标识和可选的 error 错误信息
   */
  const testConnection = async (config: ConnectionConfig): Promise<{ success: boolean; error?: string }> => {
    const ipcRenderer = getSafeIpcRenderer()
    if (!ipcRenderer) {
      console.error('ipcRenderer is not available')
      setConnectionStatus(config.id, ConnectionStatus.ERROR)
      return { success: false, error: 'IPC renderer not available' }
    }

    const isPasswordEncrypted = config.password && config.password.startsWith('U2FsdGVkX1')
    const isSshPasswordEncrypted = config.sshPassword && config.sshPassword.startsWith('U2FsdGVkX1')
    const isSshPassphraseEncrypted = config.sshPassphrase && config.sshPassphrase.startsWith('U2FsdGVkX1')

    const decryptedConfig = {
      ...config,
      password: isPasswordEncrypted ? decryptPassword(config.password) : config.password || '',
      sshPassword: config.sshPassword && isSshPasswordEncrypted ? decryptPassword(config.sshPassword) : config.sshPassword || undefined,
      sshPassphrase: config.sshPassphrase && isSshPassphraseEncrypted ? decryptPassword(config.sshPassphrase) : config.sshPassphrase || undefined,
    }

    setConnectionStatus(config.id, ConnectionStatus.CONNECTING)

    try {
      const result = await ipcRenderer.invoke('test-database-connection', decryptedConfig)

      if (result.success) {
        setConnectionStatus(config.id, ConnectionStatus.CONNECTED)
        return { success: true }
      } else {
        console.error('Connection test failed:', result.message)
        setConnectionStatus(config.id, ConnectionStatus.ERROR)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus(config.id, ConnectionStatus.ERROR)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 获取指定连接的数据库列表
   * 通过 IPC 调用主进程获取数据库列表
   * @param connectionId 连接 ID
   * @returns 数据库对象数组
   */
  const getDatabaseList = async (connectionId: string): Promise<DatabaseObject[]> => {
    const connection = connections.value.find(conn => conn.id === connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }

    const ipcRenderer = getSafeIpcRenderer()
    if (!ipcRenderer) {
      console.error('ipcRenderer is not available')
      return []
    }

    try {
      const isPasswordEncrypted = connection.password && connection.password.startsWith('U2FsdGVkX1')
      const decryptedConfig = {
        ...connection,
        password: isPasswordEncrypted ? decryptPassword(connection.password) : connection.password || '',
        id: connectionId
      }

      const result = await ipcRenderer.invoke('get-database-list', decryptedConfig)

      if (result.success) {
        const dbObjects = result.data as DatabaseObject[]
        addDatabaseObjects(dbObjects)

        dbObjects.forEach(database => {
          setDatabaseStatus(database.id, DatabaseStatus.DISCONNECTED)
        })
        return dbObjects
      } else {
        console.error('Failed to get database list:', result.message)
        return []
      }
    } catch (error) {
      console.error('Failed to get database list:', error)
      return []
    }
  }

  /**
   * 获取指定数据库的表列表
   * 通过 IPC 调用主进程获取表列表
   * @param connectionId 连接 ID
   * @param databaseName 数据库名称
   * @param databaseId 数据库 ID
   * @returns 表对象数组
   */
  const getTableList = async (connectionId: string, databaseName: string, databaseId: string): Promise<DatabaseObject[]> => {
    const connection = connections.value.find(conn => conn.id === connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }

    const ipcRenderer = getSafeIpcRenderer()
    if (!ipcRenderer) {
      console.error('ipcRenderer is not available')
      return []
    }

    try {
      setDatabaseStatus(databaseId, DatabaseStatus.LOADING)

      const isPasswordEncrypted = connection.password && connection.password.startsWith('U2FsdGVkX1')
      const decryptedConfig = {
        ...connection,
        password: isPasswordEncrypted ? decryptPassword(connection.password) : connection.password || '',
        databaseName,
        databaseId
      }

      const result = await ipcRenderer.invoke('get-table-list', decryptedConfig)

      if (result.success) {
        const tableObjects = result.data as DatabaseObject[]
        removeDatabaseObjectsByParentId(databaseId)
        addDatabaseObjects(tableObjects)
        setDatabaseStatus(databaseId, DatabaseStatus.LOADED)
        return tableObjects
      } else {
        console.error('Failed to get table list:', result.message)
        setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
        return []
      }
    } catch (error) {
      console.error('Failed to get table list:', error)
      setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
      return []
    }
  }

  /**
   * 添加单个数据库对象
   * 根据对象类型添加到对应的映射中
   * @param object 数据库对象（数据库或表）
   */
  const addDatabaseObject = (object: DatabaseObject) => {
    if (object.type === 'table') {
      const newTables = new Map(tables.value)
      newTables.set(object.id, object)
      tables.value = newTables
    } else {
      const newDatabases = new Map(databases.value)
      newDatabases.set(object.id, object)
      databases.value = newDatabases
    }
  }

  /**
   * 批量添加数据库对象
   * 分离数据库对象和表对象，分别添加到对应的映射中
   * @param objects 数据库对象数组
   */
  const addDatabaseObjects = (objects: DatabaseObject[]) => {
    if (objects.length === 0) return

    const tableObjects = objects.filter(obj => obj.type === 'table')
    const databaseObjects = objects.filter(obj => obj.type !== 'table')

    let newDatabases = new Map(databases.value)
    let newTables = new Map(tables.value)

    databaseObjects.forEach(obj => {
      newDatabases.set(obj.id, obj)
    })

    tableObjects.forEach(obj => {
      newTables.set(obj.id, obj)
    })

    databases.value = newDatabases
    tables.value = newTables
  }

  /**
   * 根据父节点 ID 删除所有关联的数据库对象
   * 用于断开连接时清理数据
   * @param parentId 父节点 ID
   */
  const removeDatabaseObjectsByParentId = (parentId: string) => {
    let newDatabases = new Map()
    for (const [key, obj] of databases.value.entries()) {
      if (obj.parentId !== parentId) {
        newDatabases.set(key, obj)
      }
    }

    let newTables = new Map()
    for (const [key, obj] of tables.value.entries()) {
      if (obj.parentId !== parentId) {
        newTables.set(key, obj)
      }
    }

    let newDatabaseStates = new Map()
    for (const [key, status] of databaseStates.value.entries()) {
      if (key !== parentId) {
        newDatabaseStates.set(key, status)
      }
    }

    databases.value = newDatabases
    tables.value = newTables
    databaseStates.value = newDatabaseStates
  }

  /**
   * 设置指定数据库的状态
   * @param databaseId 数据库 ID
   * @param status 新的数据库状态
   */
  const setDatabaseStatus = (databaseId: string, status: DatabaseStatus) => {
    const newStates = new Map(databaseStates.value)
    newStates.set(databaseId, status)
    databaseStates.value = newStates
  }

  const closeDatabase = (databaseId: string) => {
    let newTables = new Map()
    for (const [key, obj] of tables.value.entries()) {
      if (obj.parentId !== databaseId) {
        newTables.set(key, obj)
      }
    }

    let newDatabaseStates = new Map()
    for (const [key, status] of databaseStates.value.entries()) {
      if (key !== databaseId) {
        newDatabaseStates.set(key, status)
      }
    }

    tables.value = newTables
    databaseStates.value = newDatabaseStates
  }

  /**
   * 重置 Store 到初始状态
   * 清空所有连接、状态和数据
   */
  const $reset = () => {
    connections.value = []
    connectionStates.value = new Map()
    activeConnectionId.value = null
    databaseStates.value = new Map()
    databases.value = new Map()
    tables.value = new Map()
  }

  /**
   * Store 暴露的所有状态变量和方法
   */
  return {
    connections,
    connectionStates,
    activeConnectionId,
    databaseStates,
    databases,
    tables,
    connectedConnections,
    addConnection,
    updateConnection,
    removeConnection,
    decryptConnection,
    setConnectionStatus,
    setActiveConnection,
    testConnection,
    getDatabaseList,
    getTableList,
    addDatabaseObject,
    addDatabaseObjects,
    removeDatabaseObjectsByParentId,
    setDatabaseStatus,
    closeDatabase,
    initializeConnections,
    $reset
  }
})
