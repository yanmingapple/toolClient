/**
 * Electron相关工具函数
 */

/**
 * 安全获取Electron的ipcRenderer实例
 * @returns ipcRenderer实例或null
 */
export const getSafeIpcRenderer = () => {
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer' && (window as any).require) {
    try {
      const electron = (window as any).require('electron')
      return electron.ipcRenderer
    } catch (error) {
      console.error('Failed to load electron.ipcRenderer:', error)
      return null
    }
  }
  return null
}

/**
 * 监听来自主进程的IPC消息
 * @param channel 消息通道
 * @param listener 事件监听器
 * @returns 清理函数，用于移除监听器
 */
export const listenToIpcMessage = (channel: string, listener: (...args: any[]) => void) => {
  const ipcRenderer = getSafeIpcRenderer()
  if (ipcRenderer) {
    ipcRenderer.on(channel, listener)
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  }
  return () => {}
}

/**
 * 向主进程发送IPC消息
 * @param channel 消息通道
 * @param args 消息参数
 */
export const sendIpcMessage = (channel: string, ...args: any[]) => {
  const ipcRenderer = getSafeIpcRenderer()
  if (ipcRenderer) {
    ipcRenderer.send(channel, ...args)
  }
}
