import { create } from 'zustand'
import { persist, StorageValue } from 'zustand/middleware'
import { ConnectionConfig, ConnectionStatus, DatabaseStatus } from '../types/connection'
import { DatabaseObject } from '../types/tree'
import CryptoJS from 'crypto-js'

// 在 Vite + Electron 环境中，安全地加载 electron 模块
let ipcRenderer: any = null
if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
  try {
    const electron = (window as any).require('electron')
    ipcRenderer = electron.ipcRenderer
  } catch (error) {
    console.error('Failed to load electron.ipcRenderer:', error)
  }
}

const SECRET_KEY = 'dbmanager-pro-secret-key' // 实际应用中应该从环境变量获取

interface ConnectionStore {
  connections: ConnectionConfig[]
  connectionStates: Map<string, ConnectionStatus>
  activeConnectionId: string | null
  databaseObjects: Map<string, DatabaseObject>
  databaseStates: Map<string, DatabaseStatus>
  
  // Actions
  addConnection: (config: Omit<ConnectionConfig, 'id'>) => void
  updateConnection: (id: string, config: Partial<ConnectionConfig>) => void
  removeConnection: (id: string) => void
  setConnectionStatus: (id: string, status: ConnectionStatus) => void
  setActiveConnection: (id: string | null) => void
  testConnection: (config: ConnectionConfig) => Promise<boolean>
  getDatabaseList: (connectionId: string) => Promise<DatabaseObject[]>
  getTableList: (connectionId: string, databaseName: string, databaseId: string) => Promise<DatabaseObject[]>
  addDatabaseObject: (object: DatabaseObject) => void
  addDatabaseObjects: (objects: DatabaseObject[]) => void
  removeDatabaseObjectsByParentId: (parentId: string) => void
  setDatabaseStatus: (databaseId: string, status: DatabaseStatus) => void
}

// 加密密码
const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
}

// 解密密码
const decryptPassword = (encryptedPassword: string): string => {
  // 首先检查是否是有效的 CryptoJS AES 加密格式
  if (!encryptedPassword || typeof encryptedPassword !== 'string' || !encryptedPassword.startsWith('U2FsdGVkX1')) {
    return encryptedPassword
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    // 如果解密结果为空字符串，可能是解密失败，返回原始密码
    return decrypted || encryptedPassword
  } catch (error) {
    // 如果解密失败，返回原始密码
    console.error('Password decryption failed:', error)
    return encryptedPassword
  }
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connections: [],
      connectionStates: new Map(),
      activeConnectionId: null,
      databaseObjects: new Map(),
      databaseStates: new Map(),

      addConnection: (config) => {
        const newConnection: ConnectionConfig = {
          ...config,
          id: `connection_${Date.now()}`,
          password: config.password ? encryptPassword(config.password) : '',
          sshPassword: config.sshPassword ? encryptPassword(config.sshPassword) : undefined,
          sshPassphrase: config.sshPassphrase ? encryptPassword(config.sshPassphrase) : undefined,
        }
        set((state) => {
          const currentStates = state.connectionStates
          let newMap
          
          if (currentStates instanceof Map) {
            newMap = new Map(currentStates)
          } else if (Array.isArray(currentStates)) {
            newMap = new Map(currentStates)
          } else {
            newMap = new Map()
          }
          
          newMap.set(newConnection.id, ConnectionStatus.DISCONNECTED)
          
          return {
            connections: [...state.connections, newConnection],
            connectionStates: newMap
          }
        })
      },

      updateConnection: (id, config) => {
        set((state) => ({
          connections: state.connections.map((conn) => {
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
          }),
        }))
      },

      removeConnection: (id) => {
        set((state) => {
          const newConnections = state.connections.filter((conn) => conn.id !== id)
          const currentStates = state.connectionStates
          let newConnectionStates
          
          if (currentStates instanceof Map) {
            newConnectionStates = new Map(currentStates)
          } else if (Array.isArray(currentStates)) {
            newConnectionStates = new Map(currentStates)
          } else {
            newConnectionStates = new Map()
          }
          
          newConnectionStates.delete(id)
          
          // 删除该连接下的所有数据库对象
          const currentDatabaseObjects = state.databaseObjects
          let newDatabaseObjects = new Map()
          if (currentDatabaseObjects instanceof Map) {
            for (const [key, obj] of currentDatabaseObjects.entries()) {
              if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
                newDatabaseObjects.set(key, obj)
              }
            }
          }
          
          return {
            connections: newConnections,
            connectionStates: newConnectionStates,
            databaseObjects: newDatabaseObjects,
            activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
          }
        })
      },
      
      // 获取数据库列表
      getDatabaseList: async (connectionId: string): Promise<DatabaseObject[]> => {
        const store = get()
        const connection = store.connections.find(conn => conn.id === connectionId)
        
        if (!connection) {
          throw new Error('Connection not found')
        }
        
        // 检查 ipcRenderer 是否可用
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
            const databases = result.data as DatabaseObject[]
            store.addDatabaseObjects(databases)
            
            // 设置每个数据库的状态为LOADED或EMPTY
            databases.forEach(database => {
              // 这里暂时设置为LOADED，实际应该根据数据库是否有表来决定
              // 但由于此时还没有获取表列表，所以先设置为LOADED
              store.setDatabaseStatus(database.id, DatabaseStatus.DISCONNECTED)
            })
            
            return databases
          } else {
            console.error('Failed to get database list:', result.message)
            return []
          }
        } catch (error) {
          console.error('Failed to get database list:', error)
          return []
        }
      },
      
      // 获取表列表
      getTableList: async (connectionId: string, databaseName: string, databaseId: string): Promise<DatabaseObject[]> => {
        const store = get()
        const connection = store.connections.find(conn => conn.id === connectionId)
        
        if (!connection) {
          throw new Error('Connection not found')
        }
        
        // 检查 ipcRenderer 是否可用
        if (!ipcRenderer) {
          console.error('ipcRenderer is not available')
          return []
        }
        
        try {
          // 设置数据库状态为加载中
          store.setDatabaseStatus(databaseId, DatabaseStatus.LOADING)
          
          const isPasswordEncrypted = connection.password && connection.password.startsWith('U2FsdGVkX1')
          const decryptedConfig = {
            ...connection,
            password: isPasswordEncrypted ? decryptPassword(connection.password) : connection.password || '',
            databaseName,
            databaseId
          }
          
          const result = await ipcRenderer.invoke('get-table-list', decryptedConfig)
          
          if (result.success) {
            const tables = result.data as DatabaseObject[]
            // 先删除该数据库下的所有表（如果有）
            store.removeDatabaseObjectsByParentId(databaseId)
            // 再添加新的表
            store.addDatabaseObjects(tables)
            
            // 设置数据库状态为已加载或空
            store.setDatabaseStatus(databaseId,  DatabaseStatus.LOADED)
            return tables
          } else {
            console.error('Failed to get table list:', result.message)
            // 设置数据库状态为错误
            store.setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
            return []
          }
        } catch (error) {
          console.error('Failed to get table list:', error)
          // 设置数据库状态为错误
          store.setDatabaseStatus(databaseId, DatabaseStatus.ERROR)
          return []
        }
      },
      
      // 添加单个数据库对象
      addDatabaseObject: (object: DatabaseObject) => {
        set((state) => {
          const currentDatabaseObjects = state.databaseObjects
          let newDatabaseObjects = new Map()
          
          if (currentDatabaseObjects instanceof Map) {
            newDatabaseObjects = new Map(currentDatabaseObjects)
          }
          
          newDatabaseObjects.set(object.id, object)
          
          return {
            databaseObjects: newDatabaseObjects
          }
        })
      },
      
      // 批量添加数据库对象
      addDatabaseObjects: (objects: DatabaseObject[]) => {
        set((state) => {
          if (objects.length === 0) return state;
          
          const currentDatabaseObjects = state.databaseObjects
          if (!(currentDatabaseObjects instanceof Map)) {
            return {
              databaseObjects: new Map(objects.map(obj => [obj.id, obj]))
            }
          }
          
          // 检查是否需要更新
          let needsUpdate = false
          const newMap = new Map(currentDatabaseObjects)
          
          objects.forEach(obj => {
            if (!newMap.has(obj.id) || JSON.stringify(newMap.get(obj.id)) !== JSON.stringify(obj)) {
              newMap.set(obj.id, obj)
              needsUpdate = true
            }
          })
          
          if (!needsUpdate) return state;
          
          return {
            databaseObjects: newMap
          }
        })
      },
      
      // 删除指定父ID下的所有数据库对象
      removeDatabaseObjectsByParentId: (parentId: string) => {
        set((state) => {
          const currentDatabaseObjects = state.databaseObjects
          let newDatabaseObjects = new Map()
          
          if (currentDatabaseObjects instanceof Map) {
            for (const [key, obj] of currentDatabaseObjects.entries()) {
              if (obj.parentId !== parentId) {
                newDatabaseObjects.set(key, obj)
              }
            }
          }
          
          // 同时清理相关的数据库状态
          const currentDatabaseStates = state.databaseStates
          let newDatabaseStates = new Map()
          
          if (currentDatabaseStates instanceof Map) {
            for (const [key, status] of currentDatabaseStates.entries()) {
              if (key !== parentId) {
                newDatabaseStates.set(key, status)
              }
            }
          }
          
          return {
            databaseObjects: newDatabaseObjects,
            databaseStates: newDatabaseStates
          }
        })
      },

      setDatabaseStatus: (databaseId: string, status: DatabaseStatus) => {
        set((state) => {
          const currentStates = state.databaseStates
          let newMap
          
          // 获取当前状态
          if (currentStates instanceof Map) {
            newMap = new Map(currentStates)
          } else if (Array.isArray(currentStates)) {
            newMap = new Map(currentStates)
          } else {
            newMap = new Map()
          }
          
          newMap.set(databaseId, status)
          
          return {
            databaseStates: newMap
          }
        })
      },

      setConnectionStatus: (id, status) => {
        set((state) => {
          const currentStates = state.connectionStates
          let newMap
          let currentStatus = null
          
          // 获取当前状态
          if (currentStates instanceof Map) {
            currentStatus = currentStates.get(id)
            newMap = new Map(currentStates)
          } else if (Array.isArray(currentStates)) {
            const arrayStates = currentStates as Array<[string, ConnectionStatus]>
            const found = arrayStates.find(([key]) => key === id)
            currentStatus = found ? found[1] : null
            newMap = new Map(arrayStates)
          } else {
            newMap = new Map()
          }
          
          // 只有当状态真正变化时才更新
          if (currentStatus !== status) {
            newMap.set(id, status)
            
            // 如果状态变为DISCONNECTED，清理相关的数据库对象
            if (status === ConnectionStatus.DISCONNECTED) {
              const currentDatabaseObjects = state.databaseObjects
              let newDatabaseObjects = new Map()
              
              if (currentDatabaseObjects instanceof Map) {
                for (const [key, obj] of currentDatabaseObjects.entries()) {
                  if (obj.parentId !== id && !obj.id.startsWith(`db_${id}`)) {
                    newDatabaseObjects.set(key, obj)
                  }
                }
              }
              
              return {
                connectionStates: newMap,
                databaseObjects: newDatabaseObjects
              }
            }
            
            return {
              connectionStates: newMap
            }
          }
          
          // 状态没有变化，不更新
          return state
        })
      },

      setActiveConnection: (id) => {
        set({ activeConnectionId: id })
      },

      testConnection: async (config) => {
        try {
          // 检查 ipcRenderer 是否可用
          if (!ipcRenderer) {
            console.error('ipcRenderer is not available. Make sure the app is running in Electron environment.')
            get().setConnectionStatus(config.id, ConnectionStatus.ERROR)
            return false
          }
          
          // 在测试连接时，密码可能是用户刚刚输入的未加密密码
          // 只有在密码以 AES 加密格式开头且不为空时才尝试解密
          // AES 加密后的字符串通常以 U2FsdGVkX1 开头（CryptoJS 的默认格式）
          const isPasswordEncrypted = config.password && config.password.startsWith('U2FsdGVkX1')
          const isSshPasswordEncrypted = config.sshPassword && config.sshPassword.startsWith('U2FsdGVkX1')
          const isSshPassphraseEncrypted = config.sshPassphrase && config.sshPassphrase.startsWith('U2FsdGVkX1')
          
          const decryptedConfig = {
            ...config,
            password: isPasswordEncrypted ? decryptPassword(config.password) : config.password || '',
            sshPassword: config.sshPassword && isSshPasswordEncrypted ? decryptPassword(config.sshPassword) : config.sshPassword || undefined,
            sshPassphrase: config.sshPassphrase && isSshPassphraseEncrypted ? decryptPassword(config.sshPassphrase) : config.sshPassphrase || undefined,
          }

          get().setConnectionStatus(config.id, ConnectionStatus.CONNECTING)

          // 通过IPC调用主进程测试连接
          const result = await ipcRenderer.invoke('test-database-connection', decryptedConfig)

          if (result.success) {
            get().setConnectionStatus(config.id, ConnectionStatus.CONNECTED)
            return true
          } else {
            console.error('Connection test failed:', result.message)
            get().setConnectionStatus(config.id, ConnectionStatus.ERROR)
            return false
          }
        } catch (error) {
          console.error('Connection test failed:', error)
          get().setConnectionStatus(config.id, ConnectionStatus.ERROR)
          return false
        }
      },
    }),
    {
      name: 'connection-storage',
      serialize: (state: StorageValue<ConnectionStore>) => {
        const connectionStoreState = state as unknown as ConnectionStore;
        return JSON.stringify({
          ...connectionStoreState,
          connectionStates: Array.from(connectionStoreState.connectionStates?.entries() || []),
          databaseObjects: Array.from(connectionStoreState.databaseObjects?.entries() || []),
          databaseStates: Array.from(connectionStoreState.databaseStates?.entries() || []),
        })
      },
      deserialize: (str) => {
        const state = JSON.parse(str)
        // 确保connectionStates是可迭代的
        let connectionStates = new Map()
        try {
          if (Array.isArray(state.connectionStates)) {
            connectionStates = new Map(state.connectionStates)
          } else if (state.connectionStates && typeof state.connectionStates === 'object') {
            // 如果是普通对象，尝试转换为Map
            connectionStates = new Map(Object.entries(state.connectionStates))
          }
        } catch (error) {
          console.error('Failed to deserialize connectionStates:', error)
          connectionStates = new Map()
        }
        
        // 确保databaseObjects是可迭代的
        let databaseObjects = new Map()
        try {
          if (Array.isArray(state.databaseObjects)) {
            databaseObjects = new Map(state.databaseObjects)
          } else if (state.databaseObjects && typeof state.databaseObjects === 'object') {
            // 如果是普通对象，尝试转换为Map
            databaseObjects = new Map(Object.entries(state.databaseObjects))
          }
        } catch (error) {
          console.error('Failed to deserialize databaseObjects:', error)
          databaseObjects = new Map()
        }
        
        // 确保databaseStates是可迭代的
        let databaseStates = new Map()
        try {
          if (Array.isArray(state.databaseStates)) {
            databaseStates = new Map(state.databaseStates)
          } else if (state.databaseStates && typeof state.databaseStates === 'object') {
            // 如果是普通对象，尝试转换为Map
            databaseStates = new Map(Object.entries(state.databaseStates))
          }
        } catch (error) {
          console.error('Failed to deserialize databaseStates:', error)
          databaseStates = new Map()
        }
        
        return {
          ...state,
          connectionStates,
          databaseObjects,
          databaseStates,
        }
      },
    }
  )
)