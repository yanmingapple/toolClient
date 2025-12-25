import type { TableColumn } from './table'

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
