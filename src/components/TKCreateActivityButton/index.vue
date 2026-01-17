<template>
  <el-dropdown placement="bottom-start">
    <el-button type="primary" plain class="AddActivityButton">新建活动
      <svg-icon style="margin-left: 5px" icon-class="ic_move_down2" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(_option,_optionIndex) in newTypeList" :key="_optionIndex"  @click="option[_option].fun"
          >{{option[_option].desc}}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 批量新建 -->
  <ExcelImport ref="excelImportDrawerDlgRef"></ExcelImport>

  <!-- 单个表单新建 -->
  <ActivityForm ref="activityFormRef"></ActivityForm>

  <!-- 单个新建走快捷流程 -->
  <CreateActivity ref="createActivityDlgRef"></CreateActivity>

  <!-- 切换项目 弹窗 -->
  <TKSwitchProjectPop ref="TKSwitchProjectPopRef"></TKSwitchProjectPop>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import ExcelImport from "./ExcelImport";
import ActivityForm from "./ActivityForm";
import CreateActivity from "./createActivity"; //新建活动
import json from "../TkSheet/global/json";
import TKSwitchProjectPop from "../TKSwitchProjectPop";

// ------------------- 变量 -------------------------
const props = defineProps({
  activityRelatedData: {
    type: Object,
    default: () => {},
  },
  newTypeList: {
    type: Array,
    default: () => ["createActivity", "batchCreateActivity", "flowCreateActivity"],
  },
});
const TKSwitchProjectPopRef = ref(null); //切换项目dom
const excelImportDrawerDlgRef = ref();
const activityFormRef = ref();
const createActivityDlgRef = ref();
const currActivityRelatedData = reactive({
  projectData: {},
  subjectLabelList: [],
  subjectList: [],
});

const option ={
  "createActivity":{
    desc:"新建活动",
    fun:handlerCreateActivity
  },
  "batchCreateActivity":{
    desc:"批量新建活动",
    fun:handlerBatchCreateActivity
  },
  "flowCreateActivity":{
    desc:"流程新建活动",
    fun:handlerOpenCreateActivitity
  },
}




// ------------------- watch -------------------------
watch(
  () => props.activityRelatedData,
  (newValue, oldValue) => {
    currActivityRelatedData.projectData = newValue?.projectData ?? {};
    currActivityRelatedData.subjectLabelList = newValue?.subjectList?.map((_el) => _el.label) ?? [];
    currActivityRelatedData.subjectList = newValue?.subjectList ?? [];
  },
  { deep: true, immediate: true }
);

// ------------------- method -------------------------

// 批量新建活动
function handlerBatchCreateActivity() {
  if (props.activityRelatedData?.projectData?.id) {
    excelImportDrawerDlgRef.value.openDlg({
      projectData: currActivityRelatedData.projectData,
      subjectLabelList: currActivityRelatedData.subjectList.map((_el) => _el.label),
      callbackMethod: props.activityRelatedData.callbackMethod,
    });
  } else {
    TKSwitchProjectPopRef.value?.doComInit((_project) => {
      // 切换成功回调
      currActivityRelatedData.projectData = _project;
      // 切换成功回调
      excelImportDrawerDlgRef.value.openDlg({
        projectData: currActivityRelatedData.projectData,
        subjectLabelList: currActivityRelatedData.subjectList.map((_el) => _el.label),
        callbackMethod: props.activityRelatedData.callbackMethod,
      });
    });
  }
}

// 单个新建活动
function handlerCreateActivity() {
  if (props.activityRelatedData?.projectData?.id) {
    activityFormRef.value.doComInit({
      subjectList: currActivityRelatedData.subjectList,
      projectData: currActivityRelatedData.projectData,
      callbackMethod: props.activityRelatedData.callbackMethod,
    });
  } else {
    TKSwitchProjectPopRef.value?.doComInit((_project) => {
      // 切换成功回调
      currActivityRelatedData.projectData = _project;
      activityFormRef.value.doComInit({
        subjectList: currActivityRelatedData.subjectList,
        projectData: currActivityRelatedData.projectData,
        callbackMethod: props.activityRelatedData.callbackMethod,
      });
    });
  }
}
// 修改 单个新建活动
function handlerEditActivity(AssignmentFormData, projectData) {
  activityFormRef.value.doComInit({
    subjectList: currActivityRelatedData.subjectList,
    projectData: projectData || currActivityRelatedData.projectData,
    AssignmentFormData,
    callbackMethod: props.activityRelatedData.callbackMethod,
  });
}

//单个新建活动  流程化
async function handlerOpenCreateActivitity() {
  const { ret = [] } = await tkReq().path("getSubjectListOfSel").param({ delFlag: 0 }).noLoading().send();
  if (!ret.length) {
    tkMessage.err("当前用户未配置" + tkGlobalData().value.subName + "权限，请联系管理员。");
    return;
  }

  const res = await tkReq().path("queryUserStageTempData").param({ type: "createActivity" }).send();


  if (res?.ret?.tempData) {
    tkConfirm("是否加载上次创建活动数据?", "提示", {
      type: "warning",
      draggable: true,
      closeOnClickModal: false,
      customClass: "LatestStyle",
    })
      .then(() => {
        const tempData = JSON.parse(res.ret.tempData);

        const jsonData = JSON.stringify(
          currActivityRelatedData.projectData
            ? { ...tempData, project: currActivityRelatedData.projectData, curstepVal: 2 }
            : tempData
        );
        createActivityDlgRef.value.doComInit({
          jsonData,
          delStepList: props.activityRelatedData.delStepList,
          callbackMethod: props.activityRelatedData.callbackMethod,
        });
      })
      .catch(() => {
        const jsonData = JSON.stringify(
          currActivityRelatedData?.projectData ? { project: currActivityRelatedData.projectData, curstepVal: 2 } : ""
        );
        createActivityDlgRef.value.doComInit({
          jsonData,
          delStepList: props.activityRelatedData.delStepList,
          callbackMethod: props.activityRelatedData.callbackMethod,
        });
      });
  } else {
    const jsonData = JSON.stringify(
      currActivityRelatedData?.projectData ? { project: currActivityRelatedData.projectData, curstepVal: 2 } : ""
    );
    createActivityDlgRef.value.doComInit({
      jsonData,
      delStepList: props.activityRelatedData.delStepList,
      callbackMethod: props.activityRelatedData.callbackMethod,
    });
  }
}

defineExpose({ handlerEditActivity });
</script>

<style lang="less" scoped>
:deep(.el-dropdown-menu__item) {
  padding: 10px 32px !important;
  --el-font-size-base: 16px;
  --el-text-color-regular: #000;
  letter-spacing: 1.1px;
}
</style>
