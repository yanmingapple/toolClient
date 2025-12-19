import { handleDatabaseConnection } from './electron-main'

// 测试MySQL连接
const testMySQLConnection = async () => {
  console.log('Testing MySQL connection...')
  try {
    const result = await handleDatabaseConnection(null, {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      ssl: false
    })
    console.log('MySQL connection test result:', result)
  } catch (error) {
    console.error('MySQL connection test failed:', error)
  }
}

// 运行测试
testMySQLConnection()
