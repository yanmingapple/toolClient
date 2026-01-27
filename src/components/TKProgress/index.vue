<template>
  <tk-dialog :dlgObj="editorDlg">
    <div>
      <div class="TKProgress">
        <el-progress
          type="circle"
          :stroke-width="10"
          :indeterminate="true"
          :percentage="percentage"
          :color="colors"
        />
      </div>

      <div
        v-if="percentage < 100 && percentage > 0"
        style="margin-top: 20px; font-size: 14px"
      >
        正在处理中，请稍候...
      </div>

      <div v-else-if="percentage == 100" class="slot-content">
        <el-button
          v-if="showRefreshButton"
          type="primary"
          @click="triggerRefresh"
          >刷新</el-button
        >
        <slot></slot>
      </div>
    </div>
  </tk-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
const props = defineProps({
  showRefreshButton: {
    type: Boolean,
    default: false, // 默认显示刷新按钮
  },
});
//编辑表格弹出框
const editorDlg = reactive(useDlg());
editorDlg.width = "250";
editorDlg.hasConfirm = false;
editorDlg.hasCancel = false;
editorDlg.showClose = false;

const percentage = ref(0);

const colors = [
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
];

const emit = defineEmits(["refresh"]);

// 子组件内触发刷新事件
const triggerRefresh = () => {
  emit("refresh");
};

function doComInit(title) {
  percentage.value = 0;
  editorDlg.openDlg(title ?? "执行过程中，请勿刷新");
}

function doChange(currNum, totalNum) {
  percentage.value = Number.parseInt((currNum / totalNum) * 100);
  if (percentage.value == 100) {
    editorDlg.title = props.showRefreshButton
      ? "执行完成，点击刷新"
      : "执行完成";
  }
}

function doClose() {
  editorDlg.closeDlg();
}

defineExpose({ doComInit, doChange, doClose });
</script>

<style lang="less" scoped>
.TKProgress {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slot-content {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
