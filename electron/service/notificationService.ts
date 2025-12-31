const electron = require('electron');
const { Notification } = electron;

/**
 * 通知服务类
 * 负责管理所有的通知相关功能，包括系统通知、应用内提醒等
 */
export class NotificationService {
  /**
   * 显示通知
   * @param title 通知标题
   * @param body 通知内容
   * @param options 通知选项（可选）
   */
  static show(title: string, body: string, options?: any) {
    // 检查是否支持原生通知
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: title,
        body: body,
        icon: options?.icon || undefined,
        silent: options?.silent || false
      });

      notification.show();

      // 可选：监听通知点击事件
      if (options?.onClick) {
        notification.on('click', options.onClick);
      }

      // 可选：监听通知关闭事件
      if (options?.onClose) {
        notification.on('close', options.onClose);
      }

      return notification;
    } else {
      // 如果不支持原生通知，则输出到控制台
      console.log('Notification:', title, body);
      return null;
    }
  }

  /**
   * 显示成功通知
   * @param message 消息内容
   * @param options 额外选项
   */
  static success(message: string, options?: any) {
    return this.show('成功', message, {
      icon: options?.icon || 'success',
      ...options
    });
  }

  /**
   * 显示错误通知
   * @param message 错误消息
   * @param options 额外选项
   */
  static error(message: string, options?: any) {
    return this.show('错误', message, {
      icon: options?.icon || 'error',
      silent: false,
      ...options
    });
  }

  /**
   * 显示警告通知
   * @param message 警告消息
   * @param options 额外选项
   */
  static warning(message: string, options?: any) {
    return this.show('警告', message, {
      icon: options?.icon || 'warning',
      ...options
    });
  }

  /**
   * 显示信息通知
   * @param message 信息内容
   * @param options 额外选项
   */
  static info(message: string, options?: any) {
    return this.show('信息', message, {
      icon: options?.icon || 'info',
      ...options
    });
  }

  /**
   * 显示数据库操作通知
   * @param operation 操作类型
   * @param status 状态（成功/失败）
   * @param details 详细信息
   */
  static databaseOperation(operation: string, status: 'success' | 'error', details?: string) {
    const title = `数据库${operation}`;
    const body = status === 'success' 
      ? `数据库${operation}操作成功${details ? ': ' + details : ''}`
      : `数据库${operation}操作失败${details ? ': ' + details : ''}`;
    
    return this.show(title, body);
  }

  /**
   * 显示文件操作通知
   * @param operation 操作类型
   * @param fileName 文件名
   * @param status 状态
   */
  static fileOperation(operation: string, fileName: string, status: 'success' | 'error') {
    const title = `文件${operation}`;
    const body = `文件"${fileName}"${operation}操作${status === 'success' ? '成功' : '失败'}`;
    
    return this.show(title, body);
  }

  /**
   * 注册通知相关的IPC处理程序
   */
  static registerIpcHandlers() {
    const { ipcMain } = require('electron');
    
    ipcMain.on('notification:show', (_: any, title: string, body: string) => {
      this.show(title, body);
    });

    ipcMain.on('notification:success', (_: any, message: string) => {
      this.success(message);
    });

    ipcMain.on('notification:error', (_: any, message: string) => {
      this.error(message);
    });

    ipcMain.on('notification:warning', (_: any, message: string) => {
      this.warning(message);
    });

    ipcMain.on('notification:info', (_: any, message: string) => {
      this.info(message);
    });
  }

  /**
   * 检查系统是否支持通知
   * @returns 是否支持通知
   */
  static isNotificationSupported(): boolean {
    return Notification.isSupported();
  }

  /**
   * 获取通知权限状态
   * @returns 权限状态
   */
  static async getPermission(): Promise<string> {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
}