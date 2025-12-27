<template>
  <div class="object-panel">
    <TablePanel
      v-if="objectPanelType === 'table'"
      :data-source="dataSource as TableData[]"
      :selected-objects="(selectedObjects || []) as TableData[]"
      :connection-id="connectionId"
      :database-name="databaseName"
      :set-selected-node="setSelectedNode"
      @open-object="onOpenObject"
      @design-object="onDesignObject"
      @new-object="onNewObject"
      @delete-object="onDeleteObject"
      @import-wizard="onImportWizard"
      @export-wizard="onExportWizard"
      @search="onSearch"
      @select-objects="onSelectObjects"
    />
    <ViewPanel
      v-else-if="objectPanelType === 'view'"
      :data-source="dataSource as ViewData[]"
      :selected-objects="(selectedObjects || []) as ViewData[]"
      :connection-id="connectionId"
      :database-name="databaseName"
      :set-selected-node="setSelectedNode"
      @open-object="onOpenObject"
      @design-object="onDesignObject"
      @new-object="onNewObject"
      @delete-object="onDeleteObject"
      @import-wizard="onImportWizard"
      @export-wizard="onExportWizard"
      @search="onSearch"
      @select-objects="onSelectObjects"
    />
    <FunctionPanel
      v-else-if="objectPanelType === 'function'"
      :data-source="dataSource as FunctionData[]"
      :selected-objects="(selectedObjects || []) as FunctionData[]"
      :connection-id="connectionId"
      :database-name="databaseName"
      :set-selected-node="setSelectedNode"
      @open-object="onOpenObject"
      @new-object="onNewObject"
      @delete-object="onDeleteObject"
      @import-wizard="onImportWizard"
      @export-wizard="onExportWizard"
      @search="onSearch"
      @select-objects="onSelectObjects"
    />
    <el-empty v-else description="未选择对象类型" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import TablePanel from './components/ObjectTablePanel.vue'
import ViewPanel from './components/ObjectViewPanel.vue'
import FunctionPanel from './components/ObjectFunctionPanel.vue'
import type { ConnectionStatus, DatabaseStatus } from '../../enum/database'
import type { ObjectPanelType } from '../../types/headerBar/headerBar'
import type { TreeNodeType } from '../../types/leftTree/tree'
import type { MainPanelRef } from '../MainPanel/MainPanel.vue'
import type { TableData, ViewData, FunctionData } from '../../types/objectPanel'

interface ObjectPanelProps {
  connectionStatus?: ConnectionStatus
  databaseStatus?: DatabaseStatus
  dataSource?: any[]
  selectedObjects?: any[]
  objectPanelType?: ObjectPanelType
  selectedNodeName?: string
  mainPanelRef?: MainPanelRef | null
  connectionId?: string
  databaseName?: string
  setSelectedNode?: (node: { type?: TreeNodeType; name?: string; id?: string; parentId?: string }, connection?: any, database?: any, table?: TableData) => void
  onOpenObject?: (record: any) => void
  onDesignObject?: (record: any) => void
  onNewObject?: () => void
  onDeleteObject?: (records: any[]) => void
  onImportWizard?: () => void
  onExportWizard?: () => void
  onSearch?: (keyword: string) => void
  onSelectObjects?: (records: any[]) => void
}

const props = withDefaults(defineProps<ObjectPanelProps>(), {
  dataSource: () => [],
  selectedObjects: () => [],
  mainPanelRef: null
})
</script>

<style scoped>
.object-panel {
  height: 100%;
  width: 100%;
}
</style>
