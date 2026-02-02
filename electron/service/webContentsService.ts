const electron = require('electron');
const { webContents } = electron;

/**
 * Web内容服务类
 * 负责管理webContents相关的功能，包括向渲染进程发送消息、弹出对话框等
 */
export class WebContentsService {
  private static mainWindow: any;

  /**
   * 初始化Web内容服务
   * @param mainWindow 主窗口对象
   */
  static initialize(mainWindow: any) {
    this.mainWindow = mainWindow;
  }

  /**
   * 向渲染进程发送消息
   * @param channel 消息通道
   * @param args 消息参数
   */
  static sendToRenderer(channel: string, ...args: any[]) {
    // 向所有窗口广播消息，确保对话框窗口也能收到
    const allWebContents = webContents.getAllWebContents();
    console.log(`[WebContentsService] 向 ${allWebContents.length} 个窗口发送消息: ${channel}`, args);
    
    allWebContents.forEach((wc) => {
      if (!wc.isDestroyed()) {
        try {
          wc.send(channel, ...args);
          console.log(`[WebContentsService] 消息已发送到窗口 ID: ${wc.id}`);
        } catch (error) {
          console.error(`[WebContentsService] 发送消息到窗口 ${wc.id} 失败:`, error);
        }
      }
    });
    
    // 保持向后兼容：也向主窗口发送（如果主窗口不在上面的列表中）
    if (this.mainWindow?.webContents && !this.mainWindow.webContents.isDestroyed()) {
      try {
        this.mainWindow.webContents.send(channel, ...args);
      } catch (error) {
        console.error('[WebContentsService] 发送消息到主窗口失败:', error);
      }
    }
  }

  /**
   * 打开新连接对话框
   */
  static openNewConnectionDialog() {
    this.sendToRenderer('open-new-connection-dialog');
  }

  /**
   * 注册对话框相关的IPC处理程序
   */
  static registerDialogHandlers() {
    // 应用程序菜单事件
    const { ipcMain } = require('electron');
    ipcMain.on('open-new-connection-dialog', () => {
      // 向渲染进程发送打开新连接对话框的消息
      this.mainWindow?.webContents.send('open-new-connection-dialog');
    });
  }

  /**
   * 创建一个新的BrowserWindow实例（为未来扩展做准备）
   * @param options BrowserWindow选项
   * @returns BrowserWindow实例
   */
  static createWindow(options: any) {
    const { BrowserWindow } = require('electron');
    return new BrowserWindow(options);
  }

  /**
   * 获取所有webContents实例
   * @returns webContents实例数组
   */
  static getAllWebContents(): any[] {
    return webContents.getAllWebContents();
  }

  /**
   * 根据ID获取webContents实例
   * @param id webContents ID
   * @returns webContents实例
   */
  static getWebContentsById(id: number): any {
    return webContents.fromId(id);
  }
}