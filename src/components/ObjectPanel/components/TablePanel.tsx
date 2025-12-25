import { Table, Button, Input, Space, Empty, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { TreeNodeType } from '../../../types/leftTree/tree'
import { MainPanelRef } from '../../MainPanel/MainPanel'
import { useDatabaseOperations } from '../../../hooks/useDatabaseOperations'
import { useConnectionStore } from '../../../store/connectionStore'
import { useState } from 'react'
import { TableColumn, TableData } from '../../../types'


const { Search } = Input

interface TablePanelProps {
  dataSource?: TableData[]
  selectedObjects?: TableData[]
  selectedNodeName?: string
  mainPanelRef?: React.RefObject<MainPanelRef>
  connectionId?: string
  databaseName?: string
  onOpenObject?: (record: TableData) => void
  onDesignObject?: (record: TableData) => void
  onNewObject?: () => void
  onDeleteObject?: (records: TableData[]) => void
  onImportWizard?: () => void
  onExportWizard?: () => void
  onSearch?: (keyword: string) => void
  onSelectObjects?: (records: TableData[]) => void
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: TableData) => void
}

const TablePanel = ({
  dataSource = [],
  selectedObjects = [],
  onOpenObject,
  onDesignObject,
  onNewObject,
  onDeleteObject,
  onImportWizard,
  onExportWizard,
  onSearch,
  onSelectObjects,
  mainPanelRef,
  connectionId,
  databaseName,
  setSelectedNode
}: TablePanelProps) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [tableLoading, setTableLoading] = useState(false)
  const { executeSql } = useDatabaseOperations()
  const { databases } = useConnectionStore()

  const nameColumn: TableColumn = {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (text: string, record: TableData) => (
      <span
        style={{ cursor: 'pointer', color: '#1890ff' }}
        onClick={() => {
          onSelectObjects?.([record])
          onOpenObject?.(record)
          if (setSelectedNode && databaseName && connectionId) {
            const databaseObj = Array.from(databases.values()).find(db => db.name === databaseName && db.parentId === connectionId) || null;
            setSelectedNode(
              {
                type: TreeNodeType.TABLE,
                name: record.name,
                id: `${connectionId}-${databaseName}-${record.name}`,
                parentId: `${connectionId}-${databaseName}`
              },
              databaseObj?.parentId ? databases.get(databaseObj.parentId)?.metadata?.connection : null,
              databaseObj,
              record
            );
          }
        }}
      >
        {text}
      </span>
    )
  }

  const columns: TableColumn[] = [
    nameColumn,
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

  const filteredDataSource = searchKeyword
    ? dataSource.filter(object =>
      object.name.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    : dataSource

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            onClick={async () => {
              const objectToOpen = selectedObjects.length > 0 ? selectedObjects[0] : (dataSource.length > 0 ? dataSource[0] : undefined);
              if (objectToOpen && mainPanelRef?.current && connectionId && databaseName) {
                setTableLoading(true)
                try {
                  const columnsResult = await executeSql(connectionId, databaseName, `DESC ${objectToOpen.name}`)
                  const dataResult = await executeSql(connectionId, databaseName, `SELECT * FROM ${objectToOpen.name} LIMIT 100`)

                  let tableColumns: TableColumn[] = []
                  if (columnsResult && columnsResult.columns && columnsResult.rows) {
                    tableColumns = columnsResult.columns.map((column: any, _: number) => ({
                      title: column.name,
                      dataIndex: column.name,
                      key: column.name,
                      width: 150
                    }))
                  } else {
                    tableColumns = [
                      { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
                      { title: '名称', dataIndex: 'name', key: 'name', width: 150 }
                    ]
                  }

                  let tableDataSource: any[] = []
                  if (dataResult && dataResult.rows) {
                    tableDataSource = dataResult.rows.map((row: any, index: number) => ({
                      key: index + 1,
                      ...row
                    }))
                  } else {
                    tableDataSource = [
                      { key: 1, id: 1, name: '示例数据1' },
                      { key: 2, id: 2, name: '示例数据2' }
                    ]
                  }

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
                  mainPanelRef.current.createPanel('table', objectToOpen.name, tableContent)
                } catch (error) {
                  console.error('Failed to fetch table data:', error)
                  const errorContent = (
                    <div style={{ padding: 16, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div>
                        <h3>获取数据失败</h3>
                        <p>无法获取表数据，请检查数据库连接和权限。</p>
                      </div>
                    </div>
                  )
                  mainPanelRef.current.createPanel('table', objectToOpen.name, errorContent)
                } finally {
                  setTableLoading(false)
                }
              }
            }}
            type="text"
          >
            打开表
          </Button>
          <Button
            onClick={() => {
              if (selectedObjects.length > 0) {
                onDesignObject?.(selectedObjects[0])
              }
            }}
            type="text"
            danger
          >
            设计表
          </Button>
          <Button onClick={onNewObject} type="text">
            新建表
          </Button>
          <Button
            onClick={() => onDeleteObject?.(selectedObjects)}
            type="text"
            danger
          >
            删除表
          </Button>
          <Button onClick={onImportWizard} type="text">
            导入向导
          </Button>
          <Button onClick={onExportWizard} type="text">
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
        />
      </div>

      <Table
        dataSource={filteredDataSource}
        columns={columns}
        rowKey="name"
        pagination={false}
        style={{ flex: 1 }}
        bordered
        scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
        locale={{ emptyText: <Empty description="当前没有表数据" /> }}
        onRow={(record) => ({
          onClick: () => {
            onSelectObjects?.([record])
            onOpenObject?.(record)
          }
        })}
      />
    </div>
  )
}

export default TablePanel
