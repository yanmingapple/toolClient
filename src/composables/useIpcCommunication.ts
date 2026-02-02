import { onMounted, onUnmounted } from 'vue'
import { listenToIpcMessage } from '../utils/electronUtils'

interface IpcCallbacks {
  onOpenNewConnectionDialog: () => void
  onOpenTerminalConsole?: () => void
  onTerminalResult?: (data: any) => void
  onServiceMonitorHealthCheckResult?: (data: any) => void
  onSidebarOpenCalendar?: () => void
  onSidebarOpenCreditCard?: () => void
  onInterruptionReminderTriggered?: (data: any) => void
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
      console.log('[useIpcCommunication] 注册服务监控健康检查结果监听器');
      listeners.push(listenToIpcMessage('service-monitor:health-check-result', callbacks.onServiceMonitorHealthCheckResult))
    }

    // 添加侧边栏相关监听器
    if (callbacks.onSidebarOpenCalendar) {
      listeners.push(listenToIpcMessage('sidebar-open-calendar', callbacks.onSidebarOpenCalendar))
    }

    if (callbacks.onSidebarOpenCreditCard) {
      listeners.push(listenToIpcMessage('sidebar-open-credit-card', callbacks.onSidebarOpenCreditCard))
    }

    // 添加恢复提醒触发监听器
    if (callbacks.onInterruptionReminderTriggered) {
      const electronAPI = (window as any).electronAPI
      if (electronAPI && electronAPI.onInterruptionReminderTriggered) {
        electronAPI.onInterruptionReminderTriggered(callbacks.onInterruptionReminderTriggered)
        listeners.push(() => {
          electronAPI.off('interruption-reminder:triggered', callbacks.onInterruptionReminderTriggered)
        })
      }
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