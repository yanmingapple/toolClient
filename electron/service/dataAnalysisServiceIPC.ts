import { ipcMain } from 'electron';
import { DataAnalysisService } from './dataAnalysisService';

/**
 * 注册数据分析相关的IPC处理器
 */
export function registerDataAnalysisHandlers(): void {
  const dataAnalysisService = DataAnalysisService.getInstance();

  // 获取效率统计
  ipcMain.handle('data-analysis:get-efficiency-stats', async () => {
    return await dataAnalysisService.getEfficiencyStats();
  });

  // 获取任务完成率统计
  ipcMain.handle('data-analysis:get-completion-stats', async () => {
    return await dataAnalysisService.getTaskCompletionStats();
  });

  // 获取工作模式
  ipcMain.handle('data-analysis:get-work-patterns', async () => {
    return await dataAnalysisService.getWorkPatterns();
  });

  // 获取所有统计数据
  ipcMain.handle('data-analysis:get-all-stats', async () => {
    return await dataAnalysisService.getAllStats();
  });
}

