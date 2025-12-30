import { ConnectionConfig } from '../types/leftTree/connection';
import { ConnectionType } from '../enum/database';
import { createDatabaseClient } from './index';

/**
 * 测试SQLite客户端功能
 */
async function testSQLiteClient() {
  // 创建SQLite连接配置
  const config: ConnectionConfig = {
    id: 'test-sqlite',
    name: 'Test SQLite Connection',
    type: ConnectionType.SQLite,
    host: '', // SQLite不需要主机
    port: 0, // SQLite不需要端口
    username: '', // SQLite不需要用户名
    password: '', // SQLite不需要密码
    database: ':memory:' // 使用内存数据库进行测试
  };

  try {
    // 创建数据库客户端
    const client = createDatabaseClient(config);
    
    console.log('SQLite客户端创建成功');
    
    // 连接到数据库
    await client.connect();
    console.log('成功连接到SQLite数据库');
    
    // 测试ping
    const isAlive = await client.ping();
    console.log('Ping测试结果:', isAlive);
    
    // 获取数据库版本
    const version = await client.getVersion();
    console.log('SQLite版本:', version);
    
    // 创建测试表
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      )
    `);
    console.log('成功创建users表');
    
    // 插入测试数据
    await client.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Test User', 'test@example.com']
    );
    console.log('成功插入测试数据');
    
    // 查询数据
    const result = await client.execute('SELECT * FROM users');
    console.log('查询结果:', result);
    
    // 断开连接
    await client.disconnect();
    console.log('成功断开SQLite数据库连接');
    
    console.log('所有测试通过!');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 执行测试
testSQLiteClient();
