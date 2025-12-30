/**
 * 进程和系统资源检测功能
 * 提供服务进程状态和系统资源使用率检测
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import * as os from 'os';
import {
    CheckResult,
    CheckStatus,
    ProcessCheckConfig,
    SystemResourceCheckConfig
} from '../model/healthCheck';

/**
 * 进程和系统资源检测器接口
 * 专门负责进程状态监控和系统资源使用情况检测
 */
export interface SystemChecker extends EventEmitter {

    // ===== 进程检测 =====
    /**
     * 服务进程检测
     * @param config 进程检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkProcess(config: ProcessCheckConfig): Promise<CheckResult>;

    /**
     * 批量进程检测
     * @param configs 进程检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    checkProcesses(configs: ProcessCheckConfig[]): Promise<CheckResult[]>;

    /**
     * 获取进程详细信息
     * @param processName 进程名称
     * @returns Promise<CheckResult> 检测结果
     */
    getProcessDetails(processName: string): Promise<CheckResult>;

    // ===== 系统资源检测 =====
    /**
     * 系统资源使用率检测
     * @param config 系统资源检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    checkSystemResources(config: SystemResourceCheckConfig): Promise<CheckResult>;

    /**
     * 获取系统整体健康状态
     * @param config 系统资源检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    getSystemHealth(config: SystemResourceCheckConfig): Promise<CheckResult>;

    /**
     * 检测磁盘空间使用情况
     * @param diskPath 磁盘路径（如 'C:' 或 '/'）
     * @param maxUsagePercent 最大使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    checkDiskUsage(diskPath: string, maxUsagePercent: number): Promise<CheckResult>;

    /**
     * 检测内存使用情况
     * @param maxUsagePercent 最大内存使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    checkMemoryUsage(maxUsagePercent: number): Promise<CheckResult>;

    /**
     * 检测 CPU 使用情况
     * @param maxUsagePercent 最大 CPU 使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    checkCpuUsage(maxUsagePercent: number): Promise<CheckResult>;

    // ===== 事件监听 =====
    /**
     * 进程检测进度事件
     */
    on(event: 'process_progress', listener: (current: number, total: number, currentProcess: string) => void): this;

    /**
     * 系统资源检测进度事件
     */
    on(event: 'system_progress', listener: (current: number, total: number, resourceType: string) => void): this;

    /**
     * 进程检测完成事件
     */
    on(event: 'process_completed', listener: (results: CheckResult[]) => void): this;

    /**
     * 系统资源检测完成事件
     */
    on(event: 'system_completed', listener: (results: CheckResult[]) => void): this;
}

/**
 * 进程和系统资源检测器实现类
 * 实现进程状态监控和系统资源使用情况检测功能
 */
export class SystemCheckerImpl extends EventEmitter implements SystemChecker {

    constructor() {
        super();
    }

    /**
     * 检测单个进程状态
     * @param config 进程检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    async checkProcess(config: ProcessCheckConfig): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const isRunning = await this.isProcessRunning(config.processName);
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;
            let details: any = { processName: config.processName };

            if (isRunning) {
                status = CheckStatus.HEALTHY;

                // 验证期望状态
                if (config.expectedStatus && config.expectedStatus === 'stopped') {
                    status = CheckStatus.UNHEALTHY;
                    error = `Expected process ${config.processName} to be stopped, but it is running`;
                }

                // 获取进程详细信息
                const processInfo = await this.getProcessInfo(config.processName);
                details = { ...details, ...processInfo };

                // 验证进程ID（如果指定了）
                if (config.expectedPid && processInfo.pid !== config.expectedPid) {
                    status = CheckStatus.UNHEALTHY;
                    error = `Expected process ${config.processName} to have PID ${config.expectedPid}, but it has PID ${processInfo.pid}`;
                }

                // 验证内存使用（如果指定了）
                if (config.maxMemoryUsage && processInfo.memoryMB > config.maxMemoryUsage) {
                    status = CheckStatus.UNHEALTHY;
                    error = `Process ${config.processName} memory usage (${processInfo.memoryMB}MB) exceeds limit (${config.maxMemoryUsage}MB)`;
                }

                // 验证CPU使用（如果指定了）
                if (config.maxCpuUsage && processInfo.cpuPercent > config.maxCpuUsage) {
                    status = CheckStatus.UNHEALTHY;
                    error = `Process ${config.processName} CPU usage (${processInfo.cpuPercent}%) exceeds limit (${config.maxCpuUsage}%)`;
                }

            } else {
                status = CheckStatus.UNHEALTHY;
                error = `Process ${config.processName} is not running`;

                // 验证期望状态
                if (config.expectedStatus && config.expectedStatus === 'running') {
                    error = `Expected process ${config.processName} to be running, but it is stopped`;
                }
            }

            return {
                name: `Process ${config.processName}`,
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: `Process ${config.processName}`,
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: { processName: config.processName }
            };
        }
    }

    /**
     * 批量检测进程状态
     * @param configs 进程检测配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    async checkProcesses(configs: ProcessCheckConfig[]): Promise<CheckResult[]> {
        const results: CheckResult[] = [];
        const total = configs.length;

        // 并发限制，避免过多系统调用
        const concurrency = Math.min(configs.length, 10);
        const chunks = this.chunkArray(configs, concurrency);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const promises = chunk.map((config, index) =>
                this.checkProcess(config).then(result => {
                    // 发送进度事件
                    const currentIndex = i * concurrency + index;
                    this.emit('process_progress', currentIndex + 1, total, config.processName);
                    return result;
                })
            );

            const chunkResults = await Promise.all(promises);
            results.push(...chunkResults);
        }

        // 发送完成事件
        this.emit('process_completed', results);

        return results;
    }

    /**
     * 获取进程详细信息
     * @param processName 进程名称
     * @returns Promise<CheckResult> 检测结果
     */
    async getProcessDetails(processName: string): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const processInfo = await this.getProcessInfo(processName);
            const responseTime = Date.now() - startTime;

            return {
                name: `Process details: ${processName}`,
                status: CheckStatus.HEALTHY,
                responseTime,
                timestamp: new Date(),
                details: processInfo
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: `Process details: ${processName}`,
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: { processName }
            };
        }
    }

    /**
     * 检测系统资源使用情况
     * @param config 系统资源检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    async checkSystemResources(config: SystemResourceCheckConfig): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const resources = await this.getSystemResources();
            const responseTime = Date.now() - startTime;

            let status: CheckStatus = CheckStatus.HEALTHY;
            const issues: string[] = [];
            const details: any = { ...resources };

            // 验证CPU使用率
            if (config.maxCpuUsage && resources.cpuPercent > config.maxCpuUsage) {
                status = CheckStatus.UNHEALTHY;
                issues.push(`CPU usage (${resources.cpuPercent}%) exceeds limit (${config.maxCpuUsage}%)`);
            }

            // 验证内存使用率
            if (config.maxMemoryUsage && resources.memoryPercent > config.maxMemoryUsage) {
                status = CheckStatus.UNHEALTHY;
                issues.push(`Memory usage (${resources.memoryPercent}%) exceeds limit (${config.maxMemoryUsage}%)`);
            }

            // 验证磁盘使用率
            if (config.maxDiskUsage) {
                for (const diskPath of Object.keys(resources.diskUsage)) {
                    const usage = resources.diskUsage[diskPath];
                    if (usage.percent > config.maxDiskUsage) {
                        status = CheckStatus.UNHEALTHY;
                        issues.push(`Disk ${diskPath} usage (${usage.percent}%) exceeds limit (${config.maxDiskUsage}%)`);
                    }
                }
            }

            const error = issues.length > 0 ? issues.join('; ') : undefined;

            return {
                name: 'System Resources Check',
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: 'System Resources Check',
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {}
            };
        }
    }

    /**
     * 获取系统整体健康状态
     * @param config 系统资源检测配置
     * @returns Promise<CheckResult> 检测结果
     */
    async getSystemHealth(config: SystemResourceCheckConfig): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const resources = await this.getSystemResources();
            const responseTime = Date.now() - startTime;

            // 计算综合健康分数
            const healthScore = this.calculateHealthScore(resources, config);
            let status: CheckStatus;
            let error: string | undefined;

            if (healthScore >= 90) {
                status = CheckStatus.HEALTHY;
            } else if (healthScore >= 70) {
                status = CheckStatus.WARNING;
                error = 'System resources are running high but still acceptable';
            } else {
                status = CheckStatus.UNHEALTHY;
                error = 'System resources are critically high';
            }

            return {
                name: 'System Health Check',
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: {
                    ...resources,
                    healthScore,
                    config: {
                        maxCpuPercent: config.maxCpuUsage,
                        maxMemoryPercent: config.maxMemoryUsage,
                        maxDiskPercent: config.maxDiskUsage
                    }
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: 'System Health Check',
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {}
            };
        }
    }

    /**
     * 检测磁盘空间使用情况
     * @param diskPath 磁盘路径
     * @param maxUsagePercent 最大使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    async checkDiskUsage(diskPath: string, maxUsagePercent: number): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const diskInfo = await this.getDiskUsage(diskPath);
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;

            if (diskInfo.percent > maxUsagePercent) {
                status = CheckStatus.UNHEALTHY;
                error = `Disk ${diskPath} usage (${diskInfo.percent}%) exceeds limit (${maxUsagePercent}%)`;
            } else {
                status = CheckStatus.HEALTHY;
            }

            return {
                name: `Disk Usage: ${diskPath}`,
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: diskInfo
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: `Disk Usage: ${diskPath}`,
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: { diskPath }
            };
        }
    }

    /**
     * 检测内存使用情况
     * @param maxUsagePercent 最大内存使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    async checkMemoryUsage(maxUsagePercent: number): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const memoryInfo = await this.getMemoryUsage();
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;

            if (memoryInfo.percent > maxUsagePercent) {
                status = CheckStatus.UNHEALTHY;
                error = `Memory usage (${memoryInfo.percent}%) exceeds limit (${maxUsagePercent}%)`;
            } else {
                status = CheckStatus.HEALTHY;
            }

            return {
                name: 'Memory Usage Check',
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: memoryInfo
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: 'Memory Usage Check',
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {}
            };
        }
    }

    /**
     * 检测 CPU 使用情况
     * @param maxUsagePercent 最大 CPU 使用率百分比
     * @returns Promise<CheckResult> 检测结果
     */
    async checkCpuUsage(maxUsagePercent: number): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const cpuInfo = await this.getCpuUsage();
            const responseTime = Date.now() - startTime;

            let status: CheckStatus;
            let error: string | undefined;

            if (cpuInfo.percent > maxUsagePercent) {
                status = CheckStatus.UNHEALTHY;
                error = `CPU usage (${cpuInfo.percent}%) exceeds limit (${maxUsagePercent}%)`;
            } else {
                status = CheckStatus.HEALTHY;
            }

            return {
                name: 'CPU Usage Check',
                status,
                responseTime,
                error,
                timestamp: new Date(),
                details: cpuInfo
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                name: 'CPU Usage Check',
                status: CheckStatus.UNHEALTHY,
                responseTime,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                details: {}
            };
        }
    }

    // ===== 私有辅助方法 =====

    /**
     * 检查进程是否正在运行
     * @param processName 进程名称
     * @returns Promise<boolean> 是否正在运行
     */
    private async isProcessRunning(processName: string): Promise<boolean> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                // Windows 平台使用 tasklist 命令
                return await this.checkProcessWindows(processName);
            } else if (platform === 'linux' || platform === 'darwin') {
                // Linux/Mac 平台使用 ps 命令
                return await this.checkProcessUnix(processName);
            } else {
                // 其他平台返回 false 或抛出错误
                throw new Error(`Unsupported platform: ${platform}`);
            }
        } catch (error) {
            console.error(`Error checking process ${processName}:`, error);
            return false;
        }
    }

    /**
     * Windows 平台进程检测
     * @param processName 进程名称
     * @returns Promise<boolean> 是否正在运行
     */
    private async checkProcessWindows(processName: string): Promise<boolean> {
        return new Promise((resolve) => {
            // 使用 tasklist 命令检查进程，支持部分匹配
            const command = `tasklist /FO CSV /NH | findstr /I "${processName}"`;

            exec(command, { timeout: 5000 }, (error, stdout, _stderr) => {
                if (error) {
                    // 如果命令执行失败，可能是进程不存在
                    resolve(false);
                    return;
                }

                // tasklist 输出包含进程信息，如果找到匹配行说明进程存在
                const lines = stdout.trim().split('\n');
                const hasProcess = lines.some(line => {
                    // CSV 格式的第二列通常是进程名
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        const processInLine = parts[0].replace(/"/g, '').toLowerCase();
                        return processInLine.includes(processName.toLowerCase());
                    }
                    return false;
                });

                resolve(hasProcess);
            });
        });
    }

    /**
     * Unix/Linux/Mac 平台进程检测
     * @param processName 进程名称
     * @returns Promise<boolean> 是否正在运行
     */
    private async checkProcessUnix(processName: string): Promise<boolean> {
        return new Promise((resolve) => {
            // 使用 ps 命令检查进程，支持精确匹配和部分匹配
            const command = `ps aux | grep -E "^[\\s\\S]*${processName}[\\s\\S]*$" | grep -v grep`;

            exec(command, { timeout: 5000 }, (error, stdout, _stderr) => {
                if (error) {
                    // 如果命令执行失败，可能是进程不存在
                    resolve(false);
                    return;
                }

                // 如果输出不为空，说明找到了匹配的进程
                const hasProcess = stdout.trim().length > 0;
                resolve(hasProcess);
            });
        });
    }

    /**
     * 获取进程详细信息
     * @param processName 进程名称
     * @returns Promise<any> 进程信息
     */
    private async getProcessInfo(processName: string): Promise<any> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                return await this.getProcessInfoWindows(processName);
            } else if (platform === 'linux' || platform === 'darwin') {
                return await this.getProcessInfoUnix(processName);
            } else {
                throw new Error(`Unsupported platform: ${platform}`);
            }
        } catch (error) {
            console.error(`Error getting process info for ${processName}:`, error);
            return {
                pid: 0,
                memoryMB: 0,
                cpuPercent: 0,
                startTime: new Date(),
                status: 'unknown'
            };
        }
    }

    /**
     * Windows 平台获取进程详细信息
     * @param processName 进程名称
     * @returns Promise<any> 进程信息
     */
    private async getProcessInfoWindows(processName: string): Promise<any> {
        return new Promise((resolve) => {
            // 使用 wmic 命令获取详细进程信息
            const command = `wmic process where "name like '%${processName}%'" get ProcessId,Name,WorkingSetSize,PageFileUsage,CreationDate /format:csv`;

            exec(command, { timeout: 10000 }, (error, stdout, _stderr) => {
                if (error || !stdout.trim()) {
                    resolve({
                        pid: 0,
                        memoryMB: 0,
                        cpuPercent: 0,
                        startTime: new Date(),
                        status: 'not found'
                    });
                    return;
                }

                try {
                    const lines = stdout.trim().split('\n');
                    // 跳过表头
                    const dataLines = lines.slice(1).filter(line => line.trim());

                    if (dataLines.length === 0) {
                        resolve({
                            pid: 0,
                            memoryMB: 0,
                            cpuPercent: 0,
                            startTime: new Date(),
                            status: 'not found'
                        });
                        return;
                    }

                    // 解析CSV数据
                    const processData = dataLines[0].split(',');
                    const pid = parseInt(processData[2]) || 0;
                    const memoryKB = parseInt(processData[3]) || 0;
                    const memoryMB = Math.round(memoryKB / 1024);
                    const startTimeStr = processData[4];

                    // 解析创建时间
                    let startTime = new Date();
                    if (startTimeStr && startTimeStr !== 'NULL') {
                        try {
                            startTime = new Date(startTimeStr);
                        } catch (e) {
                            console.warn('Failed to parse start time:', startTimeStr);
                        }
                    }

                    resolve({
                        pid,
                        memoryMB,
                        cpuPercent: 0, // wmic 不直接提供 CPU 使用率
                        startTime,
                        status: 'running'
                    });

                } catch (parseError) {
                    console.error('Error parsing process info:', parseError);
                    resolve({
                        pid: 0,
                        memoryMB: 0,
                        cpuPercent: 0,
                        startTime: new Date(),
                        status: 'error'
                    });
                }
            });
        });
    }

    /**
     * Unix/Linux/Mac 平台获取进程详细信息
     * @param processName 进程名称
     * @returns Promise<any> 进程信息
     */
    private async getProcessInfoUnix(processName: string): Promise<any> {
        return new Promise((resolve) => {
            // 使用 ps 命令获取详细进程信息
            const command = `ps -eo pid,ppid,%mem,%cpu,etime,cmd | grep -E "${processName}" | grep -v grep | head -1`;

            exec(command, { timeout: 10000 }, (error, stdout, _stderr) => {
                if (error || !stdout.trim()) {
                    resolve({
                        pid: 0,
                        memoryMB: 0,
                        cpuPercent: 0,
                        startTime: new Date(),
                        status: 'not found'
                    });
                    return;
                }

                try {
                    const parts = stdout.trim().split(/\s+/);

                    if (parts.length < 6) {
                        resolve({
                            pid: 0,
                            memoryMB: 0,
                            cpuPercent: 0,
                            startTime: new Date(),
                            status: 'error'
                        });
                        return;
                    }

                    const pid = parseInt(parts[0]) || 0;
                    const memoryPercent = parseFloat(parts[2]) || 0;
                    const cpuPercent = parseFloat(parts[3]) || 0;
                    const etime = parts[4]; // 运行时间

                    // 估算开始时间（基于运行时间）
                    const startTime = this.estimateStartTimeFromEtime(etime);

                    // 获取系统总内存来计算实际内存使用量
                    this.getSystemTotalMemory().then(totalMemoryMB => {
                        const memoryMB = Math.round((totalMemoryMB * memoryPercent) / 100);

                        resolve({
                            pid,
                            memoryMB,
                            cpuPercent,
                            startTime,
                            status: 'running'
                        });
                    }).catch(() => {
                        resolve({
                            pid,
                            memoryMB: 0,
                            cpuPercent,
                            startTime,
                            status: 'running'
                        });
                    });

                } catch (parseError) {
                    console.error('Error parsing process info:', parseError);
                    resolve({
                        pid: 0,
                        memoryMB: 0,
                        cpuPercent: 0,
                        startTime: new Date(),
                        status: 'error'
                    });
                }
            });
        });
    }

    /**
     * 根据运行时间估算开始时间
     * @param etime 运行时间格式 (如: 1-02:03:04 表示 1天2小时3分钟4秒)
     * @returns Date 估算的开始时间
     */
    private estimateStartTimeFromEtime(etime: string): Date {
        try {
            // 解析运行时间格式
            let seconds = 0;

            if (etime.includes('-')) {
                // 格式: days-hours:minutes:seconds
                const [daysPart, timePart] = etime.split('-');
                const days = parseInt(daysPart) || 0;
                const [hours, minutes, secs] = timePart.split(':').map(n => parseInt(n) || 0);
                seconds = days * 24 * 3600 + hours * 3600 + minutes * 60 + secs;
            } else {
                // 格式: hours:minutes:seconds
                const [hours, minutes, secs] = etime.split(':').map(n => parseInt(n) || 0);
                seconds = hours * 3600 + minutes * 60 + secs;
            }

            return new Date(Date.now() - seconds * 1000);
        } catch (error) {
            console.warn('Failed to parse etime:', etime);
            return new Date();
        }
    }

    /**
     * 获取系统总内存 (MB)
     * @returns Promise<number> 总内存 MB
     */
    private async getSystemTotalMemory(): Promise<number> {
        return new Promise((resolve) => {
            const platform = os.platform();

            if (platform === 'win32') {
                // Windows 使用 wmic 命令
                exec('wmic computersystem get TotalPhysicalMemory /format:value', { timeout: 5000 }, (error, stdout) => {
                    if (error) {
                        resolve(0);
                        return;
                    }

                    const match = stdout.match(/TotalPhysicalMemory=(\d+)/);
                    if (match) {
                        const totalBytes = parseInt(match[1]);
                        resolve(Math.round(totalBytes / (1024 * 1024))); // 转换为 MB
                    } else {
                        resolve(0);
                    }
                });
            } else {
                // Unix/Linux/Mac 使用 free 或 vm_stat
                const command = platform === 'darwin' ?
                    'sysctl -n hw.memsize' :
                    'free -m | awk \'NR==2{print $2}\'';

                exec(command, { timeout: 5000 }, (error, stdout) => {
                    if (error) {
                        resolve(0);
                        return;
                    }

                    const totalMB = parseInt(stdout.trim());
                    resolve(totalMB || 0);
                });
            }
        });
    }

    /**
     * 获取系统资源信息
     * @returns Promise<any> 系统资源信息
     */
    private async getSystemResources(): Promise<any> {
        try {
            // 并发获取各种系统资源信息
            const [cpuInfo, memoryInfo, diskInfo] = await Promise.all([
                this.getCpuUsage(),
                this.getMemoryUsage(),
                this.getAllDiskUsage()
            ]);

            return {
                cpuPercent: cpuInfo.percent,
                cpuCores: cpuInfo.cores,
                loadAverage: cpuInfo.loadAverage,
                memoryPercent: memoryInfo.percent,
                memoryUsedMB: memoryInfo.usedMB,
                memoryTotalMB: memoryInfo.totalMB,
                diskUsage: diskInfo
            };
        } catch (error) {
            console.error('Error getting system resources:', error);
            throw new Error(`Failed to get system resources: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 获取所有磁盘的使用情况
     * @returns Promise<any> 磁盘信息字典
     */
    private async getAllDiskUsage(): Promise<any> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                // Windows 使用 wmic 命令获取磁盘信息
                return await this.getDiskUsageWindows();
            } else {
                // Unix/Linux/Mac 使用 df 命令
                return await this.getDiskUsageUnix();
            }
        } catch (error) {
            console.error('Error getting disk usage:', error);
            throw new Error(`Failed to get disk usage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 获取磁盘使用情况
     * @param diskPath 磁盘路径
     * @returns Promise<any> 磁盘信息
     */
    private async getDiskUsage(diskPath: string): Promise<any> {
        const allDiskUsage = await this.getAllDiskUsage();
        return allDiskUsage[diskPath] || {
            percent: 0,
            freeGB: 0,
            totalGB: 0
        };
    }

    /**
     * Windows 平台磁盘使用情况检测
     * @returns Promise<any> 磁盘信息字典
     */
    private async getDiskUsageWindows(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 wmic 命令获取磁盘信息
            exec('wmic logicaldisk get DeviceID,FreeSpace,Size /format:value', { timeout: 10000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const diskUsage: any = {};
                const lines = stdout.trim().split('\n');

                for (const line of lines) {
                    const deviceMatch = line.match(/DeviceID=([A-Z]:)/);
                    const freeMatch = line.match(/FreeSpace=(\d+)/);
                    const sizeMatch = line.match(/Size=(\d+)/);

                    if (deviceMatch && freeMatch && sizeMatch) {
                        const deviceId = deviceMatch[1];
                        const freeBytes = parseInt(freeMatch[1]);
                        const totalBytes = parseInt(sizeMatch[1]);
                        const usedBytes = totalBytes - freeBytes;
                        const usedGB = usedBytes / (1024 * 1024 * 1024);
                        const totalGB = totalBytes / (1024 * 1024 * 1024);
                        const percent = Math.round((usedBytes / totalBytes) * 100);

                        diskUsage[deviceId] = {
                            percent,
                            freeGB: Math.round(freeBytes / (1024 * 1024 * 1024) * 100) / 100,
                            totalGB: Math.round(totalGB * 100) / 100,
                            usedGB: Math.round(usedGB * 100) / 100
                        };
                    }
                }

                resolve(diskUsage);
            });
        });
    }

    /**
     * Unix/Linux/Mac 平台磁盘使用情况检测
     * @returns Promise<any> 磁盘信息字典
     */
    private async getDiskUsageUnix(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 df 命令获取磁盘信息，-k 以 KB 为单位
            exec("df -k | grep -E '^/dev/'", { timeout: 10000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const diskUsage: any = {};
                const lines = stdout.trim().split('\n');

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 6) {
                        const mountPoint = parts[5];
                        const totalKB = parseInt(parts[1]);
                        const usedKB = parseInt(parts[2]);
                        const availableKB = parseInt(parts[3]);
                        const percentStr = parts[4].replace('%', '');
                        const percent = parseInt(percentStr);

                        // 计算设备路径 (通常是 /dev/sda1 格式)
                        const devicePath = parts[0];

                        if (!isNaN(percent) && !isNaN(totalKB)) {
                            const totalGB = totalKB / (1024 * 1024);
                            const usedGB = usedKB / (1024 * 1024);
                            const freeGB = availableKB / (1024 * 1024);

                            diskUsage[mountPoint] = {
                                percent,
                                freeGB: Math.round(freeGB * 100) / 100,
                                totalGB: Math.round(totalGB * 100) / 100,
                                usedGB: Math.round(usedGB * 100) / 100,
                                device: devicePath
                            };
                        }
                    }
                }

                resolve(diskUsage);
            });
        });
    }

    /**
     * 获取内存使用情况
     * @returns Promise<any> 内存信息
     */
    private async getMemoryUsage(): Promise<any> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                return await this.getMemoryUsageWindows();
            } else {
                return await this.getMemoryUsageUnix();
            }
        } catch (error) {
            console.error('Error getting memory usage:', error);
            throw new Error(`Failed to get memory usage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Windows 平台内存使用情况检测
     * @returns Promise<any> 内存信息
     */
    private async getMemoryUsageWindows(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 wmic 命令获取内存信息
            exec('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:value', { timeout: 5000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const totalMatch = stdout.match(/TotalVisibleMemorySize=(\d+)/);
                const freeMatch = stdout.match(/FreePhysicalMemory=(\d+)/);

                if (totalMatch && freeMatch) {
                    const totalKB = parseInt(totalMatch[1]);
                    const freeKB = parseInt(freeMatch[1]);
                    const usedKB = totalKB - freeKB;
                    const percent = Math.round((usedKB / totalKB) * 100);

                    resolve({
                        percent,
                        usedMB: Math.round(usedKB / 1024),
                        totalMB: Math.round(totalKB / 1024),
                        freeMB: Math.round(freeKB / 1024)
                    });
                } else {
                    reject(new Error('Failed to parse memory information'));
                }
            });
        });
    }

    /**
     * Unix/Linux/Mac 平台内存使用情况检测
     * @returns Promise<any> 内存信息
     */
    private async getMemoryUsageUnix(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 free 命令获取内存信息
            const command = os.platform() === 'darwin' ?
                'vm_stat | grep "Pages free\\|Pages active\\|Pages wired down" | awk \'{print $2}\' | tr -d \':\'' :
                'free -m | awk \'NR==2{print $2" "$3" "$4}\'';

            exec(command, { timeout: 5000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (os.platform() === 'darwin') {
                    // Mac OS X 使用 vm_stat
                    const lines = stdout.trim().split('\n');
                    if (lines.length >= 3) {
                        const freePages = parseInt(lines[0]);
                        const activePages = parseInt(lines[1]);
                        const wiredPages = parseInt(lines[2]);
                        const pageSize = 4096; // Mac OS X 默认页面大小

                        // 获取总内存大小
                        exec('sysctl -n hw.memsize', { timeout: 3000 }, (error, stdout) => {
                            if (error) {
                                reject(error);
                                return;
                            }

                            const totalBytes = parseInt(stdout.trim());
                            const totalMB = Math.round(totalBytes / (1024 * 1024));

                            const usedBytes = (activePages + wiredPages) * pageSize;
                            const usedMB = Math.round(usedBytes / (1024 * 1024));
                            const percent = Math.round((usedMB / totalMB) * 100);

                            resolve({
                                percent,
                                usedMB,
                                totalMB,
                                freeMB: Math.round(freePages * pageSize / (1024 * 1024))
                            });
                        });
                    } else {
                        reject(new Error('Failed to parse vm_stat output'));
                    }
                } else {
                    // Linux 使用 free -m
                    const parts = stdout.trim().split(/\s+/);
                    if (parts.length >= 3) {
                        const totalMB = parseInt(parts[0]);
                        const usedMB = parseInt(parts[1]);
                        const freeMB = parseInt(parts[2]);
                        const percent = Math.round((usedMB / totalMB) * 100);

                        resolve({
                            percent,
                            usedMB,
                            totalMB,
                            freeMB
                        });
                    } else {
                        reject(new Error('Failed to parse free output'));
                    }
                }
            });
        });
    }

    /**
     * 获取 CPU 使用情况
     * @returns Promise<any> CPU 信息
     */
    private async getCpuUsage(): Promise<any> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                return await this.getCpuUsageWindows();
            } else {
                return await this.getCpuUsageUnix();
            }
        } catch (error) {
            console.error('Error getting CPU usage:', error);
            throw new Error(`Failed to get CPU usage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Windows 平台 CPU 使用情况检测
     * @returns Promise<any> CPU 信息
     */
    private async getCpuUsageWindows(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 wmic 命令获取 CPU 使用率
            exec('wmic cpu get loadpercentage /format:value', { timeout: 5000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const loadMatch = stdout.match(/LoadPercentage=(\d+)/);
                if (loadMatch) {
                    const percent = parseInt(loadMatch[1]);
                    const cores = os.cpus().length;

                    resolve({
                        percent,
                        cores,
                        loadAverage: [percent / 100, percent / 100, percent / 100] // Windows 没有真正的 load average
                    });
                } else {
                    reject(new Error('Failed to parse CPU load percentage'));
                }
            });
        });
    }

    /**
     * Unix/Linux/Mac 平台 CPU 使用情况检测
     * @returns Promise<any> CPU 信息
     */
    private async getCpuUsageUnix(): Promise<any> {
        return new Promise((resolve, reject) => {
            // 使用 top 命令获取 CPU 使用率
            const command = os.platform() === 'darwin' ?
                'top -l 1 | grep "CPU usage"' :
                'top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\'';

            exec(command, { timeout: 5000 }, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    let percent = 0;

                    if (os.platform() === 'darwin') {
                        // Mac OS X 格式: "CPU usage: 12.34% user, 5.67% sys, 81.99% idle"
                        const match = stdout.match(/CPU usage: ([0-9.]+)% user, ([0-9.]+)% sys/);
                        if (match) {
                            const userPercent = parseFloat(match[1]);
                            const sysPercent = parseFloat(match[2]);
                            percent = userPercent + sysPercent;
                        }
                    } else {
                        // Linux 格式已经是百分比
                        percent = parseFloat(stdout.trim());
                    }

                    const cores = os.cpus().length;
                    const loadAverage = os.loadavg();

                    resolve({
                        percent: Math.round(percent * 100) / 100,
                        cores,
                        loadAverage: [
                            Math.round(loadAverage[0] * 100) / 100,
                            Math.round(loadAverage[1] * 100) / 100,
                            Math.round(loadAverage[2] * 100) / 100
                        ]
                    });
                } catch (parseError) {
                    reject(new Error(`Failed to parse CPU usage: ${parseError}`));
                }
            });
        });
    }

    /**
     * 计算系统健康分数
     * @param resources 系统资源信息
     * @param config 检测配置
     * @returns number 健康分数 (0-100)
     */
    private calculateHealthScore(resources: any, config: SystemResourceCheckConfig): number {
        let score = 100;

        // CPU 使用率影响
        if (config.maxCpuUsage) {
            const cpuRatio = resources.cpuPercent / config.maxCpuUsage;
            if (cpuRatio > 1) {
                score -= 30;
            } else if (cpuRatio > 0.8) {
                score -= 15;
            } else if (cpuRatio > 0.6) {
                score -= 5;
            }
        }

        // 内存使用率影响
        if (config.maxMemoryUsage) {
            const memoryRatio = resources.memoryPercent / config.maxMemoryUsage;
            if (memoryRatio > 1) {
                score -= 25;
            } else if (memoryRatio > 0.8) {
                score -= 12;
            } else if (memoryRatio > 0.6) {
                score -= 3;
            }
        }

        // 磁盘使用率影响
        if (config.maxDiskUsage) {
            let diskPenalty = 0;
            for (const diskPath of Object.keys(resources.diskUsage)) {
                const usage = resources.diskUsage[diskPath];
                const diskRatio = usage.percent / config.maxDiskUsage;
                if (diskRatio > 1) {
                    diskPenalty += 20;
                } else if (diskRatio > 0.9) {
                    diskPenalty += 10;
                } else if (diskRatio > 0.8) {
                    diskPenalty += 5;
                }
            }
            score -= diskPenalty;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 将数组分块
     * @param array 原数组
     * @param chunkSize 块大小
     * @returns T[][] 分块后的数组
     */
    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}