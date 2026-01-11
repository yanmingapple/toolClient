import { onMounted, onUnmounted } from 'vue'
import { listenToIpcMessage } from '../utils/electronUtils'

interface IpcCallbacks {
  onOpenNewConnectionDialog: () => void
  onOpenTerminalConsole?: () => void
  onTerminalResult?: (data: any) => void
  onServiceMonitorHealthCheckResult?: (data: any) => void
}

export const useIpcCommunication = (callbacks: IpcCallbacks) => {
  let cleanup: (() => void) | undefined

  onMounted(() => {
    const listeners = [
      listenToIpcMessage('open-new-connection-dialog', callbacks.onOpenNewConnectionDialog),
    ]

    // 添加终端相关监听器
    if (callbacks.onOpenTerminalConsole) {
      listeners.push(listenToIpcMessage('terminal:open-console', callbacks.onOpenTerminalConsole))
    }

    if (callbacks.onTerminalResult) {
      listeners.push(listenToIpcMessage('terminal:result', callbacks.onTerminalResult))
    }

    // 添加服务监控健康检查结果监听器
    if (callbacks.onServiceMonitorHealthCheckResult) {
      listeners.push(listenToIpcMessage('service-monitor:health-check-result', callbacks.onServiceMonitorHealthCheckResult))
    }

    // 返回清理函数
    cleanup = () => {
      listeners.forEach(unsub => unsub())
    }
  })

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
}