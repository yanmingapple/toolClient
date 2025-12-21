/**
 * Electron IPC通信相关Hook
 */
import { useEffect } from 'react'
import { listenToIpcMessage } from '../utils/electronUtils'

/**
 * 监听Electron主进程的消息
 * @param onOpenNewConnectionDialog 打开新建连接对话框的回调
 */
export const useIpcCommunication = (onOpenNewConnectionDialog: () => void) => {
  useEffect(() => {
    // 监听打开新建连接对话框的消息
    const cleanup = listenToIpcMessage('open-new-connection-dialog', () => {
      onOpenNewConnectionDialog()
    })
    
    // 清理函数
    return cleanup
  }, [onOpenNewConnectionDialog])
}
