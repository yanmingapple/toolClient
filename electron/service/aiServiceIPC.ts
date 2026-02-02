const { ipcMain } = require('electron');
import { AIService } from './aiService';
import { AIAgentCore } from './ai/AIAgentCore';
import { CalendarModule } from './ai/modules/CalendarModule';
import { DatabaseClient } from '../dataService/database';

/**
 * AI服务IPC处理器注册
 */
export class AIServiceIPC {
  private static aiService: AIService;
  private static aiAgentCore: AIAgentCore;
  private static databaseClient: DatabaseClient | null = null;

  /**
   * 初始化AI服务
   */
  public static initialize(databaseClient: DatabaseClient): void {
    this.databaseClient = databaseClient;
    
    // 初始化AIService
    this.aiService = AIService.getInstance();
    this.aiService.setDatabaseClient(databaseClient);

    // 初始化AIAgentCore
    this.aiAgentCore = AIAgentCore.getInstance();
    this.aiAgentCore.setDatabaseClient(databaseClient);

    // 注册日历模块
    const calendarModule = new CalendarModule(databaseClient);
    this.aiAgentCore.registerModule(calendarModule).catch(err => {
      console.error('注册日历模块失败:', err);
    });

    // 注册信用卡模块
    const { CreditCardModule } = require('./ai/modules/CreditCardModule');
    const creditCardModule = new CreditCardModule(databaseClient);
    this.aiAgentCore.registerModule(creditCardModule).catch(err => {
      console.error('注册信用卡模块失败:', err);
    });
  }

  /**
   * 注册所有AI相关的IPC处理器
   */
  public static registerIpcHandlers(): void {
    // Plan-and-Solve 架构相关接口
    ipcMain.handle('ai:parse-with-plan-solve', async (event, text: string, context?: any) => {
      try {
        const aiService = AIService.getInstance();
        
        // 创建IPC发送器，将事件发送到前端
        const ipcSender = (channel: string, data: any) => {
          // console.log('[AIServiceIPC] 发送IPC事件到前端:', channel, data);
          event.sender.send(channel, data);
        };
        
        const result = await aiService.parseNaturalLanguageWithPlanAndSolve(text, context, undefined, ipcSender);
        return result;
      } catch (error: any) {
        console.error('Plan-and-Solve 解析失败:', error);
        return {
          success: false,
          message: error.message || 'Plan-and-Solve 解析失败'
        };
      }
    });
    // 先移除已存在的处理器（避免重复注册）
    const handlers = [
      'ai:parse-natural-language',
      'ai:get-config',
      'ai:configure',
      'ai:check-network-status',
      'ai:classify-event',
      'ai:detect-conflicts',
      'ai:optimize-schedule',
      'ai:generate-summary'
    ];

    handlers.forEach(handler => {
      if (ipcMain.listenerCount(handler) > 0) {
        ipcMain.removeHandler(handler);
        console.log(`已移除已存在的处理器: ${handler}`);
      }
    });

    // 解析自然语言
    ipcMain.handle('ai:parse-natural-language', async (_event, text: string, context?: any) => {
      try {
        return await this.aiService.parseNaturalLanguage(text, context);
      } catch (error: any) {
        console.error('解析自然语言失败:', error);
        return { success: false, message: error.message || '解析失败' };
      }
    });

    // 获取AI配置
    ipcMain.handle('ai:get-config', async () => {
      try {
        return await this.aiService.getAIConfig();
      } catch (error: any) {
        console.error('获取AI配置失败:', error);
        return { success: false, message: error.message || '获取配置失败' };
      }
    });

    // 配置AI服务
    ipcMain.handle('ai:configure', async (_event, config: any) => {
      try {
        return await this.aiService.configureAI(config);
      } catch (error: any) {
        console.error('配置AI服务失败:', error);
        return { success: false, message: error.message || '配置失败' };
      }
    });

    // 检查网络状态
    ipcMain.handle('ai:check-network-status', async () => {
      try {
        const isOnline = await this.aiService.checkNetworkStatusPublic();
        return { success: true, data: { online: isOnline } };
      } catch (error: any) {
        console.error('检查网络状态失败:', error);
        return { success: false, message: error.message || '检查失败' };
      }
    });

    // 智能分类事件
    ipcMain.handle('ai:classify-event', async (_event, event: any) => {
      try {
        return await this.aiService.classifyEvent(event);
      } catch (error: any) {
        console.error('智能分类失败:', error);
        return { success: false, message: error.message || '分类失败' };
      }
    });

    // 检测事件冲突
    ipcMain.handle('ai:detect-conflicts', async (_event, newEvent: any, existingEvents: any[]) => {
      try {
        return await this.aiService.detectConflicts(newEvent, existingEvents);
      } catch (error: any) {
        console.error('检测冲突失败:', error);
        return { success: false, message: error.message || '检测失败' };
      }
    });

    // 优化日程安排
    ipcMain.handle('ai:optimize-schedule', async (_event, events: any[]) => {
      try {
        return await this.aiService.optimizeSchedule(events);
      } catch (error: any) {
        console.error('优化日程失败:', error);
        return { success: false, message: error.message || '优化失败' };
      }
    });

    // 生成日程摘要
    ipcMain.handle('ai:generate-summary', async (_event, events: any[], period: 'day' | 'week' | 'month') => {
      try {
        return await this.aiService.generateSummary(events, period);
      } catch (error: any) {
        console.error('生成摘要失败:', error);
        return { success: false, message: error.message || '生成失败' };
      }
    });
  }
}

