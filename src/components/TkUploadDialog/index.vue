<template>
  <!-- 上传弹框 -->
  <tk-dialog class="upload-dlg" :dlgObj="dlgObjData">
    <div class="upload-dlg-content">
      <slot></slot>
      <div class="upload-con tool_js_col_between_stretch_flex">
        <!-- 操作按钮区域 -->
        <div class="upload-actions">
          <el-upload
            class="upload-box"
            ref="uploadDom"
            :accept="uploadData?.accept"
            :auto-upload="false"
            :show-file-list="false"
            :multiple="uploadData?.multiple"
            :on-change="handleChange"
          >
            <template #trigger>
              <el-button type="primary" plain class="upload-btn">
                <svg-icon
                  class-name="ic_uploadFile"
                  icon-class="ic_upload_file"
                ></svg-icon>
                <span>{{ uploadData?.uploadBtnName || '选择文件' }}</span>
              </el-button>
            </template>
          </el-upload>
          <el-button
            class="download-btn"
            type="success"
            v-if="!!uploadData?.downloadUrl"
            @click="downHandler"
          >
            <svg-icon icon-class="ic_download1"></svg-icon>
            <span>下载模板</span>
          </el-button>
        </div>

        <!-- 拖拽上传区域 -->
        <div
          class="drag-upload-area"
          :class="{ 'is-dragging': isDragging }"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <!-- 文件列表区域 -->
          <div class="file-list-container" v-if="uploadData?.fileList?.length">
            <div class="file-list-header">
              <span class="file-count">已选择 {{ uploadData.fileList.length }} 个文件</span>
            </div>
            <div class="file-list">
              <div
                :class="[
                  'file-item',
                  f.uploadType == 1 ? 'upload-item' : '',
                  `file-item--${f.uploadType}`,
                ]"
                v-for="(f, index) in uploadData.fileList"
                :key="'file_' + index"
              >
                <div class="file-item-content">
                  <span
                    v-if="uploadTypeMap?.[f.uploadType]?.icon"
                    :title="uploadTypeMap?.[f.uploadType]?.label ?? ''"
                    :class="['file-status-tag', uploadTypeMap?.[f.uploadType]?.clsName]"
                  >
                    <svg-icon :icon-class="uploadTypeMap?.[f.uploadType]?.icon"></svg-icon>
                  </span>
                  <span class="file-name" :title="f.name">{{ f.name }}</span>
                </div>
                <el-button
                  class="file-delete-btn"
                  text
                  type="danger"
                  @click="delHandler(f, index)"
                >
                  <svg-icon class-name="del-icon" icon-class="ic_delete"></svg-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态提示 -->
          <div class="empty-state" v-else>
            <svg-icon class-name="empty-icon" icon-class="ic_upload_file"></svg-icon>
            <p class="empty-text">暂未选择文件</p>
            <p class="drag-hint">支持拖拽文件到此处上传</p>
          </div>

          <!-- 拖拽遮罩层 -->
          <div class="drag-overlay" v-if="isDragging">
            <div class="drag-overlay-content">
              <svg-icon class-name="drag-icon" icon-class="ic_upload_file"></svg-icon>
              <p class="drag-text">松开鼠标完成上传</p>
            </div>
          </div>
        </div>

        <!-- 提示信息区域 -->
        <div class="tips-container" v-if="uploadData?.tips?.length">
          <div class="tips-title">
            <svg-icon
              class-name="tips-icon"
              icon-class="ic_circle_exclamationMark"
            ></svg-icon>
            <span>温馨提示</span>
          </div>
          <div class="tips-content">
            <div
              class="tip-item"
              v-for="(item, index) in uploadData.tips"
              :key="index"
              v-html="item"
            ></div>
          </div>
        </div>

        <slot name="uploadMsg"></slot>
      </div>
    </div>
  </tk-dialog>
</template>
<script setup>
  import { ref, reactive, nextTick } from 'vue';

  const props = defineProps({
    uploadData: { type: Object, required: true },
  });
  const paramsData = ref({}),
    uploadDom = ref(),
    isDragging = ref(false),
    dragCounter = ref(0),
    uploadTypeMap = {
      0: {
        label: '未上传',
        clsName: 'gray-tag',
        icon: 'ic_circle_exclamationMark',
      },
      1: { label: '已上传', clsName: 'green-tag', icon: 'ic_circle_right' },
      2: { label: '上传失败', clsName: 'red-tag', icon: 'ic_circle-wrong' },
    },
    dlgObjData = reactive(useDlg());
  dlgObjData.width = '50rem';

  function handleChange(file, fileList) {
    // 校验
    let type = file.name
        .substring(file.name.lastIndexOf('.') + 1)
        ?.trim()
        ?.toLowerCase(),
      acceptData = props.uploadData?.accept ?? '',
      fileTypeList = acceptData ? acceptData.replaceAll('.', '')?.split(',') : [],
      isType = fileTypeList?.length ? fileTypeList.includes(type) : true,
      fileListLen = fileList?.length ?? 0;

    if (file.name.length > 50) {
      tkMessage.err('文件名过长，请修改文件名后上传！');
      fileList.splice(fileListLen - 1, 1);
    } else if (!isType) {
      tkMessage.err(`上传的文件不符合规范，仅支持${fileTypeList.join('/')}格式！`);
      fileList.splice(fileListLen - 1, 1);
    } else {
      fileList.forEach(_f => {
        _f['uploadType'] = _f?.uploadType ?? 0;
      });
      props.uploadData.fileList = fileList;
    }
  }

  // 下载模板
  function downHandler() {
    tkTools.downloadFun(process.env.VUE_APP_BASE_API + props.uploadData?.downloadUrl);
  }

  // 删除文件
  function delHandler(file, index) {
    props.uploadData?.fileList?.splice(index, 1);
  }

  // 拖拽相关事件处理
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.value++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      isDragging.value = true;
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      isDragging.value = true;
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.value--;
    if (dragCounter.value <= 0) {
      isDragging.value = false;
      dragCounter.value = 0;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
    dragCounter.value = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      return;
    }

    // 检查是否支持多文件上传
    const isMultiple = props.uploadData?.multiple ?? false;
    const filesToProcess = isMultiple ? files : [files[0]];

    // 处理每个文件
    filesToProcess.forEach(file => {
      // 创建类似 el-upload 的文件对象
      const fileObj = {
        name: file.name,
        size: file.size,
        raw: file,
        uploadType: 0,
      };

      // 校验文件
      let type = file.name
          .substring(file.name.lastIndexOf('.') + 1)
          ?.trim()
          ?.toLowerCase(),
        acceptData = props.uploadData?.accept ?? '',
        fileTypeList = acceptData ? acceptData.replaceAll('.', '')?.split(',') : [],
        isType = fileTypeList?.length ? fileTypeList.includes(type) : true;

      if (file.name.length > 50) {
        tkMessage.err('文件名过长，请修改文件名后上传！');
        return;
      } else if (!isType) {
        tkMessage.err(`上传的文件不符合规范，仅支持${fileTypeList.join('/')}格式！`);
        return;
      }

      // 添加到文件列表
      const currentFileList = props.uploadData.fileList || [];
      // 检查是否已存在同名文件
      const exists = currentFileList.some(f => f.name === file.name);
      if (!exists) {
        props.uploadData.fileList = [...currentFileList, fileObj];
      } else {
        tkMessage.warn(`文件 ${file.name} 已存在，已跳过`);
      }
    });
  }

  // 上传
  function submitUpload() {
    let uploadFile = props.uploadData?.fileList?.filter(_f => _f.uploadType != 1);
    if (uploadFile?.length == 0) {
      tkMessage.warn('无上传文件！');
      return;
    }

    function closeDlog() {
      dlgObjData.closeDlg();
    }
    props.uploadData.processFiles(uploadFile, closeDlog);
  }

  // 提交描述
  dlgObjData.handlerConfirm = function () {
    submitUpload();
  };

  // 设置组件参数
  function doComInit(params) {
    paramsData.value = params;
    dlgObjData.openDlg(params?.title ?? '上传文件');
    if (params) {
      if (params.sureBtn) {
        dlgObjData.sureBtn = params.sureBtn;
      }
      if (params.cancelBtn) {
        dlgObjData.cancelBtn = params.cancelBtn;
      }
    }

    nextTick(() => {
      uploadDom.value.clearFiles();
      props.uploadData.fileList = [];
    });
  }

  defineExpose({ doComInit });
</script>

<style lang="less" scoped>
  .upload-con {
    max-height: 62vh;
    padding: 0 4px;

    // 操作按钮区域
    .upload-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e7ed;

      .upload-box {
        display: inline-block;
      }
    }

    // 文件列表容器
    .file-list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      margin-bottom: 16px;
      border: 2px dashed transparent;
      border-radius: 8px;
      transition: all 0.3s ease;

      .file-list-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f5f7fa;
        border-radius: 4px 4px 0 0;
        border-bottom: 1px solid #e4e7ed;

        .file-count {
          font-size: 13px;
          color: #606266;
          font-weight: 500;
        }
      }

      .file-list {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-top: none;
        border-radius: 0 0 4px 4px;
        background: #fff;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f5f7fa;
        }

        &::-webkit-scrollbar-thumb {
          background: #c0c4cc;
          border-radius: 3px;

          &:hover {
            background: #a0a4a8;
          }
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: #606266;
          border-bottom: 1px solid #f0f2f5;
          transition: all 0.2s ease;
          cursor: default;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: linear-gradient(90deg, #ecf5ff 0%, #f0f9ff 100%);
            padding-left: 20px;

            .file-delete-btn {
              opacity: 1;
              transform: scale(1);
            }
          }

          &.file-item--1 {
            background: linear-gradient(90deg, #f0f9ff 0%, #f5fdf5 100%);
          }

          &.file-item--2 {
            background: linear-gradient(90deg, #fef0f0 0%, #fef5f5 100%);
          }

          .file-item-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;

            .file-status-tag {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 18px;
              height: 18px;
              flex-shrink: 0;

              :deep(.svg-icon) {
                width: 16px;
                height: 16px;
              }

              &.gray-tag {
                color: #909399;
              }

              &.green-tag {
                color: #67c23a;
              }

              &.red-tag {
                color: #f56c6c;
              }
            }

            .file-name {
              flex: 1;
              font-size: 14px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.5;
            }
          }

          .file-delete-btn {
            flex-shrink: 0;
            padding: 4px;
            opacity: 0.6;
            transform: scale(0.9);
            transition: all 0.2s ease;

            .del-icon {
              width: 16px;
              height: 16px;
            }

            &:hover {
              opacity: 1;
              transform: scale(1.1);
            }
          }
        }
      }
    }

    // 拖拽上传区域
    .drag-upload-area {
      position: relative;
      min-height: 200px;
      transition: all 0.3s ease;

      &.is-dragging {
        .file-list-container,
        .empty-state {
          border-color: #409eff;
          background: #f0f9ff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    // 空状态
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      margin-bottom: 16px;
      background: #fafafa;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .empty-icon {
        width: 48px;
        height: 48px;
        color: #c0c4cc;
        margin-bottom: 12px;
        transition: all 0.3s ease;
      }

      .empty-text {
        font-size: 14px;
        color: #606266;
        margin: 0 0 8px 0;
        font-weight: 500;
      }

      .drag-hint {
        font-size: 12px;
        color: #909399;
        margin: 0;
      }
    }

    // 拖拽遮罩层
    .drag-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(64, 158, 255, 0.1);
      border: 2px dashed #409eff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      backdrop-filter: blur(2px);
      animation: dragPulse 1.5s ease-in-out infinite;

      .drag-overlay-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;

        .drag-icon {
          width: 64px;
          height: 64px;
          color: #409eff;
          animation: dragBounce 1s ease-in-out infinite;
        }

        .drag-text {
          font-size: 16px;
          color: #409eff;
          font-weight: 600;
          margin: 0;
        }
      }
    }

    @keyframes dragPulse {
      0%,
      100% {
        opacity: 0.8;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes dragBounce {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    // 提示信息区域
    .tips-container {
      margin-top: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
      border: 1px solid #ffe58f;
      border-radius: 6px;
      border-left: 4px solid #faad14;

      .tips-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #d48806;

        .tips-icon {
          width: 16px;
          height: 16px;
        }
      }

      .tips-content {
        .tip-item {
          font-size: 13px;
          color: #8c6e00;
          line-height: 1.8;
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          :deep(p) {
            margin: 0;
          }
        }
      }
    }
  }

  .upload-dlg-content {
    margin: 10px 0;
    background-color: #fff;
    padding: 10px;
    box-sizing: border-box;
  }
</style>
