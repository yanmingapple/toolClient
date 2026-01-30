# Plan-and-Solve 前端展示实现说明

## 一、功能概述

已实现将 Plan-and-Solve 架构的执行过程（计划、执行步骤、结果等）实时同步到前端页面展示，让用户能够看到AI的思考和执行过程。

## 二、实现架构

### 2.1 后端实现

#### Observer（观察器）
**文件**: `electron/service/ai/observer.ts`

**新增功能**:
- ✅ `setIpcSender`: 设置IPC发送器，用于向前端发送事件
- ✅ `setPlanId`: 设置当前计划ID
- ✅ `emit`: 修改为同时通过IPC发送事件到前端

**关键代码**:
```typescript
private ipcSender: ((channel: string, data: any) => void) | null = null;
private planId: string | null = null;

setIpcSender(sender: (channel: string, data: any) => void): void {
  this.ipcSender = sender;
}

private emit(event: string, data: any): void {
  // ... 原有逻辑 ...
  
  // 通过IPC发送到前端
  if (this.ipcSender) {
    this.ipcSender('ai:plan-execution-event', {
      event,
      planId: this.planId || data.planId || data.id,
      data,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### PlanAndSolveAgent
**文件**: `electron/service/ai/planAndSolveAgent.ts`

**改动**:
- ✅ 构造函数支持 `ipcSender` 参数
- ✅ 将 `ipcSender` 传递给 `Observer`
- ✅ 在规划开始时设置计划ID

**关键代码**:
```typescript
constructor(
  aiService: AIService,
  toolRegistry: ToolRegistry,
  sessionId?: string,
  ipcSender?: (channel: string, data: any) => void
) {
  // ...
  this.observer = new Observer();
  if (ipcSender) {
    this.observer.setIpcSender(ipcSender);
  }
  // ...
}

async execute(goal: string, context?: any, maxReplans: number = 3): Promise<TaskPlan> {
  // ...
  if (replanCount === 0) {
    plan = await this.planner.createPlan(goal, context);
    this.observer.setPlanId(plan.id);  // 设置计划ID
  }
  // ...
}
```

#### AIServiceIPC
**文件**: `electron/service/aiServiceIPC.ts`

**改动**:
- ✅ `ai:parse-with-plan-solve` 处理器中创建IPC发送器
- ✅ 将IPC发送器传递给 `parseNaturalLanguageWithPlanAndSolve`

**关键代码**:
```typescript
ipcMain.handle('ai:parse-with-plan-solve', async (event, text: string, context?: any) => {
  try {
    const aiService = AIService.getInstance();
    
    // 创建IPC发送器，将事件发送到前端
    const ipcSender = (channel: string, data: any) => {
      event.sender.send(channel, data);
    };
    
    const result = await aiService.parseNaturalLanguageWithPlanAndSolve(
      text, 
      context, 
      undefined, 
      ipcSender
    );
    return result;
  } catch (error: any) {
    // ...
  }
});
```

### 2.2 前端实现

#### Preload API
**文件**: `electron/preload.ts`

**新增API**:
```typescript
ai: {
  // ...
  onPlanExecutionEvent: (callback: (event: any) => void): void
  offPlanExecutionEvent: (callback?: (event: any) => void): void
}
```

#### PlanExecutionViewer 组件
**文件**: `src/view/home/components/PlanExecutionViewer.vue`

**功能**:
- ✅ 实时显示当前执行计划
- ✅ 显示所有步骤的执行状态
- ✅ 显示步骤的执行结果和错误
- ✅ 显示执行历史时间线

**关键特性**:
- 使用 `el-timeline` 展示步骤执行顺序
- 使用 `el-card` 展示每个步骤的详细信息
- 使用 `el-tag` 显示状态标签
- 使用 `el-collapse` 折叠显示执行结果

## 三、事件类型

### 3.1 支持的事件

| 事件类型 | 说明 | 数据内容 |
|---------|------|---------|
| `plan_start` | 计划开始 | `TaskPlan` 对象 |
| `step_start` | 步骤开始 | `{ step, planId }` |
| `step_complete` | 步骤完成 | `{ step, result, planId }` |
| `step_error` | 步骤错误 | `{ step, error, planId }` |
| `plan_complete` | 计划完成 | `TaskPlan` 对象 |
| `plan_error` | 计划错误 | `{ plan, error }` |
| `replan_needed` | 需要重新规划 | `{ plan, step, reason }` |
| `plan_stop` | 计划停止 | `{ plan, reason }` |

### 3.2 事件数据结构

```typescript
interface ExecutionEvent {
  event: string;              // 事件类型
  planId: string;             // 计划ID
  data: any;                   // 事件数据
  timestamp: string;           // 时间戳
}
```

## 四、使用方式

### 4.1 前端组件使用

```vue
<template>
  <PlanExecutionViewer />
</template>

<script setup lang="ts">
import PlanExecutionViewer from './components/PlanExecutionViewer.vue'
</script>
```

### 4.2 手动监听事件

```typescript
import { onMounted, onUnmounted } from 'vue'

const handleExecutionEvent = (event: any) => {
  console.log('执行事件:', event);
  // 处理事件...
};

onMounted(() => {
  const electronAPI = window.electronAPI;
  if (electronAPI?.ai?.onPlanExecutionEvent) {
    electronAPI.ai.onPlanExecutionEvent(handleExecutionEvent);
  }
});

onUnmounted(() => {
  const electronAPI = window.electronAPI;
  if (electronAPI?.ai?.offPlanExecutionEvent) {
    electronAPI.ai.offPlanExecutionEvent(handleExecutionEvent);
  }
});
```

## 五、UI展示

### 5.1 计划卡片

- **计划目标**: 显示用户输入的目标
- **计划状态**: 显示当前状态（规划中、执行中、已完成、失败等）
- **步骤列表**: 使用时间线展示所有步骤

### 5.2 步骤卡片

每个步骤显示：
- **步骤描述**: 步骤要做什么
- **步骤状态**: 待执行、执行中、成功、失败、已跳过
- **使用工具**: 显示使用的工具名称
- **执行结果**: 可折叠显示执行结果
- **错误信息**: 如果失败，显示错误信息
- **依赖关系**: 显示依赖的步骤ID

### 5.3 执行历史

- 显示所有执行事件的时序记录
- 包括计划开始、步骤开始/完成/错误、重新规划等

## 六、数据流

```
用户输入
  ↓
AIAssistant.handleSubmit()
  ↓
electronAPI.ai.parseNaturalLanguageWithPlanAndSolve()
  ↓
主进程: ai:parse-with-plan-solve
  ↓
AIService.parseNaturalLanguageWithPlanAndSolve()
  ↓
PlanAndSolveAgent.execute()
  ↓
Observer.emit() → IPC发送
  ↓
前端: ai:plan-execution-event
  ↓
PlanExecutionViewer.handleExecutionEvent()
  ↓
更新UI显示
```

## 七、实时更新

### 7.1 自动更新

- ✅ 计划开始时自动显示计划
- ✅ 步骤状态变化时自动更新
- ✅ 执行结果返回时自动显示
- ✅ 错误发生时自动显示错误信息

### 7.2 状态同步

- ✅ 前端状态与后端执行状态实时同步
- ✅ 多个步骤可以同时显示不同状态
- ✅ 支持步骤的依赖关系显示

## 八、注意事项

1. **事件顺序**: 事件按时间顺序到达，前端需要正确处理事件顺序
2. **状态管理**: 前端需要维护计划状态，确保UI正确反映执行状态
3. **性能优化**: 大量步骤时，考虑虚拟滚动或分页
4. **错误处理**: 网络断开时，事件可能丢失，需要重连机制

## 九、未来改进

1. **步骤详情**: 支持点击步骤查看更详细信息
2. **执行日志**: 显示完整的执行日志
3. **性能指标**: 显示每个步骤的执行时间
4. **可视化**: 使用流程图展示步骤依赖关系
5. **交互**: 支持暂停、取消、重试等操作

---

**最后更新**: 2026-01-30
**状态**: ✅ 实现完成

