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
        <el-table :data="services" style="width: 100%" class="service-table">
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
          <el-table-column label="操作" >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  :type="row.status === '运行中' ? 'warning' : 'success'"
                  size="small" 
                  @click="handleServiceAction(row, 'toggle')"
                >
                  <el-icon><Switch /></el-icon>
                  {{ row.status === '运行中' ? '停止' : '启动' }}
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleServiceAction(row, 'edit')"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleServiceAction(row, 'delete')"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Monitor, Refresh, Connection, Switch, Edit, Delete, Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAllServiceMonitors } from '@/utils/electronUtils'
import ServiceMonitorDlg from './components/ServiceMonitorDlg.vue'

// 服务监控数据
const services = ref([])

// 组件挂载时获取服务列表
onMounted(() => {
  handleRefreshService()
})

// 新增服务对话框
const dialogVisible = ref(false)
// 当前编辑的服务
const editingService = ref(null)

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '运行中':
      return 'success'
    case '启动中':
      return 'warning'
    case '已停止':
      return 'info'
    case '停止中':
      return 'danger'
    default:
      return 'info'
  }
}

// 处理服务操作
const handleServiceAction = (service: any, action: string) => {
  switch (action) {
    case 'toggle':
      const currentIndex = services.value.findIndex(s => s.id === service.id)
      if (currentIndex !== -1) {
        // 切换状态
        const currentStatus = services.value[currentIndex].status
        let newStatus = ''
        switch (currentStatus) {
          case '运行中':
            newStatus = '停止中'
            break
          case '停止中':
            newStatus = '运行中'
            break
          case '已停止':
            newStatus = '启动中'
            break
          case '启动中':
            newStatus = '已停止'
            break
        }
        services.value[currentIndex].status = newStatus
        
        // 模拟状态变化
        if (newStatus === '启动中' || newStatus === '停止中') {
          setTimeout(() => {
            const finalStatus = newStatus === '启动中' ? '运行中' : '已停止'
            services.value[currentIndex].status = finalStatus
          }, 2000)
        }
        
        ElMessage.success(`服务 ${service.name} ${newStatus === '运行中' ? '已启动' : '已停止'}`)
      }
      break
    case 'edit':
      editingService.value = service
      dialogVisible.value = true
      break
    case 'delete':
      ElMessage.info(`删除服务: ${service.name}`)
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
      ElMessage.success('服务列表已刷新')
    } else {
      ElMessage.error(`刷新失败: ${result.message}`)
    }
  } catch (error) {
    console.error('刷新服务列表失败:', error)
    ElMessage.error('刷新服务列表失败')
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