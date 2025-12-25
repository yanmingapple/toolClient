export interface FunctionData {
  name: string
  definition: string
  type: 'function' | 'procedure'
  parameterCount: number
  returnType?: string
  createDate: string
  modifyDate: string
  comment: string
  [key: string]: any
}
