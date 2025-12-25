import type { AlignType } from 'rc-table/lib/interface'

export interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  align?: AlignType
  ellipsis?: boolean
  render?: (text: any, record: any) => React.ReactNode
  [key: string]: any
}
