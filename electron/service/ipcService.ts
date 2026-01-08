// 引入Electron主进程模块，用于IPC通信和应用程序控制
const electron = require('electron');
// 解构获取IPC主进程和应用程序实例
const { ipcMain, app } = electron;

// 引入各种服务模块，用于注册相应的IPC处理程序
import { FileService } from './fileService';           // 文件操作服务
import { WebContentsService } from './webContentsService'; // Web内容服务
import { NotificationService } from './notificationService'; // 通知服务
import { ClientService } from './ClientService';   // 数据库服务
import { TerminalService } from './terminalService';  // 终端命令服务
import { MenuService } from './menuService';  // 菜单服务

/**
 * IPC服务类
 * 负责统一注册和管理所有的IPC（进程间通信）事件处理程序
 * 这个类是整个应用IPC通信的中央管理点
 */
export class IpcService {
  // 静态属性，存储主窗口实例的引用，供IPC处理程序使用
  private static mainWindow: any;
  // 静态属性，存储菜单服务实例的引用
  private static menuService: MenuService;

  /**
   * 注册所有IPC处理程序的统一入口
   * @param mainWindow 主窗口对象，用于窗口控制和通信
   * 
   * 此方法会依次调用各个服务模块的注册方法：
   * 1. 窗口控制处理程序
   * 2. 数据库相关IPC处理程序
   * 3. Web内容服务初始化
   * 4. 通知服务处理程序
   * 5. 对话框处理程序
   * 6. 文件操作处理程序
   */
  static registerHandlers(mainWindow: any) {
    this.mainWindow = mainWindow;
    this.menuService = new MenuService(mainWindow);

    // 1. 注册窗口控制相关的IPC处理程序（最小化、最大化、关闭、重启等）
    this.registerWindowControlHandlers();

    // 2. 注册数据库相关的IPC处理程序（连接管理、查询执行等）
    ClientService.registerIpcHandlers();

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

    // 处理窗口关闭请求
    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
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