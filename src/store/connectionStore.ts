import { create } from 'zustand'
import { persist, StorageValue } from 'zustand/middleware'
import { ConnectionConfig, ConnectionStatus, DatabaseType } from '../types/connection'
import CryptoJS from 'crypto-js'

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
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
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
          password: encryptPassword(config.password),
          sshPassword: config.sshPassword ? encryptPassword(config.sshPassword) : undefined,
          sshPassphrase: config.sshPassphrase ? encryptPassword(config.sshPassphrase) : undefined,
        }
        set((state) => ({
          connections: [...state.connections, newConnection],
          connectionStates: new Map(state.connectionStates).set(newConnection.id, ConnectionStatus.DISCONNECTED),
        }))
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
          const newConnectionStates = new Map(state.connectionStates)
          newConnectionStates.delete(id)
          
          return {
            connections: newConnections,
            connectionStates: newConnectionStates,
            activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
          }
        })
      },

      setConnectionStatus: (id, status) => {
        set((state) => ({
          connectionStates: new Map(state.connectionStates).set(id, status),
        }))
      },

      setActiveConnection: (id) => {
        set({ activeConnectionId: id })
      },

      testConnection: async (config) => {
        try {
          const decryptedConfig = {
            ...config,
            password: decryptPassword(config.password),
            sshPassword: config.sshPassword ? decryptPassword(config.sshPassword) : undefined,
            sshPassphrase: config.sshPassphrase ? decryptPassword(config.sshPassphrase) : undefined,
          }

          get().setConnectionStatus(config.id, ConnectionStatus.CONNECTING)

          // 根据数据库类型创建测试连接
          switch (config.type) {
            case DatabaseType.MYSQL:
              const mysql2 = await import('mysql2/promise')
              const mysqlConn = await mysql2.createConnection({
                host: decryptedConfig.host,
                port: decryptedConfig.port,
                user: decryptedConfig.username,
                password: decryptedConfig.password,
                database: decryptedConfig.database,
                ssl: decryptedConfig.ssl ? { rejectUnauthorized: true } : undefined
              })
              await mysqlConn.end()
              break
            case DatabaseType.POSTGRESQL:
              const pg = await import('pg')
              const pgClient = new pg.Client(decryptedConfig)
              await pgClient.connect()
              await pgClient.end()
              break
            case DatabaseType.MONGODB:
              const mongodb = await import('mongodb')
              const mongoConnectionString = `mongodb://${decryptedConfig.username}:${decryptedConfig.password}@${decryptedConfig.host}:${decryptedConfig.port}`
              const mongoClient = new mongodb.MongoClient(mongoConnectionString, {
                authSource: 'admin'
              })
              await mongoClient.connect()
              await mongoClient.close()
              break
            case DatabaseType.REDIS:
              const RedisModule = await import('ioredis')
              const Redis = RedisModule.default
              const redis = new Redis({
                host: decryptedConfig.host,
                port: decryptedConfig.port,
                password: decryptedConfig.password,
              })
              await redis.ping()
              await redis.quit()
              break
            case DatabaseType.SQLSERVER:
              const tedious = await import('tedious')
              const sqlConfig = {
                server: decryptedConfig.host,
                port: decryptedConfig.port,
                authentication: {
                  type: 'default',
                  options: {
                    userName: decryptedConfig.username,
                    password: decryptedConfig.password,
                  },
                },
                options: {
                  database: decryptedConfig.database,
                  encrypt: decryptedConfig.ssl,
                },
              }
              await new Promise((resolve, reject) => {
                const connection = new tedious.Connection(sqlConfig)
                connection.on('connect', (error) => {
                  if (error) reject(error)
                  else resolve(true)
                })
                connection.on('error', reject)
              })
              break
            case DatabaseType.SQLITE:
              const sqlite3 = await import('sqlite3')
              await new Promise((resolve, reject) => {
                const db = new sqlite3.Database(decryptedConfig.host, (err) => {
                  if (err) reject(err)
                  else resolve(true)
                })
                db.close()
              })
              break
          }

          get().setConnectionStatus(config.id, ConnectionStatus.CONNECTED)
          return true
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