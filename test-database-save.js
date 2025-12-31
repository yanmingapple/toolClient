const { databaseManager } = require('./dist/electron/manager/databaseMananger');

async function testDatabaseSave() {
    try {
        console.log('Starting database save test...');
        
        // 初始化数据库管理器
        await databaseManager.initialize();
        console.log('DatabaseManager initialized successfully');
        
        // 创建测试连接数据
        const testConnections = [
            {
                id: 'test-conn-1',
                name: 'Test MySQL Connection',
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'test',
                password: 'test123',
                database: 'test_db'
            },
            {
                id: 'test-conn-2',
                name: 'Test PostgreSQL Connection',
                type: 'postgresql',
                host: 'localhost',
                port: 5432,
                username: 'test',
                password: 'test123',
                database: 'test_db'
            }
        ];
        
        console.log('Saving test connections:', testConnections.length);
        
        // 保存连接
        await databaseManager.saveConnections(testConnections);
        console.log('Connections saved successfully');
        
        // 获取所有连接
        const allConnections = await databaseManager.getConnectionList();
        console.log('Retrieved connections:', allConnections.length);
        console.log('Retrieved connections:', allConnections);
        
        // 验证数据库中的数据
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./database/dbmanager.db');
        
        db.all('SELECT * FROM connections', [], (err, rows) => {
            if (err) {
                console.error('Database query error:', err);
            } else {
                console.log('Database contains', rows.length, 'connections');
                console.log('Database content:', rows);
            }
            db.close();
        });
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testDatabaseSave();