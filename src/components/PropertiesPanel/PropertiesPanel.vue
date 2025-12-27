<template>
  <el-card
    :body-style="{ padding: '16px' }"
    shadow="never"
    style="height: 100%; overflow: auto"
  >
    <template #header>
      <span>
        <el-icon style="margin-right: 4px">
          <component :is="getObjectIcon()" />
        </el-icon>
        {{ selectedObject ? selectedObject.name : '对象属性' }}
      </span>
    </template>
    <template v-if="selectedObject">
      <el-descriptions :column="1" border size="small">
        <template v-if="selectedObject.type === 'table'">
          <el-descriptions-item label="表名">{{ (selectedObject as TableObject).name }}</el-descriptions-item>
          <el-descriptions-item label="引擎">{{ (selectedObject as TableObject).engine }}</el-descriptions-item>
          <el-descriptions-item label="行数">{{ (selectedObject as TableObject).rows }}</el-descriptions-item>
          <el-descriptions-item label="数据长度">{{ (selectedObject as TableObject).dataLength }}</el-descriptions-item>
          <el-descriptions-item label="自动递增">{{ (selectedObject as TableObject).autoIncrement || 0 }}</el-descriptions-item>
          <el-descriptions-item label="行格式">{{ (selectedObject as TableObject).rowFormat }}</el-descriptions-item>
          <el-descriptions-item label="修改日期">{{ (selectedObject as TableObject).updateTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建日期">{{ (selectedObject as TableObject).createTime }}</el-descriptions-item>
          <el-descriptions-item label="检查时间">{{ (selectedObject as TableObject).checkTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="索引长度">{{ (selectedObject as TableObject).indexLength }}</el-descriptions-item>
          <el-descriptions-item label="最大数据长度">{{ (selectedObject as TableObject).maxDataLength }}</el-descriptions-item>
          <el-descriptions-item label="数据可用空间">{{ (selectedObject as TableObject).dataFree }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as TableObject).comment" label="注释">{{ (selectedObject as TableObject).comment }}</el-descriptions-item>
        </template>
        <template v-else-if="selectedObject.type === 'function'">
          <el-descriptions-item label="函数名">{{ (selectedObject as FunctionObject).name }}</el-descriptions-item>
          <el-descriptions-item label="返回类型">{{ (selectedObject as FunctionObject).returns }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ (selectedObject as FunctionObject).createTime }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ (selectedObject as FunctionObject).updateTime }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as FunctionObject).comment" label="注释">{{ (selectedObject as FunctionObject).comment }}</el-descriptions-item>
          <el-descriptions-item label="定义">
            <pre style="margin: 0; font-size: 12px; font-family: monospace; white-space: pre-wrap">{{ (selectedObject as FunctionObject).definition }}</pre>
          </el-descriptions-item>
        </template>
        <template v-else-if="selectedObject.type === 'database'">
          <el-descriptions-item label="数据库名">{{ (selectedObject as DatabaseObject).name }}</el-descriptions-item>
          <el-descriptions-item label="字符集">{{ (selectedObject as DatabaseObject).charset }}</el-descriptions-item>
          <el-descriptions-item label="排序规则">{{ (selectedObject as DatabaseObject).collation }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ (selectedObject as DatabaseObject).createTime }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as DatabaseObject).comment" label="注释">{{ (selectedObject as DatabaseObject).comment }}</el-descriptions-item>
        </template>
        <template v-else-if="selectedObject.type === 'connection'">
          <el-descriptions-item label="连接名">{{ (selectedObject as ConnectionObject).name }}</el-descriptions-item>
          <el-descriptions-item label="主机">{{ (selectedObject as ConnectionObject).host }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ (selectedObject as ConnectionObject).port }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ (selectedObject as ConnectionObject).user }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as ConnectionObject).database" label="默认数据库">{{ (selectedObject as ConnectionObject).database }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as ConnectionObject).charset" label="字符集">{{ (selectedObject as ConnectionObject).charset }}</el-descriptions-item>
          <el-descriptions-item v-if="(selectedObject as ConnectionObject).connectTimeout" label="连接超时">{{ (selectedObject as ConnectionObject).connectTimeout }}ms</el-descriptions-item>
        </template>
        <template v-else>
          <el-descriptions-item label="对象名">{{ (selectedObject as any).name }}</el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ (selectedObject as any).type }}</el-descriptions-item>
        </template>
      </el-descriptions>
    </template>
    <template v-else>
      <div style="padding: 24px; text-align: center">
        <p style="color: #999; font-size: 14px">选择一个对象查看其属性</p>
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { ElCard, ElDescriptions, ElDescriptionsItem, ElIcon } from 'element-plus'
import {
  DataBoard,
  TableFilled,
  Star,
  Connection
} from '@element-plus/icons-vue'

export type ObjectType = 'table' | 'function' | 'view' | 'database' | 'user' | 'index'

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

export interface FunctionObject {
  name: string
  type: 'function'
  returns: string
  definition: string
  createTime: string
  updateTime: string
  comment?: string
}

export interface DatabaseObject {
  name: string
  type: 'database'
  collation: string
  charset: string
  createTime: string
  comment?: string
}

export interface ConnectionObject {
  name: string
  type: 'connection'
  host: string
  port: number
  user: string
  database?: string
  charset?: string
  connectTimeout?: number
}

export type PropertiesObject = TableObject | FunctionObject | DatabaseObject | ConnectionObject

interface PropertiesPanelProps {
  selectedObject?: PropertiesObject | null
}

const props = defineProps<PropertiesPanelProps>()

const getObjectIcon = () => {
  if (!props.selectedObject) return 'DataBoard'

  switch (props.selectedObject.type) {
    case 'table':
      return 'TableFilled'
    case 'function':
      return 'Star'
    case 'database':
      return 'DataBoard'
    case 'connection':
      return 'Connection'
    default:
      return 'DataBoard'
  }
}
</script>
