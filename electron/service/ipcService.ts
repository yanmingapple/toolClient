// 引入Electron主进程模块，用于IPC通信和应用程序控制
const electron = require('electron');
// 解构获取IPC主进程和应用程序实例
const { ipcMain, app } = electron;

// 引入各种服务模块，用于注册相应的IPC处理程序
import { FileService } from './fileService';           // 文件操作服务
import { WebContentsService } from './webContentsService'; // Web内容服务
import { NotificationService } from './notificationService'; // 通知服务
import { DatabaseManager } from '../manager/ClientManager';   // 工具
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
    this.menuService = new MenuService(mainWindow);

    // 1. 注册窗口控制相关的IPC处理程序（最小化、最大化、关闭、重启等）
    this.registerWindowControlHandlers();

    // 2. 注册数据库相关的IPC处理程序（连接管理、查询执行等）
    DatabaseManager.registerIpcHandlers().catch(err => {
      console.error('注册IPC处理器失败:', err);
    });

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

    // 11. 注册 dbgate 相关的 IPC 处理程序
    this.registerDbgateHandlers();
    
    // 12. 注册 dbgate 窗口服务的 IPC 处理程序
    const { DbgateWindowService } = require('./dbgate');
    DbgateWindowService.registerIpcHandlers();

    // 13. 注册 AI 服务相关的 IPC 处理程序
    this.registerAIHandlers();
  }

  /**
   * 注册 AI 服务相关的 IPC 处理程序
   */
  private static registerAIHandlers() {
    const { AIServiceIPC } = require('./aiServiceIPC');
    const { DatabaseManager } = require('../manager/ClientManager');
    
    // 获取工具实例并等待初始化完成
    const dbManager = DatabaseManager.getInstance();
    
    // 等待数据库初始化完成后再注册AI服务
    dbManager.initialize().then(() => {
      const client = dbManager.getDatabaseClient();
      if (client) {
        AIServiceIPC.initialize(client);
        AIServiceIPC.registerIpcHandlers();
        console.log('AI服务IPC处理器注册成功');
      } else {
        console.warn('数据库客户端未初始化，AI服务IPC处理器注册失败');
      }
    }).catch((err: any) => {
      console.error('初始化AI服务失败:', err);
    });
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

    // 监听打开AI配置对话框的请求（从菜单触发）
    ipcMain.on('open-ai-config-dialog', () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send('open-ai-config-dialog');
      }
    });
  }

  /**
   * 注册 dbgate 相关的 IPC 处理程序
   */
  private static registerDbgateHandlers() {
    const { DbgateWindowService } = require('./dbgate');
    
    // 打开 dbgate 窗口
    ipcMain.handle('dbgate:open', async () => {
      try {
        const window = await DbgateWindowService.createDbgateWindow();
        return { success: true, windowId: window.id };
      } catch (error: any) {
        console.error('Failed to open dbgate window:', error);
        return { success: false, error: error.message };
      }
    });
    
    // 关闭 dbgate 窗口
    ipcMain.handle('dbgate:close', () => {
      DbgateWindowService.closeDbgateWindow();
      return { success: true };
    });
    
    // 检查 dbgate 窗口是否存在
    ipcMain.handle('dbgate:is-open', () => {
      return DbgateWindowService.hasDbgateWindow();
    });
  }
}