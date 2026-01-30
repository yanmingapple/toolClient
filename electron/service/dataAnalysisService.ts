import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';
import * as fs from 'fs';
import * as path from 'path';
const { app } = require('electron');

/**
 * 效率统计数据
 */
export interface EfficiencyStats {
  weekEfficiency: number;
  monthEfficiency: number;
  bestTimeSlots: Array<{
    time: string;
    score: number;
  }>;
}

/**
 * 任务完成率统计
 */
export interface TaskCompletionStats {
  name: string;
  total: number;
  completed: number;
  rate: number;
}

/**
 * 工作模式数据
 */
export interface WorkPattern {
  type: string;
  avgMinutes: number;
  efficiency: number;
  sampleCount: number;
}

/**
 * 数据分析服务
 * 从数据库和日志中提取真实统计数据
 */
export class DataAnalysisService {
  private static instance: DataAnalysisService;
  private databaseClient: DatabaseClient | null = null;
  private memoryBasePath: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.memoryBasePath = path.join(userDataPath, 'memory');
  }

  public static getInstance(): DataAnalysisService {
    if (!DataAnalysisService.instance) {
      DataAnalysisService.instance = new DataAnalysisService();
    }
    return DataAnalysisService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }

  /**
   * 获取效率统计数据
   */
  public async getEfficiencyStats(): Promise<ServiceResult<EfficiencyStats>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      // 计算本周和本月的效率
      const weekEfficiency = await this.calculateWeekEfficiency();
      const monthEfficiency = await this.calculateMonthEfficiency();

      // 获取最佳工作时间段
      const bestTimeSlots = await this.getBestTimeSlots();

      return ServiceResultFactory.success({
        weekEfficiency,
        monthEfficiency,
        bestTimeSlots
      });
    } catch (error: any) {
      console.error('获取效率统计失败:', error);
      return ServiceResultFactory.error(`获取效率统计失败: ${error.message}`);
    }
  }

  /**
   * 计算本周效率
   */
  private async calculateWeekEfficiency(): Promise<number> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // 本周一
      weekStart.setHours(0, 0, 0, 0);

      // 从工作日志中读取本周数据
      const efficiencyScores: number[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const logPath = path.join(this.memoryBasePath, 'daily', `${dateStr}.md`);
        
        if (fs.existsSync(logPath)) {
          const content = fs.readFileSync(logPath, 'utf-8');
          // 提取效率评分（简化实现）
          const efficiencyMatches = content.match(/效率[评分]*[：:]\s*(\d+)/g);
          if (efficiencyMatches) {
            efficiencyMatches.forEach(match => {
              const score = parseInt(match.match(/(\d+)/)?.[1] || '0');
              if (score > 0) {
                efficiencyScores.push(score);
              }
            });
          }
        }
      }

      if (efficiencyScores.length === 0) {
        return 0;
      }

      const avgEfficiency = Math.round(
        efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
      );
      return avgEfficiency;
    } catch (error) {
      console.error('计算本周效率失败:', error);
      return 0;
    }
  }

  /**
   * 计算本月效率
   */
  private async calculateMonthEfficiency(): Promise<number> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 从工作日志中读取本月数据
      const efficiencyScores: number[] = [];
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        if (date > now) break; // 只统计到今天
        
        const dateStr = date.toISOString().split('T')[0];
        const logPath = path.join(this.memoryBasePath, 'daily', `${dateStr}.md`);
        
        if (fs.existsSync(logPath)) {
          const content = fs.readFileSync(logPath, 'utf-8');
          const efficiencyMatches = content.match(/效率[评分]*[：:]\s*(\d+)/g);
          if (efficiencyMatches) {
            efficiencyMatches.forEach(match => {
              const score = parseInt(match.match(/(\d+)/)?.[1] || '0');
              if (score > 0) {
                efficiencyScores.push(score);
              }
            });
          }
        }
      }

      if (efficiencyScores.length === 0) {
        return 0;
      }

      const avgEfficiency = Math.round(
        efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
      );
      return avgEfficiency;
    } catch (error) {
      console.error('计算本月效率失败:', error);
      return 0;
    }
  }

  /**
   * 获取最佳工作时间段
   */
  private async getBestTimeSlots(): Promise<Array<{ time: string; score: number }>> {
    try {
      const bestTimesPath = path.join(this.memoryBasePath, 'habits', 'best-times.md');
      
      if (!fs.existsSync(bestTimesPath)) {
        return [];
      }

      const content = fs.readFileSync(bestTimesPath, 'utf-8');
      const timeSlots: Array<{ time: string; score: number }> = [];

      // 解析时间段和效率评分
      const lines = content.split('\n');
      for (const line of lines) {
        // 匹配格式：- **时间段**: 效率评分 85（任务类型）
        const match = line.match(/\*\*([^*]+)\*\*.*?(\d+)/);
        if (match) {
          const timeSlot = match[1].trim();
          const score = parseInt(match[2]);
          if (score > 0) {
            timeSlots.push({ time: timeSlot, score });
          }
        }
      }

      // 按评分排序，取前5个
      return timeSlots
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('获取最佳工作时间段失败:', error);
      return [];
    }
  }

  /**
   * 获取任务完成率统计
   */
  public async getTaskCompletionStats(): Promise<ServiceResult<TaskCompletionStats[]>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      // 查询所有事件，按类型分组统计
      const rows = await this.databaseClient.execute(SQLStatements.SELECT_ALL_EVENTS) as any[];
      
      // 统计各类型任务
      const typeStats: { [key: string]: { total: number; completed: number } } = {};
      
      rows.forEach((row: any) => {
        const type = row.type || '其他';
        if (!typeStats[type]) {
          typeStats[type] = { total: 0, completed: 0 };
        }
        typeStats[type].total++;
        
        // 检查是否完成（通过查询工作日志或行为记录）
        // 简化实现：假设所有事件都未完成（实际应该查询完成记录）
      });

      // 查询完成的事件（从行为记录中）
      const completedRows = await this.databaseClient.execute(`
        SELECT action_data
        FROM user_behavior_log
        WHERE module_id = 'calendar'
          AND action_type = 'complete'
      `) as any[];

      completedRows.forEach((row: any) => {
        try {
          const data = JSON.parse(row.action_data || '{}');
          const eventType = data.type || '其他';
          if (typeStats[eventType]) {
            typeStats[eventType].completed++;
          }
        } catch (e) {
          // 忽略解析错误
        }
      });

      // 转换为数组格式
      const stats: TaskCompletionStats[] = Object.entries(typeStats).map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

      return ServiceResultFactory.success(stats);
    } catch (error: any) {
      console.error('获取任务完成率统计失败:', error);
      return ServiceResultFactory.error(`获取任务完成率统计失败: ${error.message}`);
    }
  }

  /**
   * 获取工作模式数据
   */
  public async getWorkPatterns(): Promise<ServiceResult<WorkPattern[]>> {
    try {
      const patternsPath = path.join(this.memoryBasePath, 'habits', 'work-patterns.md');
      
      if (!fs.existsSync(patternsPath)) {
        return ServiceResultFactory.success([]);
      }

      const content = fs.readFileSync(patternsPath, 'utf-8');
      const patterns: WorkPattern[] = [];

      // 解析工作模式
      const lines = content.split('\n');
      let currentType = '';
      let currentData: any = {};

      for (const line of lines) {
        // 匹配任务类型标题：## 类型类任务
        const typeMatch = line.match(/##\s*(.+?)类任务/);
        if (typeMatch) {
          if (currentType && currentData.avgMinutes) {
            patterns.push({
              type: currentType,
              avgMinutes: currentData.avgMinutes,
              efficiency: currentData.avgEfficiency || 0,
              sampleCount: currentData.sampleCount || 0
            });
          }
          currentType = typeMatch[1];
          currentData = {};
        } else if (currentType) {
          // 解析数据行
          const minutesMatch = line.match(/平均耗时[：:]\s*(\d+)分钟/);
          if (minutesMatch) {
            currentData.avgMinutes = parseInt(minutesMatch[1]);
          }
          
          const efficiencyMatch = line.match(/平均效率[：:]\s*(\d+)/);
          if (efficiencyMatch) {
            currentData.avgEfficiency = parseInt(efficiencyMatch[1]);
          }
          
          const sampleMatch = line.match(/样本数[：:]\s*(\d+)/);
          if (sampleMatch) {
            currentData.sampleCount = parseInt(sampleMatch[1]);
          }
        }
      }

      // 添加最后一个模式
      if (currentType && currentData.avgMinutes) {
        patterns.push({
          type: currentType,
          avgMinutes: currentData.avgMinutes,
          efficiency: currentData.avgEfficiency || 0,
          sampleCount: currentData.sampleCount || 0
        });
      }

      return ServiceResultFactory.success(patterns);
    } catch (error: any) {
      console.error('获取工作模式失败:', error);
      return ServiceResultFactory.error(`获取工作模式失败: ${error.message}`);
    }
  }

  /**
   * 获取所有统计数据
   */
  public async getAllStats(): Promise<ServiceResult<{
    efficiency: EfficiencyStats;
    completion: TaskCompletionStats[];
    patterns: WorkPattern[];
  }>> {
    try {
      const [efficiencyResult, completionResult, patternsResult] = await Promise.all([
        this.getEfficiencyStats(),
        this.getTaskCompletionStats(),
        this.getWorkPatterns()
      ]);

      if (!efficiencyResult.success || !completionResult.success || !patternsResult.success) {
        return ServiceResultFactory.error('获取统计数据失败');
      }

      return ServiceResultFactory.success({
        efficiency: efficiencyResult.data!,
        completion: completionResult.data!,
        patterns: patternsResult.data!
      });
    } catch (error: any) {
      console.error('获取所有统计数据失败:', error);
      return ServiceResultFactory.error(`获取所有统计数据失败: ${error.message}`);
    }
  }
}

