<template>
  <div class="plan-execution-viewer">
    <el-card v-if="currentPlan" class="plan-card">
      <template #header>
        <div class="plan-header">
          <span class="plan-goal">{{ currentPlan.goal }}</span>
          <el-tag :type="getStatusType(currentPlan.status)" size="small">
            {{ getStatusText(currentPlan.status) }}
          </el-tag>
        </div>
      </template>

      <div class="plan-steps">
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in currentPlan.steps"
            :key="step.id"
            :timestamp="formatTime(step.startTime)"
            :type="getStepType(step.status)"
            :icon="getStepIcon(step.status)"
            placement="top"
          >
            <el-card class="step-card" :class="`step-${step.status}`">
              <div class="step-header">
                <span class="step-description">{{ step.description }}</span>
                <el-tag :type="getStepStatusType(step.status)" size="small">
                  {{ getStepStatusText(step.status) }}
                </el-tag>
              </div>
              
              <div v-if="step.tool" class="step-tool">
                <el-icon><Tools /></el-icon>
                <span>工具: {{ step.tool }}</span>
              </div>

              <div v-if="step.result" class="step-result">
                <el-collapse>
                  <el-collapse-item title="执行结果" name="result">
                    <pre>{{ formatResult(step.result) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>

              <div v-if="step.error" class="step-error">
                <el-alert
                  :title="step.error"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>

              <div v-if="step.dependencies && step.dependencies.length > 0" class="step-dependencies">
                <el-tag size="small" type="info">
                  依赖: {{ step.dependencies.join(', ') }}
                </el-tag>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="executionHistory.length > 0" class="execution-history">
        <el-divider>执行历史</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in executionHistory"
            :key="index"
            :timestamp="formatTime(history.timestamp)"
            :type="getHistoryType(history.type)"
            placement="top"
          >
            <div class="history-item">
              <span class="history-type">{{ getHistoryTypeText(history.type) }}</span>
              <span v-if="history.data?.reason" class="history-reason">
                {{ history.data.reason }}
              </span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <el-empty v-else description="暂无执行计划" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElCard, ElTag, ElTimeline, ElTimelineItem, ElIcon, ElCollapse, ElCollapseItem, ElAlert, ElDivider, ElEmpty } from 'element-plus';
import { Tools } from '@element-plus/icons-vue';

interface TaskStep {
  id: string;
  order: number;
  description: string;
  tool: string;
  parameters: any;
  dependencies: string[];
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

interface TaskPlan {
  id: string;
  goal: string;
  steps: TaskStep[];
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface ExecutionHistory {
  type: string;
  planId: string;
  stepId?: string;
  timestamp: string;
  data: any;
}

const currentPlan = ref<TaskPlan | null>(null);
const executionHistory = ref<ExecutionHistory[]>([]);

// 监听执行事件
const handleExecutionEvent = (event: any) => {
  console.log('[PlanExecutionViewer] 收到执行事件:', event);
  const { event: eventType, planId, data } = event;

  switch (eventType) {
    case 'plan_start':
      currentPlan.value = data as TaskPlan;
      executionHistory.value = [];
      break;
    
    case 'step_start':
      if (currentPlan.value) {
        const step = currentPlan.value.steps.find(s => s.id === data.step.id);
        if (step) {
          step.status = 'running';
          step.startTime = new Date().toISOString();
        }
      }
      executionHistory.value.push({
        type: eventType,
        planId,
        stepId: data.step.id,
        timestamp: new Date().toISOString(),
        data
      });
      break;
    
    case 'step_complete':
      if (currentPlan.value) {
        const step = currentPlan.value.steps.find(s => s.id === data.step.id);
        if (step) {
          step.status = 'success';
          step.result = data.result;
          step.endTime = new Date().toISOString();
        }
      }
      executionHistory.value.push({
        type: eventType,
        planId,
        stepId: data.step.id,
        timestamp: new Date().toISOString(),
        data
      });
      break;
    
    case 'step_error':
      if (currentPlan.value) {
        const step = currentPlan.value.steps.find(s => s.id === data.step.id);
        if (step) {
          step.status = 'failed';
          step.error = data.error.message || data.error;
          step.endTime = new Date().toISOString();
        }
      }
      executionHistory.value.push({
        type: eventType,
        planId,
        stepId: data.step.id,
        timestamp: new Date().toISOString(),
        data
      });
      break;
    
    case 'plan_complete':
      if (currentPlan.value) {
        currentPlan.value.status = 'completed';
      }
      executionHistory.value.push({
        type: eventType,
        planId,
        timestamp: new Date().toISOString(),
        data
      });
      break;
    
    case 'plan_error':
      if (currentPlan.value) {
        currentPlan.value.status = 'failed';
      }
      executionHistory.value.push({
        type: eventType,
        planId,
        timestamp: new Date().toISOString(),
        data
      });
      break;
    
    case 'replan_needed':
      executionHistory.value.push({
        type: eventType,
        planId,
        stepId: data.step.id,
        timestamp: new Date().toISOString(),
        data
      });
      break;
  }
};

onMounted(() => {
  // 监听执行事件
  const electronAPI = window.electronAPI;
  console.log('[PlanExecutionViewer] 组件已挂载，electronAPI:', electronAPI);
  if (electronAPI?.ai?.onPlanExecutionEvent) {
    console.log('[PlanExecutionViewer] 注册事件监听器');
    electronAPI.ai.onPlanExecutionEvent(handleExecutionEvent);
  } else {
    console.warn('[PlanExecutionViewer] onPlanExecutionEvent 方法不存在');
  }
});

onUnmounted(() => {
  // 清理监听器
  const electronAPI = window.electronAPI;
  if (electronAPI?.ai?.offPlanExecutionEvent) {
    electronAPI.ai.offPlanExecutionEvent(handleExecutionEvent);
  }
});

// 格式化时间
const formatTime = (time?: string): string => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleTimeString('zh-CN');
};

// 格式化结果
const formatResult = (result: any): string => {
  if (typeof result === 'string') {
    return result;
  }
  return JSON.stringify(result, null, 2);
};

// 获取状态类型
const getStatusType = (status: string): string => {
  const map: Record<string, string> = {
    planning: 'info',
    executing: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  };
  return map[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    planning: '规划中',
    executing: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  };
  return map[status] || status;
};

// 获取步骤类型
const getStepType = (status: string): string => {
  const map: Record<string, string> = {
    pending: '',
    running: 'primary',
    success: 'success',
    failed: 'danger',
    skipped: 'info'
  };
  return map[status] || '';
};

// 获取步骤图标
const getStepIcon = (status: string): any => {
  // 可以根据状态返回不同的图标
  return null;
};

// 获取步骤状态类型
const getStepStatusType = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    success: 'success',
    failed: 'danger',
    skipped: 'info'
  };
  return map[status] || 'info';
};

// 获取步骤状态文本
const getStepStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待执行',
    running: '执行中',
    success: '成功',
    failed: '失败',
    skipped: '已跳过'
  };
  return map[status] || status;
};

// 获取历史类型
const getHistoryType = (type: string): string => {
  const map: Record<string, string> = {
    plan_start: 'primary',
    step_start: 'primary',
    step_complete: 'success',
    step_error: 'danger',
    plan_complete: 'success',
    plan_error: 'danger',
    replan_needed: 'warning',
    plan_stop: 'info'
  };
  return map[type] || '';
};

// 获取历史类型文本
const getHistoryTypeText = (type: string): string => {
  const map: Record<string, string> = {
    plan_start: '计划开始',
    step_start: '步骤开始',
    step_complete: '步骤完成',
    step_error: '步骤错误',
    plan_complete: '计划完成',
    plan_error: '计划错误',
    replan_needed: '需要重新规划',
    plan_stop: '计划停止'
  };
  return map[type] || type;
};
</script>

<style scoped>
.plan-execution-viewer {
  padding: 16px;
}

.plan-card {
  margin-bottom: 16px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-goal {
  font-size: 16px;
  font-weight: 500;
}

.plan-steps {
  margin-top: 16px;
}

.step-card {
  margin-bottom: 8px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-description {
  font-weight: 500;
}

.step-tool {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}

.step-result {
  margin-top: 8px;
}

.step-result pre {
  margin: 0;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}

.step-error {
  margin-top: 8px;
}

.step-dependencies {
  margin-top: 8px;
}

.execution-history {
  margin-top: 24px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-type {
  font-weight: 500;
}

.history-reason {
  color: #909399;
  font-size: 12px;
}

.step-pending {
  opacity: 0.6;
}

.step-running {
  border-left: 3px solid #409eff;
}

.step-success {
  border-left: 3px solid #67c23a;
}

.step-failed {
  border-left: 3px solid #f56c6c;
}

.step-skipped {
  border-left: 3px solid #909399;
}
</style>

