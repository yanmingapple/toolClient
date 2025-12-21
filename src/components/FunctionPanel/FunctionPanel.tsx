import React from 'react'
import { Table, Button, Input, Space, Tooltip } from 'antd'
import { SearchOutlined, PlayCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Search } = Input

// 函数数据接口
export interface FunctionData {
  name: string
  modifyDate: string
  functionType: string
  deterministic: boolean
  comment: string
  [key: string]: any
}

interface FunctionPanelProps {
  /**
   * 函数数据列表
   */
  dataSource?: FunctionData[]
  /**
   * 设计函数的回调
   */
  onDesignFunction?: (record: FunctionData) => void
  /**
   * 新建函数的回调
   */
  onNewFunction?: () => void
  /**
   * 删除函数的回调
   */
  onDeleteFunction?: (record: FunctionData) => void
  /**
   * 运行函数的回调
   */
  onRunFunction?: (record: FunctionData) => void
  /**
   * 搜索函数的回调
   */
  onSearch?: (keyword: string) => void
}

/**
 * 函数管理面板组件
 */
const FunctionPanel: React.FC<FunctionPanelProps> = ({
  dataSource = [],
  onDesignFunction,
  onNewFunction,
  onDeleteFunction,
  onRunFunction,
  onSearch
}) => {
  // 表格列配置
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: FunctionData) => (
        <span
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => onDesignFunction?.(record)}
        >
          {text}
        </span>
      )
    },
    {
      title: '修改日期',
      dataIndex: 'modifyDate',
      key: 'modifyDate',
      width: 150
    },
    {
      title: '函数类型',
      dataIndex: 'functionType',
      key: 'functionType',
      width: 120
    },
    {
      title: '具有确定性',
      dataIndex: 'deterministic',
      key: 'deterministic',
      width: 120,
      render: (deterministic: boolean) => (
        <span>{deterministic ? '是' : '否'}</span>
      )
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: FunctionData) => (
        <Space size="middle">
          <Tooltip title="运行函数">
            <PlayCircleOutlined
              style={{ cursor: 'pointer', color: '#52c41a' }}
              onClick={() => onRunFunction?.(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button onClick={onNewFunction} type="default">
            <PlusOutlined /> 新建函数
          </Button>
          <Button onClick={() => onDeleteFunction && onDeleteFunction(dataSource[0])} type="default" danger>
            <DeleteOutlined /> 删除函数
          </Button>
          <Button onClick={() => onRunFunction && onRunFunction(dataSource[0])} type="default">
            <PlayCircleOutlined /> 运行函数
          </Button>
        </Space>
        
        <Search
          placeholder="搜索函数"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={onSearch}
          style={{ width: 200 }}
        />
      </div>
      
      {/* 表格区域 */}
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="name"
        pagination={false}
        style={{ flex: 1 }}
        bordered
        scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
      />
    </div>
  )
}

export default FunctionPanel