import { useState } from 'react'
import './App.css'
import ConnectionDialog from './components/ConnectionDialog'
import QueryEditor from './components/QueryEditor'
import AppLayout from './components/AppLayout'
import { useConnectionStore } from './store/connectionStore'
import { ConnectionConfig } from './types/connection'
import { useIpcCommunication } from './hooks/useIpcCommunication'

const App = () => {
  const [connectionDialogVisible, setConnectionDialogVisible] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | null>(null)
  const activeConnectionId = useConnectionStore((state) => state.activeConnectionId)
  const handleNewConnection = () => {
    setEditingConnection(null)
    setConnectionDialogVisible(true)
  }

  useIpcCommunication(handleNewConnection)

  return (
    <div>
      <AppLayout
        activeConnectionId={activeConnectionId}
        onNewConnection={handleNewConnection}
      >
        {activeConnectionId ? (
          <QueryEditor />
        ) : null}
      </AppLayout>

      <ConnectionDialog
        visible={connectionDialogVisible}
        onCancel={() => {
          setConnectionDialogVisible(false)
          setEditingConnection(null)
        }}
        connection={editingConnection}
      />
    </div>
  )
}

export default App