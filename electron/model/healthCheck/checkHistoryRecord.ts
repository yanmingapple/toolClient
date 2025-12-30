/**
 * 检测历史记录接口
 * 定义了健康检测历史记录的数据结构
 */

import { CheckResult } from './checkResult';

export interface CheckHistoryRecord {
    /** 检测配置 */
    config: any;
    /** 检测结果 */
    result: CheckResult;
    /** 检测持续时间（毫秒） */
    duration: number;
}