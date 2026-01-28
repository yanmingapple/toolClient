// 引入Electron主进程模块，用于IPC通信和应用程序控制
const electron = require('electron');
// 解构获取IPC主进程和应用程序实例
const { ipcMain, app } = electron;

// 引入各种服务模块，用于注册相应的IPC处理程序
import { FileService } from './fileService';           // 文件操作服务
import { WebContentsService } from './webContentsService'; // Web内容服务
import { NotificationService } from './notificationService'; // 通知服务
import { DatabaseManager } from '../manager/ClientManager';   // 数据库管理器
import { TerminalService } from './terminalService';  // 终端命令服务
import { MenuService } from './menuService';  // 菜单服务
import { SidebarService } from './sidebarService';  // 侧边栏服务
import { WindowService } from './windowService';  // 窗口管理服务

/**
 * IPC服务类
 * 负责统一注册和管理所有的IPC（进程间通信）事件处理程序
 * 这个类是整个应用IPC通信的中央管理点
 */
export class IpcService {
  // 静态属性，存储主窗口实例的引用，供IPC处理程序使用
  private static mainWindow: any;
  //
  private static sidebarWindow: any;
  // 静态属性，存储菜单服务实例的引用
  private static menuService: MenuService;

  /**
   * 注册所有IPC处理程序的统一入口
   * @param mainWindow 主窗口对象，用于窗口控制和通信
   * @param sidebarWindow 侧边栏窗口对象，用于侧边栏控制
   * 
   * 此方法会依次调用各个服务模块的注册方法：
   * 1. 窗口控制处理程序
   * 2. 数据库相关IPC处理程序
   * 3. Web内容服务初始化
   * 4. 通知服务处理程序
   * 5. 对话框处理程序
   * 6. 文件操作处理程序
   * 7. 侧边栏服务处理程序
   */
  static registerHandlers(mainWindow: any, sidebarWindow?: any) {
    this.mainWindow = mainWindow;
    this.sidebarWindow = sidebarWindow;
    this.menuService = new MenuService(mainWindow);

    // 1. 注册窗口控制相关的IPC处理程序（最小化、最大化、关闭、重启等）
    this.registerWindowControlHandlers();

    // 2. 注册数据库相关的IPC处理程序（连接管理、查询执行等）
    DatabaseManager.registerIpcHandlers();

    // 3. 初始化WebContentsService，传入主窗口引用用于后续通信
    WebContentsService.initialize(mainWindow);

    // 4. 注册通知相关的IPC处理程序（系统通知、应用通知等）
    NotificationService.registerIpcHandlers();

    // 5. 注册对话框相关的IPC处理程序（文件选择、消息框等）
    WebContentsService.registerDialogHandlers();

    // 6. 注册文件操作相关的IPC处理程序（文件读写、保存等）
    FileService.registerIpcHandlers(ipcMain, mainWindow);

    // 7. 注册终端命令相关的IPC处理程序（cmd、powershell命令执行等）
    TerminalService.getInstance().registerIpcHandlers();

    // 8. 注册菜单控制相关的IPC处理程序
    this.registerMenuHandlers();

    // 9. 注册侧边栏相关的IPC处理程序（如果提供了侧边栏窗口）
    if (sidebarWindow) {
      SidebarService.registerIpcHandlers(mainWindow, sidebarWindow);
    }

    // 10. 注册窗口管理相关的IPC处理程序
    WindowService.registerIpcHandlers();
  }

  /**
   * 注册窗口控制相关的IPC处理程序
   * 
   * 处理来自渲染进程的窗口控制请求，包括：
   * - 窗口最小化
   * - 窗口最大化/还原
   * - 窗口关闭
   * - 应用程序重启
   */
  private static registerWindowControlHandlers() {
    // 处理窗口最小化请求
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    // 处理窗口最大化/还原切换请求
    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        // 如果当前已最大化，则还原窗口
        this.mainWindow.unmaximize();
      } else {
        // 如果当前未最大化，则最大化窗口
        this.mainWindow?.maximize();
      }
    });

    // 处理窗口关闭请求（关闭发送请求的窗口）
    ipcMain.handle('window:close', (event: any) => {
      // 尝试从事件中获取发送消息的窗口
      const { BrowserWindow } = require('electron');
      const senderWindow = BrowserWindow.fromWebContents(event.sender);
      if (senderWindow) {
        senderWindow.close();
      } else {
        // 如果无法获取，则关闭主窗口
        this.mainWindow?.close();
      }
    });

    // 处理应用程序重启请求
    ipcMain.handle('app:restart', () => {
      // 重新启动应用程序并退出当前实例
      app.relaunch();
      app.quit();
    });
  }

  /**
   * 注册菜单控制相关的IPC处理程序
   */
  private static registerMenuHandlers() {
    // 处理菜单类型切换请求
    // @ts-ignore
    ipcMain.handle('menu:switch-type', (_event: any, menuType: string) => {
      if (menuType === 'workspace' || menuType === 'database') {
        this.menuService.setMenuType(menuType);
        return true;
      }
      return false;
    });
  }
}