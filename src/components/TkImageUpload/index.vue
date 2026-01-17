<template>
  <div class="tk-image-upload">
    <el-upload
      ref="uploadRef"
      list-type="picture-card"
      :action="uploadAction"
      :http-request="handleUpload"
      :on-success="handleSuccess"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :accept="accept"
      :multiple="multiple"
      :limit="limit"
      :file-list="fileList"
      :on-preview="handlePreview"
      :on-error="handleError"
    >
      <el-icon class="el-icon-plus">
        <Plus />
      </el-icon>
      <template #file="{ file }">
        <div class="file-item-wrapper">
          <img
            v-if="isImageFile(file.name)"
            :src="file.url"
            class="el-upload-list__item-thumbnail"
            alt
          />
          <div v-else class="file-thumbnail">
            <el-icon class="file-icon">
              <Document />
            </el-icon>
            <div class="file-name">{{ file.name }}</div>
          </div>
          <label class="el-upload-list__item-status-label">
            <el-icon class="el-icon--upload-success el-icon--check">
              <Check />
            </el-icon>
          </label>
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePreview(file)"
            >
              <el-icon><ZoomIn /></el-icon>
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>

    <!-- 预览对话框 -->
    <el-dialog :close-on-click-modal="false" v-model="previewVisible" draggable>
      <div v-if="isPreviewImage" style="text-align: center;">
        <img w-full style="width: 100%; max-height: 70vh; object-fit: contain;" :src="previewUrl" alt />
      </div>
      <div v-else style="text-align: center; padding: 40px;">
        <el-icon :size="80" style="color: #409eff; margin-bottom: 20px;">
          <Document />
        </el-icon>
        <div style="font-size: 16px; color: #606266;">{{ previewFileName }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Document, ZoomIn, Delete, Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  accept: {
    type: String
  },
  multiple: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number
  },
  maxSize: {
    type: Number
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const uploadRef = ref()
const previewVisible = ref(false)
const previewUrl = ref('')
const previewFileName = ref('')
const isPreviewImage = ref(false)
// 本地维护的文件列表，用于避免多文件上传时的竞态条件
const localFileList = ref([])

// 判断是否为图片文件
const isImageFile = (fileName) => {
  if (!fileName) return false
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'heif', 'heic', 'svg', 'raw', 'ico']
  const extension = fileName.split('.').pop()?.toLowerCase()
  return imageExtensions.includes(extension)
}

// 计算文件列表，用于el-upload显示
const fileList = computed(() => {
  return localFileList.value.map((file, index) => ({
    uid: file.uid || `file-${index}`,
    name: file.name || file.filename || 'image',
    url: `/fileDown/down.do?id=${file.fileId}`,
    status: 'success',
    response: file.response || null
  }))
})

// 上传配置
const uploadAction = '#'

// 上传前验证
const beforeUpload = (file) => {
  // 检查文件大小
  if (file.size > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize / 1024 / 1024}MB！`)
    return false
  }

  
  return true
}

// 自定义上传
const handleUpload = (options) => {
  const { file, onSuccess, onError } = options
  
  tkReq()
    .path('uploadFileCom')
    .param({})
    .file(file)
    .fileName('files')
    .succ((res) => {
      if (res && res.code === '000000') {
        // 处理响应数据结构
        let processedFile = null
        if (res.ret && Array.isArray(res.ret) && res.ret.length > 0) {
          const attachment = res.ret[0]
          processedFile = {
            uid: file.uid,
            name: file.name,
            url: `/fileDown/down.do?id=${attachment.id}`,
            fileId: attachment.id,
            response: {
              ret: {
                ...attachment,
                tnetAttachment: {
                  filename: attachment.filename,
                  filenewname: attachment.filenewname,
                  filepath: attachment.filepath,
                  id: attachment.id
                }
              }
            }
          }
        } else {
          // 如果响应格式不是数组，保持原格式
          processedFile = {
            uid: file.uid,
            name: file.name,
            url: `/fileDown/down.do?id=${res.ret.id}`,
            fileId: res.ret.id,
            response: {
              ret: {
                tnetAttachment: {
                  filename: res.ret.filename,
                  filenewname: res.ret.filenewname,
                  filepath: res.ret.filepath,
                  id: res.ret.id
                }
              }
            }
          }
        }
        
        // 在成功回调中读取最新的文件列表，避免多文件上传时的竞态条件
        // 检查文件是否已存在（通过 uid 判断），避免重复添加
        const currentList = [...localFileList.value]
        const existingIndex = currentList.findIndex(item => item.uid === file.uid)
        
        if (existingIndex >= 0) {
          // 如果文件已存在，更新它
          currentList[existingIndex] = processedFile
        } else {
          // 如果文件不存在，添加它
          currentList.push(processedFile)
        }
        
        // 更新本地文件列表
        localFileList.value = currentList
        emit('update:modelValue', currentList)
        emit('change', currentList)
        
        // 调用 Element Plus 的成功回调
        onSuccess(res)
      } else {
        onError(new Error('文件上传失败！'))
      }
    })
    .err((error) => {
      onError(error)
    })
    .send()
}

// 上传成功（文件列表更新已在 handleUpload 中处理，这里只显示消息）
const handleSuccess = (response, file, fileList) => {
  if (response && response.code === '000000') {
    ElMessage.success('文件上传成功！')
  } else {
    ElMessage.error('文件上传失败！')
  }
}

// 删除文件
const handleRemove = (file, fileList) => {
  // 从本地文件列表中移除对应的文件
  const newFileList = localFileList.value.filter(item => {
    if (file.uid) {
      return item.uid !== file.uid
    }
    // 如果没有uid，通过其他属性匹配
    return item.name !== file.name || item.url !== file.url
  })
  
  localFileList.value = newFileList
  emit('update:modelValue', newFileList)
  emit('change', newFileList)
  ElMessage.success('文件删除成功！')
}

// 预览文件
const handlePreview = (file) => {
  const fileName = file.name || ''
  isPreviewImage.value = isImageFile(fileName)
  previewFileName.value = fileName
  previewUrl.value = file.url
  previewVisible.value = true
}

// 上传错误
const handleError = (error) => {
  ElMessage.error('上传失败：' + (error.message || '未知错误'))
}

// 监听外部数据变化，同步到本地文件列表
watch(() => props.modelValue, (newVal) => {
  // 当外部数据变化时，同步到本地文件列表
  // 使用深拷贝避免引用问题
  localFileList.value = newVal ? [...newVal] : []
}, { deep: true, immediate: true })

// 暴露方法给父组件
const clearFiles = () => {
  localFileList.value = []
  emit('update:modelValue', [])
  emit('change', [])
}

const submitUpload = () => {
  uploadRef.value?.submit()
}

defineExpose({
  clearFiles,
  submitUpload
})
</script>

<style lang="less" scoped>
.tk-image-upload {
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 148px;
      height: 148px;
      overflow: hidden;
    }
  }
  
  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    line-height: 146px;
  }

  .file-item-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .el-upload-list__item-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-thumbnail {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      padding: 10px;
      box-sizing: border-box;

      .file-icon {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 8px;
      }

      .file-name {
        font-size: 12px;
        color: #606266;
        text-align: center;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;
        max-width: 100%;
      }
    }


    .el-upload-list__item-actions {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      z-index: 2;

      &:hover {
        opacity: 1;
      }

      .el-upload-list__item-preview,
      .el-upload-list__item-delete {
        cursor: pointer;
        font-size: 20px;

        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
