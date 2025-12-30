import { databaseManager } from '../manager/databaseMananger';
import { ConnectionConfig } from '../../src/types/leftTree/connection';
import { ConnectionType } from '../model/database';

/**
 * 数据库管理器使用示例
 * 演示如何使用 DatabaseManager 进行连接池管理和缓存操作
 */

// 示例配置
const mysqlConfig: ConnectionConfig = {
    id: 'mysql-1',
    name: '本地MySQL数据库',
    type: ConnectionType.MySQL,
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'test_db'
};

const sqliteConfig: ConnectionConfig = {
    id: 'sqlite-1',
    name: 'SQLite数据库文件',
    type: ConnectionType.SQLite,
    host: '',
    port: 0,
    username: '',
    password: '',
    database: './test.db'
};

async function demonstrateDatabaseManager() {
    try {
        console.log('=== 数据库管理器演示 ===\n');

        // 1. 获取连接
        console.log('1. 获取MySQL连接...');
        const mysqlClient = await databaseManager.getConnection(mysqlConfig);
        console.log('✓ MySQL连接获取成功');

        // 2. 执行查询（示例）
        console.log('\n2. 执行查询测试...');
        try {
            const version = await mysqlClient.getVersion();
            console.log(`✓ MySQL版本: ${version}`);
        } catch (error) {
            console.log(`! 查询失败: ${error}`);
        }

        // 3. 获取连接状态
        console.log('\n3. 检查连接状态...');
        const status = databaseManager.getConnectionStatus(mysqlConfig);
        console.log(`✓ 连接状态: ${status}`);

        // 4. 获取连接统计
        console.log('\n4. 连接统计信息:');
        const stats = databaseManager.getConnectionStats();
        console.log(JSON.stringify(stats, null, 2));

        // 5. 获取连接详情
        console.log('\n5. 连接使用详情:');
        const details = databaseManager.getConnectionDetails();
        console.log(JSON.stringify(details, null, 2));

        // 6. 释放连接（不关闭）
        console.log('\n6. 释放连接...');
        databaseManager.releaseConnection(mysqlConfig);
        console.log('✓ 连接已标记为已释放');

        // 7. 获取第二个连接（验证连接复用）
        console.log('\n7. 获取第二个MySQL连接...');
        void await databaseManager.getConnection(mysqlConfig);
        console.log('✓ 第二个连接获取成功（应该是复用之前的连接）');
        // 注意: 第二次调用应该复用之前的连接实例

        // 8. 配置管理器参数
        console.log('\n8. 配置管理器参数...');
        databaseManager.configure({
            healthCheckInterval: 60000, // 1分钟健康检查
            maxIdleTime: 600000, // 10分钟最大空闲时间
            pingInterval: 120000 // 2分钟ping间隔
        });
        console.log('✓ 参数配置完成');

        // 9. 测试连接健康状态
        console.log('\n9. 测试连接健康状态...');
        const isHealthy = await databaseManager.testConnectionHealth(mysqlConfig);
        console.log(`✓ 连接健康状态: ${isHealthy ? '健康' : '不健康'}`);

        // 10. 清理空闲连接
        console.log('\n10. 清理空闲连接...');
        const cleanedCount = await databaseManager.cleanupIdleConnections(1000); // 1秒空闲就清理
        console.log(`✓ 清理了 ${cleanedCount} 个空闲连接`);

        // 11. 强制重新连接
        console.log('\n11. 强制重新连接...');
        void await databaseManager.reconnect(mysqlConfig);
        console.log('✓ 强制重新连接完成');
        // 注意: 重新连接会创建一个新的客户端实例

        // 12. 添加SQLite连接（测试多数据库支持）
        console.log('\n12. 添加SQLite连接...');
        try {
            const sqliteClient = await databaseManager.getConnection(sqliteConfig);
            console.log('✓ SQLite连接获取成功');

            // SQLite特定操作
            try {
                const sqliteVersion = await sqliteClient.getVersion();
                console.log(`✓ SQLite版本: ${sqliteVersion}`);
            } catch (error) {
                console.log(`! SQLite查询失败: ${error}`);
            }
        } catch (error) {
            console.log(`! SQLite连接失败: ${error}`);
        }

        // 13. 最终统计
        console.log('\n13. 最终连接统计:');
        const finalStats = databaseManager.getConnectionStats();
        console.log(JSON.stringify(finalStats, null, 2));

        console.log('\n=== 演示完成 ===');

    } catch (error) {
        console.error('演示过程中发生错误:', error);
    }
}

/**
 * 错误处理示例
 */
async function errorHandlingExample() {
    console.log('\n=== 错误处理示例 ===');

    // 无效配置
    const invalidConfig: ConnectionConfig = {
        id: 'invalid-1',
        name: '无效连接',
        type: ConnectionType.MySQL,
        host: 'nonexistent-host',
        port: 3306,
        username: 'invalid',
        password: 'invalid',
        database: 'invalid'
    };

    try {
        console.log('尝试连接不存在的服务器...');
        void await databaseManager.getConnection(invalidConfig);
        console.log('不应该到达这里');
        // 此处故意尝试连接不存在的服务器来演示错误处理
    } catch (error) {
        console.log(`✓ 正确捕获错误: ${error}`);
    }

    // 检查错误后的状态
    const status = databaseManager.getConnectionStatus(invalidConfig);
    console.log(`✓ 错误连接状态: ${status}`);
}

/**
 * 性能测试示例
 */
async function performanceTest() {
    console.log('\n=== 性能测试示例 ===');

    const configs = [
        { ...mysqlConfig, id: 'perf-test-1' },
        { ...mysqlConfig, id: 'perf-test-2' },
        { ...mysqlConfig, id: 'perf-test-3' }
    ];

    // 并发获取连接
    console.log('并发获取3个连接...');
    const startTime = Date.now();

    void await Promise.all(
        configs.map(config => databaseManager.getConnection(config))
    );
    // 并发获取3个连接，测试数据库管理器的并发处理能力

    const endTime = Date.now();
    console.log(`✓ 并发连接耗时: ${endTime - startTime}ms`);

    // 检查连接复用
    const stats = databaseManager.getConnectionStats();
    console.log(`✓ 当前总连接数: ${stats.total}`);
    console.log(`✓ 已连接数: ${stats.connected}`);

    // 清理
    console.log('清理测试连接...');
    for (const config of configs) {
        await databaseManager.removeConnection(config);
    }
    console.log('✓ 清理完成');
}

/**
 * 优雅关闭示例
 */
async function gracefulShutdown() {
    console.log('\n=== 优雅关闭示例 ===');

    console.log('正在关闭所有连接...');
    await databaseManager.shutdown();
    console.log('✓ 所有连接已优雅关闭');

    // 验证所有连接已关闭
    const stats = databaseManager.getConnectionStats();
    console.log(`✓ 关闭后连接数: ${stats.total}`);
}

// 主函数
async function main() {
    try {
        await demonstrateDatabaseManager();
        await errorHandlingExample();
        await performanceTest();
        await gracefulShutdown();
    } catch (error) {
        console.error('主函数执行错误:', error);
    }
}

// 导出函数供外部调用
export {
    demonstrateDatabaseManager,
    errorHandlingExample,
    performanceTest,
    gracefulShutdown,
    main
};

// 如果直接运行此文件，则执行演示
if (require.main === module) {
    main().then(() => {
        console.log('\n所有演示完成！');
        process.exit(0);
    }).catch(error => {
        console.error('演示失败:', error);
        process.exit(1);
    });
}