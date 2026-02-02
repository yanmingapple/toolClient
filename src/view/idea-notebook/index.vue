<template>
  <div class="idea-notebook">
    <el-card shadow="hover" class="notebook-card">
      <template #header>
        <div class="card-header">
          <h2>💡 想法记事本</h2>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAddIdea">快速添加</el-button>
            <el-button :icon="Refresh" @click="loadIdeas" :loading="loading">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 编辑器模式 -->
      <div v-if="editMode" class="editor-container">
        <div class="editor-toolbar">
          <el-space>
            <el-button size="small" type="primary" @click="handleSave">保存</el-button>
            <el-button size="small" @click="handleCancel">取消</el-button>
          </el-space>
        </div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="25"
          placeholder="记录你的想法和灵感..."
          class="markdown-editor"
        />
      </div>

      <!-- 预览模式 -->
      <div v-else class="preview-container">
        <div class="preview-toolbar">
          <el-space>
            <el-button size="small" @click="handleEdit">编辑</el-button>
            <el-button size="small" :icon="Plus" @click="handleQuickAdd">快速添加</el-button>
          </el-space>
        </div>
        <div class="markdown-preview" v-html="renderedContent"></div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!content && !editMode"
        description="还没有记录任何想法"
        :image-size="120"
      >
        <el-button type="primary" @click="handleAddIdea">开始记录</el-button>
      </el-empty>
    </el-card>

    <!-- 快速添加对话框 -->
    <el-dialog
      v-model="quickAddVisible"
      title="快速添加想法"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="quickAddForm" label-width="80px">
        <el-form-item label="想法内容">
          <el-input
            v-model="quickAddForm.content"
            type="textarea"
            :rows="6"
            placeholder="输入你的想法..."
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="quickAddForm.tags"
            placeholder="用逗号分隔多个标签（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quickAddVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuickAddSubmit" :loading="loading">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { marked } from 'marked'

const content = ref('')
const editMode = ref(false)
const loading = ref(false)
const quickAddVisible = ref(false)
const quickAddForm = ref({
  content: '',
  tags: ''
})

const renderedContent = computed(() => {
  if (!content.value) return ''
  return marked(content.value)
})

const loadIdeas = async () => {
  loading.value = true
  try {
    const result = await (window as any).electronAPI.ideaNotebook.read()
    if (result.success && result.data) {
      content.value = result.data
    } else {
      ElMessage.error(result.message || '加载失败')
    }
  } catch (error: any) {
    console.error('加载想法失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  editMode.value = true
}

const handleSave = async () => {
  loading.value = true
  try {
    const result = await (window as any).electronAPI.ideaNotebook.save(content.value)
    if (result.success) {
      ElMessage.success('保存成功')
      editMode.value = false
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  editMode.value = false
  loadIdeas()
}

const handleAddIdea = () => {
  editMode.value = true
  if (!content.value) {
    content.value = `# 想法记事本

记录你的想法和灵感。

---
`
  }
}

const handleQuickAdd = () => {
  quickAddForm.value = {
    content: '',
    tags: ''
  }
  quickAddVisible.value = true
}

const handleQuickAddSubmit = async () => {
  if (!quickAddForm.value.content.trim()) {
    ElMessage.warning('请输入想法内容')
    return
  }

  loading.value = true
  try {
    const tags = quickAddForm.value.tags
      ? quickAddForm.value.tags.split(',').map(t => t.trim()).filter(t => t)
      : undefined

    const result = await (window as any).electronAPI.ideaNotebook.append(
      quickAddForm.value.content,
      tags
    )

    if (result.success) {
      ElMessage.success('添加成功')
      quickAddVisible.value = false
      await loadIdeas()
    } else {
      ElMessage.error(result.message || '添加失败')
    }
  } catch (error: any) {
    console.error('添加失败:', error)
    ElMessage.error('添加失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadIdeas()
})
</script>

<style lang="scss" scoped>
.idea-notebook {
  padding: 20px;
  height: 100vh;
  overflow: auto;
  background: #f5f5f5;
}

.notebook-card {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 40px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.editor-container,
.preview-container {
  min-height: 600px;
}

.editor-toolbar,
.preview-toolbar {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.markdown-editor {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.markdown-preview {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: 600px;
  line-height: 1.8;

  :deep(h1) {
    font-size: 24px;
    margin: 20px 0 16px;
    border-bottom: 2px solid #e4e7ed;
    padding-bottom: 8px;
  }

  :deep(h2) {
    font-size: 20px;
    margin: 18px 0 14px;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 6px;
  }

  :deep(h3) {
    font-size: 18px;
    margin: 16px 0 12px;
  }

  :deep(p) {
    margin: 12px 0;
  }

  :deep(ul),
  :deep(ol) {
    margin: 12px 0;
    padding-left: 30px;
  }

  :deep(li) {
    margin: 6px 0;
  }

  :deep(blockquote) {
    border-left: 4px solid #409eff;
    padding-left: 16px;
    margin: 12px 0;
    color: #606266;
    background: #f5f7fa;
    padding: 12px 16px;
  }

  :deep(code) {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }

  :deep(pre) {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid #e4e7ed;
    margin: 20px 0;
  }
}
</style>

