import { create } from 'zustand'
import { persist, StorageValue } from 'zustand/middleware'
import { ConnectionConfig, ConnectionStatus } from '../types/connection'
import CryptoJS from 'crypto-js'

// 在 Vite + Electron 环境中，直接使用 electron 模块
let ipcRenderer: any = null
if (typeof window !== 'undefined' && (window as any).require) {
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
  
  // Actions
  addConnection: (config: Omit<ConnectionConfig, 'id'>) => void
  updateConnection: (id: string, config: Partial<ConnectionConfig>) => void
  removeConnection: (id: string) => void
  setConnectionStatus: (id: string, status: ConnectionStatus) => void
  setActiveConnection: (id: string | null) => void
  testConnection: (config: ConnectionConfig) => Promise<boolean>
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
          
          return {
            connections: newConnections,
            connectionStates: newConnectionStates,
            activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
          }
        })
      },

      setConnectionStatus: (id, status) => {
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
          
          newMap.set(id, status)
          
          return {
            connectionStates: newMap
          }
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
        })
      },
      deserialize: (str) => {
        const state = JSON.parse(str)
        return {
          ...state,
          connectionStates: new Map(state.connectionStates),
        }
      },
    }
  )
)