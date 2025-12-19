import React, { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Button, Tabs, Table, Divider, Spin, message, Card, Space, Tooltip } from 'antd'
import { PlayCircleOutlined, SaveOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQueryStore } from '../store/queryStore'
import { useConnectionStore } from '../store/connectionStore'
import { QueryResult } from '../types/connection'

const { TabPane } = Tabs

const QueryEditor: React.FC = () => {
  const { 
    tabs, 
    activeTabId, 
    queryResults, 
    queryExecutionInProgress,
    addTab, 
    removeTab, 
    setActiveTab, 
    updateQuery, 
    executeQuery 
  } = useQueryStore()
  
  const { connections } = useConnectionStore()
  const editorRef = useRef<any>(null)

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Add a new query tab
  const handleAddTab = () => {
    if (connections.length === 0) {
      message.warning('Please add a connection first')
      return
    }
    const newTabId = addTab(connections[0].id)
    setActiveTab(newTabId)
  }

  // Remove a tab
  const handleRemoveTab = (tabId: string) => {
    removeTab(tabId)
  }

  // Execute current query
  const handleExecuteQuery = async () => {
    if (!activeTab) return
    
    try {
      await executeQuery(activeTab.id, activeTab.query)
      message.success('Query executed successfully')
    } catch (error) {
      message.error('Query execution failed: ' + (error as Error).message)
    }
  }

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    if (activeTabId && value) {
      updateQuery(activeTabId, value)
    }
  }

  // Render query result
  const renderQueryResult = (result: QueryResult | undefined) => {
    if (!result) return null

    return (
      <div className="query-result">
        <div className="result-header">
          <Space>
            <span>Rows: {result.rows.length}</span>
            {result.affectedRows !== undefined && <span>Affected rows: {result.affectedRows}</span>}
            {result.executionTime !== undefined && <span>Execution time: {result.executionTime}ms</span>}
          </Space>
        </div>
        <Divider />
        <Table
          columns={result.columns.map(col => ({ title: col, dataIndex: col, key: col }))}
          dataSource={result.rows.map((row, index) => ({ ...row, key: index }))}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    )
  }

  // Get database type for syntax highlighting
  const getDatabaseType = (connectionId: string): string => {
    const connection = connections.find(conn => conn.id === connectionId)
    return connection?.type || 'sql'
  }

  // Get Monaco Editor language
  const getEditorLanguage = (databaseType: string): string => {
    switch (databaseType) {
      case 'mysql':
      case 'sqlserver':
      case 'sqlite':
        return 'sql'
      case 'postgresql':
        return 'pgsql'
      case 'mongodb':
        return 'javascript'
      case 'redis':
        return 'redis'
      default:
        return 'sql'
    }
  }

  return (
    <div className="query-editor-container">
      <div className="query-tabs">
        <Tabs
          activeKey={activeTabId || ''}
          onChange={setActiveTab}
          type="editable-card"
          onEdit={(e, action) => {
            const targetKey = typeof e === 'string' ? e : e.currentTarget.getAttribute('data-key') || '';
            if (action === 'add') {
              handleAddTab()
            } else if (action === 'remove') {
              handleRemoveTab(targetKey)
            }
          }}
        >
          {tabs.map(tab => {
            const connection = connections.find(conn => conn.id === tab.connectionId)
            return (
              <TabPane
                tab={
                  <Space>
                    <span>{tab.title}</span>
                    {connection && <span style={{ fontSize: '12px', color: '#999' }}>({connection.name})</span>}
                  </Space>
                }
                key={tab.id}
              />
            )
          })}
        </Tabs>
      </div>

      {activeTab && (
        <div className="query-content">
          <div className="query-toolbar">
            <Space>
              <Tooltip title="Execute Query">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleExecuteQuery}
                  loading={queryExecutionInProgress}
                >
                  Execute
                </Button>
              </Tooltip>
              <Tooltip title="Save Query">
                <Button icon={<SaveOutlined />}>
                  Save
                </Button>
              </Tooltip>
              <Tooltip title="Clear Query">
                <Button icon={<DeleteOutlined />}>
                  Clear
                </Button>
              </Tooltip>
              <Tooltip title="Reload">
                <Button icon={<ReloadOutlined />}>
                  Reload
                </Button>
              </Tooltip>
            </Space>
          </div>

          <div className="query-editor">
            <Editor
              height="400px"
              language={getEditorLanguage(getDatabaseType(activeTab.connectionId))}
              value={activeTab.query}
              onChange={handleEditorChange}
              onMount={(editor) => {
                editorRef.current = editor
              }}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          <Divider />

          <div className="query-result-container">
            <Spin spinning={queryExecutionInProgress}>
              {renderQueryResult(queryResults.get(activeTab.id))}
            </Spin>
          </div>
        </div>
      )}

      {tabs.length === 0 && (
        <div className="empty-state">
          <Card>
            <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
              <h3>No query tabs open</h3>
              <p>Click the "+" button above to create a new query tab</p>
              <Button type="primary" onClick={handleAddTab}>
                Create Query Tab
              </Button>
            </Space>
          </Card>
        </div>
      )}
    </div>
  )
}

export default QueryEditor
