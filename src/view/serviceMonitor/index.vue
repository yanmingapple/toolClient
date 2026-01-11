<template>
  <div class="service-monitor">
    <!-- 服务监控表格 -->
    <div class="service-monitoring">
      <div class="section-header">
        <h2 class="section-title">服务监控</h2>
        <div class="section-actions">
          <el-button size="small" @click="handleRefreshService">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" size="small" @click="handleAddService">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </div>
      <div class="monitoring-table-container">
        <el-table 
          ref="tableRef"
          :data="services" 
          style="width: 100%" 
          class="service-table"
          @row-contextmenu="handleRowContextMenu"
        >
          <el-table-column prop="name" label="服务名称" min-width="150">
            <template #default="{ row }">
              <div class="service-name">
                <el-icon class="service-icon"><Connection /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.status)" 
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="port" label="端口号" width="100">
            <template #default="{ row }">
              <span class="port-number">{{ row.port }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <!-- 新增服务对话框组件 -->
<ServiceMonitorDlg
  v-model:dialog-visible="dialogVisible"
  :editing-service="editingService"
  @save-success="handleRefreshService"
/>

<!-- 右键菜单组件 -->
<CTRightMenu
  v-model:visible="menuVisible"
  :position="menuPosition"
  :menu-items="menuItems"
  :data="selectedService"
  @menu-click="handleMenuClick"
/>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import {
  Monitor, Refresh, Connection, Switch, Edit, Delete, Plus
} from '@element-plus/icons-vue'

import { getAllServiceMonitors, controlService } from '@/utils/electronUtils'
import { useIpcCommunication } from '@/composables/useIpcCommunication'
import { ServiceHealthStatus, ServiceMonitorStatus } from '@/types'
import ServiceMonitorDlg from './components/ServiceMonitorDlg.vue'
import CTRightMenu from '@/components/CTRightMenu/index.vue'

// 服务监控数据
const services = ref([])

// 组件挂载时获取服务列表
onMounted(() => {
  handleRefreshService()
})

// 使用IPC通信获取服务监控健康检查结果
useIpcCommunication({
  onOpenNewConnectionDialog: () => {}, // 空实现，不使用
  onServiceMonitorHealthCheckResult: (data) => {
    // 查找对应的服务并更新状态
    const serviceIndex = services.value.findIndex(service => service.id === data.id)
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
      
      services.value[serviceIndex] = {
        ...services.value[serviceIndex],
        status: serviceStatus,
        healthCheckResult: data // 保存完整的健康检查结果
      }
    }
  }
})

// 新增服务对话框
const dialogVisible = ref(false)
// 当前编辑的服务
const editingService = ref(null)

// 右键菜单相关
const menuVisible = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const selectedService = ref(null)

// 右键菜单项配置
const menuItems = [
  {
    key: 'start',
    label: '启动',
    icon: Switch,
    visible: (data) => data.status === ServiceMonitorStatus.STOPPED,
    onClick: (data) => handleServiceAction(data, 'toggle')
  },
  {
    key: 'stop',
    label: '停止',
    icon: Switch,
    visible: (data) => data.status === ServiceMonitorStatus.RUNNING,
    onClick: (data) => handleServiceAction(data, 'toggle')
  },
  {
    key: 'edit',
    label: '编辑',
    icon: Edit,
    visible: (data) => data.status !== ServiceMonitorStatus.STARTING && data.status !== ServiceMonitorStatus.STOPPING,
    onClick: (data) => handleServiceAction(data, 'edit')
  },
  {
    divider: true
  },
  {
    key: 'delete',
    label: '删除',
    icon: Delete,
    danger: true,
    visible: (data) => data.status !== ServiceMonitorStatus.STARTING && data.status !== ServiceMonitorStatus.STOPPING,
    onClick: (data) => handleServiceAction(data, 'delete')
  },
  {
    key: 'refresh',
    label: '刷新',
    icon: Refresh,
    onClick: () => handleRefreshService()
  }
]

// 处理行右键菜单事件
const handleRowContextMenu = (...args: any[]) => {
  // 查看实际参数
  console.log('右键菜单事件参数:', args)
  console.log('参数数量:', args.length)
  
  // 兼容不同的参数顺序和数量
  let row: any, event: MouseEvent | undefined
  
  // 查找事件对象（包含clientX属性）
  event = args.find(arg => arg?.clientX !== undefined) as MouseEvent | undefined
  
  // 查找行数据（不包含clientX且具有id或name等服务监控属性）
  row = args.find(arg => 
    arg?.clientX === undefined && 
    (arg?.id !== undefined || arg?.name !== undefined) 
  ) || null
  
  console.log('解析后的数据:', { row, event })
  
  if (event) {
    // 手动阻止默认右键菜单
    event.preventDefault()
    
    // 先隐藏菜单，再更新位置和显示，确保位置更新生效
    menuVisible.value = false
    
    // 使用 nextTick 确保菜单隐藏后再更新位置和显示
    nextTick(() => {
      menuPosition.value = { x: event.clientX, y: event.clientY }
      selectedService.value = row
      menuVisible.value = true
    })
  } else {
    console.error('没有找到有效的事件对象')
  }
}

// 处理右键菜单项点击事件
const handleMenuClick = (key: string, data: any) => {
  console.log('右键菜单点击:', key, data)
}

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
const handleServiceAction = async (service: any, action: string) => {
  switch (action) {
    case 'toggle':
      const currentIndex = services.value.findIndex(s => s.id === service.id)
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
        if (serviceAction && (currentStatus === ServiceMonitorStatus.RUNNING || currentStatus === ServiceMonitorStatus.STOPPED)) {
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
      editingService.value = service
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
.service-monitor {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.monitoring-table-container {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.service-table {
  width: 100%;
}

.service-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  color: #409eff;
}

.port-number {
  font-family: 'Courier New', Courier, monospace;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>