import React, { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Button, Tabs, Table, Divider, Spin, message, Card, Space, Tooltip, Menu, Dropdown } from 'antd'
import { PlayCircleOutlined, SaveOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQueryStore } from '../store/queryStore'
import { useConnectionStore } from '../store/connectionStore'
import { QueryResult } from '../types/leftTree/connection'
import { generateUUID } from '../utils/formatUtils'

const { TabPane } = Tabs

const QueryEditor = () => {
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

  const { connections, activeConnectionId } = useConnectionStore()
  const editorRef = useRef<any>(null)

  // 表格选中状态
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([])

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Add a new query tab
  const handleAddTab = () => {
    if (connections.length === 0) {
      message.warning('Please add a connection first')
      return
    }
    // 使用当前激活的连接，如果没有激活的连接则使用第一个连接
    const connectionId = activeConnectionId || connections[0].id
    const newTabId = addTab(connectionId)
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

  // 处理编辑菜单点击
  const handleEditMenuClick = (e: any) => {
    const { key } = e
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result) return

    switch (key) {
      case 'set-empty':
        handleSetEmptyString()
        break
      case 'set-null':
        handleSetNull()
        break
      case 'set-uuid':
        handleSetUUID()
        break
      case 'delete-record':
        handleDeleteRecord()
        break
      case 'copy':
        handleCopy()
        break
      case 'paste':
        handlePaste()
        break
      case 'save-data':
        handleSaveData()
        break
      case 'find':
        handleFind()
        break
      case 'find-next':
        handleFindNext()
        break
      case 'replace':
        handleReplace()
        break
      case 'go-to-record':
        handleGoToRecord()
        break
      default:
        break
    }
  }

  // 实现编辑菜单功能
  const handleSetEmptyString = () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    // 更新选中行的数据
    const updatedRows = result.rows.map((row, index) => {
      if (selectedRowKeys.includes(index)) {
        // 将所有字段设置为空白字符串
        const updatedRow: any = { ...row }
        result.columns.forEach(col => {
          updatedRow[col] = ''
        })
        return updatedRow
      }
      return row
    })

    // 更新查询结果
    queryResults.set(activeTabId, {
      ...result,
      rows: updatedRows
    })

    message.success('已将选中行设置为空白字符串')
  }

  const handleSetNull = () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    // 更新选中行的数据
    const updatedRows = result.rows.map((row, index) => {
      if (selectedRowKeys.includes(index)) {
        // 将所有字段设置为NULL
        const updatedRow: any = { ...row }
        result.columns.forEach(col => {
          updatedRow[col] = null
        })
        return updatedRow
      }
      return row
    })

    // 更新查询结果
    queryResults.set(activeTabId, {
      ...result,
      rows: updatedRows
    })

    message.success('已将选中行设置为NULL')
  }

  const handleSetUUID = () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    // 更新选中行的数据
    const updatedRows = result.rows.map((row, index) => {
      if (selectedRowKeys.includes(index)) {
        // 将所有字段设置为UUID
        const updatedRow: any = { ...row }
        result.columns.forEach(col => {
          updatedRow[col] = generateUUID()
        })
        return updatedRow
      }
      return row
    })

    // 更新查询结果
    queryResults.set(activeTabId, {
      ...result,
      rows: updatedRows
    })

    message.success('已将选中行设置为UUID')
  }

  const handleDeleteRecord = () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    // 删除选中的行
    const updatedRows = result.rows.filter((_, index) => !selectedRowKeys.includes(index))

    // 更新查询结果
    queryResults.set(activeTabId, {
      ...result,
      rows: updatedRows
    })

    // 清空选中状态
    setSelectedRowKeys([])

    message.success(`已删除 ${selectedRowKeys.length} 条记录`)
  }

  const handleCopy = async () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    // 获取选中的行数据
    const selectedRows = result.rows.filter((_, index) => selectedRowKeys.includes(index))

    // 转换为CSV格式
    const csvContent = result.columns.join(",") + "\n"
      + selectedRows.map(row => result.columns.map(col => {
        const cell = row[col]
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `\"${cell.replace(/"/g, '""')}\"`
        }
        return cell === null || cell === undefined ? '' : cell
      }).join(",")).join("\n")

    try {
      await navigator.clipboard.writeText(csvContent)
      message.success('已复制到剪贴板')
    } catch (error) {
      message.error('复制失败，请重试')
      console.error('Copy failed:', error)
    }
  }

  const handlePaste = async () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result || selectedRowKeys.length === 0) return

    try {
      const clipboardText = await navigator.clipboard.readText()
      const pastedRows = clipboardText.split('\n')
        .filter(row => row.trim())
        .map(row => row.split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/))

      if (pastedRows.length === 0) return

      // 更新选中的行数据
      const updatedRows = [...result.rows]
      selectedRowKeys.forEach((key, index) => {
        const rowIndex = Number(key)
        if (rowIndex < updatedRows.length && index < pastedRows.length) {
          const updatedRow: any = { ...updatedRows[rowIndex] }
          result.columns.forEach((col, colIndex) => {
            if (colIndex < pastedRows[index].length) {
              let cellValue = pastedRows[index][colIndex]
              // 移除引号
              if (cellValue.startsWith('"') && cellValue.endsWith('"')) {
                cellValue = cellValue.slice(1, -1).replace(/""/g, '"')
              }
              // 处理空值
              updatedRow[col] = cellValue === '' ? null : cellValue
            }
          })
          updatedRows[rowIndex] = updatedRow
        }
      })

      // 更新查询结果
      queryResults.set(activeTabId, {
        ...result,
        rows: updatedRows
      })

      message.success('已粘贴数据')
    } catch (error) {
      message.error('粘贴失败，请重试')
      console.error('Paste failed:', error)
    }
  }

  const handleSaveData = () => {
    if (!activeTabId) return
    const result = queryResults.get(activeTabId)
    if (!result) return

    // 保存为CSV格式
    const csvContent = "data:text/csv;charset=utf-8,"
      + result.columns.join(",") + "\n"
      + result.rows.map(row => result.columns.map(col => {
        const cell = row[col]
        // 处理包含逗号、引号或换行符的单元格
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `\"${cell.replace(/"/g, '""')}\"`
        }
        return cell === null || cell === undefined ? '' : cell
      }).join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `query_result_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success('数据已保存为CSV格式')
  }

  const handleFind = () => {
    if (!editorRef.current) return
    // 聚焦编辑器并显示查找控件
    editorRef.current.focus()
    editorRef.current.getAction('actions.find').run()
  }

  const handleFindNext = () => {
    if (!editorRef.current) return
    editorRef.current.getAction('actions.findNext').run()
  }

  const handleReplace = () => {
    if (!editorRef.current) return
    // 聚焦编辑器并显示替换控件
    editorRef.current.focus()
    editorRef.current.getAction('actions.replace').run()
  }

  const handleGoToRecord = () => {
    const recordNumber = prompt('请输入记录号:', '1')
    if (!recordNumber) return

    const index = parseInt(recordNumber) - 1
    if (isNaN(index) || index < 0) {
      message.error('请输入有效的记录号')
      return
    }

    // 滚动到指定行
    const tableElement = document.querySelector('.query-result .ant-table-body')
    if (tableElement) {
      const rowHeight = 47 // 估算行高
      tableElement.scrollTop = index * rowHeight
    }

    message.success(`已定位到记录 ${recordNumber}`)
  }

  // Render query result
  const renderQueryResult = (result: QueryResult | undefined) => {
    if (!result) return null

    const rowSelection = {
      selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
      },
    }

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
          rowSelection={rowSelection}
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

              {/* 编辑菜单 */}
              <Dropdown overlay={
                <Menu onClick={handleEditMenuClick}>
                  <Menu.Item key="set-empty">设置为空白字符串</Menu.Item>
                  <Menu.Item key="set-null">设置为NULL</Menu.Item>
                  <Menu.Item key="set-uuid">设置为UUID</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="delete-record">删除记录</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="copy">复制</Menu.Item>
                  <Menu.Item key="paste">粘贴</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="save-data">保存数据为...</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="find">查找</Menu.Item>
                  <Menu.Item key="find-next">查找下一个</Menu.Item>
                  <Menu.Item key="replace">替换</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="go-to-record">前往记录...</Menu.Item>
                </Menu>
              }>
                <Button>编辑</Button>
              </Dropdown>
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
