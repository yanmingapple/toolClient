// 引入Electron主进程模块
const electron = require('electron');
const { BrowserWindow, ipcMain, Menu } = electron;
import * as path from 'path';
import * as url from 'url';
import { join } from 'path';

/**
 * 窗口管理服务类
 * 负责创建和管理应用中的各种窗口
 */
export class WindowService {
  // 存储所有窗口实例的映射
  private static windows: Map<string, typeof BrowserWindow> = new Map();

  /**
   * 注册窗口管理相关的IPC处理程序
   */
  static registerIpcHandlers() {
    // 处理创建新窗口的请求
    ipcMain.handle('window:create', async (_event: any, options: {
      page: string; // 页面类型: 'toolpanel' | 'workspace' | 'ocr' | 'sidebar'
      title?: string; // 窗口标题
      width?: number; // 窗口宽度
      height?: number; // 窗口高度
      engine?: string; // OCR引擎（仅当page为ocr时使用）
      ocrTitle?: string; // OCR页面标题（仅当page为ocr时使用）
    }) => {
      return await this.createWindow(options);
    });

    // 处理关闭指定窗口的请求
    ipcMain.handle('window:close-by-id', (_event: any, windowId: string) => {
      this.closeWindow(windowId);
    });

    // 处理获取所有窗口的请求
    ipcMain.handle('window:get-all', () => {
      return Array.from(this.windows.keys());
    });
  }

  /**
   * 创建新窗口
   * @param options 窗口选项
   * @returns 窗口ID
   */
  static async createWindow(options: {
    page: string;
    title?: string;
    width?: number;
    height?: number;
    engine?: string;
    ocrTitle?: string;
    params?: Record<string, any>;
  }): Promise<string> {
    const {
      page,
      title,
      width = 1200,
      height = 800,
      engine,
      ocrTitle,
      params = {}
    } = options;

    // 生成窗口ID
    const windowId = `${page}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 根据页面类型确定URL
    let hash = '';

    switch (page) {
      case 'toolpanel':
        hash = '#toolpanel';
        break;
      case 'workspace':
        hash = '#workspace';
        break;
      case 'ocr':
        if (engine) {
          const params = new URLSearchParams({
            engine: engine,
            title: ocrTitle || '智能文字识别'
          });
          hash = `#ocr?${params.toString()}`;
        } else {
          hash = '#ocr';
        }
        break;
      case 'sidebar':
        hash = '#sidebar';
        break;
      case 'dialog-connection': {
        const paramsObj = new URLSearchParams();
        if (params.connection) {
          paramsObj.set('connection', encodeURIComponent(JSON.stringify(params.connection)));
        }
        hash = paramsObj.toString() ? `#dialog-connection?${paramsObj.toString()}` : '#dialog-connection';
        break;
      }
      case 'dialog-command-result': {
        const paramsObj = new URLSearchParams();
        if (params.title) {
          paramsObj.set('title', encodeURIComponent(params.title));
        }
        if (params.result) {
          paramsObj.set('result', encodeURIComponent(JSON.stringify(params.result)));
        }
        hash = paramsObj.toString() ? `#dialog-command-result?${paramsObj.toString()}` : '#dialog-command-result';
        break;
      }
      case 'dialog-terminal':
        hash = '#dialog-terminal';
        break;
      case 'dialog-event-reminder':
        hash = '#dialog-event-reminder';
        break;
      case 'dialog-credit-card':
        hash = '#dialog-credit-card';
        break;
      default:
        hash = '#toolpanel';
    }

    // 判断是否为对话框窗口
    const isDialog = page.startsWith('dialog-');
    
    // 创建新窗口
    const newWindow = new BrowserWindow({
      width: isDialog ? (width || 800) : width,
      height: isDialog ? (height || 600) : height,
      minWidth: isDialog ? 400 : 800,
      minHeight: isDialog ? 300 : 600,
      frame: true,
      titleBarStyle: 'default',
      title: title || this.getDefaultTitle(page),
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(process.cwd(), 'dist/electron/preload.js'),
        devTools: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
      },
    });

    // 加载页面
    if (process.env.NODE_ENV === 'development') {
      newWindow.loadURL(`http://localhost:3000${hash}`);
    } else {
      newWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, '../renderer/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: hash
        })
      );
    }

    // 窗口关闭时从映射中移除
    newWindow.on('closed', () => {
      this.windows.delete(windowId);
    });

    // 存储窗口实例
    this.windows.set(windowId, newWindow);

    // 获取窗口标题
    const windowTitle = title || this.getDefaultTitle(page);

    // 日历提醒和信用卡提醒窗口默认最大化
    if (page === 'dialog-event-reminder' || page === 'dialog-credit-card') {
      newWindow.maximize();
    }

    // 窗口加载完成后重新设置标题（防止被 HTML title 标签覆盖）
    newWindow.webContents.once('did-finish-load', () => {
      newWindow.setTitle(windowTitle);
    });

    // 监听页面标题变化，保持窗口标题不变
    newWindow.webContents.on('page-title-updated', (event) => {
      event.preventDefault();
      newWindow.setTitle(windowTitle);
    });

    // 只为非对话框窗口设置菜单栏
    if (!isDialog) {
      this.setWindowMenu(newWindow, page);
    } else {
      // 对话框窗口明确禁用菜单
      newWindow.setMenu(null);
    }

    return windowId;
  }

  /**
   * 为窗口设置菜单栏
   * @param window 窗口实例
   * @param page 页面类型
   */
  private static setWindowMenu(window: typeof BrowserWindow, page: string): void {
    // 构建通用菜单模板
    const template: any[] = [
      {
        label: '文件(F)',
        submenu: [
          { type: 'separator' },
          { label: '关闭窗口', accelerator: 'CmdOrCtrl+W', click: () => window.close() },
          { type: 'separator' },
          { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => electron.app.quit() },
        ],
      },
      {
        label: '编辑(E)',
        submenu: [
          { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          { type: 'separator' },
          { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        ],
      },
      {
        label: '查看(V)',
        submenu: [
          {
            label: '缩放', submenu: [
              { label: '放大', accelerator: 'CmdOrCtrl+Plus', click: () => window.webContents.setZoomLevel((window.webContents.getZoomLevel() || 0) + 0.5) },
              { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => window.webContents.setZoomLevel((window.webContents.getZoomLevel() || 0) - 0.5) },
              { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => window.webContents.setZoomLevel(0) },
            ]
          },
          { type: 'separator' },
          { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => window.webContents.reload() },
          { type: 'separator' },
          { label: '全屏模式', accelerator: 'F11', click: () => window.setFullScreen(!window.isFullScreen()) },
          { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', click: () => window.webContents.toggleDevTools() },
        ],
      },
      {
        label: '帮助(H)',
        submenu: [
          { label: '关于', click: () => { } },
        ],
      },
    ];

    // 为每个窗口单独设置菜单栏
    const menu = Menu.buildFromTemplate(template);
    window.setMenu(menu);
  }

  /**
   * 获取默认窗口标题
   * @param page 页面类型
   * @returns 默认标题
   */
  private static getDefaultTitle(page: string): string {
    const titles: Record<string, string> = {
      toolpanel: '工具面板',
      workspace: '数据库工作区',
      ocr: '智能文字识别',
      sidebar: '侧边栏',
      'dialog-connection': '数据库连接',
      'dialog-command-result': '命令执行结果',
      'dialog-terminal': '终端控制台',
      'dialog-event-reminder': '代办事项',
      'dialog-credit-card': '信用卡'
    };
    return titles[page] || '应用';
  }

  /**
   * 关闭指定窗口
   * @param windowId 窗口ID
   */
  private static closeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      window.close();
      this.windows.delete(windowId);
    }
  }

  /**
   * 获取窗口实例
   * @param windowId 窗口ID
   * @returns 窗口实例
   */
  static getWindow(windowId: string): typeof BrowserWindow | undefined {
    return this.windows.get(windowId);
  }

  /**
   * 获取所有窗口ID
   * @returns 窗口ID数组
   */
  static getAllWindowIds(): string[] {
    return Array.from(this.windows.keys());
  }
}

