/**
 * 应用主布局组件
 */
import React from 'react'
import { Layout } from 'antd'
import HeaderBar from '../HeaderBar'
import ConnectionTree from '../ConnectionTree'
import MainPanel from '../MainPanel/MainPanel'
import ObjectPanel, { TableData } from '../ObjectPanel'
import FunctionPanel, { FunctionData } from '../FunctionPanel'
import PropertiesPanel, { TableObject } from '../PropertiesPanel'
import { TreeNode, TreeNodeType } from '../../types/tree'
import { useConnection } from '../../hooks/useConnection'
import { useDatabaseOperations } from '../../hooks/useDatabaseOperations'
import { useConnectionStore } from '../../store/connectionStore'
import { useSelection } from '../../hooks/useSelection'
import { formatBytes } from '../../utils/formatUtils'
import { ConnectionStatus, DatabaseStatus } from '../../types/connection'

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
const AppLayout = ({
  activeConnectionId: propActiveConnectionId, // 使用下划线前缀表示未使用的参数
  onNewConnection,
  onConnect,
  onUser,
  onOther,
  onSearch,
  onAutoRun
}: AppLayoutProps) => {
  // 从hooks获取连接和数据库操作相关的状态和函数
  const { connectionStates, activeConnectionId: storeActiveConnectionId } = useConnection()
  const { tables, databaseStates } = useConnectionStore()
  const { } = useDatabaseOperations()
  
  // 使用useSelection hook管理选中状态
  const {
    selectedTables,
    setSelectedTables,
    currentConnectionStatus,
    setCurrentConnectionStatus,
    selectedNode,
    setSelectedNode,
    mainPanelRef,
    selectedObject,
    setSelectedObject
  } = useSelection()
  
  // 处理表打开事件，创建TableObject对象
  const handleTableOpen = (record: TableData): void => {
    const tableObject: TableObject = {
      name: record.name,
      type: TreeNodeType.TABLE,
      engine: record.engine,
      rows: record.rows,
      dataLength: record.dataLength,
      createTime: record.createTime || '',
      updateTime: record.modifyDate || '',
      collation: record.collation || '',
      autoIncrement: record.autoIncrement || null,
      rowFormat: record.rowFormat || '',
      checkTime: record.checkTime || null,
      indexLength: record.indexLength || '0 KB',
      maxDataLength: record.maxDataLength || '0 KB',
      dataFree: record.dataFree || '0 KB',
      comment: record.comment
    }
    debugger
    setSelectedObject(tableObject)
  }

  // 创建ObjectPanel组件
  const createObjectPanelContent = (dataSource: TableData[] = [], nodeType?: TreeNodeType, nodeName?: string, databaseStatus?: DatabaseStatus) => (
    <ObjectPanel
      dataSource={dataSource}
      selectedTables={selectedTables}
      onSelectTables={setSelectedTables}
      selectedNodeType={nodeType}
      selectedNodeName={nodeName}
      onOpenTable={handleTableOpen}
      connectionStatus={currentConnectionStatus}
      databaseStatus={databaseStatus}
      mainPanelRef={mainPanelRef}
      connectionId={propActiveConnectionId || storeActiveConnectionId || undefined}
      databaseName={selectedNode.name}
    />
  )

  // 处理表按钮点击
  const handleTableClick = () => {
    mainPanelRef.current?.createPanel('table', '表', createObjectPanelContent([], selectedNode.type, selectedNode.name))
  }

  // 处理函数按钮点击
  const handleFunctionClick = () => {
    mainPanelRef.current?.createPanel('function', '函数', (
      <FunctionPanel
        dataSource={mockFunctions}
      />
    ))
  }

  // 处理新建查询按钮点击
  const handleNewQueryClick = () => {
    mainPanelRef.current?.createPanel('query', `查询`, (
      <div style={{ padding: '20px' }}>
        <h3>新建查询</h3>
        <p>查询编辑器将在这里显示</p>
      </div>
    ))
  }

  // 处理视图按钮点击
  const handleViewClick = () => {
    mainPanelRef.current?.createPanel('view', '视图', (
      <div style={{ padding: '20px' }}>
        <h3>视图</h3>
        <p>视图列表将在这里显示</p>
      </div>
    ))
  }

  // 处理备份按钮点击
  const handleBackupClick = () => {
    mainPanelRef.current?.createPanel('backup', '备份', (
      <div style={{ padding: '20px' }}>
        <h3>备份</h3>
        <p>备份功能将在这里显示</p>
      </div>
    ))
  }

  // 处理模型按钮点击
  const handleModelClick = () => {
    mainPanelRef.current?.createPanel('model', '模型', (
      <div style={{ padding: '20px' }}>
        <h3>模型</h3>
        <p>模型功能将在这里显示</p>
      </div>
    ))
  }

  // 处理BI按钮点击
  const handleBIClick = () => {
    mainPanelRef.current?.createPanel('bi', 'BI', (
      <div style={{ padding: '20px' }}>
        <h3>BI</h3>
        <p>BI功能将在这里显示</p>
      </div>
    ))
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
          dataLength: typeof tableObject.metadata?.dataLength === 'number' ? formatBytes(tableObject.metadata.dataLength) : '0 KB',
          engine: tableObject.metadata?.engine || '',
          modifyDate: tableObject.metadata?.updateTime || '--',
          collation: tableObject.metadata?.collation || '',
          rowFormat: tableObject.metadata?.rowFormat || '',
          comment: tableObject.metadata?.comment || ''
        }
        // 设置选中对象
        const tableDetails: TableObject = {
          name: table.name,
          type: TreeNodeType.TABLE,
          engine: tableObject.metadata?.engine || '',
          rows: tableObject.metadata?.rows || 0,
          dataLength: typeof tableObject.metadata?.dataLength === 'number' ? formatBytes(tableObject.metadata.dataLength) : '0 KB',
          createTime: tableObject.metadata?.createTime || '',
          updateTime: tableObject.metadata?.updateTime || '',
          collation: tableObject.metadata?.collation || '',
          autoIncrement: tableObject.metadata?.autoIncrement || null,
          rowFormat: tableObject.metadata?.rowFormat || '',
          checkTime: tableObject.metadata?.checkTime || null,
          indexLength: typeof tableObject.metadata?.indexLength === 'number' ? formatBytes(tableObject.metadata.indexLength) : '0 KB',
          maxDataLength: typeof tableObject.metadata?.maxDataLength === 'number' ? formatBytes(tableObject.metadata.maxDataLength) : '0 KB',
          dataFree: typeof tableObject.metadata?.dataFree === 'number' ? formatBytes(tableObject.metadata.dataFree) : '0 KB',
          comment: tableObject.metadata?.comment || ''
        }
        debugger
        setSelectedObject(tableDetails)
        
        // 从tables中获取该表所在数据库的所有表
        const databaseId = tableObject.parentId
        const actualTables = tables instanceof Map 
          ? Array.from(tables.values())
              .filter(obj => obj.parentId === databaseId)
              .map(obj => ({
                name: obj.name,
                rows: obj.metadata?.rows || 0,
                dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
                engine: obj.metadata?.engine || '',
                modifyDate: obj.metadata?.updateTime || '--',
                collation: obj.metadata?.collation || '',
                rowFormat: obj.metadata?.rowFormat || '',
                comment: obj.metadata?.comment || ''
              }))
          : []
        
        // 更新默认对象面板的内容
        mainPanelRef.current?.updatePanelContent('object-0', createObjectPanelContent(
          currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : [],
          node.type,
          typeof node.title === 'string' ? node.title : undefined,
          databaseId && databaseStates instanceof Map ? databaseStates.get(databaseId) : undefined // 获取表所在数据库的状态
        ))
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
              dataLength: typeof obj.metadata?.dataLength === 'number' ? formatBytes(obj.metadata.dataLength) : '0 KB',
              engine: obj.metadata?.engine || '',
              modifyDate: obj.metadata?.updateTime || '--',
              collation: obj.metadata?.collation || '',
              rowFormat: obj.metadata?.rowFormat || '',
              comment: obj.metadata?.comment || ''
            }))
        : []
      
      // 更新默认对象面板的内容
        mainPanelRef.current?.updatePanelContent('object-0', createObjectPanelContent(
          currentConnectionStatus === ConnectionStatus.CONNECTED ? actualTables : [],
          node.type,
          typeof node.title === 'string' ? node.title : undefined,
          databaseStates instanceof Map ? databaseStates.get(node.key) : undefined
        ))
    } else if (node.type === TreeNodeType.CONNECTION) {
      // 处理连接节点点击
      // 更新默认对象面板的内容
        mainPanelRef.current?.updatePanelContent('object-0', (
          <ObjectPanel
            dataSource={[]} // 连接节点选中时显示空表列表
            selectedTables={selectedTables}
            onSelectTables={setSelectedTables}
            selectedNodeType={node.type}
            selectedNodeName={typeof node.title === 'string' ? node.title : undefined}
            connectionStatus={currentConnectionStatus}
            onOpenTable={(record) => {
              // 打开表时，显示表的详细信息
              const tableObject: TableObject = {
                name: record.name,
                type: TreeNodeType.TABLE,
                engine: record.engine,
                rows: record.rows,
                dataLength: record.dataLength,
                createTime: record.createTime || '',
                updateTime: record.modifyDate || '',
                collation: record.collation || '',
                autoIncrement: record.autoIncrement || null,
                rowFormat: record.rowFormat || '',
                checkTime: record.checkTime || null,
                indexLength: record.indexLength || '0 KB',
                maxDataLength: record.maxDataLength || '0 KB',
                dataFree: record.dataFree || '0 KB',
                comment: record.comment
              }
              debugger
              setSelectedObject(tableObject)
            }}
          />
        ))
    } else if (node.type === TreeNodeType.FUNCTION) {
      // 处理函数节点双击
      mainPanelRef.current?.createPanel('function', '函数', (
        <FunctionPanel
          dataSource={mockFunctions}
        />
      ))
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
            ref={mainPanelRef}
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
