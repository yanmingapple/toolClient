<template>
  <el-popover
    popper-class="popper-btns"
    placement="bottom-start"
    :width="popWidth"
    trigger="click"
    @show="popType(false)"
    @hide="popType(true)"
  >
    <template #reference>
      <el-button :disabled="disabled" type="primary" plain>
        {{ groupName }}
        <svg-icon
          :class-name="['btn-group-icon', isRight ? 'to-right' : 'to-bottom']"
          icon-class="ic_to_next"
        />
      </el-button>
    </template>
    <div v-for="(item, index) in btnDatas" :key="'btn_' + index">
      <span v-if="item.bntType === 'link'"  v-permission="item.permission || []" class="mr10">
        <el-link
          :underline="false"
          @click="item.fun && item.fun(item)"
          >{{ item.label }}</el-link
        >
      </span>

      <el-upload
        v-if="item.bntType === 'upload'"
        class="upload-btn"
        :action="item.url"
        :on-error="importError"
        :on-success="
          (response, file, fileList) => {
            importSuccess(response, file, fileList, item.successTxt);
          }
        "
        :before-upload="(file) => beforeUpload(file, item)"
        :show-file-list="false"
        :data="item.data || {}"
        :name="item.name || 'file'"
        :accept="item.accept || ''"
        ref="uploadUserFile"
      >
        <el-link :underline="false">{{ item.label }}</el-link>
      </el-upload>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: "btnGroup",
  props: {
    groupName: { type: String, default: "批量导入" },
    popWidth: { type: String, default: "" },
    btnDatas: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  data: function () {
    return {
      isRight: true,
      fullscreenLoading: false,
    };
  },

  methods: {
    // 右侧图标变动
    popType(type) {
      this.isRight = type;
    },
    // 上传文件
    importError() {
      tkMessage.err("导入失败！");
      this.fullscreenLoading.close();
    },

    importSuccess(response, file, fileList, successTxt) {
      if (response.code === "000000") {
        if (successTxt) tkMessage.succ(successTxt);
        this.$emit("importSuccess", response);
      } else {
        tkMessage.err(response.errMsg || "导入失败！");
      }
      this.fullscreenLoading.close();
    },

    beforeUpload(file, item) {
      let type = file.name
        .substring(file.name.lastIndexOf(".") + 1)
        .trim()
        .toLowerCase();
      if (item.accept && item.accept.indexOf(type) < 0) {
        tkMessage.err(`上传的文件不符合规范，仅支持${item.accept}文件！`);
        return false;
      }
      this.openFullScreen();
      return true;
    },

    // 整页loading
    openFullScreen() {
      this.fullscreenLoading = this.$loading({
        lock: true,
        text: "上传并解析中.....",
        spinner: "el-icon-loading",
        background: "rgba(255, 255, 255, 0.5)",
      });
    },
  },
};
</script>

<style lang="less">
.el-button {
  margin: 0;
  .btn-group-icon {
    display: inline-block;
    &.to-bottom {
      transform: rotate(90deg);
    }
  }
}
.popper-btns.el-popper.el-popover {
  min-width: 80px;
  text-align: center;
  padding: 2px 4px;
  .el-link.el-link--default {
    padding-bottom: 10px;
    &:first-of-type {
      padding-top: 10px;
    }
  }
}
</style>
