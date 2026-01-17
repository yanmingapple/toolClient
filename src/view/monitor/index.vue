<template>
  <div class="service-monitor">
    <!-- 服务监控表格 -->
    <div class="service-monitoring">
      <div class="monitoring-table-container">
        <TkTable :tableObj="tableObj">
          <template #tblTopRight>
            <el-button size="small" @click="handleRefreshService">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="handleAddService">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
          </template>
          <template #name="{ row }">
            <div class="service-name">
              <el-icon class="service-icon"><Connection /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
          <template #status="{ row }">
            <el-tag 
              :type="getStatusType(row.status)" 
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
          <template #port="{ row }">
            <span class="port-number">{{ row.port }}</span>
          </template>
        </TkTable>
      </div>
    </div>
  </div>
  <!-- 新增服务对话框组件 -->
<ServiceMonitorDlg
  v-model:dialog-visible="dialogVisible"
  :editing-service="editingService"
  @save-success="handleRefreshService"
/>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, Connection, Plus } from '@element-plus/icons-vue'
import type { ServiceMonitor } from '../../../electron/model/database/ServiceMonitor'

import { getAllServiceMonitors, controlService, performServiceHealthCheck } from '@/utils/electronUtils'
import { useIpcCommunication } from '@/composables/useIpcCommunication'
import { ServiceHealthStatus, ServiceMonitorStatus } from '@/types'
import ServiceMonitorDlg from './components/ServiceMonitorDlg.vue'

// 服务监控数据
const services = ref<ServiceMonitor[]>([])

// 组件挂载时获取服务列表
onMounted(() => {
  handleRefreshService()
})

// 使用IPC通信获取服务监控健康检查结果
useIpcCommunication({
  onOpenNewConnectionDialog: () => {}, // 空实现，不使用
  onServiceMonitorHealthCheckResult: (data: any) => {
    // 查找对应的服务并更新状态
    const serviceIndex = services.value.findIndex((service: ServiceMonitor) => service.id === data.id)
    if (serviceIndex !== -1) {
      // 将健康检查结果映射到服务状态
      let serviceStatus = ServiceMonitorStatus.STOPPED
      
      switch (data.status) {
        case ServiceHealthStatus.HEALTHY:
          serviceStatus = ServiceMonitorStatus.RUNNING
          break
        case ServiceHealthStatus.UNHEALTHY:
        case ServiceHealthStatus.WARNING:
        case ServiceHealthStatus.UNKNOWN:
        case ServiceHealthStatus.TIMEOUT:
          serviceStatus = ServiceMonitorStatus.STOPPED
          break
      }
      
      // 更新服务状态
      const updatedService = {
        ...services.value[serviceIndex],
        status: serviceStatus
      }
      services.value[serviceIndex] = updatedService
    }
  }
})

// 新增服务对话框
const dialogVisible = ref(false)
// 当前编辑的服务
const editingService = ref<ServiceMonitor | null>(null)

// 右键菜单项配置
const getContextMenuItems = (service: ServiceMonitor | null) => {
  if (!service) return []
  
  const items: any[] = []
  
  // 启动按钮
  if (service.status === ServiceMonitorStatus.STOPPED) {
    items.push({
      label: '启动',
      icon: 'Switch',
      handler: () => handleServiceAction(service, 'toggle')
    })
  }
  
  // 停止按钮
  if (service.status === ServiceMonitorStatus.RUNNING) {
    items.push({
      label: '停止',
      icon: 'Switch',
      handler: () => handleServiceAction(service, 'toggle')
    })
  }
  
  // 编辑按钮
  if (service.status !== ServiceMonitorStatus.STARTING && 
      service.status !== ServiceMonitorStatus.STOPPING) {
    items.push({
      label: '编辑',
      icon: 'Edit',
      handler: () => handleServiceAction(service, 'edit')
    })
  }
  
  // 分隔线
  if (items.length > 0) {
    items.push({ type: 'divider' })
  }
  
  // 删除按钮
  if (service.status !== ServiceMonitorStatus.STARTING && 
      service.status !== ServiceMonitorStatus.STOPPING) {
    items.push({
      label: '删除',
      icon: 'Delete',
      type: 'danger',
      handler: () => handleServiceAction(service, 'delete')
    })
  }
  
  // 刷新按钮
  items.push({
    label: '刷新',
    icon: 'Refresh',
    handler: () => handleRefreshService()
  })
  
  return items
}

// 表格配置对象
const tableObj = ref({
  type: 'table',
  get tableData() {
    return services.value
  },
  tableLoading: false,
  border: true,
  showHeader: true,
  rowKey: 'id',
  // 显示表格顶部区域和插槽
  isShowTblTopCon: true,
  isShowTblSlotTopCon: true,
  column: [
    {
      label: '服务名称',
      prop: 'name',
      minWidth: 150,
      slot: 'name'
    },
    {
      label: '状态',
      prop: 'status',
      width: 150,
      slot: 'status'
    },
    {
      label: '端口号',
      prop: 'port',
      width: 150,
      slot: 'port'
    }
  ],
  // 右键菜单配置
  contextMenuVisible: false,
  contextMenuX: 0,
  contextMenuY: 0,
  contextMenuData: null as ServiceMonitor | null,
  contextMenuItems: (data: ServiceMonitor | null) => getContextMenuItems(data),
  // 表格引用
  tableRef: null as any,
  setTableRef: (ref: any) => {
    tableObj.value.tableRef = ref
  },
  // 空方法（TkTable 需要）
  search: () => {},
  reset: () => {},
  pagination: () => {},
  pageObj: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  },
  isPagination: false,
  autoHeight: () => {},
  // 获取选中行（用于分页显示）
  getSelectedRow: () => []
})


// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case ServiceMonitorStatus.RUNNING:
      return 'success'
    case ServiceMonitorStatus.STARTING:
      return 'warning'
    case ServiceMonitorStatus.STOPPED:
      return 'info'
    case ServiceMonitorStatus.STOPPING:
      return 'danger'
    default:
      return 'info'
  }
}

// 处理服务操作
const handleServiceAction = async (service: ServiceMonitor, action: string) => {
  switch (action) {
    case 'toggle':
      const currentIndex = services.value.findIndex((s: ServiceMonitor) => s.id === service.id)
      if (currentIndex !== -1) {
        // 切换状态
        const currentStatus = services.value[currentIndex].status
        let newStatus = ''
        let serviceAction: 'start' | 'stop' | 'restart' | null = null
        
        switch (currentStatus) {
          case ServiceMonitorStatus.RUNNING:
            newStatus = ServiceMonitorStatus.STOPPING
            serviceAction = 'stop'
            break
          case ServiceMonitorStatus.STOPPING:
            newStatus = ServiceMonitorStatus.RUNNING
            serviceAction = 'start'
            break
          case ServiceMonitorStatus.STOPPED:
            newStatus = ServiceMonitorStatus.STARTING
            serviceAction = 'start'
            break
          case ServiceMonitorStatus.STARTING:
            newStatus = ServiceMonitorStatus.STOPPED
            serviceAction = 'stop'
            break
        }
        
        services.value[currentIndex].status = newStatus
        
        // 执行实际的服务控制命令
        if (serviceAction && service.serverName && (currentStatus === ServiceMonitorStatus.RUNNING || currentStatus === ServiceMonitorStatus.STOPPED)) {
          try {
            const result = await controlService(service.serverName, serviceAction)
            
            // 根据命令结果更新最终状态
            setTimeout(() => {
              if (result.success) {
                const finalStatus = newStatus === ServiceMonitorStatus.STARTING ? ServiceMonitorStatus.RUNNING : ServiceMonitorStatus.STOPPED
                services.value[currentIndex].status = finalStatus
                CTMessage.success(`服务 ${service.name} ${serviceAction === 'start' ? '已启动' : '已停止'}`)
              } else {
                // 命令执行失败，恢复原状态
                services.value[currentIndex].status = currentStatus
                CTMessage.error(`执行${serviceAction === 'start' ? '启动' : '停止'}服务 ${service.name} 失败: ${result.message}`)
              }
            }, 2000)
          } catch (error) {
            // 发生异常，恢复原状态
            setTimeout(() => {
              services.value[currentIndex].status = currentStatus
              CTMessage.error(`执行${serviceAction === 'start' ? '启动' : '停止'}服务 ${service.name} 时发生异常: ${error instanceof Error ? error.message : '未知错误'}`)
            }, 2000)
          }
        } else {
          // 模拟状态变化（仅用于取消操作）
          setTimeout(() => {
            const finalStatus = newStatus === ServiceMonitorStatus.STARTING ? ServiceMonitorStatus.RUNNING : ServiceMonitorStatus.STOPPED
            services.value[currentIndex].status = finalStatus
          }, 2000)
        }
      }
      break
    case 'edit':
      editingService.value = { ...service }
      dialogVisible.value = true
      break
    case 'delete':
      CTMessage.info(`删除服务: ${service.name}`)
      break
  }
}

// 服务监控相关处理函数
const handleRefreshService = async () => {
  try {
   
    
    // 从数据库获取服务监控列表
    const result = await getAllServiceMonitors()
    if (result.success) {
      services.value = result.data || []
      CTMessage.success('服务列表已刷新')

       // 执行健康检查
      const healthCheckResult = await performServiceHealthCheck()
      if (healthCheckResult.success) {
        // 健康检查完成后，等待一段时间让健康检查结果通过 IPC 事件更新到前端
        // 然后从数据库获取服务监控列表以刷新状态
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } else {
      CTMessage.error(`刷新失败: ${result.message}`)
    }
  } catch (error) {
    console.error('刷新服务列表失败:', error)
    CTMessage.error('刷新服务列表失败')
  }
}

const handleAddService = () => {
  // 清空编辑服务数据，确保是新增模式
  editingService.value = null
  // 打开新增服务对话框
  dialogVisible.value = true
}
</script>

<style scoped>

</style>