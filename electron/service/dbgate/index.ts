/**
 * Dbgate 窗口服务
 * 按照 dbgate-master/app/src 的结构组织代码
 */

import { BrowserWindow } from 'electron'
import { createWindow, registerIpcHandlers, getWindow, hasWindow } from './electron'

export class DbgateWindowService {
  /**
   * 初始化 dbgate API 服务（预检查）
   * 注意：实际的 API 加载和 IPC 注册在 createDbgateWindow() 中进行，
   * 与原始代码保持一致（在 createWindow() 内部调用 useAllControllers）
   */
  static async initialize() {
    // 这个方法现在只做预检查，实际的初始化在 createDbgateWindow() 中进行
    // 这样可以确保在创建窗口之后才注册 IPC 处理程序，与原始代码保持一致
    console.log('DbgateWindowService.initialize() called (pre-check only)')
    console.log('Actual API initialization will happen in createDbgateWindow()')
  }

  /**
   * 创建并显示 dbgate 窗口
   */
  static async createDbgateWindow() {
    return createWindow()
  }

  /**
   * 检查 dbgate 窗口是否存在
   */
  static hasDbgateWindow(): boolean {
    return hasWindow()
  }

  /**
   * 关闭 dbgate 窗口
   */
  static closeDbgateWindow() {
    const window = getWindow()
    if (window && !window.isDestroyed()) {
      window.close()
    }
  }

  /**
   * 获取 dbgate 窗口实例
   */
  static getDbgateWindow(): typeof BrowserWindow | null {
    return getWindow()
  }

  /**
   * 注册 dbgate 相关的 IPC 处理程序
   */
  static registerIpcHandlers() {
    registerIpcHandlers()
  }
}

