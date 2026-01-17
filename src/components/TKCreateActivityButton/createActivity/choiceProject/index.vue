<template>
  <div class="choiceProject main-page height100">
    <!-- handleCleanChoicePorject清除选择 -->
    <tk-table :tableObj="tableObj" :searchFormObj="searchForm">
      <template #formright>
        <el-button type="primary" @click="handleCreateProject">新建项目</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="projectStatus[row.status || 0].type">{{ projectStatus[row.status || 0].label }}</el-tag>
      </template>
      <template #selectItem="{ row }">
        <svg-icon
          v-if="currProject?.name === row.name"
          icon-class="ic_hook_round"
          class="ic_hook_round"
          color="#06A362"
        ></svg-icon>
        <el-link :type="row.status === '2' ? 'info' : 'primary'" @click="handleChoice(row)" v-else>选择</el-link>
      </template>
    </tk-table>

    <!-- 新建命题项目表单弹窗 -->
    <CreateProjectFormPop ref="CreateProjectFormPopRef"></CreateProjectFormPop>
  </div>
</template>

<script setup>
import CreateProjectFormPop from "@/components/TKCreateActivityButton/CreateProjectFormPop";
import { reactive, ref, onMounted } from "vue";

let changeProject = null; //通知父页面修改项目名称显示的方法
const CreateProjectFormPopRef = ref(null); //新建命题项目弹窗Dom
const currProject = ref({}); //当前选择的项目
const projectStatus = tkEnumData.ACT_STATUS; //命题项目活动状态列表

//表格上方查询
const searchForm = reactive(useForm());
searchForm.inline = true;
searchForm.buildFormConfig("input", "searchKey", "", {
  width: "12rem",
  placeholder: "请输入项目名称",
  hiddenWordLimit: true,
});
searchForm.buildFormConfig("select", "status", 1, {
  width: "12rem",
  placeholder: "请选择状态",
  options: [
    { label: "进行中", value: 1 },
    { label: "已结束", value: 2 },
  ],
});

//表格
const tableObj = reactive(useTable());
tableObj.path = "ApiGetProjectList";
tableObj.catchName = "project";
tableObj.param = { status: 1 };
tableObj.column = [
  { label: "序号" },
  { label: "项目名称", prop: "name" },
  { label: "备注信息", prop: "description", align: "left" },
  { label: "命题活动", prop: "activityCount", minWidth: 60 },
  {
    label: "项目状态",
    prop: "status",
    slot: "status",
    minWidth: 60,
  },
  {
    label: "起止时间",
    prop: "abortTimeString",
    minWidth: 150,
    formatter: (row) => {
      if (row["startTime"]) {
        return (
          (row["startTime"] + "").tkDateStringFormart("yyyy-MM-dd") +
          " 至 " +
          (row["abortTime"] + "").tkDateStringFormart("yyyy-MM-dd")
        );
      }
    },
  },
  { label: "创建人员", prop: "createrName" },
  {
    label: "创建时间",
    prop: "createTime",
    align: "center",
    formatter: (row) => {
      return row["createTime"] ? (row["createTime"] + "").tkDateStringFormart() : "";
    },
  },
  {
    label: "项目选择",
    prop: "selectItem",
    slot: "selectItem",
    width: 80,
  },
  {
    label: "操作",
    type: "operations",
    width: 150,
    btnList: [
      {
        label: "修改",
        disabledFun: (row) => row.status === "2", // 已结束状态不可修改
        func: handleEditoRow,
      },
      {
        label: "删除",
        func: handleDele,
      },
    ],
  },
];

tableObj.search = () => {
  tableObj.param.searchKey = searchForm.formData.searchKey;
  tableObj.param.status = searchForm.formData.status;
  tableObj.loadTable();
};

//选择该项目
function handleChoice(row) {
  currProject.value = row;
  changeProject(row.name);
}

function handleCleanChoicePorject(a, b, c) {
  tkConfirm("确认删除选择项目？", "提示", {
    type: "warning",
    draggable: true,
    closeOnClickModal: false,
  })
    .then(() => {
      currProject.value = undefined;
    })
    .catch((err) => {
      a.stopPropagation();
    });
}

// 删除项目
function handleDele(row) {
  if (row?.projectActivityLength) {
    tkMessage.warn("提示：该项目下已有活动，请先删除活动！");
    return;
  }
  tkConfirm("确认删除该项目？", "提示", { type: "warning", draggable: true, closeOnClickModal: false })
    .then(() => {
      tkReq()
        .path("ApiDelProject")
        .param({
          id: row.id,
        })
        .succ((res) => {
          tkMessage.succ("项目删除成功");
          tableObj.search();
        })
        .send();
    })
    .catch(() => {});
}

// 新建命题项目 弹窗打开
function handleCreateProject() {
  CreateProjectFormPopRef.value.doComInit({
    callbackFunc: tableObj.search,
  });
}

// 修改命题项目 弹窗打开
function handleEditoRow(row) {
  // 已结束状态不可修改
  if (row.status === "2") return;
  CreateProjectFormPopRef.value.doComInit({
    assginFormData: row,
    callbackFunc: tableObj.search,
  });
}

// 启动组件
function doComInit(params, changeProjectMethod) {
  changeProject = changeProjectMethod;
  currProject.value = params;
  tableObj.search();
}

function doSubmit() {
  const ret = {
    succ: true,
    data: currProject.value,
  };

  if (!currProject.value) {
    ret.succ = false;
  }

  return ret;
}

function doSubmitTemp() {
  const ret = {
    succ: true,
    data: currProject.value,
  };

  return ret;
}

defineExpose({ doComInit, doSubmit, doSubmitTemp });
</script>

<style lang="less">
#LatestStyle .choiceProject .table-auto .tbl-top-con {
  padding: 0 20px !important;
}
.LatestStyle .table-auto .el-table .ic_hook_round {
  font-size: 18px !important;
}
</style>
