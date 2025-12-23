import { useState } from 'react'
import { Table, Button, Input, Space, Empty, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { TreeNodeType } from '../../types/tree'
import { ConnectionStatus, DatabaseStatus } from '../../types/connection'
import { MainPanelRef } from '../MainPanel/MainPanel'
import { useDatabaseOperations } from '../../hooks/useDatabaseOperations'

const { Search } = Input

// 表列信息接口
interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  [key: string]: any
}

// 表数据接口
export interface TableData {
  name: string
  rows: number
  dataLength: string
  engine: string
  modifyDate: string
  comment: string
  columns?: TableColumn[]
  [key: string]: any
}

interface ObjectPanelProps {
  /**
   * 当前连接状态
   */
  connectionStatus?: ConnectionStatus
  
  /**
   * 当前数据库状态
   */
  databaseStatus?: DatabaseStatus
  
  /**
   * 表数据列表
   */
  dataSource?: TableData[]
  /**
   * 选中的表数据
   */
  selectedTables?: TableData[]
  /**
   * 打开表的回调
   */
  onOpenTable?: (record: TableData) => void
  /**
   * 设计表的回调
   */
  onDesignTable?: (record: TableData) => void
  /**
   * 新建表的回调
   */
  onNewTable?: () => void
  /**
   * 删除表的回调
   */
  onDeleteTable?: (records: TableData[]) => void
  /**
   * 导入向导的回调
   */
  onImportWizard?: () => void
  /**
   * 导出向导的回调
   */
  onExportWizard?: () => void
  /**
   * 搜索表的回调
   */
  onSearch?: (keyword: string) => void
  /**
   * 选择表的回调
   */
  onSelectTables?: (records: TableData[]) => void

  /**
   * 当前选中节点类型
   */
  selectedNodeType?: TreeNodeType
  /**
   * 当前选中节点名称
   */
  selectedNodeName?: string
  /**
   * MainPanel的引用，用于创建新面板
   */
  mainPanelRef?: React.RefObject<MainPanelRef>
  /**
   * 当前连接ID
   */
  connectionId?: string
  /**
   * 当前数据库名称
   */
  databaseName?: string
}

/**
 * 对象列表面板组件
 */
const ObjectPanel = ({
  dataSource = [],
  selectedTables = [],
  onOpenTable,
  // onDesignTable,
  onNewTable,
  onDeleteTable,
  onImportWizard,
  onExportWizard,
  onSearch,
  onSelectTables,
  databaseStatus,
  selectedNodeType,
  selectedNodeName: _selectedNodeName,
  mainPanelRef,
  connectionId,
  databaseName
}: ObjectPanelProps) => {
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('')
  // 加载状态
  const [tableLoading, setTableLoading] = useState(false)
  // 数据库操作hook
  const { executeSql } = useDatabaseOperations()
  
  // 判断是否显示表数据
  const shouldShowTables = selectedNodeType && [TreeNodeType.DATABASE, TreeNodeType.TABLE].includes(selectedNodeType)
  // 表格列配置
  const columns: any[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: TableData) => (
        <span
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => {
            onSelectTables?.([record])
            onOpenTable?.(record)
          }}
        >
          {text}
        </span>
      )
    },
    {
      title: '行',
      dataIndex: 'rows',
      key: 'rows',
      width: 150,
      align: 'right'
    },
    {
      title: '数据长度',
      dataIndex: 'dataLength',
      key: 'dataLength',
      width: 150,
      align: 'right'
    },
    {
      title: '引擎',
      dataIndex: 'engine',
      key: 'engine',
      width: 150
    },
    {
      title: '修改日期',
      dataIndex: 'modifyDate',
      key: 'modifyDate',
      width: 150
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    }
  ]
  // 判断数据库操作是否可用（需要数据库已加载），只是是数据库节点，并且数据库状态是已加载
  const isDatabaseOperationsAvailable = selectedNodeType === TreeNodeType.DATABASE && 
    databaseStatus === DatabaseStatus.LOADED
  
  // 判断表操作是否可用，只要是表节点或者有选中的表，就可以操作
  const isTableOperationsAvailable = selectedNodeType === TreeNodeType.TABLE 
  
  // 过滤后的表数据
  const filteredDataSource = searchKeyword 
    ? dataSource.filter(table => 
        table.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : dataSource
  
  

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button onClick={async () => {
            // 获取要打开的表，优先使用选中的表，如果没有选中表则使用第一个表
            const tableToOpen = selectedTables.length > 0 ? selectedTables[0] : dataSource[0];
            if (tableToOpen && mainPanelRef?.current && connectionId && databaseName) {
              setTableLoading(true)
              try {
                // 从数据库获取表的列信息
                const columnsResult = await executeSql(connectionId, databaseName, `DESC ${tableToOpen.name}`)
                // 从数据库获取表的数据（限制前100行）
                const dataResult = await executeSql(connectionId, databaseName, `SELECT * FROM ${tableToOpen.name} LIMIT 100`)
                
                // 处理列信息
                let tableColumns: TableColumn[] = []
                if (columnsResult && columnsResult.columns && columnsResult.rows) {
                  tableColumns = columnsResult.columns.map((column: any, _: number) => ({
                    title: column.name,
                    dataIndex: column.name,
                    key: column.name,
                    width: 150
                  }))
                } else {
                  // 如果获取失败，使用默认列
                  tableColumns = [
                    {
                      title: 'ID',
                      dataIndex: 'id',
                      key: 'id',
                      width: 100
                    },
                    {
                      title: '名称',
                      dataIndex: 'name',
                      key: 'name',
                      width: 150
                    }
                  ]
                }
                
                // 处理表数据
                let tableDataSource: any[] = []
                if (dataResult && dataResult.rows) {
                  tableDataSource = dataResult.rows.map((row: any, index: number) => ({
                    key: index + 1,
                    ...row
                  }))
                } else {
                  // 如果获取失败，使用mock数据
                  tableDataSource = [
                    {
                      key: 1,
                      id: 1,
                      name: '示例数据1'
                    },
                    {
                      key: 2,
                      id: 2,
                      name: '示例数据2'
                    }
                  ]
                }
                
                // 创建表数据面板内容
                const tableContent = (
                  <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
                    <Spin spinning={tableLoading}>
                      <Table
                        columns={tableColumns}
                        dataSource={tableDataSource}
                        pagination={{ pageSize: 20 }}
                        scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
                      />
                    </Spin>
                  </div>
                )
                // 在MainPanel中创建新面板，页签名称为表名
                mainPanelRef.current.createPanel('table', tableToOpen.name, tableContent)
              } catch (error) {
                console.error('Failed to fetch table data:', error)
                // 如果获取失败，使用默认列和数据
                const tableColumns = [
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 100
                  },
                  {
                    title: '名称',
                    dataIndex: 'name',
                    key: 'name',
                    width: 150
                  }
                ]
                const tableDataSource = [
                  {
                    key: 1,
                    id: 1,
                    name: '示例数据1'
                  },
                  {
                    key: 2,
                    id: 2,
                    name: '示例数据2'
                  }
                ]
                const tableContent = (
                  <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
                    <Table
                      columns={tableColumns}
                      dataSource={tableDataSource}
                      pagination={{ pageSize: 20 }}
                      scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
                    />
                  </div>
                )
                mainPanelRef.current.createPanel('table', tableToOpen.name, tableContent)
              } finally {
                setTableLoading(false)
              }
            }
          }} type="text" disabled={!isTableOperationsAvailable}>
            打开表
          </Button>
            <Button 
            onClick={() => onDeleteTable?.([])}
            type="text" 
            danger
            disabled={!isTableOperationsAvailable}
          >
            设计表
          </Button>
          <Button onClick={onNewTable} type="text" disabled={!isTableOperationsAvailable && !isDatabaseOperationsAvailable}>
            新建表
          </Button>
          <Button 
            onClick={() => onDeleteTable?.([])}
            type="text" 
            danger
            disabled={!isTableOperationsAvailable}
          >
            删除表
          </Button>
          <Button onClick={onImportWizard} type="text" disabled={!isTableOperationsAvailable && !isDatabaseOperationsAvailable}>
            导入向导
          </Button>
          <Button onClick={onExportWizard} type="text" disabled={!isTableOperationsAvailable && !isDatabaseOperationsAvailable}>
            导出向导
          </Button>
        </Space>
        
        <Search
          placeholder="搜索表"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={(value) => {
            setSearchKeyword(value)
            onSearch?.(value)
          }}
          onChange={(e) => {
            setSearchKeyword(e.target.value)
            onSearch?.(e.target.value)
          }}
          value={searchKeyword}
          style={{ width: 200 }}
          disabled={!shouldShowTables}
        />
      </div>
      
      {/* 表格区域 */}
        <Table
          dataSource={filteredDataSource}
          columns={columns}
          rowKey="name"
          pagination={false}
          style={{ flex: 1 }}
          bordered
          scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
          locale={{ emptyText: <Empty description="当前数据库没有表" /> }}
          onRow={(record) => ({
            onClick: () => {
              onSelectTables?.([record])
              onOpenTable?.(record)
            }
          })}
        />
    </div>
  )
}

export default ObjectPanel