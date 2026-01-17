<template>
  <tk-dialog :dlgObj="dlgObjData">
    <div v-if="paramsData.tipsStr" class="msg-con" v-html="paramsData.tipsStr"></div>
    <!-- 列表展示 -->
    <div v-if="paramsData.tipsType == 'list' && paramsData.ListData.length > 0" class="list-con mt10">
      <label v-html="paramsData.listName||''"></label>
      <div class="list">
        <div class="list-item" v-for="(item, index) in paramsData.ListData" :key="index" v-html="item"></div>
      </div>
    </div>
  </tk-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
const paramsData = ref({})
  , dlgObjData = reactive(useDlg());
dlgObjData.width = 500
dlgObjData.hasConfirm = false
dlgObjData.cancelBtn = '关闭'

// 设置组件参数
function doComInit(params) {
  paramsData.value = {...params}
  dlgObjData.openDlg(params?.title??'提示')
}

defineExpose({ doComInit });
</script>

<style lang="less" scoped>
.list-con {
  display: flex;
  align-items: center;
  border: 1px solid #c4c2c2;
  label {
    padding: 0 10px;
  }
  .list {
    flex: 1;
    border-left: 1px solid #c4c2c2;
    &-item {
      line-height: 1.8;
      text-align: center;
      border-bottom: 1px solid #c4c2c2;
      background-color: rgba(73, 162, 255, 0.1) !important;
      &:last-of-type {
        border: none;
      }
    }
  }
}
</style>
