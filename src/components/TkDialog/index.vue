<template>
  <!-- 编辑/新增  弹框 -->
  <el-dialog
    v-if="dlgObj.visible"
    element-loading-text="提交中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.4)"
    v-model="dlgObj.visible"
    :width="dlgObj.width"
    :fullscreen="dlgObj.fullscreen"
    :close-on-click-modal="dlgObj.closeOnClickModal"
    :show-close="dlgObj.hasCancel || dlgObj.showClose"
    :top="dlgObj.top"
    :title="dlgObj.title"
    :class="[
      {
        noFooter: !dlgObj.isShowFooter,
        LatestStyle: `LatestStyle`,
      },
      dlgObj.dlgClsName,
    ]"
    :append-to-body="dlgObj.appendToBody"
    @close="dlgObj.close"
    :align-center="dlgObj.align == undefined ? true : dlgObj.align"
    draggable
  >
    <div class="dlg-main-con">
      <slot></slot>
    </div>
    <template #footer>
      <div v-if="dlgObj.isShowFooter">
        <div class="tan_dialog">
          <slot name="leftButton"></slot>
          <slot name="rightButton">
            <el-button
              v-if="dlgObj.hasCancel"
              :loading="dlgObj.confirmLoading"
              @click="dlgObj.cancel"
              type="primary"
            >
              {{ dlgObj.cancelBtn }}
            </el-button>

            <el-button
              v-if="dlgObj.hasConfirm"
              type="primary"
              plain
              :disabled="dlgObj.confirmDisabled || dlgObj.confirmLoading"
              @click="dlgObj.confirm"
            >
              {{ dlgObj.sureBtn }}
            </el-button>
          </slot>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
  const props = defineProps({
    // 弹出框数据
    dlgObj: {
      type: Object,
      default: {
        width: '500px',
        visible: false,
        title: '',
      },
    },
  });
</script>
<style lang="less">
  .el-dialog {
    .el-dialog__body {
      padding: 0 20px;
      max-height: 84vh;
      overflow: auto;
      box-sizing: border-box;
      .dlg-main-con {
        height: 100%;
        //   padding-top: 20px;
        .table-auto {
          padding: 0;
        }
      }
    }
  }

  // tkConfirm
  .el-message-box.LatestStyle {
    --el-messagebox-padding-primary: 0px;
    max-width: 600px;
    .el-message-box__header {
      background-color: #f3f5f9;
      padding: 14px 16px;
      font-weight: 500;
      position: relative;
      .el-message-box__title {
        --el-messagebox-title-color: #000000;
        --el-messagebox-font-size: 18px;
        --el-messagebox-font-line-height: 19.2px;
      }
      .el-message-box__close {
        color: #000;
        font-size: 1.5rem;
      }

      .el-message-box__headerbtn {
        top: 50% !important;
        transform: translateY(-50%);
      }
    }
    .el-message-box__content {
      padding: 20px;
      align-items: start;
      background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
      min-height: 100px;
      p {
        color: #000;
        font-family: '微软雅黑', Arial, Helvetica, sans-serif;
        font-size: 16px;
        line-height: 31px;
        letter-spacing: 1.1px;
      }
      --el-messagebox-content-color: #000;
      --el-messagebox-content-font-size: 16px;
      --el-messagebox-font-line-height: 20px;
    }
    &:not(.el-message-box__content).el-message-box__container {
      padding: 20px;
      align-items: start;
      background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
      min-height: 100px;
      p {
        color: #000;
        font-family: '微软雅黑', Arial, Helvetica, sans-serif;
        font-size: 16px;
        line-height: 31px;
        letter-spacing: 1.1px;
      }
      --el-messagebox-content-color: #000;
      --el-messagebox-content-font-size: 16px;
      --el-messagebox-font-line-height: 20px;
    }

    .el-message-box__btns {
      padding: 8.5px 15px;
      box-shadow: 0 -6px 11px 0 #8e989f33;
      button.el-button {
        height: 30px !important;
        line-height: 30px !important;
        min-width: 61px;
        border-radius: 2px;
        padding: 8px 15px;
        --el-text-color-regular: #0380ff;
        --el-border-color: #0380ff;
        background-color: #fff;
        --el-border: 1px solid #3073f5;
        &:hover {
          background-color: rgba(48, 115, 245, 0.15);
          border-color: #0380ff;
          --el-button-hover-text-color: #0380ff;
          outline: none;
        }

        &.el-button--primary {
          color: #fff !important;
          background-color: #0380ff !important;
          &:hover {
            background-color: rgb(69, 127, 244) !important;
          }
        }
      }
    }
  }

  // ------------------------- 新风格弹窗样式 开始 --------------------
  // dialog
  .el-dialog.LatestStyle {
    --el-dialog-padding-primary: 0px;
    .el-dialog__header {
      display: flex;
      background: #f3f5f9;
      padding: 14px 16px;
      font-weight: 600;
      min-height: 45px;
      box-sizing: border-box;
      .el-dialog__title {
        --el-text-color-primary: #000000;
        --el-dialog-title-font-size: 18px;
        --el-dialog-font-line-height: 19.2px;
      }

      .el-dialog__headerbtn .el-dialog__close {
        color: #000;
        font-size: 1.5rem;
      }
    }

    .el-dialog__body {
      min-height: 45mm;
      padding: 0 10px;
      background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
      .table-auto {
        background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
        .tbl-top-con,
        .tablePanel {
          padding: 0 !important;
          .cus-form {
            padding: 6px 0;
          }
        }
      }
    }

    .el-dialog__footer {
      padding: 2mm 15px;
      box-shadow: 0 -6px 11px 0 #8e989f33;
    }

    &.noFooter {
      .el-dialog__footer {
        padding: 3px;
        box-shadow: none;
      }
    }
  }
  .LatestStyle
    .el-dialog.LatestStyle
    .el-dialog__footer
    .tan_dialog
    button.el-button:not(.is-link),
  #LatestStyle
    .el-dialog.LatestStyle
    .el-dialog__footer
    .tan_dialog
    button.el-button:not(.is-link),
  .el-dialog.LatestStyle .el-dialog__footer .tan_dialog button.el-button:not(.is-link) {
    height: 30px !important;
    line-height: 30px !important;
    min-width: 64px !important;
    border-radius: 2px !important;
    padding: 4px 15px !important;
  }

  .unPadding.el-dialog.LatestStyle .el-dialog__body {
    padding: 0 !important;
  }

  .unPadding.el-dialog.LatestStyle .el-dialog__body .cus-form {
    padding: 0 !important;
  }
  // ------------------------- 新风格弹窗样式 结束 --------------------
</style>
