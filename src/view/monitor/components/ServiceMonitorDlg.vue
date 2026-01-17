<template>
  <TkDialog :dlgObj="dlgObj">
    <tk-form :searchFormObj="formObj" />
  </TkDialog>
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { saveServiceMonitors, selectFolder } from '@/utils/electronUtils'
import type { ServiceMonitor } from '../../../../electron/model/database/ServiceMonitor'
import type { ServiceResult } from '../../../../electron/model/result/ServiceResult'

// useDlg 和 useForm 是全局函数
declare const useDlg: () => any
declare const useForm: () => any

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

// 对话框配置对象
const dlgObj = reactive(useDlg())
dlgObj.width = '500px'
dlgObj.closeOnClickModal = false

// 表单配置对象
const formObj = reactive(useForm())
formObj.labelWidth = '100px'
formObj.formType = 'normal'
formObj.inline = false

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

// 处理文件夹选择
const handleSelectFolder = async () => {
  debugger
  try {
    const folderPath = await selectFolder()
    formObj.formData.workspace = folderPath
  } catch (error: any) {
    console.error('选择文件夹失败:', error)
    CTMessage.error(error.message || '选择文件夹失败')
  }
}

// 构建表单配置
const buildFormConfig = () => {
  formObj.formConfig = [
    {
      type: 'select',
      prop: 'type',
      label: '服务类型',
      placeholder: '请选择服务类型',
      isRequired: true,
      options: [
        { label: '数据库', value: 'database' },
        { label: 'Redis', value: 'redis' },
        { label: '消息队列', value: 'mq' },
        { label: 'Elasticsearch', value: 'es' },
        { label: '其他服务', value: 'service' }
      ],
      change: (value: string) => {
        handleTypeChange(value)
      }
    },
    {
      type: 'input',
      prop: 'name',
      label: '服务名称',
      placeholder: '请输入服务名称',
      isRequired: true,
      maxlength: 50
    },
    {
      type: 'input',
      prop: 'serverName',
      label: '服务标识',
      placeholder: '请输入服务标识（如mysql、redis）'
    },
    {
      type: 'number',
      prop: 'port',
      label: '端口号',
      placeholder: '请输入端口号',
      isRequired: true,
      min: 1,
      max: 65535,
      precision: 0
    },
    {
      type: 'input',
      prop: 'workspace',
      label: '工作目录',
      placeholder: '请选择工作目录',
      isRequired: true,
      maxlength:1000,
      appendIcon: 'folder', // 使用 append 图标
      appendFun: handleSelectFolder
    },
    {
      type: 'input',
      prop: 'url',
      label: '服务地址',
      placeholder: '请输入服务地址',
      isRequired: true
    }
  ]
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

// 初始化表单数据和配置
const initFormData = () => {
  formObj.formData = {
    type: 'database',
    name: typeNameMap['database'],
    serverName: typeServerNameMap['database'],
    port: typePortMap['database'],
    workspace: '',
    url: '',
    status: '已停止'
  }
  formObj.initFormData = { ...formObj.formData }
  formObj.rules = rules
}

// 处理服务类型变更
const handleTypeChange = (type: string) => {
  formObj.formData.name = typeNameMap[type] || ''
  formObj.formData.port = typePortMap[type] || 8080
  formObj.formData.serverName = typeServerNameMap[type] || ''
}

// 保存服务监控
const handleSaveService = async () => {
  try {
    // 表单验证
    if (formObj.resetForm && typeof formObj.resetForm === 'function') {
      // resetForm 实际上是一个方法，需要调用实际的表单验证
      const formEl = (formObj as any).ruleForm
      if (formEl && typeof formEl.validate === 'function') {
        await formEl.validate()
      }
    }
    
    // 准备保存的数据
    const isEditMode = !!props.editingService
    const newService: ServiceMonitor = {
      id: isEditMode && props.editingService ? props.editingService.id : 0,
      name: formObj.formData.name,
      serverName: formObj.formData.serverName || '',
      type: formObj.formData.type,
      port: formObj.formData.port,
      status: formObj.formData.status || '已停止',
      workspace: formObj.formData.workspace,
      url: formObj.formData.url,
      createTime: isEditMode && props.editingService ? props.editingService.createTime : new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    // 保存服务监控
    const result: ServiceResult<void> = await saveServiceMonitors([newService])
    if (result.success) {
      CTMessage.success(isEditMode ? '服务编辑成功' : '服务添加成功')
      dlgObj.closeDlg()
      emit('save-success')
    } else {
      CTMessage.error(`${isEditMode ? '服务编辑' : '服务添加'}失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('保存服务监控失败:', error)
    CTMessage.error(error.message || (!!props.editingService ? '服务编辑失败' : '服务添加失败'))
  }
}

// 配置对话框
dlgObj.handlerConfirm = handleSaveService
dlgObj.handlerCancel = () => {
  dlgObj.closeDlg()
  emit('update:dialogVisible', false)
}

// 监听对话框显示状态和编辑服务数据变化
watch([() => props.dialogVisible, () => props.editingService], ([visible, editingService]: [boolean, ServiceMonitor | null | undefined]) => {
  if (visible) {
    // 构建表单配置（首次）
    if (formObj.formConfig.length === 0) {
      buildFormConfig()
      initFormData()
    }
    
    if (editingService) {
      // 编辑模式：加载编辑数据
      formObj.setEditData(editingService)
      dlgObj.openDlg('编辑服务', false)
    } else {
      // 新增模式：重置表单
      formObj.reset()
      dlgObj.openDlg('新增服务', true)
    }
  } else {
    // 关闭对话框
    if (dlgObj.visible) {
      dlgObj.closeDlg()
    }
  }
}, { immediate: true })

// 监听对话框状态变化，同步到父组件
watch(() => dlgObj.visible, (visible: boolean) => {
  if (!visible) {
    emit('update:dialogVisible', false)
  }
})
</script>
