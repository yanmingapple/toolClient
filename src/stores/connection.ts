import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import CryptoJS from 'crypto-js'
import type { ConnectionConfig } from '../types/leftTree/connection'
import { ConnectionStatus, DatabaseStatus } from '../enum/database'
import type { DatabaseObject } from '../types/leftTree/tree'
import { getSafeIpcRenderer } from '../utils/electronUtils'

const SECRET_KEY = 'dbmanager-pro-secret-key'
const STORAGE_KEY = 'connection-storage'

const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
}

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

const loadPersistedState = (): Partial<{ connections: ConnectionConfig[] }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.connections && Array.isArray(parsed.connections)) {
        return { connections: parsed.connections }
      }
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error)
  }
  return {}
}

const savePersistedState = (connections: ConnectionConfig[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ connections }))
  } catch (error) {
    console.error('Failed to save persisted state:', error)
  }
}

export const useConnectionStore = defineStore('connection', () => {
  const persistedState = loadPersistedState()
  const connections = ref<ConnectionConfig[]>(persistedState.connections || [])
  const connectionStates = ref<Map<string, ConnectionStatus>>(new Map())
  const activeConnectionId = ref<string | null>(null)
  const databaseStates = ref<Map<string, DatabaseStatus>>(new Map())
  const databases = ref<Map<string, DatabaseObject>>(new Map())
  const tables = ref<Map<string, DatabaseObject>>(new Map())

  watch(connections, (newConnections) => {
    savePersistedState(newConnections)
  }, { deep: true })

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

  const setActiveConnection = (id: string | null) => {
    activeConnectionId.value = id
  }

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

  const setDatabaseStatus = (databaseId: string, status: DatabaseStatus) => {
    const newStates = new Map(databaseStates.value)
    newStates.set(databaseId, status)
    databaseStates.value = newStates
  }

  const $reset = () => {
    connections.value = []
    connectionStates.value = new Map()
    activeConnectionId.value = null
    databaseStates.value = new Map()
    databases.value = new Map()
    tables.value = new Map()
  }

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
    setConnectionStatus,
    setActiveConnection,
    testConnection,
    getDatabaseList,
    getTableList,
    addDatabaseObject,
    addDatabaseObjects,
    removeDatabaseObjectsByParentId,
    setDatabaseStatus,
    $reset
  }
})
