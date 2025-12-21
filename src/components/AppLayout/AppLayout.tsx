/**
 * 应用主布局组件
 */
import React, { useState } from 'react'
import { Layout } from 'antd'
import HeaderBar from '../HeaderBar'
import ConnectionTree from '../ConnectionTree'
import MainPanel, { PanelItem, PanelType } from '../MainPanel'
import ObjectPanel, { TableData } from '../ObjectPanel'
import FunctionPanel, { FunctionData } from '../FunctionPanel'
import PropertiesPanel, { TableObject } from '../PropertiesPanel'
import { TreeNode, TreeNodeType } from '../../types/tree'
import { useConnection } from '../../hooks/useConnection'
import { useDatabaseOperations } from '../../hooks/useDatabaseOperations'
import { useConnectionStore } from '../../store/connectionStore'
import { ConnectionStatus } from '../../types/connection'

const { Sider, Content } = Layout



const mockFunctions: FunctionData[] = [
  { name: 'get_format', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: true, comment: 'Format a date or time value' },
  { name: 'uuid', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Generate a UUID value' },
  { name: 'version', modifyDate: '2023-01-15', functionType: 'FUNCTION', deterministic: false, comment: 'Return version of MySQL server' },
]

interface AppLayoutProps {
  /**
   * 活动连接ID
   */
  activeConnectionId?: string | null
  /**
   * 内容区域的子组件
   */
  children?: React.ReactNode
  /**
   * 处理新建连接按钮点击
   */
  onNewConnection?: () => void
  /**
   * 处理连接按钮点击
   */
  onConnect?: () => void
  /**
   * 处理新建查询按钮点击
   */
  onNewQuery?: () => void
  /**
   * 处理表按钮点击
   */
  onTable?: () => void
  /**
   * 处理视图按钮点击
   */
  onView?: () => void
  /**
   * 处理函数按钮点击
   */
  onFunction?: () => void
  /**
   * 处理用户按钮点击
   */
  onUser?: () => void
  /**
   * 处理其他按钮点击
   */
  onOther?: () => void
  /**
   * 处理查询按钮点击
   */
  onSearch?: () => void
  /**
   * 处理备份按钮点击
   */
  onBackup?: () => void
  /**
   * 处理自动运行按钮点击
   */
  onAutoRun?: () => void
  /**
   * 处理模型按钮点击
   */
  onModel?: () => void
  /**
   * 处理BI按钮点击
   */
  onBI?: () => void
}

/**
 * 应用主布局组件
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  activeConnectionId: propActiveConnectionId, // 使用下划线前缀表示未使用的参数
  onNewConnection,
  onConnect,
  onUser,
  onOther,
  onSearch,
  onAutoRun
}) => {
  // 从hooks获取连接和数据库操作相关的状态和函数
  const { connectionStates, activeConnectionId: storeActiveConnectionId } = useConnection()
  const { tables } = useConnectionStore()
  const { } = useDatabaseOperations()
  
  // 选中对象状态
  const [selectedTables, setSelectedTables] = useState<TableData[]>([])
  // 当前连接状态
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  // 当前选中的节点信息
  const [selectedNode, setSelectedNode] = useState<{ type?: TreeNodeType; name?: string }>({})
  
  // 面板状态
  // 添加默认的"对象"面板，默认显示表内容
  const [panels, setPanels] = useState<PanelItem[]>([
    {
      id: 'object-0',
      type: 'table',
      title: '对象',
      content: (
        <ObjectPanel
          dataSource={[]} // 默认显示空表列表
          selectedTables={selectedTables}
          onSelectTables={setSelectedTables}
          connectionStatus={currentConnectionStatus}
          selectedNodeType={selectedNode.type}
          selectedNodeName={selectedNode.name}
          onOpenTable={(record) => {
            // 打开表时，显示表的详细信息
            const tableObject: TableObject = {
              name: record.name,
              type: TreeNodeType.TABLE,
              engine: record.engine,
              rows: record.rows,
              dataLength: record.dataLength,
              createTime: '2025-11-08 09:51:13',
              updateTime: record.modifyDate || '',
              collation: 'utf8mb4_0900_ai_ci',
              autoIncrement: 0,
              rowFormat: 'Dynamic',
              checkTime: null,
              indexLength: '0 bytes (0)',
              maxDataLength: '0 bytes (0)',
              dataFree: '4.00 MB (4,194,304)',
              comment: record.comment
          }
          setSelectedObject(tableObject)
          }}
        />
      )
    }
  ])
  const [activePanelId, setActivePanelId] = useState<string | undefined>('object-0')
  const [selectedObject, setSelectedObject] = useState<TableObject | null>(null)

  // 创建新面板
  const createPanel = (type: PanelType, title: string, content: React.ReactNode) => {
    const panelId = `${type}-${Date.now()}`
    const newPanel: PanelItem = {
      id: panelId,
      type,
      title,
      content
    }
    
    const updatedPanels = [...panels, newPanel]
    setPanels(updatedPanels)
    setActivePanelId(panelId)
  }

  // 关闭面板
  const handleClosePanel = (panelId: string) => {
    // 防止删除默认的"对象"面板
    if (panelId === 'object-0') {
      return
    }
    
    const updatedPanels = panels.filter(panel => panel.id !== panelId)
    setPanels(updatedPanels)
    
    // 如果关闭的是当前激活的面板，激活最后一个面板
    if (panelId === activePanelId) {
      setActivePanelId(updatedPanels[updatedPanels.length - 1]?.id)
    }
  }

  // 切换面板
  const handleSwitchPanel = (panelId: string) => {
    setActivePanelId(panelId)
  }

  // 处理表按钮点击
  const handleTableClick = () => {
    // 检查是否已经存在表面板
    const existingPanel = panels.find(panel => panel.type === 'table')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('table', '表', (
        <ObjectPanel
              dataSource={[]} // 默认显示空表列表
              selectedTables={selectedTables}
              onSelectTables={setSelectedTables}
              connectionStatus={currentConnectionStatus}
              selectedNodeType={selectedNode.type}
              selectedNodeName={selectedNode.name}
              onOpenTable={(record) => {
                // 打开表时，显示表的详细信息
                const tableObject: TableObject = {
                  name: record.name,
                  type: TreeNodeType.TABLE,
                  engine: record.engine,
                  rows: record.rows,
                  dataLength: record.dataLength,
                  createTime: '2025-11-08 09:51:13',
                  updateTime: record.modifyDate || '',
                  collation: 'utf8mb4_0900_ai_ci',
                  autoIncrement: 0,
                  rowFormat: 'Dynamic',
                  checkTime: null,
                  indexLength: '0 bytes (0)',
                  maxDataLength: '0 bytes (0)',
                  dataFree: '4.00 MB (4,194,304)',
                  comment: record.comment
                }
                setSelectedObject(tableObject)
              }}
            />
      ))
    }
  }

  // 处理函数按钮点击
  const handleFunctionClick = () => {
    // 检查是否已经存在函数面板
    const existingPanel = panels.find(panel => panel.type === 'function')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('function', '函数', (
        <FunctionPanel
          dataSource={mockFunctions}
        />
      ))
    }
  }

  // 处理新建查询按钮点击
  const handleNewQueryClick = () => {
    createPanel('query', `查询 (${panels.filter(p => p.type === 'query').length + 1})`, (
      <div style={{ padding: '20px' }}>
        <h3>新建查询</h3>
        <p>查询编辑器将在这里显示</p>
      </div>
    ))
  }

  // 处理视图按钮点击
  const handleViewClick = () => {
    // 检查是否已经存在视图面板
    const existingPanel = panels.find(panel => panel.type === 'view')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('view', '视图', (
        <div style={{ padding: '20px' }}>
          <h3>视图</h3>
          <p>视图列表将在这里显示</p>
        </div>
      ))
    }
  }

  // 处理备份按钮点击
  const handleBackupClick = () => {
    // 检查是否已经存在备份面板
    const existingPanel = panels.find(panel => panel.type === 'backup')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('backup', '备份', (
        <div style={{ padding: '20px' }}>
          <h3>备份</h3>
          <p>备份功能将在这里显示</p>
        </div>
      ))
    }
  }

  // 处理模型按钮点击
  const handleModelClick = () => {
    // 检查是否已经存在模型面板
    const existingPanel = panels.find(panel => panel.type === 'model')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('model', '模型', (
        <div style={{ padding: '20px' }}>
          <h3>模型</h3>
          <p>模型功能将在这里显示</p>
        </div>
      ))
    }
  }

  // 处理BI按钮点击
  const handleBIClick = () => {
    // 检查是否已经存在BI面板
    const existingPanel = panels.find(panel => panel.type === 'bi')
    if (existingPanel) {
      setActivePanelId(existingPanel.id)
    } else {
      createPanel('bi', 'BI', (
        <div style={{ padding: '20px' }}>
          <h3>BI</h3>
          <p>BI功能将在这里显示</p>
        </div>
      ))
    }
  }

  // 更新当前连接状态
  React.useEffect(() => {
    const activeId = propActiveConnectionId || storeActiveConnectionId
    if (activeId && connectionStates instanceof Map) {
      const status = connectionStates.get(activeId) || ConnectionStatus.DISCONNECTED
      setCurrentConnectionStatus(status)
    } else {
      setCurrentConnectionStatus(ConnectionStatus.DISCONNECTED)
    }
  }, [propActiveConnectionId, storeActiveConnectionId, connectionStates])

  // 处理节点选择事件
  const handleNodeSelect = (node: TreeNode) => {
    // 更新选中节点状态
    setSelectedNode({ type: node.type, name: typeof node.title === 'string' ? node.title : undefined })
    
    // 根据节点类型处理不同的选择事件
    if (node.type === TreeNodeType.TABLE) {
      // 从tables中查找选中的表
      const tableObject = tables.get(node.key)
      
      if (tableObject) {
        const table: TableData = {
          name: tableObject.name,
          rows: tableObject.metadata?.rows || 0,
          dataLength: tableObject.metadata?.dataLength || '0 KB',
          engine: tableObject.metadata?.engine || '',
          modifyDate: tableObject.metadata?.updateTime || '--',
          comment: tableObject.metadata?.comment || ''
        }
        // 设置选中对象
        const tableDetails: TableObject = {
          name: table.name,
          type: TreeNodeType.TABLE,
          engine: table.engine,
          rows: table.rows,
          dataLength: table.dataLength,
          createTime: '2025-11-08 09:51:13',
          updateTime: table.modifyDate || '',
          collation: 'utf8mb4_0900_ai_ci',
          autoIncrement: 0,
          rowFormat: 'Dynamic',
          checkTime: null,
          indexLength: '0 bytes (0)',
          maxDataLength: '0 bytes (0)',
          dataFree: '4.00 MB (4,194,304)',
          comment: table.comment
        }
        setSelectedObject(tableDetails)
        
        // 从tables中获取该表所在数据库的所有表
        const databaseId = tableObject.parentId
        const actualTables = tables instanceof Map 
          ? Array.from(tables.values())
              .filter(obj => obj.parentId === databaseId)
              .map(obj => ({
                name: obj.name,
                rows: obj.metadata?.rows || 0,
                dataLength: obj.metadata?.dataLength || '0 KB',
                engine: obj.metadata?.engine || '',
                modifyDate: obj.metadata?.updateTime || '--',
                comment: obj.metadata?.comment || ''
              }))
          : []
        
        // 检查是否已经存在表面板
        const existingPanel = panels.find(panel => panel.type === 'table')
        if (existingPanel) {
          // 更新现有面板的内容
          const updatedPanels = panels.map(panel => {
            if (panel.id === existingPanel.id) {
              return {
                ...panel,
                content: (
                  <ObjectPanel
                    dataSource={currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : []}
                    selectedTables={selectedTables}
                    onSelectTables={setSelectedTables}
                    connectionStatus={currentConnectionStatus}
                    selectedNodeType={node.type}
                    selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
                    onOpenTable={(record: TableData) => {
                      // 打开表时，显示表的详细信息
                      const tableObject: TableObject = {
                        name: record.name,
                        type: TreeNodeType.TABLE,
                        engine: record.engine,
                        rows: record.rows,
                        dataLength: record.dataLength,
                        createTime: '2025-11-08 09:51:13',
                        updateTime: record.modifyDate || '',
                        collation: 'utf8mb4_0900_ai_ci',
                        autoIncrement: 0,
                        rowFormat: 'Dynamic',
                        checkTime: null,
                        indexLength: '0 bytes (0)',
                        maxDataLength: '0 bytes (0)',
                        dataFree: '4.00 MB (4,194,304)',
                        comment: record.comment
                      }
                      setSelectedObject(tableObject)
                    }}
                  />
                )
              }
            }
            return panel
          })
          setPanels(updatedPanels)
          setActivePanelId(existingPanel.id)
        } else {
          // 如果没有表面板，则创建一个
          createPanel('table', '表', (
            <ObjectPanel
              dataSource={currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : []}
              selectedTables={selectedTables}
              onSelectTables={setSelectedTables}
              connectionStatus={currentConnectionStatus}
              selectedNodeType={node.type}
              selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
              onOpenTable={(record: TableData) => {
                // 打开表时，显示表的详细信息
                const tableObject: TableObject = {
                  name: record.name,
                  type: TreeNodeType.TABLE,
                  engine: record.engine,
                  rows: record.rows,
                  dataLength: record.dataLength,
                  createTime: '2025-11-08 09:51:13',
                  updateTime: record.modifyDate || '',
                  collation: 'utf8mb4_0900_ai_ci',
                  autoIncrement: 0,
                  rowFormat: 'Dynamic',
                  checkTime: null,
                  indexLength: '0 bytes (0)',
                  maxDataLength: '0 bytes (0)',
                  dataFree: '4.00 MB (4,194,304)',
                  comment: record.comment
                }
                setSelectedObject(tableObject)
              }}
            />
          ))
        }
      }
    } else if (node.type === TreeNodeType.DATABASE) {
      // 双击数据库节点可以加载表并显示表列表
      // 从tables中获取该数据库下的所有表
      const actualTables = tables instanceof Map 
        ? Array.from(tables.values())
            .filter(obj => obj.parentId === node.key)
            .map(obj => ({
              name: obj.name,
              rows: obj.metadata?.rows || 0,
              dataLength: obj.metadata?.dataLength || '0 KB',
              engine: obj.metadata?.engine || '',
              modifyDate: obj.metadata?.updateTime || '--',
              comment: obj.metadata?.comment || ''
            }))
        : []
      
      // 检查是否已经存在表面板
      const existingPanel = panels.find(panel => panel.type === 'table')
      if (existingPanel) {
        // 更新现有面板的内容
        const updatedPanels = panels.map(panel => {
          if (panel.id === existingPanel.id) {
            return {
              ...panel,
              content: (
                <ObjectPanel
                  dataSource={currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : []}
                  selectedTables={selectedTables}
                  onSelectTables={setSelectedTables}
                  connectionStatus={currentConnectionStatus}
                  selectedNodeType={node.type}
                  selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
                  onOpenTable={(record) => {
                    // 打开表时，显示表的详细信息
                    const tableObject: TableObject = {
                      name: record.name,
                      type: TreeNodeType.TABLE,
                      engine: record.engine,
                      rows: record.rows,
                      dataLength: record.dataLength,
                      createTime: '2025-11-08 09:51:13',
                      updateTime: record.modifyDate || '',
                      collation: 'utf8mb4_0900_ai_ci',
                      autoIncrement: 0,
                      rowFormat: 'Dynamic',
                      checkTime: null,
                      indexLength: '0 bytes (0)',
                      maxDataLength: '0 bytes (0)',
                      dataFree: '4.00 MB (4,194,304)',
                      comment: record.comment
                    }
                    setSelectedObject(tableObject)
                  }}
                />
              )
            }
          }
          return panel
        })
        setPanels(updatedPanels)
        setActivePanelId(existingPanel.id)
      } else {
        // 创建表面板
        createPanel('table', '表', (
          <ObjectPanel
            dataSource={currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : []}
            selectedTables={selectedTables}
            onSelectTables={setSelectedTables}
            connectionStatus={currentConnectionStatus}
            selectedNodeType={node.type}
            selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
            onOpenTable={(record) => {
              // 打开表时，显示表的详细信息
              const tableObject: TableObject = {
                name: record.name,
                type: TreeNodeType.TABLE,
                engine: record.engine,
                rows: record.rows,
                dataLength: record.dataLength,
                createTime: '2025-11-08 09:51:13',
                updateTime: record.modifyDate || '',
                collation: 'utf8mb4_0900_ai_ci',
                autoIncrement: 0,
                rowFormat: 'Dynamic',
                checkTime: null,
                indexLength: '0 bytes (0)',
                maxDataLength: '0 bytes (0)',
                dataFree: '4.00 MB (4,194,304)',
                comment: record.comment
              }
              setSelectedObject(tableObject)
            }}
          />
        ))
      }
    } else if (node.type === TreeNodeType.CONNECTION) {
      // 处理连接节点点击
      // 检查是否已经存在表面板
      const existingPanel = panels.find(panel => panel.type === 'table')
      if (existingPanel) {
        // 更新现有面板的内容
        const updatedPanels = panels.map(panel => {
          if (panel.id === existingPanel.id) {
            return {
              ...panel,
              content: (
                <ObjectPanel
                  dataSource={[]} // 连接节点选中时显示空表列表
                  selectedTables={selectedTables}
                  onSelectTables={setSelectedTables}
                  connectionStatus={currentConnectionStatus}
                  selectedNodeType={node.type}
                  selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
                  onOpenTable={(record) => {
                    // 打开表时，显示表的详细信息
                    const tableObject: TableObject = {
                      name: record.name,
                      type: TreeNodeType.TABLE,
                      engine: record.engine,
                      rows: record.rows,
                      dataLength: record.dataLength,
                      createTime: '2025-11-08 09:51:13',
                      updateTime: record.modifyDate || '',
                      collation: 'utf8mb4_0900_ai_ci',
                      autoIncrement: 0,
                      rowFormat: 'Dynamic',
                      checkTime: null,
                      indexLength: '0 bytes (0)',
                      maxDataLength: '0 bytes (0)',
                      dataFree: '4.00 MB (4,194,304)',
                      comment: record.comment
                    }
                    setSelectedObject(tableObject)
                  }}
                />
              )
            }
          }
          return panel
        })
        setPanels(updatedPanels)
        setActivePanelId(existingPanel.id)
      } else {
        // 创建表面板
        createPanel('table', '表', (
          <ObjectPanel
            dataSource={[]} // 连接节点选中时显示空表列表
            selectedTables={selectedTables}
            onSelectTables={setSelectedTables}
            connectionStatus={currentConnectionStatus}
            selectedNodeType={node.type}
            selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
            onOpenTable={(record) => {
              // 打开表时，显示表的详细信息
              const tableObject: TableObject = {
                name: record.name,
                type: TreeNodeType.TABLE,
                engine: record.engine,
                rows: record.rows,
                dataLength: record.dataLength,
                createTime: '2025-11-08 09:51:13',
                updateTime: record.modifyDate || '',
                collation: 'utf8mb4_0900_ai_ci',
                autoIncrement: 0,
                rowFormat: 'Dynamic',
                checkTime: null,
                indexLength: '0 bytes (0)',
                maxDataLength: '0 bytes (0)',
                dataFree: '4.00 MB (4,194,304)',
                comment: record.comment
              }
              setSelectedObject(tableObject)
            }}
          />
        ))
      }
    } else if (node.type === TreeNodeType.FUNCTION) {
      // 处理函数节点双击
      // 检查是否已经存在函数面板
      const existingPanel = panels.find(panel => panel.type === 'function')
      if (existingPanel) {
        setActivePanelId(existingPanel.id)
      } else {
        createPanel('function', '函数', (
          <FunctionPanel
            dataSource={mockFunctions}
          />
        ))
      }
    }
  }



  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderBar
        onConnect={onConnect}
        onNewQuery={handleNewQueryClick}
        onTable={handleTableClick}
        onView={handleViewClick}
        onFunction={handleFunctionClick}
        onUser={onUser}
        onOther={onOther}
        onSearch={onSearch}
        onBackup={handleBackupClick}
        onAutoRun={onAutoRun}
        onModel={handleModelClick}
        onBI={handleBIClick}
      />
      
      <Layout>
        <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <ConnectionTree
            onNewConnection={onNewConnection}
            onNodeSelect={handleNodeSelect}
          />
        </Sider>
        
        <Content style={{ margin: '16px', padding: 0, overflowY: 'auto' }}>
          <MainPanel
            activePanelId={activePanelId}
            panels={panels}
            onClosePanel={handleClosePanel}
            onSwitchPanel={handleSwitchPanel}
            propertiesContent={
              <PropertiesPanel
                selectedObject={selectedObject}
              />
            }
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
