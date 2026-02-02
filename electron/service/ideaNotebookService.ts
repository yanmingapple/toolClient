import * as fs from 'fs';
import * as path from 'path';
const { app } = require('electron');
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

/**
 * 想法记事本服务
 * 负责管理想法和灵感的记录，保存到 memory/ideas.md 文件
 */
export class IdeaNotebookService {
  private static instance: IdeaNotebookService;
  private ideasFilePath: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    const memoryPath = path.join(userDataPath, 'memory');
    this.ideasFilePath = path.join(memoryPath, 'ideas.md');
    this.ensureIdeasFile();
  }

  public static getInstance(): IdeaNotebookService {
    if (!IdeaNotebookService.instance) {
      IdeaNotebookService.instance = new IdeaNotebookService();
    }
    return IdeaNotebookService.instance;
  }

  /**
   * 确保想法文件存在
   */
  private ensureIdeasFile(): void {
    const memoryDir = path.dirname(this.ideasFilePath);
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.ideasFilePath)) {
      const initialContent = `# 想法记事本

记录你的想法和灵感。

---
`;
      fs.writeFileSync(this.ideasFilePath, initialContent, 'utf-8');
    }
  }

  /**
   * 读取所有想法
   */
  public async readIdeas(): Promise<ServiceResult<string>> {
    try {
      if (!fs.existsSync(this.ideasFilePath)) {
        this.ensureIdeasFile();
      }
      const content = fs.readFileSync(this.ideasFilePath, 'utf-8');
      return ServiceResultFactory.success(content);
    } catch (error: any) {
      console.error('读取想法失败:', error);
      return ServiceResultFactory.error(`读取想法失败: ${error.message}`);
    }
  }

  /**
   * 保存想法
   */
  public async saveIdeas(content: string): Promise<ServiceResult<void>> {
    try {
      this.ensureIdeasFile();
      fs.writeFileSync(this.ideasFilePath, content, 'utf-8');
      return ServiceResultFactory.success(undefined, '想法已保存');
    } catch (error: any) {
      console.error('保存想法失败:', error);
      return ServiceResultFactory.error(`保存想法失败: ${error.message}`);
    }
  }

  /**
   * 追加想法
   */
  public async appendIdea(idea: string, tags?: string[]): Promise<ServiceResult<void>> {
    try {
      this.ensureIdeasFile();
      
      // 读取现有内容
      let content = '';
      if (fs.existsSync(this.ideasFilePath)) {
        content = fs.readFileSync(this.ideasFilePath, 'utf-8');
      }
      
      // 生成时间戳
      const now = new Date();
      const timestamp = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // 构建新想法条目
      let newEntry = `\n## ${timestamp}\n\n`;
      if (tags && tags.length > 0) {
        newEntry += `**标签**: ${tags.join(', ')}\n\n`;
      }
      newEntry += `${idea}\n\n`;
      newEntry += `---\n`;
      
      // 追加到文件末尾
      const newContent = content + newEntry;
      fs.writeFileSync(this.ideasFilePath, newContent, 'utf-8');
      
      return ServiceResultFactory.success(undefined, '想法已添加');
    } catch (error: any) {
      console.error('添加想法失败:', error);
      return ServiceResultFactory.error(`添加想法失败: ${error.message}`);
    }
  }
}

