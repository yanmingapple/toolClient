/**
 * 应用主布局组件
 */
import React, { useState } from 'react'
import { Layout, Typography, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Icon } from '../../icons'
import HeaderBar from '../HeaderBar'
import ConnectionTree from '../ConnectionTree'
import MainPanel, { PanelItem, PanelType } from '../MainPanel'
import TablePanel, { TableData } from '../TablePanel'
import FunctionPanel, { FunctionData } from '../FunctionPanel'
import PropertiesPanel, { TableObject } from '../PropertiesPanel'
import { TreeNode, TreeNodeType } from '../../types/tree'

const { Sider, Content } = Layout
const { Title, Paragraph } = Typography

// 模拟数据
const mockTables: TableData[] = [
  { name: 'columns_priv', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Column privileges' },
  { name: 'component', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Components' },
  { name: 'db', rows: 2, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Database privileges' },
  { name: 'default_roles', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Default roles' },
  { name: 'engine_cost', rows: 2, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Costs for query execution engines' },
  { name: 'func', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'User defined functions' },
  { name: 'general_log', rows: 2, dataLength: '0 KB', engine: 'CSV', modifyDate: '--', comment: 'General log' },
  { name: 'global_grants', rows: 57, dataLength: '48 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Extended global grants' },
  { name: 'gtid_executed', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: '' },
  { name: 'help_category', rows: 53, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'help categories' },
  { name: 'help_keyword', rows: 1016, dataLength: '128 KB', engine: 'InnoDB', modifyDate: '--', comment: 'help keywords' },
  { name: 'help_relation', rows: 2631, dataLength: '96 KB', engine: 'InnoDB', modifyDate: '--', comment: 'keyword-topic relation' },
  { name: 'help_topic', rows: 511, dataLength: '1552 KB', engine: 'InnoDB', modifyDate: '--', comment: 'help topics' },
  { name: 'innodb_index_stats', rows: 365, dataLength: '96 KB', engine: 'InnoDB', modifyDate: '--', comment: 'InnoDB index statistics' },
  { name: 'innodb_table_stats', rows: 87, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'InnoDB table statistics' },
  { name: 'ndb_binlog_index', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: '' },
  { name: 'password_history', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Password history for users' },
  { name: 'plugin', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'MySQL plugins' },
  { name: 'proc_priv', rows: 0, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'Procedure privileges' },
  { name: 'proxies_priv', rows: 1, dataLength: '16 KB', engine: 'InnoDB', modifyDate: '--', comment: 'User proxy privileges' },
]

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
  activeConnectionId,
  onNewConnection,
  onConnect,
  onUser,
  onOther,
  onSearch,
  onAutoRun
}) => {
  // 面板状态
  // 添加默认的"对象"面板
  const [panels, setPanels] = useState<PanelItem[]>([
    {
      id: 'object-0',
      type: 'object',
      title: '对象',
      content: (
        <div style={{ padding: '20px' }}>
          <h3>对象列表</h3>
          <p>选择左侧导航树中的对象以查看详细信息</p>
        </div>
      )
    }
  ])
  const [activePanelId, setActivePanelId] = useState<string | undefined>('object-0')
  
  // 选中对象状态
  const [selectedTables, setSelectedTables] = useState<TableData[]>([])
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
        <TablePanel
          dataSource={mockTables}
          selectedTables={selectedTables}
          onSelectTables={setSelectedTables}
          onOpenTable={(record) => {
            // 打开表时，显示表的详细信息
            const tableObject: TableObject = {
              name: record.name,
              type: 'table',
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

  // 处理节点双击事件
  const handleNodeDoubleClick = (node: TreeNode) => {
    // 根据节点类型处理不同的双击事件
    if (node.type === TreeNodeType.TABLE) {
      // 查找双击的表
      const tableName = node.key.replace(/^table_/, '')
      const table = mockTables.find(t => t.name === tableName)
      
      if (table) {
        // 设置选中对象
        const tableObject: TableObject = {
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
        setSelectedObject(tableObject)
        
        // 检查是否已经存在表面板
        const existingPanel = panels.find(panel => panel.type === 'table')
        if (existingPanel) {
          setActivePanelId(existingPanel.id)
        } else {
          // 如果没有表面板，则创建一个
          createPanel('table', '表', (
            <TablePanel
              dataSource={mockTables}
              selectedTables={selectedTables}
              onSelectTables={setSelectedTables}
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
    } else if (node.type === TreeNodeType.DATABASE) {
      // 双击数据库节点可以加载表并显示表列表
      // 检查是否已经存在表面板
      const existingPanel = panels.find(panel => panel.type === 'table')
      if (existingPanel) {
        setActivePanelId(existingPanel.id)
      } else {
        // 创建表面板
        createPanel('table', '表', (
          <TablePanel
            dataSource={mockTables}
            selectedTables={selectedTables}
            onSelectTables={setSelectedTables}
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
            onNodeDoubleClick={handleNodeDoubleClick}
          />
        </Sider>
        
        <Content style={{ margin: '16px', padding: 0,  }}>
          {activeConnectionId ? (
            <MainPanel
              activePanelId={activePanelId}
              panels={panels}
              onClosePanel={handleClosePanel}
              onSwitchPanel={handleSwitchPanel}
              propertiesContent={
                <PropertiesPanel
                  selectedObject={selectedObject}
                  objectType="table"
                />
              }
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', margin: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <Icon name="database" size={64} color="#1890ff" style={{ marginBottom: '24px' }} />
              <Title level={2} style={{ marginBottom: '16px' }}>欢迎使用 DBManager Pro</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                一款功能强大的数据库管理工具，支持多种数据库类型
              </Paragraph>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onNewConnection} style={{ marginTop: '24px' }}>
                新建数据库连接
              </Button>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
