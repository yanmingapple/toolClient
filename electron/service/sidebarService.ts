// 引入Electron主进程模块，用于IPC通信
const electron = require('electron');
// 解构获取IPC主进程
const { ipcMain } = electron;

// 引入窗口管理服务
import { WindowService } from './windowService';

/**
 * 侧边栏服务类
 * 负责处理侧边栏相关的所有IPC通信
 * 包括：OCR页面打开、日历提醒、信用卡提醒等
 */
export class SidebarService {
  // 静态属性，存储侧边栏窗口实例的引用
  private static sidebarWindow: any;

  /**
   * 注册侧边栏相关的所有IPC处理程序
   * @param mainWindow 主窗口实例（预留参数，未来可能使用）
   * @param sidebarWindow 侧边栏窗口实例
   */
  static registerIpcHandlers(_mainWindow: any, sidebarWindow: any) {
    this.sidebarWindow = sidebarWindow;

    // 注册侧边栏相关的IPC处理程序
    this.registerSidebarHandlers();


    // 监听鼠标进入事件 - 展开侧边栏
    sidebarWindow.on('enter-full-screen', () => {
      this.expandSidebarIcon();
    });

    // 监听鼠标离开事件 - 收起侧边栏
    sidebarWindow.on('leave-full-screen', () => {
      this.collapseSidebar();
    });
  }

  /**
   * 注册侧边栏相关的IPC处理程序
   */
  private static registerSidebarHandlers() {
    // 处理打开日历提醒请求 - 直接打开对话框窗口
    ipcMain.on('sidebar:open-calendar', async () => {
      await WindowService.createWindow({
        page: 'dialog-event-reminder',
        title: '日历提醒',
        width: 800,
        height: 600
      });
    });

    // 处理打开信用卡提醒工具请求 - 直接打开对话框窗口
    ipcMain.on('sidebar:open-credit-card', async () => {
      await WindowService.createWindow({
        page: 'dialog-credit-card',
        title: '信用卡提醒',
        width: 800,
        height: 600
      });
    });

    // 处理切换侧边栏请求
    ipcMain.on('sidebar:toggle', () => {
      this.toggleSidebar();
    });

    // 处理关闭侧边栏请求
    ipcMain.on('sidebar:close', () => {
      if (this.sidebarWindow) {
        this.sidebarWindow.hide();
      }
    });

    // 处理展开侧边栏请求
    ipcMain.on('sidebar:expand', () => {
      this.expandSidebar();
    });

    // 处理收起侧边栏请求
    ipcMain.on('sidebar:collapse', () => {
      this.collapseSidebar();
    });
  }

  /**
   * 切换侧边栏的显示/隐藏状态
   */
  static toggleSidebar() {
    if (this.sidebarWindow) {
      if (this.sidebarWindow.isVisible()) {
        this.sidebarWindow.hide();
      } else {
        this.sidebarWindow.show();
      }
    }
  }

  /**
 * 展开侧边栏
 */
  static expandSidebarIcon() {
    if (this.sidebarWindow) {
      const { screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width } = primaryDisplay.workAreaSize;
      const targetX = width - 10;
      const [, y] = this.sidebarWindow.getPosition();
      this.sidebarWindow.setSize(10, this.sidebarWindow.getSize()[1]);
      this.sidebarWindow.setPosition(targetX, y);
    }
  }

  /**
   * 展开侧边栏
   */
  static expandSidebar() {
    if (this.sidebarWindow) {
      const { screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width } = primaryDisplay.workAreaSize;
      const targetX = width - 300;
      const [, y] = this.sidebarWindow.getPosition();
      this.sidebarWindow.setSize(300, this.sidebarWindow.getSize()[1]);
      this.sidebarWindow.setPosition(targetX, y);
    }
  }

  /**
   * 收起侧边栏
   */
  static collapseSidebar() {
    if (this.sidebarWindow) {
      const { screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width } = primaryDisplay.workAreaSize;
      const targetX = width - 5;
      const [, y] = this.sidebarWindow.getPosition();
      this.sidebarWindow.setSize(5, 30);
      this.sidebarWindow.setPosition(targetX, y);
    }
  }

  /**
   * 设置侧边栏窗口的事件监听
   */
  static setupWindowEventListeners() {
    if (this.sidebarWindow) {
      // 使用 webContents 监听页面加载完成事件
      this.sidebarWindow.webContents.on('did-finish-load', () => {
        // 向渲染进程发送消息，通知侧边栏已准备好
        this.sidebarWindow.webContents.send('sidebar-ready');
      });
    }
  }
}
