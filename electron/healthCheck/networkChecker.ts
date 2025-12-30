/**
 * 网络连接检测功能
 * 提供 Ping 检测和网络连通性验证功能
 */

import { EventEmitter } from 'events';
import {
    CheckResult,
    PingConfig
} from '../model/healthCheck';

/**
 * 网络连接检测器接口
 * 专门负责网络连接相关的检测功能
 */
export interface NetworkChecker extends EventEmitter {

    /**
     * Ping 检测
     * @param config ping 配置
     * @returns Promise<CheckResult> 检测结果
     */
    ping(config: PingConfig): Promise<CheckResult>;

    /**
     * 批量 ping 检测
     * @param configs ping 配置列表
     * @returns Promise<CheckResult[]> 检测结果列表
     */
    pingBatch(configs: PingConfig[]): Promise<CheckResult[]>;

    // ===== 事件监听 =====
    /**
     * Ping 检测进度事件
     */
    on(event: 'ping_progress', listener: (current: number, total: number, currentHost: string) => void): this;

    /**
     * Ping 检测完成事件
     */
    on(event: 'ping_completed', listener: (results: CheckResult[]) => void): this;
}