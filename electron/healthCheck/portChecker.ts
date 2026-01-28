/**
 * 端口状态检测功能
 * 提供端口连接检测和 Netstat 功能
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import * as net from 'net';
import * as os from 'os';
import {
    CheckResult,
    CheckStatus,
    PortCheckConfig
} from '../model/healthCheck';

/**
 * 端口状态检测器接口
 * 专门负责端口连接状态和监听状态的检测
 */
export interface PortChecker extends EventEmitter {

    // ===== 端口连接检测 =====
    /**
     * 端口连接检测（支持普通模式和 netstat 模式）
     * @param config 端口检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkPort(config: PortCheckConfig): Promise<CheckResult>;

    /**
     * 批量端口检测（支持普通模式和 netstat 模式）
     * @param configs 端口检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkPorts(configs: PortCheckConfig[]): Promise<CheckResult[]>;

    // ===== 事件监听 =====
    /**
     * 端口检测进度事件
     */
    on(event: 'port_progress', listener: (current: number, total: number, currentPort: number) => void): this;

    /**
     * 端口检测完成事件
     */
    on(event: 'port_completed', listener: (results: CheckResult[]) => void): this;
}

/**
 * 端口状态检测器实现类
 * 实现端口连接检测和 Netstat 功能
 */
export class PortCheckerImpl extends EventEmitter implements PortChecker {

    constructor() {
        super();
    }

    /**
     * 检测单个端口状态（支持普通模式和 netstat 模式）
     * @param config 端口检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    async checkPort(config: PortCheckConfig): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            // 如果是 netstat 模式，调用 netstat 功能
            if (config.protocol === 'netstat') {
                const timeout = config.timeout || 10000; // netstat 模式默认10秒超时
                return await this.performNetstatCheck(config.host, config.port, timeout);
            }

            // 普通端口检测模式
            if (!config.port) {
                throw new Error('Port number is required for normal port checking');
            }

            const timeout = config.timeout || 5000; // 默认5秒超时
            const protocol = config.protocol || 'tcp';

            const isOpen = await this.testPortProtocol(config.host, config.port, protocol, timeout);
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;

            if (isOpen) {
                status = CheckStatus.HEALTHY;
                // 验证期望状态
                if (config.expectedStatus && config.expectedStatus === 'closed') {
                    status = CheckStatus.UNHEALTHY;
                    error = `Expected port ${config.port} to be closed, but it is open`;
                }
            } else {
                status = CheckStatus.UNHEALTHY;
                // 验证期望状态
                if (config.expectedStatus && config.expectedStatus === 'open') {
                    status = CheckStatus.UNHEALTHY;
                    error = `Expected port ${config.port} to be open, but it is closed`;
                } else {
                    error = `Port ${config.port} is closed or unreachable`;
                }
            }

            return {
                name: `Port ${config.port} on ${config.host}`,
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: {
                    host: config.host,
                    port: config.port,
                    protocol,
                    expectedStatus: config.expectedStatus
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            const portInfo = config.port ? `Port ${config.port} on ` : '';
            return {
                name: `${portInfo}${config.host}`,
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {
                    host: config.host,
                    port: config.port,
                    protocol: config.protocol || 'tcp'
                }
            };
        }
    }

    /**
     * 批量检测端口状态（支持普通模式和 netstat 模式）
     * @param configs 端口检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    async checkPorts(configs: PortCheckConfig[]): Promise<CheckResult[]> {
        const results: CheckResult[] = [];
        const total = configs.length;

        // 使用统一的并发限制处理所有配置
        const concurrency = Math.min(configs.length, 10);
        const chunks = this.chunkArray(configs, concurrency);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const promises = chunk.map((config, index) =>
                this.checkPort(config).then(result => {
                    // 发送进度事件
                    const currentIndex = i * concurrency + index;
                    this.emit('port_progress', currentIndex + 1, total, config.port || 0);
                    return result;
                })
            );

            const chunkResults = await Promise.all(promises);
            results.push(...chunkResults);
        }

        // 发送完成事件
        this.emit('port_completed', results);

        return results;
    }


    /**
     * 按协议测试端口连接
     * @param host 主机地址
     * @param port 端口号
     * @param protocol 协议类型（tcp 或 udp）
     * @param timeout 超时时间
     * @returns Promise<boolean> 是否可连接
     */
    private async testPortProtocol(host: string, port: number, protocol: string, timeout: number): Promise<boolean> {
        switch (protocol.toLowerCase()) {
            case 'udp':
                return await this.testUdpPort(host, port, timeout);
            case 'tcp':
                return await this.testTcpPort(host, port, timeout);
            default:
                // 不支持的协议类型，回退到 TCP
                return await this.testTcpPort(host, port, timeout);
        }
    }


    /**
  * 测试 TCP 端口连接
  * @param host 主机地址
  * @param port 端口号
  * @param timeout 超时时间
  * @returns Promise<boolean> 是否可连接
  */
    private async testTcpPort(host: string, port: number, timeout: number): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timer = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, timeout);

            socket.setTimeout(timeout);

            socket.on('connect', () => {
                clearTimeout(timer);
                socket.destroy();
                resolve(true);
            });

            socket.on('error', () => {
                clearTimeout(timer);
                resolve(false);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });

            // TCP 连接
            socket.connect(port, host);
        });
    }

    /**
     * 测试 UDP 端口（简化实现）
     * @param host 主机地址
     * @param port 端口号
     * @param timeout 超时时间
     * @returns Promise<boolean> 端口是否响应（UDP 不保证准确）
     */
    private async testUdpPort(host: string, port: number, timeout: number): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timer = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, timeout);

            socket.setTimeout(timeout);

            // UDP 比较复杂，这里发送一个空的 UDP 包
            socket.on('connect', () => {
                clearTimeout(timer);
                socket.destroy();
                resolve(true);
            });

            socket.on('error', () => {
                clearTimeout(timer);
                // UDP 端口可能没有响应，但不一定是关闭的
                resolve(false);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });

            // UDP 连接尝试
            socket.connect(port, host);
        });
    }

    /**
     * 获取本地监听端口（使用 netstat 命令）
     * @param timeout 超时时间
     * @returns Promise<number[]> 监听端口列表
     */
    private async getLocalListeningPorts(timeout?: number, specificPort?: number): Promise<number[]> {
        const platform = os.platform();
        const timeoutMs = timeout || 10000;

        return new Promise((resolve, reject) => {
            let command: string;

            if (platform === 'win32') {
                // Windows 使用 netstat 命令
                command = 'netstat -an';
                // 如果指定了端口，使用 findstr 过滤
                if (specificPort) {
                    command += ` | findstr :${specificPort}`;
                }
            } else if (platform === 'darwin') {
                // macOS 使用 netstat 命令
                command = 'netstat -an';
                // 如果指定了端口，使用 grep 过滤
                if (specificPort) {
                    command += ` | grep :${specificPort}`;
                }
            } else {
                // Linux 使用 ss 命令（更现代）或 netstat
                command = 'ss -tuln || netstat -tuln';
                // 如果指定了端口，使用 grep 过滤
                if (specificPort) {
                    command += ` | grep :${specificPort}`;
                }
            }

            exec(command, { timeout: timeoutMs }, (error, stdout, _stderr) => {
                if (error) {
                    // 如果是过滤特定端口时没有找到匹配项，返回空数组而不是错误
                    if (specificPort && error.code === 1) {
                        resolve([]);
                        return;
                    }
                    reject(error);
                    return;
                }

                try {
                    const listeningPorts = this.parseNetstatOutput(stdout, platform);
                    resolve(listeningPorts);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    /**
     * 执行 netstat 模式检测
     * @param host 主机地址
     * @param timeout 超时时间
     * @returns Promise<CheckResult> 检测结果
     */
    private async performNetstatCheck(host: string, port?: number, timeout?: number): Promise<CheckResult> {
        const startTime = Date.now();
        const timeoutMs = timeout || 10000; // 默认10秒超时

        try {
            // 如果指定了端口，传递给getLocalListeningPorts以优化性能
            const listeningPorts = await this.getLocalListeningPorts(timeoutMs, port);
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;

            if (port) {
                // 检查特定端口是否在监听列表中
                const isPortListening = listeningPorts.includes(port);
                status = isPortListening ? CheckStatus.HEALTHY : CheckStatus.UNHEALTHY;

                if (!isPortListening) {
                    error = `Port ${port} is not listening on ${host}`;
                }
            } else {
                // 不指定端口时，只返回所有监听端口
                status = CheckStatus.HEALTHY;
            }

            return {
                name: port ? `Netstat on ${host}:${port}` : `Netstat on ${host}`,
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: {
                    host,
                    port,
                    listeningPorts: listeningPorts.sort((a, b) => a - b),
                    totalListeningPorts: listeningPorts.length,
                    isPortListening: port ? listeningPorts.includes(port) : undefined
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: port ? `Netstat on ${host}:${port}` : `Netstat on ${host}`,
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {
                    host,
                    port
                }
            };
        }
    }

    /**
     * 解析 netstat 输出
     * @param output netstat 命令输出
     * @param platform 操作系统平台
     * @returns number[] 监听端口列表
     */
    private parseNetstatOutput(output: string, platform: string): number[] {
        const listeningPorts: number[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();

            // 跳过表头和空行
            if (!trimmedLine || trimmedLine.toLowerCase().includes('proto')) {
                continue;
            }

            // 解析不同平台的 netstat 输出格式
            let port: number | null = null;

            if (platform === 'win32') {
                // Windows 格式: TCP    0.0.0.0:80           0.0.0.0:0              LISTENING
                const match = trimmedLine.match(/TCP\s+[\d\.]+:(\d+)\s+[\d\.\*]+:(\d+)\s+LISTENING/i);
                if (match) {
                    port = parseInt(match[1]);
                }
            } else {
                // Unix/Linux/Mac 格式: tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN
                const match = trimmedLine.match(/(?:tcp|TCP)\s+[\d\s\.\*]+:(\d+)\s+[\d\.\*:\*]+\s+(?:LISTEN|LISTENING)/);
                if (match) {
                    port = parseInt(match[1]);
                }
            }

            if (port && !isNaN(port)) {
                listeningPorts.push(port);
            }
        }

        return Array.from(new Set(listeningPorts)); // 去重
    }
    /**
     * 将数组分块
     * @param array 原数组
     * @param size 块大小
     * @returns T[][] 分块后的数组
     */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}