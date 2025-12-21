import React from 'react'
import { Table, Button, Input, Space, Checkbox, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { TreeNodeType } from '../../types/tree'
import { ConnectionStatus } from '../../types/connection'

const { Search } = Input

// 表数据接口
export interface TableData {
  name: string
  rows: number
  dataLength: string
  engine: string
  modifyDate: string
  comment: string
  [key: string]: any
}

interface ObjectPanelProps {
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
   * 当前连接状态
   */
  connectionStatus?: ConnectionStatus
  /**
   * 当前选中节点类型
   */
  selectedNodeType?: TreeNodeType
  /**
   * 当前选中节点名称
   */
  selectedNodeName?: string
}

/**
 * 对象列表面板组件
 */
const ObjectPanel: React.FC<ObjectPanelProps> = ({
  dataSource = [],
  selectedTables = [],
  onOpenTable,
  onDesignTable,
  onNewTable,
  onDeleteTable,
  onImportWizard,
  onExportWizard,
  onSearch,
  onSelectTables,
  connectionStatus,
  selectedNodeType,
  selectedNodeName: _selectedNodeName
}) => {
  // 表格列配置
  const columns: any[] = [
    {
      title: (
        <Checkbox
          checked={selectedTables.length === dataSource.length && dataSource.length > 0}
          indeterminate={selectedTables.length > 0 && selectedTables.length < dataSource.length}
          onChange={(e) => {
            if (e.target.checked) {
              onSelectTables?.(dataSource)
            } else {
              onSelectTables?.([])
            }
          }}
        />
      ),
      key: 'selection',
      width: 40,
      render: (_: any, record: TableData) => (
        <Checkbox
          checked={selectedTables.some(table => table.name === record.name)}
          onChange={(e) => {
            let newSelectedTables
            if (e.target.checked) {
              newSelectedTables = [...selectedTables, record]
            } else {
              newSelectedTables = selectedTables.filter(table => table.name !== record.name)
            }
            onSelectTables?.(newSelectedTables)
          }}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: TableData) => (
        <span
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => onOpenTable?.(record)}
        >
          {text}
        </span>
      )
    },
    {
      title: '行',
      dataIndex: 'rows',
      key: 'rows',
      width: 60,
      align: 'right'
    },
    {
      title: '数据长度',
      dataIndex: 'dataLength',
      key: 'dataLength',
      width: 100,
      align: 'right'
    },
    {
      title: '引擎',
      dataIndex: 'engine',
      key: 'engine',
      width: 100
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
debugger
  // 判断是否显示表数据
  const shouldShowTables = connectionStatus === ConnectionStatus.CONNECTED && 
    selectedNodeType && [TreeNodeType.CONNECTION, TreeNodeType.DATABASE, TreeNodeType.TABLE].includes(selectedNodeType)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button onClick={() => onOpenTable && onOpenTable(dataSource[0])} type="text" disabled={!shouldShowTables || dataSource.length === 0}>
            打开表
          </Button>
          <Button onClick={() => onDesignTable && onDesignTable(dataSource[0])} type="text" disabled={!shouldShowTables || dataSource.length === 0}>
            设计表
          </Button>
          <Button onClick={onNewTable} type="text" disabled={!shouldShowTables}>
            新建表
          </Button>
          <Button 
            onClick={() => onDeleteTable?.(selectedTables)}
            type="text" 
            danger
            disabled={!shouldShowTables || selectedTables.length === 0}
          >
            删除表
          </Button>
          <Button onClick={onImportWizard} type="text" disabled={!shouldShowTables}>
            导入向导
          </Button>
          <Button onClick={onExportWizard} type="text" disabled={!shouldShowTables}>
            导出向导
          </Button>
        </Space>
        
        <Search
          placeholder="搜索表"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={onSearch}
          style={{ width: 200 }}
          disabled={!shouldShowTables}
        />
      </div>
      
      {/* 表格区域 */}
      {shouldShowTables ? (
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="name"
          pagination={false}
          style={{ flex: 1 }}
          bordered
          scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
          locale={{ emptyText: <Empty description="当前数据库没有表" /> }}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description={
            connectionStatus === ConnectionStatus.CONNECTED 
              ? "请选择一个数据库或表" 
              : "请先连接到数据库"
          } />
        </div>
      )}
    </div>
  )
}

export default ObjectPanel