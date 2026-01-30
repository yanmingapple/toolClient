<template>
  <div class="data-analysis-panel">
    <el-card shadow="hover" class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>📊 数据分析</span>
          <el-button size="small" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card">
        <!-- 效率分析 -->
        <el-tab-pane label="效率分析" name="efficiency">
          <div class="analysis-content">
            <div class="stat-card">
              <div class="stat-item">
                <span class="stat-label">本周工作效率</span>
                <el-progress
                  :percentage="stats.weekEfficiency"
                  :color="getEfficiencyColor(stats.weekEfficiency)"
                  :stroke-width="20"
                />
              </div>
              <div class="stat-item">
                <span class="stat-label">本月工作效率</span>
                <el-progress
                  :percentage="stats.monthEfficiency"
                  :color="getEfficiencyColor(stats.monthEfficiency)"
                  :stroke-width="20"
                />
              </div>
            </div>

            <div class="chart-container">
              <h4>最佳工作时间</h4>
              <div class="time-slots">
                <div
                  v-for="slot in bestTimeSlots"
                  :key="slot.time"
                  class="time-slot-item"
                >
                  <div class="time-label">{{ slot.time }}</div>
                  <el-progress
                    :percentage="slot.score"
                    :color="getEfficiencyColor(slot.score)"
                    :stroke-width="12"
                  />
                  <div class="time-score">{{ slot.score }}分</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 任务完成率 -->
        <el-tab-pane label="任务完成率" name="completion">
          <div class="analysis-content">
            <div class="completion-stats">
              <div
                v-for="type in taskCompletionStats"
                :key="type.name"
                class="completion-item"
              >
                <div class="completion-header">
                  <span class="type-name">{{ type.name }}</span>
                  <span class="completion-rate">{{ type.rate }}%</span>
                </div>
                <el-progress
                  :percentage="type.rate"
                  :color="getCompletionColor(type.rate)"
                />
                <div class="completion-details">
                  <span>完成: {{ type.completed }}/{{ type.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 工作模式 -->
        <el-tab-pane label="工作模式" name="patterns">
          <div class="analysis-content">
            <div class="pattern-section">
              <h4>任务类型偏好</h4>
              <div class="pattern-list">
                <div
                  v-for="pattern in workPatterns"
                  :key="pattern.type"
                  class="pattern-item"
                >
                  <div class="pattern-info">
                    <span class="pattern-type">{{ pattern.type }}</span>
                    <span class="pattern-avg">平均耗时: {{ pattern.avgMinutes }}分钟</span>
                  </div>
                  <el-progress
                    :percentage="pattern.efficiency"
                    :color="getEfficiencyColor(pattern.efficiency)"
                    :stroke-width="10"
                  />
                </div>
              </div>
            </div>

            <div class="pattern-section">
              <h4>打断模式</h4>
              <div class="interruption-stats">
                <div class="interruption-item">
                  <span class="label">平均每2小时被打断</span>
                  <span class="value">{{ interruptionStats.avgPer2Hours }}次</span>
                </div>
                <div class="interruption-item">
                  <span class="label">打断后恢复时间</span>
                  <span class="value">{{ interruptionStats.recoveryTime }}分钟</span>
                </div>
                <div class="interruption-item">
                  <span class="label">建议缓冲时间</span>
                  <span class="value">{{ interruptionStats.suggestedBuffer }}分钟</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 时间分布 -->
        <el-tab-pane label="时间分布" name="distribution">
          <div class="analysis-content">
            <div class="distribution-chart">
              <h4>每日工作时间分布</h4>
              <div class="time-distribution">
                <div
                  v-for="dist in timeDistribution"
                  :key="dist.period"
                  class="distribution-item"
                >
                  <div class="period-label">{{ dist.period }}</div>
                  <div class="bar-container">
                    <div
                      class="bar"
                      :style="{ width: `${dist.percentage}%`, backgroundColor: dist.color }"
                    ></div>
                    <span class="bar-label">{{ dist.hours }}小时</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('efficiency')

const stats = ref({
  weekEfficiency: 0,
  monthEfficiency: 0
})

const bestTimeSlots = ref<Array<{ time: string; score: number }>>([])

const taskCompletionStats = ref<Array<{ name: string; completed: number; total: number; rate: number }>>([])

const workPatterns = ref<Array<{ type: string; avgMinutes: number; efficiency: number }>>([])

const interruptionStats = ref({
  avgPer2Hours: 1,
  recoveryTime: 5,
  suggestedBuffer: 10
})

const timeDistribution = ref([
  { period: '上午 (09:00-12:00)', hours: 3, percentage: 37.5, color: '#409eff' },
  { period: '下午 (14:00-18:00)', hours: 4, percentage: 50, color: '#67c23a' },
  { period: '晚上 (19:00-22:00)', hours: 1, percentage: 12.5, color: '#e6a23c' }
])

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const result = await (window as any).electronAPI.dataAnalysis.getAllStats()
    if (result.success && result.data) {
      // 更新效率统计
      if (result.data.efficiency) {
        stats.value.weekEfficiency = result.data.efficiency.weekEfficiency || 0
        stats.value.monthEfficiency = result.data.efficiency.monthEfficiency || 0
        bestTimeSlots.value = result.data.efficiency.bestTimeSlots || []
      }
      
      // 更新任务完成率统计
      if (result.data.completion) {
        taskCompletionStats.value = result.data.completion
      }
      
      // 更新工作模式
      if (result.data.patterns) {
        workPatterns.value = result.data.patterns.map((p: any) => ({
          type: p.type,
          avgMinutes: p.avgMinutes,
          efficiency: p.efficiency
        }))
      }
      
      ElMessage.success('数据刷新成功')
    } else {
      ElMessage.error(result.message || '获取数据失败')
    }
  } catch (error: any) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

// 获取效率颜色
const getEfficiencyColor = (score: number): string => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取完成率颜色
const getCompletionColor = (rate: number): string => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 70) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.data-analysis-panel {
  padding: 20px;
}

.analysis-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-content {
  padding: 20px;
}

.stat-card {
  margin-bottom: 30px;
}

.stat-item {
  margin-bottom: 20px;
}

.stat-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.chart-container {
  margin-top: 30px;
}

.chart-container h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-slot-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-label {
  min-width: 120px;
  font-weight: 500;
  color: #606266;
}

.time-score {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #303133;
}

.completion-stats {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.completion-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-name {
  font-weight: 600;
  color: #303133;
}

.completion-rate {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.completion-details {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.pattern-section {
  margin-bottom: 30px;
}

.pattern-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pattern-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.pattern-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pattern-type {
  font-weight: 500;
  color: #303133;
}

.pattern-avg {
  font-size: 13px;
  color: #909399;
}

.interruption-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interruption-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.interruption-item .label {
  color: #606266;
}

.interruption-item .value {
  font-weight: 600;
  color: #303133;
}

.distribution-chart h4 {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.time-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.period-label {
  min-width: 150px;
  font-weight: 500;
  color: #606266;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar {
  height: 24px;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-label {
  min-width: 60px;
  text-align: right;
  font-weight: 500;
  color: #303133;
}
</style>

