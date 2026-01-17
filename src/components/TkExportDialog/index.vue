<template>
  <tk-dialog :dlgObj="exportData">
    <TkCheckbox v-model:list="checkList"></TkCheckbox>
  </tk-dialog>
</template>

<script setup>
import {ref, reactive,  watch } from "vue";
import TkCheckbox from "@/components/TkCheckbox";

const checkList = ref([]);

//编辑弹出框
const exportData = reactive(useDlg());
exportData.width = "600";

exportData.handlerConfirm = () => {
  if (confirmCallBack) {
   confirmCallBack(checkList.value);
  }
};


const attrList = ref([]);
const confirmCallBack = ref();

function doComInit(_attrList,_confirmCallBack) {  
  attrList.value = _attrList;
  confirmCallBack.value = _confirmCallBack;

  exportData.openDlg("选择导出属性")
}

defineExpose({ doComInit });

</script>

<style lang="less" scoped>
.tk-form-item {
  display: flex;
  &-label {
    &::before {
      content: "\002a";
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  &-notrRequired {
    &::before {
      content: " ";
      margin-right: 16px;
    }
  }
}
</style>
