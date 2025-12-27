import { onMounted, onUnmounted } from 'vue'
import { listenToIpcMessage } from '../utils/electronUtils'

export const useIpcCommunication = (onOpenNewConnectionDialog: () => void) => {
  let cleanup: (() => void) | undefined

  onMounted(() => {
    cleanup = listenToIpcMessage('open-new-connection-dialog', () => {
      onOpenNewConnectionDialog()
    })
  })

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
}
