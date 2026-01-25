// 引入Electron主进程模块，用于IPC通信
const electron = require('electron');
// 解构获取IPC主进程
const { ipcMain } = electron;

// 引入操作系统模块，用于获取系统资源信息
const os = require('os');

/**
 * 侧边栏服务类
 * 负责处理侧边栏相关的所有IPC通信
 * 包括：OCR页面打开、日历提醒、信用卡提醒、系统资源获取等
 */
export class SidebarService {
  // 静态属性，存储主窗口实例的引用
  private static mainWindow: any;
  // 静态属性，存储侧边栏窗口实例的引用
  private static sidebarWindow: any;

  /**
   * 注册侧边栏相关的所有IPC处理程序
   * @param mainWindow 主窗口实例
   * @param sidebarWindow 侧边栏窗口实例
   */
  static registerIpcHandlers(mainWindow: any, sidebarWindow: any) {
    this.mainWindow = mainWindow;
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
    // 处理打开OCR页面请求
    ipcMain.on('sidebar:open-ocr-page', (_event: any, engine: string) => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.webContents.send('open-ocr-page', { engine });
      }
    });

    // 处理打开日历提醒请求
    ipcMain.on('sidebar:open-calendar', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.webContents.send('sidebar-open-calendar');
      }
    });

    // 处理打开信用卡提醒工具请求
    ipcMain.on('sidebar:open-credit-card', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.webContents.send('sidebar-open-credit-card');
      }
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

    // 处理获取系统资源信息请求
    ipcMain.handle('sidebar:get-system-resources', async () => {
      try {
        // 获取 CPU 使用率（需要两次采样计算差值）
        const cpus1 = os.cpus();
        let totalIdle1 = 0;
        let totalTick1 = 0;

        cpus1.forEach((cpu: os.CpuInfo) => {
          totalTick1 += cpu.times.user;
          totalTick1 += cpu.times.nice;
          totalTick1 += cpu.times.sys;
          totalTick1 += cpu.times.idle;
          totalTick1 += cpu.times.irq;
          totalIdle1 += cpu.times.idle;
        });

        // 等待 100ms 后再次采样
        await new Promise(resolve => setTimeout(resolve, 100));

        const cpus2 = os.cpus();
        let totalIdle2 = 0;
        let totalTick2 = 0;

        cpus2.forEach((cpu: os.CpuInfo) => {
          totalTick2 += cpu.times.user;
          totalTick2 += cpu.times.nice;
          totalTick2 += cpu.times.sys;
          totalTick2 += cpu.times.idle;
          totalTick2 += cpu.times.irq;
          totalIdle2 += cpu.times.idle;
        });

        // 计算差值
        const idleDiff = totalIdle2 - totalIdle1;
        const totalDiff = totalTick2 - totalTick1;
        const cpuPercent = Math.round((1 - idleDiff / totalDiff) * 100);

        // 获取内存使用率
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryPercent = Math.round((usedMemory / totalMemory) * 100);

        return {
          success: true,
          data: {
            cpu: cpuPercent + '%',
            memory: memoryPercent + '%'
          }
        };
      } catch (error) {
        console.error('Error getting system resources:', error);
        return {
          success: false,
          error: '获取系统资源失败'
        };
      }
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
