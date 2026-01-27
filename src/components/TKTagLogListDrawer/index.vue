<template>
  <!-- 标签日志 -->
  <tk-drawer :dlgObj="dlgData">
    <tk-table :tableObj="tbl" :searchFormObj="searchForm"> </tk-table>
  </tk-drawer>
</template>

<script setup>

import { ref, reactive, nextTick } from "vue";
import { getAcitivityRolesList, getRolesList } from "@/store/tkStore";
const actData = reactive(tkTransferParamsData("/activity/activityDetail", "multi"));
let dlgData = reactive(useDlg());
dlgData.width = "100%";
// dlgData.cssType = ['noPaddingBody']

// 表格数据
const tbl = reactive(useTable());
tbl.path = "getTagLogList";
tbl.column = [
  { label: "序号" },
  { label: "日志描述", prop: "description" },
  { label: "操作时间", prop: "createTimeStr", width: 200 },
];
//搜索功能
tbl.search = () => {
  tbl.param["searchKey"] = searchForm.formData.searchKey;
  tbl.loadTable();
};

// 搜索
const searchForm = reactive(useForm());
searchForm.inline = true;
searchForm.formConfig = [
  {
    placeholder: "请输入日志描述或试题编号关键字",
    prop: "searchKey",
    type: "input",
    hiddenWordLimit: true,
    width: "15rem",
  },
];
searchForm.setInitFormData();

// 初始化组件
function doComInit(params) {
  let actR = getAcitivityRolesList(),
    r = getRolesList();
  console.log(actR, r);
  tbl.param = {
    subjectId: actData.subjectId,
    bizId: actData.id || actData.actid,
    expand: "Item",
  };
  if (!actR?.value?.find((_a) => _a.type == 0) && !r?.value?.find((_r) => _r.type == 0)) {
    //更新hasResetPw状态，不显示是否重置弹窗
    let sessionLoginData = localStorage.getItem("sessionLoginData")
      ? JSON.parse(localStorage.getItem("sessionLoginData"))
      : {};
    tbl.param["userId"] = sessionLoginData.userId;
  }
  tbl.pageObj.currentPage = 1;
  tbl.loadTable();
  dlgData.openDlg("标签日志");
}

defineExpose({ doComInit });
</script>

<style lang="less" scoped></style>
