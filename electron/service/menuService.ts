const electron = require('electron');
const { Menu, app } = electron;
import { TerminalService } from './terminalService';

/**
 * 菜单服务类
 * 负责创建和设置应用程序菜单
 */
export class MenuService {
  private mainWindow: any;

  /**
   * 创建菜单服务实例
   * @param mainWindow 主窗口实例
   */
  constructor(mainWindow: any) {
    this.mainWindow = mainWindow;
  }

  /**
   * 构建应用程序菜单
   * @returns 构建好的菜单
   */
  buildMenu(): any {
    const template: any[] = [
      {
        label: '文件(F)',
        submenu: [
          { label: '新建项目...', click: () => { } },
          { label: '新建连接...', accelerator: 'CmdOrCtrl+N', click: () => this.mainWindow?.webContents.send('open-new-connection-dialog') },
          { type: 'separator' },
          { label: '使用 Navicat URI 打开...', accelerator: 'Ctrl+U', click: () => { } },
          { label: '打开外部文件', click: () => { } },
          { type: 'separator' },
          {
            label: '打开最近使用的',
            submenu: [
              { label: '最近连接1', click: () => { } },
              { label: '最近连接2', click: () => { } },
              { type: 'separator' },
              { label: '清除最近记录', click: () => { } },
            ]
          },
          { type: 'separator' },
          { label: '关闭连接', click: () => { } },
          { type: 'separator' },
          { label: '导入连接...', click: () => { } },
          { label: '导出连接...', click: () => { } },
          { type: 'separator' },
          { label: '管理...', click: () => { } },
          { type: 'separator' },
          { label: '关闭窗口', click: () => this.mainWindow?.close() },
          { label: '退出 Navicat', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
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
          { type: 'separator' },
          { label: '查找', accelerator: 'CmdOrCtrl+F', click: () => { } },
          { label: '替换', accelerator: 'CmdOrCtrl+H', click: () => { } },
        ],
      },
      {
        label: '查看(V)',
        submenu: [
          { label: '导航窗格', click: () => { } },
          { label: '信息窗格', click: () => { } },
          { type: 'separator' },
          { label: '网格视图', click: () => { } },
          { label: '单元视图', click: () => { } },
          { type: 'separator' },
          { label: '表格数据编辑器', click: () => { } },
          { label: '数据分析', click: () => { } },
          { type: 'separator' },
          { label: '显示/隐藏筛选及排序', click: () => { } },
          {
            label: '筛选器和排序布局', submenu: [
              { label: '布局1', click: () => { } },
              { label: '布局2', click: () => { } },
              { label: '重置布局', click: () => { } },
            ]
          },
          { type: 'separator' },
          {
            label: '显示', submenu: [
              { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => this.mainWindow?.webContents.reload() },
              { label: '状态栏', click: () => { } },
              { type: 'separator' },
              {
                label: '缩放', submenu: [
                  { label: '放大', accelerator: 'CmdOrCtrl+Plus', click: () => this.mainWindow?.webContents.setZoomLevel((this.mainWindow.webContents.getZoomLevel() || 0) + 0.5) },
                  { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => this.mainWindow?.webContents.setZoomLevel((this.mainWindow.webContents.getZoomLevel() || 0) - 0.5) },
                  { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => this.mainWindow?.webContents.setZoomLevel(0) },
                ]
              },
            ]
          },
          { type: 'separator' },
          { label: '页眉', click: () => { } },
          { type: 'separator' },
          { label: '全屏模式', accelerator: 'F11', click: () => this.mainWindow?.setFullScreen(!this.mainWindow.isFullScreen()) },
          { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', click: () => this.mainWindow?.webContents.toggleDevTools() },
        ],
      },
      {
        label: '收藏(A)',
        submenu: [
          { label: '添加到收藏夹', accelerator: 'CmdOrCtrl+T', click: () => { } },
          { label: '管理收藏夹', click: () => { } },
          { type: 'separator' },
          { label: '收藏夹1', click: () => { } },
          { label: '收藏夹2', click: () => { } },
        ],
      },
      {
        label: '工具(T)',
        submenu: [
          { label: '数据传输', click: () => { } },
          { label: '数据同步', click: () => { } },
          { label: '结构同步', click: () => { } },
          { type: 'separator' },
          { label: '导入向导', click: () => { } },
          { label: '导出向导', click: () => { } },
          { type: 'separator' },
          { label: '查询创建工具', click: () => { } },
          { label: '报表创建工具', click: () => { } },
          { type: 'separator' },
          { label: '模型', click: () => { } },
          { type: 'separator' },
          { label: '服务器监控', click: () => { } },
          { type: 'separator' },
          { label: '选项', click: () => { } },
        ],
      },
      {
        label: '终端(Terminal)',
        submenu: [
          {
            label: '打开终端控制台',
            accelerator: 'Ctrl+`',
            click: () => {
              // 发送消息到渲染进程打开终端控制台
              this.mainWindow?.webContents.send('terminal:open-console');
            }
          },
          { type: 'separator' },
          {
            label: '系统信息',
            click: async () => {
              const terminalService = TerminalService.getInstance();
              const result = await terminalService.executeCommand({
                command: 'systeminfo',
                shell: 'cmd',
                timeout: 15000
              });
              // 将结果发送到渲染进程显示
              this.mainWindow?.webContents.send('terminal:result', {
                title: '系统信息',
                result: result
              });
            }
          },
          {
            label: '当前目录',
            click: async () => {
              const terminalService = TerminalService.getInstance();
              const result = await terminalService.executeCommand({
                command: 'cd',
                shell: 'cmd'
              });
              this.mainWindow?.webContents.send('terminal:result', {
                title: '当前目录',
                result: result
              });
            }
          },
          {
            label: '列出目录',
            click: async () => {
              const terminalService = TerminalService.getInstance();
              const result = await terminalService.executeCommand({
                command: 'dir',
                shell: 'cmd'
              });
              this.mainWindow?.webContents.send('terminal:result', {
                title: '目录列表',
                result: result
              });
            }
          },
          {
            label: '查看进程',
            click: async () => {
              const terminalService = TerminalService.getInstance();
              const result = await terminalService.executeCommand({
                command: 'tasklist',
                shell: 'cmd',
                timeout: 10000
              });
              this.mainWindow?.webContents.send('terminal:result', {
                title: '运行进程',
                result: result
              });
            }
          },
          { type: 'separator' },
          {
            label: '网络诊断',
            submenu: [
              {
                label: 'Ping 本地回环',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'ping 127.0.0.1 -n 4',
                    shell: 'cmd',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'Ping 本地回环',
                    result: result
                  });
                }
              },
              {
                label: 'Ping Google DNS',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'ping 8.8.8.8 -n 4',
                    shell: 'cmd',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'Ping Google DNS',
                    result: result
                  });
                }
              },
              {
                label: '查看网络配置',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'ipconfig /all',
                    shell: 'cmd',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: '网络配置',
                    result: result
                  });
                }
              }
            ]
          },
          {
            label: '磁盘信息',
            submenu: [
              {
                label: '查看磁盘空间',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'dir C:\\',
                    shell: 'cmd'
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'C盘内容',
                    result: result
                  });
                }
              },
              {
                label: '磁盘空间使用情况',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'fsutil volume diskfree C:',
                    shell: 'cmd',
                    timeout: 5000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: '磁盘空间使用情况',
                    result: result
                  });
                }
              }
            ]
          },
          {
            label: '系统服务',
            submenu: [
              {
                label: '查看运行服务',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'net start',
                    shell: 'cmd',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: '系统服务',
                    result: result
                  });
                }
              },
              {
                label: '查看启动程序',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'wmic startup list brief',
                    shell: 'cmd',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: '启动程序',
                    result: result
                  });
                }
              }
            ]
          },
          { type: 'separator' },
          {
            label: 'PowerShell 工具',
            submenu: [
              {
                label: '获取系统信息',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'Get-ComputerInfo',
                    shell: 'powershell',
                    timeout: 15000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'PowerShell 系统信息',
                    result: result
                  });
                }
              },
              {
                label: '获取进程列表',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'Get-Process | Select-Object ProcessName, Id, CPU, PM | Format-Table -AutoSize',
                    shell: 'powershell',
                    timeout: 10000
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'PowerShell 进程列表',
                    result: result
                  });
                }
              },
              {
                label: '获取磁盘信息',
                click: async () => {
                  const terminalService = TerminalService.getInstance();
                  const result = await terminalService.executeCommand({
                    command: 'Get-PSDrive -PSProvider FileSystem | Format-Table -AutoSize',
                    shell: 'powershell'
                  });
                  this.mainWindow?.webContents.send('terminal:result', {
                    title: 'PowerShell 磁盘信息',
                    result: result
                  });
                }
              }
            ]
          }
        ],
      },
      {
        label: '帮助(H)',
        submenu: [
          { label: '帮助主题', click: () => { } },
          { label: 'Navicat 教程', click: () => { } },
          { type: 'separator' },
          { label: '检查更新', click: () => { } },
          { type: 'separator' },
          { label: '关于 Navicat', click: () => { } },
        ],
      },
    ];

    return Menu.buildFromTemplate(template);
  }

  /**
   * 设置应用程序菜单
   */
  setApplicationMenu(): void {
    const menu = this.buildMenu();
    Menu.setApplicationMenu(menu);
  }
}