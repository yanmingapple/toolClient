import * as fs from 'fs/promises';
const electron = require('electron');
const { dialog } = electron;

/**
 * 文件服务类
 * 处理所有文件操作相关的功能，包括选择文件、保存文件、读取文件等
 */
export class FileService {
  /**
   * 选择文件
   * @param mainWindow 主窗口对象
   * @param filters 文件过滤器
   * @returns Promise<string> 选择的文件路径
   */
  static async selectFile(mainWindow: any, filters?: Array<{ name: string; extensions: string[] }>): Promise<string> {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: filters || [
        { name: 'SQL Files', extensions: ['sql'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.filePaths[0] || '';
  }

  /**
   * 选择文件夹
   * @param mainWindow 主窗口对象
   * @returns Promise<string> 选择的文件夹路径
   */
  static async selectFolder(mainWindow: any): Promise<string> {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.filePaths[0] || '';
  }

  /**
   * 保存文件
   * @param mainWindow 主窗口对象
   * @param defaultPath 默认路径
   * @param content 文件内容
   * @returns Promise<boolean> 是否成功
   */
  static async saveFile(mainWindow: any, defaultPath: string, content: string): Promise<boolean> {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultPath,
        filters: [
          { name: 'SQL Files', extensions: ['sql'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        await fs.writeFile(result.filePath, content, 'utf8');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }

  /**
   * 读取文件
   * @param filePath 文件路径
   * @returns Promise<string> 文件内容
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  /**
   * 注册文件服务相关的 IPC 处理程序
   * @param ipcMain IPC 主对象
   * @param mainWindow 主窗口对象
   */
  static registerIpcHandlers(ipcMain: any, mainWindow: any) {
    ipcMain.handle('file:select-file', async (_: any, filters?: Array<{ name: string; extensions: string[] }>) => {
      return await this.selectFile(mainWindow, filters);
    });

    ipcMain.handle('file:select-folder', async () => {
      return await this.selectFolder(mainWindow);
    });

    ipcMain.handle('file:save-file', async (_: any, defaultPath: string, content: string) => {
      return await this.saveFile(mainWindow, defaultPath, content);
    });

    ipcMain.handle('file:read-file', async (_: any, filePath: string) => {
      return await this.readFile(filePath);
    });
  }
}