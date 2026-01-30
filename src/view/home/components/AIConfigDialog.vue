<template>
  <el-dialog
    v-model="visible"
    title="AI服务配置"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="服务提供商" prop="provider">
        <el-select v-model="formData.provider" placeholder="请选择AI服务提供商" @change="handleProviderChange">
          <el-option label="OpenAI" value="openai" />
          <el-option label="DeepSeek" value="deepseek" />
          <el-option label="百度文心一言" value="baidu" />
          <el-option label="阿里通义千问" value="ali" />
          <el-option label="腾讯混元" value="tencent" />
        </el-select>
      </el-form-item>

      <el-form-item label="API密钥" prop="apiKey">
        <el-input
          v-model="formData.apiKey"
          type="password"
          placeholder="请输入API密钥"
          show-password
        />
        <div class="form-tip">
          <el-link
            v-if="formData.provider === 'openai'"
            href="https://platform.openai.com/api-keys"
            target="_blank"
            type="primary"
            size="small"
          >
            获取OpenAI API密钥
          </el-link>
          <el-link
            v-else-if="formData.provider === 'deepseek'"
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            type="primary"
            size="small"
          >
            获取DeepSeek API密钥
          </el-link>
        </div>
      </el-form-item>

      <el-form-item label="Base URL" prop="baseUrl">
        <el-input
          v-model="formData.baseUrl"
          placeholder="可选，使用默认URL可留空"
        />
        <div class="form-tip">
          <span class="tip-text">默认URL：</span>
          <span class="tip-value">{{ defaultBaseUrl }}</span>
        </div>
      </el-form-item>

      <el-form-item label="模型" prop="model">
        <el-select v-model="formData.model" placeholder="请选择模型">
          <el-option
            v-for="model in availableModels"
            :key="model"
            :label="model"
            :value="model"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="启用状态">
        <el-switch v-model="formData.enabled" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface AIConfig {
  provider: string
  apiKey: string
  baseUrl?: string
  model?: string
  enabled: boolean
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const saving = ref(false)

const formData = ref<AIConfig>({
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: '',
  enabled: true
})

const defaultBaseUrls: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  baidu: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
  ali: 'https://dashscope.aliyuncs.com/api/v1',
  tencent: 'https://hunyuan.tencentcloudapi.com'
}

const defaultModels: Record<string, string[]> = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  baidu: ['ernie-bot', 'ernie-bot-turbo', 'ernie-bot-4'],
  ali: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  tencent: ['hunyuan-lite', 'hunyuan-standard']
}

const defaultBaseUrl = computed(() => {
  return defaultBaseUrls[formData.value.provider] || ''
})

const availableModels = computed(() => {
  return defaultModels[formData.value.provider] || []
})

const rules: FormRules = {
  provider: [
    { required: true, message: '请选择服务提供商', trigger: 'change' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

// 监听提供商变化，自动设置默认值
const handleProviderChange = () => {
  formData.value.baseUrl = defaultBaseUrls[formData.value.provider] || ''
  if (availableModels.value.length > 0) {
    formData.value.model = availableModels.value[0]
  }
}

// 加载现有配置
const loadConfig = async () => {
  try {
    const result = await (window as any).electronAPI.ai.getConfig()
    if (result.success && result.data) {
      const config = result.data
      formData.value = {
        provider: config.provider || 'openai',
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || '',
        model: config.model || '',
        enabled: config.enabled !== false
      }
    } else {
      // 没有配置，使用默认值
      formData.value = {
        provider: 'openai',
        apiKey: '',
        baseUrl: '',
        model: '',
        enabled: true
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    // 加载失败时使用默认值
    formData.value = {
      provider: 'openai',
      apiKey: '',
      baseUrl: '',
      model: '',
      enabled: true
    }
  }
}

// 保存配置
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    saving.value = true
    try {
      const result = await (window as any).electronAPI.ai.configure({
        provider: formData.value.provider,
        apiKey: formData.value.apiKey,
        baseUrl: formData.value.baseUrl || undefined,
        model: formData.value.model || undefined,
        enabled: formData.value.enabled
      })

      if (result.success) {
        ElMessage.success('AI服务配置已保存')
        emit('saved')
        visible.value = false
      } else {
        ElMessage.error(result.message || '保存失败')
      }
    } catch (error: any) {
      console.error('保存配置失败:', error)
      ElMessage.error('保存配置失败: ' + (error.message || '未知错误'))
    } finally {
      saving.value = false
    }
  })
}

const handleCancel = () => {
  visible.value = false
}

// 打开对话框时加载配置
watch(visible, (val) => {
  if (val) {
    loadConfig()
  }
})
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.tip-text {
  margin-right: 4px;
}

.tip-value {
  font-family: monospace;
  color: #409eff;
}
</style>

