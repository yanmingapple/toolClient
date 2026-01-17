<template>
  <el-dialog
    :title="connection ? '编辑数据库连接' : '新建数据库连接'"
    v-model="dialogVisible"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本配置" name="basic">
          <el-form-item label="连接名称" prop="name">
            <el-input v-model="formData.name" placeholder="例如: 本地MySQL" />
          </el-form-item>

          <el-form-item label="数据库类型" prop="type">
            <el-select v-model="formData.type" @change="handleTypeChange" style="width: 100%">
              <el-option label="MySQL" :value="ConnectionType.MySQL" />
              <el-option label="PostgreSQL" :value="ConnectionType.PostgreSQL" />
              <el-option label="MongoDB" :value="ConnectionType.MongoDB" />
              <el-option label="Redis" :value="ConnectionType.Redis" />
              <el-option label="SQL Server" :value="ConnectionType.SQLServer" />
              <el-option label="SQLite" :value="ConnectionType.SQLite" />
            </el-select>
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="主机名" prop="host">
                <el-input v-model="formData.host" placeholder="localhost" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="端口" prop="port">
                <el-input-number v-model="formData.port" :min="1" :max="65535" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="formData.username" placeholder="root" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码">
                <el-input v-model="formData.password" type="password" placeholder="" show-password />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="数据库名">
            <el-input v-model="formData.database" placeholder="默认数据库" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="高级配置" name="advanced">
          <el-card header="SSL配置" shadow="never" style="margin-bottom: 16px">
            <el-form-item label="启用SSL">
              <el-switch v-model="formData.ssl" />
            </el-form-item>
          </el-card>

          <el-card header="SSH隧道" shadow="never" style="margin-bottom: 16px">
            <el-form-item label="启用SSH隧道">
              <el-switch v-model="formData.ssh" />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="SSH主机名">
                  <el-input v-model="formData.sshHost" placeholder="SSH服务器地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SSH端口">
                  <el-input-number v-model="formData.sshPort" :min="1" :max="65535" :step="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="SSH用户名">
                  <el-input v-model="formData.sshUsername" placeholder="SSH用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SSH密码">
                  <el-input v-model="formData.sshPassword" type="password" placeholder="SSH密码" show-password />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="SSH私钥">
              <el-input v-model="formData.sshPrivateKey" type="textarea" :rows="4" placeholder="SSH私钥内容" />
            </el-form-item>

            <el-form-item label="SSH私钥密码">
              <el-input v-model="formData.sshPassphrase" type="password" placeholder="SSH私钥密码" show-password />
            </el-form-item>
          </el-card>

          <el-card header="连接选项" shadow="never">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="连接超时(秒)">
                  <el-input-number v-model="formData.timeout" :min="1" :max="300" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="字符集">
                  <el-input v-model="formData.charset" placeholder="例如: utf8mb4" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="最大连接数">
              <el-input-number v-model="formData.maxConnections" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-space :size="16">
        <el-button @click="handleTestConnection" :loading="testLoading">测试连接</el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          {{ connection ? '更新' : '保存' }}
        </el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
import { useConnectionStore } from '../../stores/connection'
import { ConnectionType, ConnectionConfig, TreeNode } from '../../../electron/model/database'

interface ConnectionDialogProps {
  visible: boolean
  connection?: TreeNode | null
}

const props = withDefaults(defineProps<ConnectionDialogProps>(), {
  visible: false,
  connection: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
}>()

const connectionStore = useConnectionStore()

const formRef = ref<FormInstance | null>(null)
const activeTab = ref('basic')
const loading = ref(false)
const testLoading = ref(false)

const defaultPorts: Record<ConnectionType, number> = {
  [ConnectionType.MySQL]: 3306,
  [ConnectionType.PostgreSQL]: 5432,
  [ConnectionType.MongoDB]: 27017,
  [ConnectionType.Redis]: 6379,
  [ConnectionType.SQLServer]: 1433,
  [ConnectionType.SQLite]: 0
}

const formData = reactive({
  name: '',
  type: ConnectionType.MySQL as ConnectionType,
  host: '127.0.0.1',
  port: defaultPorts[ConnectionType.MySQL],
  username: 'root',
  password: '123456',
  database: '',
  ssl: false,
  ssh: false,
  sshHost: '',
  sshPort: 22,
  sshUsername: '',
  sshPassword: '',
  sshPrivateKey: '',
  sshPassphrase: '',
  timeout: 30,
  charset: 'utf8mb4',
  maxConnections: 10
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入连接名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机名', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

const dialogVisible = computed({
  get: () => {
    console.log('ConnectionDialog dialogVisible get:', props.visible)
    return props.visible
  },
  set: (value) => {
    console.log('ConnectionDialog dialogVisible set:', value)
    emit('update:visible', value)
  }
})

watch(() => props.visible, (visible) => {
  console.log('ConnectionDialog watch visible:', visible, 'connection:', props.connection)
  if (visible && props.connection) {
    try {
      const decryptedConnection = connectionStore.decryptConnection(props.connection)
      Object.assign(formData, {
        ...decryptedConnection,
        type: decryptedConnection.type,
        port: decryptedConnection.port || defaultPorts[decryptedConnection.type]
      })
    } catch (error) {
      console.error('Error decrypting connection:', error)
    }
  } else if (visible) {
    Object.assign(formData, {
      name: '',
      type: ConnectionType.MySQL,
      host: '127.0.0.1',
      port: defaultPorts[ConnectionType.MySQL],
      username: 'root',
      password: '123456',
      database: '',
      ssl: false,
      ssh: false,
      sshHost: '',
      sshPort: 22,
      sshUsername: '',
      sshPassword: '',
      sshPrivateKey: '',
      sshPassphrase: '',
      timeout: 30,
      charset: 'utf8mb4',
      maxConnections: 10
    })
  }
})

const handleTypeChange = (type: ConnectionType) => {
  formData.port = defaultPorts[type]
}

const handleTestConnection = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    testLoading.value = true

    const conectionNode:TreeNode ={
      ...props.connection,
      connectionConfig: {
        ...formData,
        type: formData.type,
        id: 'test-connection',
        password: formData.password || ''
      }
    }

    const result = await connectionStore.testConnection(conectionNode)
    if (result.success) {
      CTMessage.success('连接测试成功！')
    } else {
      CTMessage.error(`连接测试失败：${result.error || '未知错误'}`)
    }
  } catch (error: any) {
    CTMessage.error(`表单验证失败：${error?.message || '请检查输入'}`)
  } finally {
    testLoading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (props.connection) {
      connectionStore.updateConnection(props.connection.id, { ...formData })
      CTMessage.success('连接更新成功！')
    } else {
      connectionStore.addConnection({ ...formData })
      CTMessage.success('连接添加成功！')
    }

    handleCancel()
  } catch (error: any) {
    CTMessage.error(`保存失败：${error?.message || '请检查输入'}`)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
