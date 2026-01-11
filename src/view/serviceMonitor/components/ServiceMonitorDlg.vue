<template>
  <el-dialog
    :model-value="dialogVisible"
    @update:model-value="emit('update:dialogVisible', $event)"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      label-width="100px"
      :rules="rules"
    >
     
      <el-form-item label="服务类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择服务类型" @change="handleTypeChange">
          <el-option label="数据库" value="database" />
          <el-option label="Redis" value="redis" />
          <el-option label="消息队列" value="mq" />
          <el-option label="Elasticsearch" value="es" />
          <el-option label="其他服务" value="service" />
        </el-select>
      </el-form-item>
       <el-form-item label="服务名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入服务名称" />
      </el-form-item>
      <el-form-item label="服务标识">
        <el-input v-model="form.serverName" placeholder="请输入服务标识（如mysql、redis）" />
      </el-form-item>
      <el-form-item label="端口号" prop="port">
        <el-input-number
          v-model="form.port"
          :min="1"
          :max="65535"
          placeholder="请输入端口号"
        />
      </el-form-item>
      <el-form-item label="工作目录" prop="workspace">
        <el-input v-model="form.workspace" placeholder="请选择工作目录">
          <template #append>
            <el-button @click="handleSelectFolder">
              <el-icon><Folder /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="服务地址" prop="url">
        <el-input v-model="form.url" placeholder="请输入服务地址" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:dialogVisible', false)">取消</el-button>
      <el-button type="primary" @click="handleSaveService">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { ElForm } from 'element-plus'

import { Folder } from '@element-plus/icons-vue'
import { saveServiceMonitors, selectFolder } from '@/utils/electronUtils'
import type { ServiceMonitor } from '../../../../electron/model/database/ServiceMonitor'
import type { ServiceResult } from '../../../../electron/model/result/ServiceResult'

// 定义组件属性
const props = defineProps<{
  dialogVisible: boolean
  editingService?: ServiceMonitor | null
}>()

// 定义组件事件
const emit = defineEmits<{
  'update:dialogVisible': [value: boolean]
  'save-success': []
}>()

// 表单引用
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

// 表单数据
const form = ref({
  name: '数据库服务',
  serverName: '',
  type: 'database',
  port: 3306,
  workspace: '',
  url: ''
})

// 对话框标题
const dialogTitle = ref('新增服务')

// 监听对话框显示状态和编辑服务数据变化
watch([() => props.dialogVisible, () => props.editingService], ([visible, editingService]) => {
  if (visible) {
    if (editingService) {
      // 编辑模式：加载编辑数据
      form.value = { ...editingService }
      dialogTitle.value = '编辑服务'
    } else {
      // 新增模式：重置表单
      form.value = {
        name: typeNameMap['database'],
        serverName: typeServerNameMap['database'],
        type: 'database',
        port: typePortMap['database'],
        workspace: '',
        url: ''
      }
      dialogTitle.value = '新增服务'
    }
  }
}, { immediate: true })

// 服务类型对应的默认名称映射
const typeNameMap: Record<string, string> = {
  database: '数据库服务',
  redis: 'Redis服务',
  mq: '消息队列服务',
  es: 'Elasticsearch服务',
  service: '其他服务'
}

// 服务类型对应的默认端口映射
const typePortMap: Record<string, number> = {
  database: 3306,
  redis: 6379,
  mq: 5672,
  es: 9200,
  service: 8080
}

// 服务类型对应的默认服务标识映射
const typeServerNameMap: Record<string, string> = {
  database: 'mysql',
  redis: 'redis',
  mq: 'rabbitmq',
  es: 'elasticsearch',
  service: ''
}

// 处理服务类型变更
const handleTypeChange = (type: string) => {
  form.value.name = typeNameMap[type] || ''
  form.value.port = typePortMap[type] || 8080
  form.value.serverName = typeServerNameMap[type] || ''
}

// 处理文件夹选择
const handleSelectFolder = async () => {
  try {
    const folderPath = await selectFolder()
    form.value.workspace = folderPath
  } catch (error: any) {
    console.error('选择文件夹失败:', error)
    CTMessage.error(error.message || '选择文件夹失败')
  }
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号在 1 到 65535 之间', trigger: 'blur' }
  ],
  workspace: [
    { required: true, message: '请输入工作目录', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入服务地址', trigger: 'blur' }
  ]
}

// 保存服务监控
const handleSaveService = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 准备保存的数据
    const isEditMode = !!props.editingService
    // 创建一个纯净的对象，只包含需要的属性，避免Vue响应式属性导致的序列化问题
    const newService: ServiceMonitor = {
      id: isEditMode && props.editingService ? props.editingService.id : 0,
      name: form.value.name,
      serverName: form.value.serverName,
      type: form.value.type,
      port: form.value.port,
      status: form.value.status || '已停止',
      workspace: form.value.workspace,
      url: form.value.url,
      createTime: isEditMode && props.editingService ? props.editingService.createTime : new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    // 保存服务监控
    const result: ServiceResult<void> = await saveServiceMonitors([newService])
    if (result.success) {
      CTMessage.success(isEditMode ? '服务编辑成功' : '服务添加成功')
      emit('update:dialogVisible', false)
      emit('save-success')
    } else {
      CTMessage.error(`${isEditMode ? '服务编辑' : '服务添加'}失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('保存服务监控失败:', error)
    CTMessage.error(error.message || (!!props.editingService ? '服务编辑失败' : '服务添加失败'))
  }
}
</script>