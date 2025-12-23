import React from 'react'
import { Card, Descriptions } from 'antd'
import { DatabaseOutlined, TableOutlined, FunctionOutlined } from '@ant-design/icons'

// 定义对象类型
export type ObjectType = 'table' | 'function' | 'view' | 'database' | 'user' | 'index'

// 表对象接口
export interface TableObject {
  name: string
  type: 'table'
  engine: string
  rows: number
  dataLength: string
  createTime: string
  updateTime: string
  collation: string
  autoIncrement: number | null
  rowFormat: string
  checkTime: string | null
  indexLength: string
  maxDataLength: string
  dataFree: string
  comment?: string
}

// 函数对象接口
export interface FunctionObject {
  name: string
  type: 'function'
  returns: string
  definition: string
  createTime: string
  updateTime: string
  comment?: string
}

// 数据库对象接口
export interface DatabaseObject {
  name: string
  type: 'database'
  collation: string
  charset: string
  createTime: string
  comment?: string
}

// 属性面板数据接口
export type PropertiesObject = TableObject | FunctionObject | DatabaseObject

interface PropertiesPanelProps {
  /**
   * 当前选中的对象
   */
  selectedObject?: PropertiesObject | null
}

/**
 * 属性面板组件，用于显示不同对象的详细信息
 */
const PropertiesPanel = ({
  selectedObject,
}: PropertiesPanelProps) => {
  // 获取对象类型对应的图标
  const getObjectIcon = () => {
    if (!selectedObject) return null
    
    switch (selectedObject.type) {
      case 'table':
        return <TableOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
      case 'function':
        return <FunctionOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
      case 'database':
        return <DatabaseOutlined style={{ color: '#722ed1', marginRight: '4px' }} />
      default:
        return null
    }
  }

  // 渲染表对象的属性
  const renderTableProperties = (table: TableObject) => {
    return (
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="表名">{table.name}</Descriptions.Item>
        <Descriptions.Item label="引擎">{table.engine}</Descriptions.Item>
        <Descriptions.Item label="行数">{table.rows}</Descriptions.Item>
        <Descriptions.Item label="数据长度">{table.dataLength}</Descriptions.Item>
        <Descriptions.Item label="自动递增">{table.autoIncrement || 0}</Descriptions.Item>
        <Descriptions.Item label="行格式">{table.rowFormat}</Descriptions.Item>
        <Descriptions.Item label="修改日期">{table.updateTime || '--'}</Descriptions.Item>
        <Descriptions.Item label="创建日期">{table.createTime}</Descriptions.Item>
        <Descriptions.Item label="检查时间">{table.checkTime || '--'}</Descriptions.Item>
        <Descriptions.Item label="索引长度">{table.indexLength}</Descriptions.Item>
        <Descriptions.Item label="最大数据长度">{table.maxDataLength}</Descriptions.Item>
        <Descriptions.Item label="数据可用空间">{table.dataFree}</Descriptions.Item>
        {table.comment && <Descriptions.Item label="注释">{table.comment}</Descriptions.Item>}
      </Descriptions>
    )
  }

  // 渲染函数对象的属性
  const renderFunctionProperties = (func: FunctionObject) => {
    return (
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="函数名">{func.name}</Descriptions.Item>
        <Descriptions.Item label="返回类型">{func.returns}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{func.createTime}</Descriptions.Item>
        <Descriptions.Item label="修改时间">{func.updateTime}</Descriptions.Item>
        {func.comment && <Descriptions.Item label="注释">{func.comment}</Descriptions.Item>}
        <Descriptions.Item label="定义" style={{ whiteSpace: 'pre-wrap' }}>
          <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>{func.definition}</pre>
        </Descriptions.Item>
      </Descriptions>
    )
  }

  // 渲染数据库对象的属性
  const renderDatabaseProperties = (db: DatabaseObject) => {
    return (
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="数据库名">{db.name}</Descriptions.Item>
        <Descriptions.Item label="字符集">{db.charset}</Descriptions.Item>
        <Descriptions.Item label="排序规则">{db.collation}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{db.createTime}</Descriptions.Item>
        {db.comment && <Descriptions.Item label="注释">{db.comment}</Descriptions.Item>}
      </Descriptions>
    )
  }

  // 渲染对象属性
  const renderObjectProperties = () => {
    if (!selectedObject) return null

    switch (selectedObject.type) {
      case 'table':
        return renderTableProperties(selectedObject)
      case 'function':
        return renderFunctionProperties(selectedObject)
      case 'database':
        return renderDatabaseProperties(selectedObject)
      default:
        return (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="对象名">{(selectedObject as any).name}</Descriptions.Item>
            <Descriptions.Item label="对象类型">{(selectedObject as any).type}</Descriptions.Item>
          </Descriptions>
        )
    }
  }

  // 渲染空状态
  const renderEmptyState = () => {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '14px' }}>选择一个对象查看其属性</p>
      </div>
    )
  }

  return (
    <Card 
      title={
        <span>
          {getObjectIcon()}
          {selectedObject ? `${selectedObject.name}` : '对象属性'}
        </span>
      }
      bordered={false}
      style={{ height: '100%', overflow: 'auto' }}
      size="small"
    >
      {selectedObject ? renderObjectProperties() : renderEmptyState()}
    </Card>
  )
}

export default PropertiesPanel