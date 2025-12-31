// 前端数据库保存功能测试脚本
const { databaseManager } = require('./dist/electron/manager/databaseMananger');

async function testFrontendDatabaseSave() {
    try {
        console.log('Starting frontend database save test...');
        
        // 初始化数据库管理器
        await databaseManager.initialize();
        console.log('DatabaseManager initialized successfully');
        
        // 创建测试连接数据 - 这些连接数据模拟前端保存的数据
        const testConnections = [
            {
                id: 'frontend-test-1',
                name: '前端测试MySQL连接',
                type: 'mysql',
                host: '192.168.1.100',
                port: 3306,
                username: 'frontend_user',
                password: 'U2FsdGVkX1+encrypted_password_here', // 模拟加密后的密码
                database: 'frontend_test_db',
                charset: 'utf8mb4',
                ssl: false,
                sshHost: '',
                sshPort: 22,
                sshUsername: '',
                sshPassword: ''
            },
            {
                id: 'frontend-test-2',
                name: '前端测试PostgreSQL连接',
                type: 'postgresql',
                host: '192.168.1.200',
                port: 5432,
                username: 'pg_user',
                password: 'U2FsdGVkX1+encrypted_pg_password_here', // 模拟加密后的密码
                database: 'frontend_pg_db',
                charset: 'utf8',
                ssl: false,
                sshHost: '',
                sshPort: 22,
                sshUsername: '',
                sshPassword: ''
            }
        ];
        
        console.log('Saving test connections (simulating frontend save):', testConnections.length);
        console.log('Test connections:', testConnections);
        
        // 保存连接
        await databaseManager.saveConnections(testConnections);
        console.log('✅ Connections saved successfully from frontend test');
        
        // 验证数据库中的数据
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./database/dbmanager.db');
        
        db.all('SELECT * FROM connections ORDER BY id', [], (err, rows) => {
            if (err) {
                console.error('❌ Database query error:', err);
            } else {
                console.log('✅ Database now contains', rows.length, 'connections');
                rows.forEach((row, index) => {
                    console.log(`Connection ${index + 1}:`, {
                        id: row.id,
                        name: row.name,
                        type: row.type,
                        host: row.host,
                        port: row.port,
                        username: row.username
                    });
                });
                
                // 验证测试连接是否正确保存
                const frontendConnections = rows.filter(row => 
                    row.id === 'frontend-test-1' || row.id === 'frontend-test-2'
                );
                
                if (frontendConnections.length === 2) {
                    console.log('✅ Frontend test connections saved correctly!');
                    console.log('✅ 数据库保存功能修复成功！');
                } else {
                    console.log('❌ Frontend test connections not found in database');
                }
            }
            db.close();
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// 延迟启动以确保数据库管理器完全初始化
setTimeout(testFrontendDatabaseSave, 2000);