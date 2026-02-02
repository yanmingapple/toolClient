import * as fs from 'fs';
import * as path from 'path';
const { app } = require('electron');
import { DatabaseClient } from '../dataService/database';
import { SQLStatements } from '../dataService/sql';
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 任务完成信息
 */
export interface TaskCompletionInfo {
  eventId: string;
  title: string;
  type: string;
  createTime: string;
  completeTime: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  interruptionCount?: number;
  description?: string;
  tags?: string[];
}

/**
 * 工作日志服务
 * 负责提取工作模式（不生成日志文件）
 */
export class WorkLogService {
  private static instance: WorkLogService;
  private databaseClient: DatabaseClient | null = null;
  private memoryBasePath: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.memoryBasePath = path.join(userDataPath, 'memory');
    this.ensureMemoryDirectory();
  }

  public static getInstance(): WorkLogService {
    if (!WorkLogService.instance) {
      WorkLogService.instance = new WorkLogService();
    }
    return WorkLogService.instance;
  }

  /**
   * 设置数据库客户端
   */
  public setDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client;
  }


  /**
   * 确保记忆目录结构存在
   */
  private ensureMemoryDirectory(): void {
    const dirs = [
      this.memoryBasePath,
      path.join(this.memoryBasePath, 'daily'),
      path.join(this.memoryBasePath, 'habits')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 只提取工作模式，不生成日志文件
   */
  public async extractWorkPatternsOnly(
    completionInfo: TaskCompletionInfo
  ): Promise<ServiceResult<void>> {
    try {
      // 只提取关键经验到工作模式文件，不写入日志
      await this.extractWorkPatterns(completionInfo);
      return ServiceResultFactory.success(undefined, '工作模式已更新');
    } catch (error: any) {
      console.error('提取工作模式失败:', error);
      return ServiceResultFactory.error(`提取工作模式失败: ${error.message}`);
    }
  }

  /**
   * 提取工作模式到work-patterns.md
   */
  private async extractWorkPatterns(info: TaskCompletionInfo): Promise<void> {
    try {
      const patternsPath = path.join(this.memoryBasePath, 'habits', 'work-patterns.md');
      
      // 读取现有模式文件
      let content = '';
      if (fs.existsSync(patternsPath)) {
        content = fs.readFileSync(patternsPath, 'utf-8');
      } else {
        content = `# 工作模式识别\n\n`;
        content += `本文档记录系统学习到的工作模式。\n\n`;
      }

      // 提取关键信息
      const actualMinutes = info.actualMinutes || this.calculateActualMinutes(info.createTime, info.completeTime);
      const completeTime = new Date(info.completeTime);
      const hour = completeTime.getHours();
      const dayOfWeek = completeTime.getDay();
      const efficiency = this.calculateEfficiency(actualMinutes, info.estimatedMinutes || 60);

      // 更新或创建任务类型模式
      await this.updateTaskTypePattern(content, patternsPath, info.type, {
        actualMinutes,
        hour,
        efficiency,
        interruptionCount: info.interruptionCount || 0
      });

      // 更新最佳工作时间模式
      await this.updateBestTimePattern(patternsPath, hour, efficiency, info.type);

      // 更新任务偏好
      await this.updateTaskPreferences(patternsPath, info.type, actualMinutes, efficiency);
    } catch (error) {
      console.error('提取工作模式失败:', error);
    }
  }

  /**
   * 更新任务类型模式
   */
  private async updateTaskTypePattern(
    currentContent: string,
    patternsPath: string,
    taskType: string,
    data: { actualMinutes: number; hour: number; efficiency: number; interruptionCount: number }
  ): Promise<void> {
    let content = currentContent;
    const sectionHeader = `## ${taskType}类任务`;

    if (content.includes(sectionHeader)) {
      // 更新现有部分
      const lines = content.split('\n');
      const sectionStart = lines.findIndex(line => line.includes(sectionHeader));
      if (sectionStart !== -1) {
        // 找到该部分的结束位置（下一个##或文件结束）
        let sectionEnd = lines.length;
        for (let i = sectionStart + 1; i < lines.length; i++) {
          if (lines[i].startsWith('##')) {
            sectionEnd = i;
            break;
          }
        }

        // 提取现有数据
        const sectionLines = lines.slice(sectionStart, sectionEnd);
        const existingData = this.parsePatternSection(sectionLines);

        // 更新数据
        existingData.samples = existingData.samples || [];
        existingData.samples.push({
          minutes: data.actualMinutes,
          hour: data.hour,
          efficiency: data.efficiency,
          interruptionCount: data.interruptionCount,
          date: new Date().toISOString().split('T')[0]
        });

        // 计算平均值
        const avgMinutes = Math.round(
          existingData.samples.reduce((sum: number, s: any) => sum + s.minutes, 0) / existingData.samples.length
        );
        const avgEfficiency = Math.round(
          existingData.samples.reduce((sum: number, s: any) => sum + s.efficiency, 0) / existingData.samples.length
        );
        const avgInterruptions = (
          existingData.samples.reduce((sum: number, s: any) => sum + s.interruptionCount, 0) / existingData.samples.length
        ).toFixed(1);

        // 重建该部分
        const newSection = [
          sectionHeader,
          '',
          `- **平均耗时**: ${avgMinutes}分钟`,
          `- **平均效率**: ${avgEfficiency}/100`,
          `- **平均打断次数**: ${avgInterruptions}次`,
          `- **样本数**: ${existingData.samples.length}`,
          `- **最后更新**: ${new Date().toISOString().split('T')[0]}`,
          ''
        ];

        // 替换该部分
        const newLines = [
          ...lines.slice(0, sectionStart),
          ...newSection,
          ...lines.slice(sectionEnd)
        ];
        content = newLines.join('\n');
      }
    } else {
      // 添加新部分
      content += `\n${sectionHeader}\n\n`;
      content += `- **平均耗时**: ${data.actualMinutes}分钟\n`;
      content += `- **平均效率**: ${data.efficiency}/100\n`;
      content += `- **平均打断次数**: ${data.interruptionCount}次\n`;
      content += `- **样本数**: 1\n`;
      content += `- **最后更新**: ${new Date().toISOString().split('T')[0]}\n\n`;
    }

    fs.writeFileSync(patternsPath, content, 'utf-8');
  }

  /**
   * 解析模式部分数据
   */
  private parsePatternSection(lines: string[]): any {
    const data: any = { samples: [] };
    for (const line of lines) {
      if (line.includes('平均耗时')) {
        const match = line.match(/(\d+)分钟/);
        if (match) data.avgMinutes = parseInt(match[1]);
      } else if (line.includes('平均效率')) {
        const match = line.match(/(\d+)\/100/);
        if (match) data.avgEfficiency = parseInt(match[1]);
      } else if (line.includes('样本数')) {
        const match = line.match(/(\d+)/);
        if (match) data.sampleCount = parseInt(match[1]);
      }
    }
    return data;
  }

  /**
   * 更新最佳工作时间模式
   */
  private async updateBestTimePattern(
    patternsPath: string,
    hour: number,
    efficiency: number,
    taskType: string
  ): Promise<void> {
    try {
      const bestTimesPath = path.join(this.memoryBasePath, 'habits', 'best-times.md');
      
      let content = '';
      if (fs.existsSync(bestTimesPath)) {
        content = fs.readFileSync(bestTimesPath, 'utf-8');
      } else {
        content = `# 最佳工作时间\n\n`;
        content += `本文档记录不同时间段的工作效率。\n\n`;
      }

      // 时间段分类
      let timeSlot = '';
      if (hour >= 6 && hour < 9) timeSlot = '早晨 (06:00-09:00)';
      else if (hour >= 9 && hour < 12) timeSlot = '上午 (09:00-12:00)';
      else if (hour >= 12 && hour < 14) timeSlot = '中午 (12:00-14:00)';
      else if (hour >= 14 && hour < 18) timeSlot = '下午 (14:00-18:00)';
      else if (hour >= 18 && hour < 22) timeSlot = '晚上 (18:00-22:00)';
      else timeSlot = '深夜 (22:00-06:00)';

      // 更新或添加时间段记录
      if (content.includes(timeSlot)) {
        // 更新现有记录
        const lines = content.split('\n');
        const slotIndex = lines.findIndex(line => line.includes(timeSlot));
        if (slotIndex !== -1) {
          // 提取现有效率数据
          let efficiencySum = efficiency;
          let count = 1;
          for (let i = slotIndex + 1; i < lines.length && i < slotIndex + 10; i++) {
            if (lines[i].includes('效率评分')) {
              const match = lines[i].match(/(\d+)/);
              if (match) {
                efficiencySum += parseInt(match[1]);
                count++;
              }
            }
          }
          const avgEfficiency = Math.round(efficiencySum / count);
          
          // 更新该时间段
          const newLine = `- **${timeSlot}**: 效率评分 ${avgEfficiency}（${taskType}类任务）`;
          lines[slotIndex] = newLine;
          content = lines.join('\n');
        }
      } else {
        // 添加新时间段
        content += `- **${timeSlot}**: 效率评分 ${efficiency}（${taskType}类任务）\n`;
      }

      fs.writeFileSync(bestTimesPath, content, 'utf-8');
    } catch (error) {
      console.error('更新最佳工作时间失败:', error);
    }
  }

  /**
   * 更新任务偏好
   */
  private async updateTaskPreferences(
    patternsPath: string,
    taskType: string,
    actualMinutes: number,
    efficiency: number
  ): Promise<void> {
    try {
      const preferencesPath = path.join(this.memoryBasePath, 'habits', 'task-preferences.md');
      
      let content = '';
      if (fs.existsSync(preferencesPath)) {
        content = fs.readFileSync(preferencesPath, 'utf-8');
      } else {
        content = `# 任务偏好\n\n`;
        content += `本文档记录对不同类型任务的偏好和表现。\n\n`;
      }

      // 更新任务类型偏好
      const typeSection = `## ${taskType}类任务`;
      if (content.includes(typeSection)) {
        // 更新现有记录
        const lines = content.split('\n');
        const sectionIndex = lines.findIndex(line => line.includes(typeSection));
        if (sectionIndex !== -1) {
          // 查找效率记录
          let hasEfficiency = false;
          for (let i = sectionIndex; i < lines.length && i < sectionIndex + 10; i++) {
            if (lines[i].includes('平均效率')) {
              hasEfficiency = true;
              // 更新效率值（简化处理）
              lines[i] = `- **平均效率**: ${efficiency}/100`;
              break;
            }
          }
          if (!hasEfficiency) {
            lines.splice(sectionIndex + 1, 0, `- **平均效率**: ${efficiency}/100`);
          }
          content = lines.join('\n');
        }
      } else {
        // 添加新任务类型
        content += `\n${typeSection}\n\n`;
        content += `- **平均耗时**: ${actualMinutes}分钟\n`;
        content += `- **平均效率**: ${efficiency}/100\n`;
        content += `- **最后更新**: ${new Date().toISOString().split('T')[0]}\n\n`;
      }

      fs.writeFileSync(preferencesPath, content, 'utf-8');
    } catch (error) {
      console.error('更新任务偏好失败:', error);
    }
  }

  /**
   * 计算实际耗时（分钟）
   */
  private calculateActualMinutes(createTime: string, completeTime: string): number {
    const create = new Date(createTime).getTime();
    const complete = new Date(completeTime).getTime();
    return Math.round((complete - create) / 1000 / 60);
  }

  /**
   * 计算效率评分
   */
  private calculateEfficiency(actualMinutes: number, estimatedMinutes: number): number {
    if (estimatedMinutes === 0) return 50;
    
    const ratio = actualMinutes / estimatedMinutes;
    if (ratio <= 0.8) return 95; // 提前完成
    if (ratio <= 1.0) return 90; // 按时完成
    if (ratio <= 1.2) return 80; // 稍微超时
    if (ratio <= 1.5) return 70; // 明显超时
    return 60; // 严重超时
  }


  /**
   * 获取指定日期的日志路径（只读，用于总结上下文）
   */
  private getLogPath(date: string): string {
    return path.join(this.memoryBasePath, 'daily', `${date}.md`);
  }

  /**
   * 读取指定日期的日志
   */
  public async getLogByDate(date: string): Promise<ServiceResult<string>> {
    try {
      const logPath = this.getLogPath(date);
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf-8');
        return ServiceResultFactory.success(content);
      } else {
        return ServiceResultFactory.success('');
      }
    } catch (error: any) {
      console.error('读取日志失败:', error);
      return ServiceResultFactory.error(`读取日志失败: ${error.message}`);
    }
  }



  /**
   * 获取今日统计
   */
  public async getTodayStats(): Promise<ServiceResult<{
    completedTasks: number;
    totalTasks: number;
    totalHours: number;
    efficiencyScore: number;
    interruptions: number;
  }>> {
    try {
      if (!this.databaseClient) {
        return ServiceResultFactory.error('数据库未初始化');
      }

      const today = new Date().toISOString().split('T')[0];
      const events = await this.databaseClient.execute(
        'SELECT * FROM events WHERE date = ?',
        [today]
      ) as any[];

      // 简化统计，实际应该从日志中提取
      return ServiceResultFactory.success({
        completedTasks: events.length,
        totalTasks: events.length,
        totalHours: events.length * 1, // 简化计算
        efficiencyScore: 80, // 简化计算
        interruptions: 0
      });
    } catch (error: any) {
      console.error('获取统计失败:', error);
      return ServiceResultFactory.error(`获取统计失败: ${error.message}`);
    }
  }
}

