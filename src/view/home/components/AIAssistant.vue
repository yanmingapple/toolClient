<template>
  <div class="ai-assistant">
    <!-- AI自然语言输入区域 -->
    <div class="ai-input-section">
      <el-card shadow="never" class="ai-input-card">
        <template #header>
          <div class="ai-input-header">
            <span>🤖 AI智能助手</span>
            <el-tag 
              :type="networkStatus === 'online' ? 'success' : 'warning'"
              size="small"
            >
              {{ networkStatus === 'online' ? '在线模式' : '离线模式' }}
            </el-tag>
          </div>
        </template>
        
        <!-- 输入框 -->
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          placeholder="用自然语言描述你的需求，AI会自动识别意图：&#10;• 明天下午3点团队会议（自动识别为事件）&#10;• 下午3点给客户回电（自动识别为代办）&#10;• 查找包含'会议'的事件（自动识别为检索）"
          @keyup.enter.ctrl="handleSubmit"
          :disabled="processing"
        />
        
        <!-- 操作按钮 -->
        <div class="ai-input-actions">
          <el-button 
            type="primary" 
            size="small"
            @click="handleSubmit" 
            :loading="processing"
            :disabled="!inputText.trim()"
          >
            <el-icon><MagicStick /></el-icon>
            智能处理
          </el-button>
          <el-button size="small" @click="handleClear">清空</el-button>
        </div>
        
        <!-- AI 回答结果 -->
        <el-card
          v-if="lastResult && lastResult.type === 'aiResponse'"
          shadow="never"
          class="parse-result-card"
          style="margin-top: 12px;"
        >
          <template #header>
            <div class="result-header">
              <span>💬 AI 回答</span>
              <el-button 
                type="text" 
                size="small" 
                @click="lastResult = null"
                style="padding: 0;"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="result-content">
            <div class="ai-response-content">
              {{ lastResult.content }}
            </div>
          </div>
        </el-card>

        <!-- 创建成功结果 -->
        <el-card
          v-if="lastResult && (lastResult.type === 'eventCreated' || lastResult.type === 'todoCreated')"
          shadow="never"
          class="parse-result-card"
          style="margin-top: 12px;"
        >
          <template #header>
            <div class="result-header">
              <span>{{ lastResult.type === 'eventCreated' ? '📅 事件创建成功' : '✓ 待办创建成功' }}</span>
              <el-button 
                type="text" 
                size="small" 
                @click="lastResult = null"
                style="padding: 0;"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="result-content">
            <div class="created-result-content">
              <div class="result-item">
                <span class="result-label">{{ lastResult.type === 'eventCreated' ? '标题' : '内容' }}：</span>
                <span class="result-value">{{ lastResult.data.title || lastResult.data.text }}</span>
              </div>
              <div class="result-item" v-if="lastResult.data.date">
                <span class="result-label">日期：</span>
                <span class="result-value">{{ lastResult.data.date }}</span>
              </div>
              <div class="result-item" v-if="lastResult.data.time">
                <span class="result-label">时间：</span>
                <span class="result-value">{{ lastResult.data.time }}</span>
              </div>
              <div class="result-item" v-if="lastResult.data.type">
                <span class="result-label">类型：</span>
                <span class="result-value">{{ lastResult.data.type }}</span>
              </div>
            </div>
          </div>
          
          <template #footer>
            <div class="result-actions">
              <el-button size="small" @click="lastResult = null">关闭</el-button>
              <el-button 
                type="primary" 
                size="small" 
                @click="handleOpenEventReminder"
              >
                查看详情
              </el-button>
            </div>
          </template>
        </el-card>

        <!-- 搜索结果预览 -->
        <el-card
          v-if="searchResults.length > 0"
          shadow="never"
          class="parse-result-card"
          style="margin-top: 12px;"
        >
          <template #header>
            <div class="result-header">
              <span>🔍 检索结果 ({{ searchResults.length }}条)</span>
              <el-button 
                type="text" 
                size="small" 
                @click="searchResults = []; lastResult = null"
                style="padding: 0;"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="result-content">
            <div class="search-results">
              <div
                v-for="(result, index) in searchResults"
                :key="index"
                class="search-result-item"
                @click="handleOpenEventReminder"
              >
                <div class="result-type">{{ result.type === 'event' ? '📅 事件' : '✓ 代办' }}</div>
                <div class="result-title">{{ result.title }}</div>
                <div v-if="result.date" class="result-meta">
                  {{ result.date }} {{ result.time || '' }}
                </div>
              </div>
            </div>
          </div>
          
          <template #footer>
            <div class="result-actions">
              <el-button size="small" @click="searchResults = []; lastResult = null">关闭</el-button>
              <el-button 
                type="primary" 
                size="small" 
                @click="handleOpenEventReminder"
              >
                查看详情
              </el-button>
            </div>
          </template>
        </el-card>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Close } from '@element-plus/icons-vue'

const emit = defineEmits<{
  'event-created': []
  'todo-created': []
  'refresh': []
}>()

// State
const inputText = ref('')
const processing = ref(false)
const networkStatus = ref<'online' | 'offline' | 'checking'>('checking')
const parseResult = ref<any>(null)
const searchResults = ref<any[]>([])
const lastResult = ref<{
  type: 'aiResponse' | 'eventCreated' | 'todoCreated' | 'search'
  content?: string
  data?: any
} | null>(null)

// Methods


// 检查网络状态
const checkNetworkStatus = async () => {
  networkStatus.value = 'checking'
  try {
    const result = await (window as any).electronAPI.ai.checkNetworkStatus()
    if (result.success) {
      networkStatus.value = result.data.online ? 'online' : 'offline'
    } else {
      networkStatus.value = 'offline'
    }
  } catch (error) {
    networkStatus.value = 'offline'
  }
}

// 处理提交（自动识别意图）
const handleSubmit = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  processing.value = true
  try {
    // 自动识别意图并处理
    await handleAutoParse()
  } catch (error: any) {
    console.error('处理失败:', error)
    ElMessage.error('处理失败: ' + (error.message || '未知错误'))
  } finally {
    processing.value = false
  }
}

// 自动识别意图并处理
const handleAutoParse = async () => {
  // 使用本地时区获取当前日期，避免时区问题
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const currentDate = `${year}-${month}-${day}`
  // 使用Plan-and-Solve模式，这样可以显示执行过程
  const result = await (window as any).electronAPI.ai.parseNaturalLanguageWithPlanAndSolve(inputText.value, {
    currentDate,
    userTimezone: 'Asia/Shanghai'
  })
  
  if (result.success && result.data) {
    parseResult.value = result.data
    const detectedIntent = result.data.intent || 'event'
    
    // 如果 AI 直接返回了回答（不需要工具的情况，如"明天几号"）
    if (result.data.aiResponse) {
      // 保存结果用于展示
      lastResult.value = {
        type: 'aiResponse',
        content: result.data.aiResponse
      }
      ElMessage.success({
        message: result.data.aiResponse,
        duration: 3000,
        showClose: true
      })
      // 清空输入框
      inputText.value = ''
      return
    }
    
    // 检查是否已经自动保存
    if (parseResult.value.autoSaved) {
      // 已经自动保存，直接显示结果
      if (detectedIntent === 'event') {
        lastResult.value = {
          type: 'eventCreated',
          data: {
            title: parseResult.value.title,
            date: parseResult.value.date,
            time: parseResult.value.time,
            type: parseResult.value.type
          }
        }
        ElMessage.success('事件已自动创建并保存')
        emit('event-created')
        emit('refresh')
        inputText.value = ''
        return
      } else if (detectedIntent === 'todo') {
        lastResult.value = {
          type: 'todoCreated',
          data: {
            text: parseResult.value.text,
            date: parseResult.value.date
          }
        }
        ElMessage.success('待办已自动创建并保存')
        emit('todo-created')
        emit('refresh')
        inputText.value = ''
        return
      }
    }
    
    // 如果自动保存失败，显示错误信息
    if (parseResult.value.autoSaved === false && parseResult.value.saveError) {
      ElMessage.warning(`自动保存失败: ${parseResult.value.saveError}，请手动保存`)
    }
    
    // 根据识别的意图自动处理
    if (detectedIntent === 'search') {
      // 自动切换到搜索模式并执行搜索
      await handleSearch()
    } else if (detectedIntent === 'todo') {
      // 只有在明确识别为待办意图，且有有效数据时才创建
      // 避免将查询问题误判为待办
      if (parseResult.value.text && parseResult.value.text.trim() && 
          !parseResult.value.text.includes('哪些') && 
          !parseResult.value.text.includes('有没有') &&
          !parseResult.value.text.includes('查询') &&
          !parseResult.value.text.includes('查找')) {
        await handleConfirmTodo()
      } else {
        // 如果看起来像查询问题，转为搜索
        await handleSearch()
      }
    } else {
      // 默认创建事件（但也要检查是否是查询问题）
      if (parseResult.value.title && 
          (parseResult.value.title.includes('哪些') || 
           parseResult.value.title.includes('有没有') ||
           parseResult.value.title.includes('查询') ||
           parseResult.value.title.includes('查找'))) {
        // 如果是查询问题，转为搜索
        await handleSearch()
      } else {
        await handleConfirmEvent()
      }
    }
  } else {
    ElMessage.error(result.message || '解析失败')
  }
}


// 智能搜索功能（AI直接分析数据并返回匹配结果）
const handleSearch = async () => {
  try {
    // 1. 使用AI理解搜索意图，AI会直接分析所有数据并返回匹配结果
    // 使用本地时区获取当前日期，避免时区问题
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const currentDate = `${year}-${month}-${day}`
    const parseResult = await (window as any).electronAPI.ai.parseNaturalLanguageWithPlanAndSolve(inputText.value, {
      currentDate,
      userTimezone: 'Asia/Shanghai',
      mode: 'search'
    })
    
    if (!parseResult.success || !parseResult.data) {
      ElMessage.error('无法理解搜索意图')
      return
    }
    
    const data = parseResult.data
    
    // 2. 如果AI直接返回了匹配结果（在线模式）
    if (data.searchResults) {
      const results: any[] = []
      
      // 处理AI返回的事件
      if (data.searchResults.events && data.searchResults.events.length > 0) {
        data.searchResults.events.forEach((event: any) => {
          results.push({
            type: 'event',
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            typeLabel: event.type
          })
        })
      }
      
      // 处理AI返回的代办
      if (data.searchResults.todos && data.searchResults.todos.length > 0) {
        data.searchResults.todos.forEach((todo: any) => {
          results.push({
            type: 'todo',
            id: todo.id,
            title: todo.text,
            date: todo.date,
            done: todo.done
          })
        })
      }
      
      searchResults.value = results
      // 保存搜索结果
      lastResult.value = {
        type: 'search',
        data: { count: results.length }
      }
      
      if (results.length === 0) {
        ElMessage.info('未找到匹配的结果')
      } else {
        ElMessage.success(`找到 ${results.length} 条结果`)
      }
      return
    }
    
    // 3. 降级方案：如果AI只返回了搜索条件（离线模式），使用条件过滤
    if (data.searchCriteria) {
      const criteria = data.searchCriteria
      
      // 从数据库获取所有事件和代办
      const [eventsResult, todosResult] = await Promise.all([
        (window as any).electronAPI.event.getAll(),
        (window as any).electronAPI.todo.getAll()
      ])
      
      const allEvents = eventsResult.success ? eventsResult.data || [] : []
      const allTodos = todosResult.success ? todosResult.data || [] : []
      
      const results: any[] = []
      
      // 根据条件过滤事件
      allEvents.forEach((event: any) => {
        let matches = true
        
        // 关键词匹配
        if (criteria.keywords && criteria.keywords.length > 0) {
          const eventText = `${event.title || ''} ${event.type || ''} ${event.description || ''}`.toLowerCase()
          matches = criteria.keywords.some((keyword: string) => 
            eventText.includes(keyword.toLowerCase())
          )
        }
        
        // 类型过滤（精确匹配）
        if (matches && criteria.types && criteria.types.length > 0) {
          matches = criteria.types.some((type: string) => 
            event.type === type || event.type?.toLowerCase() === type.toLowerCase()
          )
        }
        
        // 日期范围过滤
        if (matches && (criteria.dateRange.start || criteria.dateRange.end)) {
          const eventDate = event.date
          if (criteria.dateRange.start && eventDate < criteria.dateRange.start) {
            matches = false
          }
          if (criteria.dateRange.end && eventDate > criteria.dateRange.end) {
            matches = false
          }
        }
        
        if (matches) {
          results.push({
            type: 'event',
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            typeLabel: event.type
          })
        }
      })
      
      // 根据条件过滤代办
      allTodos.forEach((todo: any) => {
        let matches = true
        
        // 关键词匹配
        if (criteria.keywords && criteria.keywords.length > 0) {
          const todoText = (todo.text || '').toLowerCase()
          matches = criteria.keywords.some((keyword: string) => 
            todoText.includes(keyword.toLowerCase())
          )
        }
        
        // 状态过滤
        if (matches && criteria.todoStatus !== 'all') {
          if (criteria.todoStatus === 'done' && !todo.done) {
            matches = false
          }
          if (criteria.todoStatus === 'undone' && todo.done) {
            matches = false
          }
        }
        
        // 日期范围过滤
        if (matches && (criteria.dateRange.start || criteria.dateRange.end)) {
          const todoDate = todo.date
          if (criteria.dateRange.start && todoDate < criteria.dateRange.start) {
            matches = false
          }
          if (criteria.dateRange.end && todoDate > criteria.dateRange.end) {
            matches = false
          }
        }
        
        if (matches) {
          results.push({
            type: 'todo',
            id: todo.id,
            title: todo.text,
            date: todo.date,
            done: todo.done
          })
        }
      })
      
      searchResults.value = results
      
      if (results.length === 0) {
        ElMessage.info('未找到匹配的结果')
      } else {
        ElMessage.success({
          message: `找到 ${results.length} 条结果（离线模式）`,
          duration: 3000
        })
      }
    } else {
      ElMessage.error('无法理解搜索意图')
    }
  } catch (error: any) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败: ' + (error.message || '未知错误'))
  }
}

// 确认创建事件
const handleConfirmEvent = async () => {
  if (!parseResult.value) {
    ElMessage.warning('请先解析内容')
    return
  }

  try {
    const eventData = {
      id: `event_${Date.now()}`,
      title: parseResult.value.title || '',
      type: parseResult.value.type || '其他',
      date: parseResult.value.date || new Date().toISOString().split('T')[0],
      time: parseResult.value.time || '09:00',
      reminder: parseResult.value.reminder || 15,
      createTime: new Date().toISOString()
    }
    
    const result = await (window as any).electronAPI.event.save(eventData)
    if (result.success) {
      // 保存创建结果用于展示
      lastResult.value = {
        type: 'eventCreated',
        data: eventData
      }
      
      const source = parseResult.value.source
      if (source === 'offline' || source === 'offline-fallback') {
        ElMessage.success({
          message: '事件创建成功（离线模式）',
          duration: 3000
        })
      } else {
        ElMessage.success('事件创建成功')
      }
      emit('event-created')
      emit('refresh')
      // 不清空结果，保留展示
      inputText.value = ''
      parseResult.value = null
    } else {
      ElMessage.error(result.message || '创建失败')
    }
  } catch (error: any) {
    console.error('创建失败:', error)
    ElMessage.error('创建失败: ' + (error.message || '未知错误'))
  }
}

// 确认创建代办
const handleConfirmTodo = async () => {
  if (!parseResult.value) {
    ElMessage.warning('请先解析内容')
    return
  }

  try {
    const todoData = {
      id: `todo_${Date.now()}`,
      text: parseResult.value.text || parseResult.value.title || inputText.value,
      date: parseResult.value.date || new Date().toISOString().split('T')[0],
      done: false,
      createTime: new Date().toISOString()
    }
    
    const result = await (window as any).electronAPI.todo.save(todoData)
    if (result.success) {
      // 保存创建结果用于展示
      lastResult.value = {
        type: 'todoCreated',
        data: todoData
      }
      
      const source = parseResult.value.source
      if (source === 'offline' || source === 'offline-fallback') {
        ElMessage.success({
          message: '代办创建成功（离线模式）',
          duration: 3000
        })
      } else {
        ElMessage.success('代办创建成功')
      }
      emit('todo-created')
      emit('refresh')
      // 不清空结果，保留展示
      inputText.value = ''
      parseResult.value = null
    } else {
      ElMessage.error(result.message || '创建失败')
    }
  } catch (error: any) {
    console.error('创建失败:', error)
    ElMessage.error('创建失败: ' + (error.message || '未知错误'))
  }
}


// 打开事件提醒窗口
const handleOpenEventReminder = async () => {
  const { openEventReminderDialog } = await import('../../../utils/electronUtils')
  await openEventReminderDialog()
}

const handleClear = () => {
  inputText.value = ''
  parseResult.value = null
  searchResults.value = []
  lastResult.value = null
}

// 初始化时检查网络状态
let networkCheckInterval: number | null = null

onMounted(() => {
  // 立即检查一次
  checkNetworkStatus()
  
  // 每30秒检查一次网络状态
  networkCheckInterval = window.setInterval(() => {
    checkNetworkStatus()
  }, 30000)
})

onUnmounted(() => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval)
    networkCheckInterval = null
  }
})
</script>

<style scoped>
.ai-assistant {
  width: 100%;
}

.ai-input-section {
  margin-bottom: 0;
}

.ai-input-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.ai-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-input-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.parse-result-card {
  margin-top: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tags {
  display: flex;
  gap: 8px;
}

.result-content {
  padding: 12px 0;
}

.result-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.result-label {
  min-width: 60px;
  font-weight: 500;
  color: #606266;
}

.result-value {
  flex: 1;
  color: #303133;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 8px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-result-item:hover {
  background: #e4e7ed;
  transform: translateX(4px);
}

.result-type {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.result-meta {
  font-size: 12px;
  color: #909399;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ai-response-content {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  line-height: 1.6;
  color: #1e40af;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.created-result-content {
  padding: 8px 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>

