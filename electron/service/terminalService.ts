const { spawn } = require('child_process');
const { ipcMain } = require('electron');
import { ServiceResult, ServiceResultFactory } from '../model/result/ServiceResult';

export interface TerminalCommand {
  command: string;
  shell?: 'cmd' | 'powershell';
  cwd?: string;
  timeout?: number;
  encoding?: BufferEncoding;
}

export interface CommandExecutionResult {
  command: string;
  shell: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTime: number;
  timestamp: Date;
}

/**
 * 终端命令执行服务
 * 支持 Windows cmd 和 PowerShell 命令执行
 */
export class TerminalService {
  private static instance: TerminalService;

  private constructor() {}

  public static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService();
    }
    return TerminalService.instance;
  }

  /**
   * 执行终端命令
   * @param commandConfig 命令配置
   * @returns Promise<ServiceResult<CommandExecutionResult>>
   */
  public async executeCommand(commandConfig: TerminalCommand): Promise<ServiceResult<CommandExecutionResult>> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const { command, shell = 'powershell', cwd, timeout = 30000, encoding = 'utf8' } = commandConfig;
      
      // Validate command configuration
      if (!command || typeof command !== 'string') {
        throw new Error('Command must be a non-empty string');
      }

      try {
        // 根据shell类型选择执行程序
        const shellPath = shell === 'cmd' ? 'cmd.exe' : 'powershell.exe';
        const shellArgs = shell === 'cmd' 
          ? ['/c', command] 
          : ['-Command', command];

        const child = spawn(shellPath, shellArgs, {
          cwd,
          encoding,
          windowsHide: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        // 设置超时
        const timer = setTimeout(() => {
          child.kill('SIGTERM');
          resolve(ServiceResultFactory.error<CommandExecutionResult>(
            `命令执行超时 (${timeout}ms)`,
            {
              command,
              shell,
              exitCode: -1,
              stdout: '',
              stderr: 'Command execution timeout',
              executionTime: Date.now() - startTime,
              timestamp: new Date()
            }
          ));
        }, timeout);

        // 收集输出
        child.stdout?.on('data', (data: Buffer) => {
          stdout += data.toString(encoding);
        });

        child.stderr?.on('data', (data: Buffer) => {
          stderr += data.toString(encoding);
        });

        // 处理进程结束
        child.on('close', (code: number) => {
          clearTimeout(timer);
          const executionTime = Date.now() - startTime;
          
          const result: CommandExecutionResult = {
            command,
            shell,
            exitCode: code || 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            executionTime,
            timestamp: new Date()
          };

          if (code === 0) {
            resolve(ServiceResultFactory.success<CommandExecutionResult>(result));
          } else {
            resolve(ServiceResultFactory.error<CommandExecutionResult>(
              `命令执行失败，退出码: ${code}`,
              result
            ));
          }
        });

        // 处理进程错误
        child.on('error', (error: Error) => {
          clearTimeout(timer);
          resolve(ServiceResultFactory.error<CommandExecutionResult>(
            `命令执行错误: ${error.message}`,
            {
              command,
              shell,
              exitCode: -1,
              stdout: '',
              stderr: error.message,
              executionTime: Date.now() - startTime,
              timestamp: new Date()
            }
          ));
        });

      } catch (error: any) {
        resolve(ServiceResultFactory.error<CommandExecutionResult>(
          `命令执行异常: ${error.message}`,
          {
            command,
            shell,
            exitCode: -1,
            stdout: '',
            stderr: error.message,
            executionTime: Date.now() - startTime,
            timestamp: new Date()
          }
        ));
      }
    });
  }

  /**
   * 执行多个命令（批量执行）
   * @param commands 命令配置数组
   * @param parallel 是否并行执行
   * @returns Promise<ServiceResult<CommandExecutionResult[]>>
   */
  public async executeCommands(
    commands: TerminalCommand[], 
    parallel: boolean = false
  ): Promise<ServiceResult<CommandExecutionResult[]>> {
    
    try {
      let results: CommandExecutionResult[] = [];

      if (parallel) {
        // 并行执行
        const promises = commands.map(cmd => this.executeCommand(cmd));
        const allResults = await Promise.all(promises);
        results = allResults.map(result => result.success ? result.data! : result.data!);
      } else {
        // 串行执行
        for (const command of commands) {
          const result = await this.executeCommand(command);
          results.push(result.data!);
          
          // 如果命令失败，可以选择停止执行或继续执行
          if (!result.success) {
            // 这里可以选择停止或继续，取决于业务需求
            // 为了安全性，我们选择停止执行
            break;
          }
        }
      }

      const hasError = results.some(result => result.exitCode !== 0);
      
      return hasError 
        ? ServiceResultFactory.error<CommandExecutionResult[]>(
            '部分命令执行失败',
            results
          )
        : ServiceResultFactory.success<CommandExecutionResult[]>(results);

    } catch (error: any) {
      return ServiceResultFactory.error<CommandExecutionResult[]>(
        `批量命令执行异常: ${error.message}`
      );
    }
  }

  /**
   * 获取系统信息
   * @returns Promise<ServiceResult<any>>
   */
  public async getSystemInfo(): Promise<ServiceResult<any>> {
    try {
      const commands: TerminalCommand[] = [
        { command: 'ver', shell: 'cmd', timeout: 5000 },
        { command: 'hostname', shell: 'cmd', timeout: 5000 },
        { command: 'echo %USERNAME%', shell: 'cmd', timeout: 5000 },
        { command: 'echo %USERPROFILE%', shell: 'cmd', timeout: 5000 }
      ];

      const result = await this.executeCommands(commands, true);
      
      if (result.success) {
        const data = result.data!;
        const systemInfo = {
          osVersion: data[0]?.stdout || '',
          hostname: data[1]?.stdout || '',
          username: data[2]?.stdout?.replace(/\r?\n/g, '') || '',
          userProfile: data[3]?.stdout?.replace(/\r?\n/g, '') || '',
          timestamp: new Date()
        };
        
        return ServiceResultFactory.success(systemInfo);
      }
      
      return result;
    } catch (error: any) {
      return ServiceResultFactory.error(`获取系统信息失败: ${error.message}`);
    }
  }

  /**
   * 注册 IPC 处理器
   */
  public registerIpcHandlers(): void {
    // 执行单个命令
    ipcMain.handle('terminal-execute-command', async (_: any, commandConfig: TerminalCommand) => {
      return await this.executeCommand(commandConfig);
    });

    // 批量执行命令
    ipcMain.handle('terminal-execute-commands', async (_: any, commands: TerminalCommand[], parallel: boolean) => {
      return await this.executeCommands(commands, parallel);
    });

    // 获取系统信息
    ipcMain.handle('terminal-get-system-info', async (_: any) => {
      return await this.getSystemInfo();
    });
  }
}