<template>
  <el-drawer
    v-if="dlgObj.visible"
    :class="[
      dlgObj.customClass,
      {
        blueImgBg: !dlgObj.width || dlgObj.width === '100%',
        'no-padding-body':
          dlgObj.cssType && dlgObj.cssType.includes('noPaddingBody'),
        LatestStyle: `LatestStyle`,
      },
    ]"
    v-model="dlgObj.visible"
    :title="dlgObj.title"
    :size="dlgObj.width || '100%'"
    :direction="dlgObj.direction"
    :append-to-body="dlgObj.appendToBody"
    :destroy-on-close="!!dlgObj.destroyOnClose"
    :before-close="dlgObj.close"
    :show-close="false"
    :close-on-click-modal="dlgObj.closeOnClickModal"
    :close-on-press-escape="dlgObj.closeOnClickModal"
    :modal="dlgObj.modalPenetrable === undefined ? true : !dlgObj.modalPenetrable"
    :modal-penetrable="dlgObj.modalPenetrable"
  >
    <template #header>
      <div class="drawerData-title" v-if="dlgObj.headerData">
        <template v-if="dlgObj.title">
          <div v-html="dlgObj.title"></div>
        </template>
        <template v-else>
          <slot name="headerTitle"></slot>
        </template>
        <div class="flex">
          <slot name="middle"></slot>
        </div>
        <div class="flex arrowRow">
          <slot name="headerBtn"></slot>

          <div
            v-if="
              dlgObj.headerData.totalPage >= 1 && dlgObj.headerData.curPage > 0
            "
            class="statistics_row"
          >
            <el-button
              class="arrow"
              plain
              :disabled="dlgObj.headerData.curPage == '1'"
              @click="dlgObj.headerData.handleChange('up')"
            >
              <img :src="require('@/assets/imgs/tk_arrow.png')" alt="" />
            </el-button>

            <span class="statistics">
              <span class="currNumber">{{ dlgObj.headerData.curPage }}</span
              ><span class="totalNumber"
                >/{{ dlgObj.headerData.totalPage }}</span
              >
            </span>

            <el-button
              class="arrow right"
              plain
              :disabled="
                dlgObj.headerData.totalPage == dlgObj.headerData.curPage
              "
              @click="dlgObj.headerData.handleChange('down')"
            >
              <img :src="require('@/assets/imgs/tk_arrow.png')" alt="" />
            </el-button>
          </div>
        </div>
      </div>
      <div class="drawerData-title" v-else>
        <template v-if="dlgObj.title">
          <div v-html="dlgObj.title"></div>
        </template>
        <template v-else>
          <slot name="headerTitle"></slot>
        </template>

        <div class="flex">
          <slot name="middle"></slot>
        </div>

        <div class="flex">
          <slot name="headerBtn"></slot>
        </div>
      </div>

      <el-link
        v-if="!dlgObj.hideTopClose"
        class="closeButtonCustom"
        type="primary"
        :underline="false"
        @click="dlgObj.cancel"
        >{{ dlgObj.closeButtonCustomText
        }}<svg-icon class-name="ic_return2" icon-class="ic_return2"
      /></el-link>
    </template>
    <slot></slot>

    <template #footer>
      <div v-if="dlgObj.footer">
        <div class="drawerData-footer">
          <el-button
            type="primary"
            v-if="dlgObj.hasCancel"
            :loading="dlgObj.confirmLoading"
            @click="dlgObj.cancel"
            >{{ dlgObj.cancelBtn }}</el-button
          >

          <el-button
            v-if="dlgObj.hasConfirm"
            type="primary"
            plain
            :disabled="dlgObj.confirmDisabled || dlgObj.confirmLoading"
            @click="dlgObj.confirm"
            >{{ dlgObj.sureBtn }}</el-button
          >
        </div>
      </div>
    </template>
  </el-drawer>
</template>
<script setup>
const props = defineProps({
  // 弹出框数据
  dlgObj: {
    type: Object,
    default: {
      width: "80%",
      visible: false,
      title: "",
      direction: "rtl",
      appendToBody: true,
      modalPenetrable: false, // 是否允许遮罩层穿透，true 时遮罩层可穿透（不显示遮罩），false 时显示遮罩
    },
  },
});
</script>
<style lang="less">
.drawerData-title {
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1.2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawerData-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 8px 0;
}

.flex {
  display: flex;
}

.no-padding-body {
  .el-drawer__body {
    padding: 0;
  }
}

.closeButtonCustom {
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1.1px;
  .svg-icon {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}

// ------------- 新风格 开始 ------------------
.LatestStyle,
#LatestStyle {
  .drawerData-title {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: #3370ff;
    }
  }
  .el-drawer__body {
    background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
    .table-auto {
      background-image: linear-gradient(180deg, #e1eaff 3%, #ffffff 50%);
    }
  }
  .el-drawer__footer {
    // 添加阴影效果，使其与上方内容区分开
    box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #f0f0f0;
  }
  .el-drawer__footer button.el-button:not(.is-link) {
    height: 36px !important;
    line-height: 36px !important;
    min-width: 112px !important;
    border-radius: 2px !important;
  }
}
#LatestStyle .el-drawer__header,
.LatestStyle .el-drawer__header {
  font-weight: 600 !important;
  font-size: 18px !important;
  color: #000000d9 !important;
  background: #f5f7fb !important;
  padding: 10px 20px 10px 30px !important;
}

#LatestStyle .el-drawer.blueImgBg .el-drawer__body,
.el-drawer.blueImgBg .el-drawer__body {
  // background-image: url("@/assets/imgs/tk_workbench_header_bg.png");
  // background-position: 0 -120px;
  // background-repeat: no-repeat;
  // background-size: 100% auto;
  // background-color: rgba(224, 238, 253, 0.6);
  padding: 0!important;
  box-sizing: border-box;
  background-color: #fff;
}

.LatestStyle.el-drawer.blueImgBg .el-drawer__body .table-auto,
#LatestStyle .el-drawer.blueImgBg .el-drawer__body .table-auto {
  background-image: none;
}

.ic_return2 {
  width: 24px !important;
  height: 24px !important;
}

.drawerHeader_button .el-drawer,
.drawerHeader_button #app .el-drawer {
  .el-drawer__header {
    background-color: #0380ff !important;
    color: #fff !important;
    .drawerData-title {
      padding-left: 25px;
      &::after {
        background-color: transparent;
        width: 30px;
        height: 30px;
        background-image: url("@/assets/imgs/tkPaperIcon.png");
        background-size: 30px 30px; /* or contain based on your needs */
        background-position: 0 0; /* 居中显示 */
        background-repeat: no-repeat; /* 不重复 */
      }
    }
    .arrowRow {
      .el-button.is-plain {
        background-color: transparent;
      }
      .statistics_row {
        margin-left: 40px;
        .statistics {
          padding: 20px;
          .currNumber {
            font-size: 24px;
          }
          .totalNumber {
            font-size: 16px;
          }
        }

        .arrow {
          height: 18px !important;
          line-height: 18px !important;
          width: 18px !important;
          box-sizing: border-box;
          border: none !important;
          background: #52a8ff !important;
          border-radius: 2px !important;
          padding: 0 !important;
          &.right {
            transform: rotate(180deg);
          }
        }
      }
    }
    .closeButtonCustom {
      padding: 8px 10px;
      background-color: #fff;
      border-radius: 5px;
      margin-left: 30px;
    }
  }
  .el-drawer__body {
    padding: 0;
  }
}
// ------------- 新风格 结束 ------------------
</style>
