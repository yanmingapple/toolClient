<template>
  <div class="service-monitor">
    <!-- 服务监控表格 -->
    <div class="service-monitoring">
      <div class="monitoring-table-container">
        <div class="table-header">
          <h3 class="table-title">服务列表</h3>
          <div class="table-actions">
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
        <div class="service-list">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-item"
            :class="{ 'is-running': service.status === 'running' }"
            @contextmenu.prevent="handleContextMenu($event, service)"
          >
            <div class="service-info">
              <div class="service-icon-wrapper" :class="service.status">
                <el-icon class="service-icon">
                  <Connection />
                </el-icon>
              </div>
              <div class="service-details">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-port">端口: {{ service.port }}</div>
              </div>
            </div>
            <div class="service-status">
              <el-tag
                :type="getStatusType(service.status)"
                size="small"
              >
                {{ getStatusText(service.status) }}
              </el-tag>
            </div>
            <div class="service-actions">
              <el-button
                v-if="service.status === 'stopped'"
                type="success"
                size="small"
                @click.stop="handleServiceAction(service, 'toggle')"
              >
                <el-icon><VideoPlay /></el-icon>
                启动
              </el-button>
              <el-button
                v-else-if="service.status === 'running'"
                type="warning"
                size="small"
                @click.stop="handleServiceAction(service, 'toggle')"
              >
                <el-icon><VideoPause /></el-icon>
                停止
              </el-button>
              <el-button
                v-if="service.status !== 'starting' && service.status !== 'stopping'"
                type="primary"
                size="small"
                @click.stop="handleServiceAction(service, 'edit')"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                v-if="service.status !== 'starting' && service.status !== 'stopping'"
                type="danger"
                size="small"
                @click.stop="handleServiceAction(service, 'delete')"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="services.length === 0" class="empty-state">
          <el-icon><InfoFilled /></el-icon>
          <p>暂无服务数据</p>
        </div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <TkContextMenu
      v-model:visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :menu-items="contextMenuItems"
      @menu-item-click="handleContextMenuItemClick"
    />
  </div>
  <!-- 新增服务对话框组件 -->
  <ServiceMonitorDlg
    v-model:dialog-visible="dialogVisible"
    :editing-service="editingService"
    @save-success="handleRefreshService"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Refresh, Connection, Plus, Edit, Delete, VideoPlay, VideoPause, InfoFilled } from '@element-plus/icons-vue'
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

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuData = ref<ServiceMonitor | null>(null)

// 右键菜单项配置
const contextMenuItems = computed(() => {
  if (!contextMenuData.value) return []
  
  const items: any[] = []
  const service = contextMenuData.value
  
  // 启动按钮
  if (service.status === ServiceMonitorStatus.STOPPED) {
    items.push({
      label: '启动',
      icon: 'ic_play',
      handler: () => handleServiceAction(service, 'toggle')
    })
  }
  
  // 停止按钮
  if (service.status === ServiceMonitorStatus.RUNNING) {
    items.push({
      label: '停止',
      icon: 'ic_pause',
      handler: () => handleServiceAction(service, 'toggle')
    })
  }
  
  // 编辑按钮
  if (service.status !== ServiceMonitorStatus.STARTING && 
      service.status !== ServiceMonitorStatus.STOPPING) {
    items.push({
      label: '编辑',
      icon: 'ic_edit',
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
      icon: 'ic_delete',
      type: 'danger',
      handler: () => handleServiceAction(service, 'delete')
    })
  }
  
  // 刷新按钮
  items.push({
    label: '刷新',
    icon: 'ic_refresh',
    handler: () => handleRefreshService()
  })
  
  return items
})

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, service: ServiceMonitor) => {
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuData.value = service
  contextMenuVisible.value = true
}

// 处理右键菜单项点击
const handleContextMenuItemClick = (item: any) => {
  contextMenuVisible.value = false
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

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case ServiceMonitorStatus.RUNNING:
      return '运行中'
    case ServiceMonitorStatus.STARTING:
      return '启动中'
    case ServiceMonitorStatus.STOPPED:
      return '已停止'
    case ServiceMonitorStatus.STOPPING:
      return '停止中'
    default:
      return status
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
      handleDeleteService(service)
      break
  }
  // 关闭右键菜单
  contextMenuVisible.value = false
}

// 刷新服务列表
const handleRefreshService = async () => {
  try {
    const serviceMonitors = await getAllServiceMonitors()
    services.value = serviceMonitors?.data??[]
    CTMessage.success('服务列表已刷新')
  } catch (error) {
    CTMessage.error('刷新服务列表失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 新增服务
const handleAddService = () => {
  editingService.value = null
  dialogVisible.value = true
}

// 删除服务
const handleDeleteService = async (service: ServiceMonitor) => {
  try {
    await CTMessageBox.confirm(
      `确定要删除服务 "${service.name}" 吗？此操作不可恢复。`,
      '删除服务',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里添加删除服务的逻辑
    // await deleteService(service.id)
    
    // 从列表中移除
    const index = services.value.findIndex(s => s.id === service.id)
    if (index !== -1) {
      services.value.splice(index, 1)
    }
    
    CTMessage.success(`服务 "${service.name}" 已删除`)
  } catch (error) {
    if (error !== 'cancel') {
      CTMessage.error('删除服务失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
}
</script>

<style scoped>
.service-monitor {
  padding: 20px;
}

.service-monitoring {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  &.is-running {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #10b981;
  }
}

.service-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.service-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  &.running {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  &.starting {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  &.stopped {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.stopping {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.service-port {
  font-size: 13px;
  color: #64748b;
}

.service-status {
  display: flex;
  align-items: center;
  min-width: 100px;
}

.service-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;

  .el-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}
</style>
