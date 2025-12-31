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
    if (this.mainWindow?.webContents) {
      this.mainWindow.webContents.send(channel, ...args);
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