import { Empty } from 'antd'
import TablePanel from './components/TablePanel'
import ViewPanel from './components/ViewPanel'
import FunctionPanel from './components/FunctionPanel'
import { ConnectionStatus, DatabaseStatus } from '../../types/leftTree/connection'
import { ObjectPanelType } from '../../types/headerBar/headerBar'
import { TreeNodeType } from '../../types/leftTree/tree'
import { MainPanelRef } from '../MainPanel/MainPanel'
import type { TableData, ViewData, FunctionData } from '../../types/objectPanel'

interface ObjectPanelProps {
  /** 数据库连接状态 */
  connectionStatus?: ConnectionStatus
  /** 数据库加载状态 */
  databaseStatus?: DatabaseStatus
  /** 数据源列表 */
  dataSource?: any[]
  /** 已选择的数据库对象列表 */
  selectedObjects?: any[]
  /** 对象面板类型（表、视图、函数等） */
  objectPanelType?: ObjectPanelType
  /** 选中的节点名称 */
  selectedNodeName?: string
  /** 主面板的引用 */
  mainPanelRef?: React.RefObject<MainPanelRef>
  /** 连接ID */
  connectionId?: string
  /** 数据库名称 */
  databaseName?: string
  /** 设置选中的节点 */
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: TableData) => void
  /** 打开对象的回调 */
  onOpenObject?: (record: any) => void
  /** 设计对象的回调 */
  onDesignObject?: (record: any) => void
  /** 新建对象的回调 */
  onNewObject?: () => void
  /** 删除对象的回调 */
  onDeleteObject?: (records: any[]) => void
  /** 导入向导的回调 */
  onImportWizard?: () => void
  /** 导出向导的回调 */
  onExportWizard?: () => void
  /** 搜索的回调 */
  onSearch?: (keyword: string) => void
  /** 选择对象的回调 */
  onSelectObjects?: (records: any[]) => void
}

const ObjectPanel = ({
  dataSource = [],
  selectedObjects = [],
  objectPanelType,
  mainPanelRef,
  connectionId,
  databaseName,
  setSelectedNode,
  onOpenObject,
  onDesignObject,
  onNewObject,
  onDeleteObject,
  onImportWizard,
  onExportWizard,
  onSearch,
  onSelectObjects
}: ObjectPanelProps) => {
  const renderPanel = () => {
    if (!objectPanelType) {
      return <Empty description="未选择对象类型" />
    }
    debugger
    switch (objectPanelType) {
      case 'table':
        return (
          <TablePanel
            dataSource={dataSource as TableData[]}
            selectedObjects={selectedObjects as TableData[]}
            mainPanelRef={mainPanelRef}
            connectionId={connectionId}
            databaseName={databaseName}
            setSelectedNode={setSelectedNode}
            onOpenObject={onOpenObject}
            onDesignObject={onDesignObject}
            onNewObject={onNewObject}
            onDeleteObject={onDeleteObject}
            onImportWizard={onImportWizard}
            onExportWizard={onExportWizard}
            onSearch={onSearch}
            onSelectObjects={onSelectObjects}
          />
        )
      case 'view':
        return (
          <ViewPanel
            dataSource={dataSource as ViewData[]}
            selectedObjects={selectedObjects as ViewData[]}
            mainPanelRef={mainPanelRef}
            connectionId={connectionId}
            databaseName={databaseName}
            setSelectedNode={setSelectedNode}
            onOpenObject={onOpenObject}
            onDesignObject={onDesignObject}
            onNewObject={onNewObject}
            onDeleteObject={onDeleteObject}
            onImportWizard={onImportWizard}
            onExportWizard={onExportWizard}
            onSearch={onSearch}
            onSelectObjects={onSelectObjects}
          />
        )
      case 'function':
        return (
          <FunctionPanel
            dataSource={dataSource as FunctionData[]}
            selectedObjects={selectedObjects as FunctionData[]}
            mainPanelRef={mainPanelRef}
            connectionId={connectionId}
            databaseName={databaseName}
            setSelectedNode={setSelectedNode}
            onOpenObject={onOpenObject}
            onNewObject={onNewObject}
            onDeleteObject={onDeleteObject}
            onImportWizard={onImportWizard}
            onExportWizard={onExportWizard}
            onSearch={onSearch}
            onSelectObjects={onSelectObjects}
          />
        )
      default:
        return <Empty description={`当前面板类型 ${objectPanelType} 暂未实现专用组件`} />
    }
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {renderPanel()}
    </div>
  )
}

export default ObjectPanel
