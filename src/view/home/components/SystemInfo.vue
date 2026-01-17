<template>
  <div class="system-info">
    <div class="info-grid">
      <div class="info-item">
        <el-icon><Folder /></el-icon>
        <span class="info-label">工作目录:</span>
        <span class="info-value">{{ systemInfo.workingDirectory }}</span>
      </div>
      <div class="info-item">
        <el-icon><Timer /></el-icon>
        <span class="info-label">进程ID:</span>
        <span class="info-value">{{ systemInfo.processId }}</span>
      </div>
      <div class="info-item">
        <el-icon><Clock /></el-icon>
        <span class="info-label">运行时间:</span>
        <span class="info-value">{{ systemInfo.uptime }}</span>
      </div>
      <div class="info-item">
        <el-icon><Monitor /></el-icon>
        <span class="info-label">版本:</span>
        <span class="info-value">{{ systemInfo.version }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder, Timer, Clock, Monitor } from '@element-plus/icons-vue'

// 格式化运行时间
const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 系统信息
const systemInfo = computed(() => {
  // 在浏览器环境中，process 不可用，使用更兼容的获取方式
  const now = new Date()
  
  // 更兼容的时间获取方式
  let startTime: number
  try {
    startTime = performance.timeOrigin || Date.now()
  } catch {
    startTime = Date.now()
  }
  
  const uptime = Math.floor((now.getTime() - startTime) / 1000)
  
  // 尝试从多种来源获取系统信息
  const getSystemInfo = () => {
    // 获取工作目录
    let workingDir = '未知'
    try {
      if (typeof window !== 'undefined') {
        workingDir = window.location.pathname || '浏览器环境'
      }
    } catch {
      workingDir = '浏览器环境'
    }
    
    // 获取进程信息
    let processId = 'N/A'
    try {
      // 尝试从全局对象获取进程信息（electron环境）
      if (typeof window !== 'undefined' && (window as any).process) {
        processId = (window as any).process.pid?.toString() || 'N/A'
      }
    } catch {
      // 忽略错误，使用默认值
    }
    
    // 获取版本信息
    let version = '1.0.0'
    try {
      // 尝试从全局对象获取版本信息
      if (typeof window !== 'undefined' && (window as any).appVersion) {
        version = (window as any).appVersion
      }
    } catch {
      // 忽略错误，使用默认值
    }
    
    return {
      workingDirectory: workingDir,
      processId,
      uptime: formatUptime(uptime),
      version
    }
  }
  
  return getSystemInfo()
})
</script>

<style scoped>
.system-info {
  width: 100%;
}

.info-grid {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-item .el-icon {
  color: #409eff;
  font-size: 16px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>