<template>
  <tk-drawer :dlgObj="createActivityDlg">
    <div class="createActivityDrawer">
      <div class="createActivityDrawer_header">
        <StepsOfAll :stepData="stepData"></StepsOfAll>
      </div>
      <div class="createActivityDrawer_main">
        <ChoiceProject v-show="stepData.curstepVal == 1" ref="choiceProjectRef"></ChoiceProject>
        <BatchCreateActivity v-show="stepData.curstepVal == 2" ref="batchCreateActivityRef"></BatchCreateActivity>
        <BatchImportUser v-show="stepData.curstepVal == 3" ref="batchImportUserRef"></BatchImportUser>
        <BatchSetUserActAndRole v-show="stepData.curstepVal == 4" ref="batchSetUserActAndRole"></BatchSetUserActAndRole>
        <BatchExportLoginUser v-show="stepData.curstepVal == 5" ref="batchExportLoginUser"></BatchExportLoginUser>
      </div>

      <div class="createActivityDrawer_footer">
        <Step :stepData="comStepData"></Step>
      </div>
    </div>
  </tk-drawer>
</template>

<script setup>
import { reactive, ref, onMounted, computed, nextTick } from "vue";
import ChoiceProject from "./choiceProject";
import BatchCreateActivity from "./batchCreateActivity";
import BatchImportUser from "./batchImportUser";
import BatchSetUserActAndRole from "./batchSetUserActAndRole";
import BatchExportLoginUser from "./batchExportLoginUser";

const choiceProjectRef = ref(),
  batchCreateActivityRef = ref(),
  batchImportUserRef = ref(),
  batchSetUserActAndRole = ref(),
  batchExportLoginUser = ref(),
  paramsData = ref({ curstepVal: 1 }); //全局数据
const createActivityDlg = reactive(useDlg());
let closeLoadOuterTableMethod = null;
createActivityDlg.appendToBody = true;
createActivityDlg.destroyOnClose = true;
createActivityDlg.width = "100%";
createActivityDlg.closeButtonCustomText = "返回工作台";

// 步骤条
let stepData = reactive({
  hasSplit: true,
  curstepVal: paramsData.value.curstepVal,
  list: [
    { label: "选择项目", value: 1 }, // ,  optFun: func
    {
      label: "新建活动",
      value: 2,
      beforeFun: validateStepStatus,
      disabledFun: () => {
        return paramsData.value.createComplete;
      },
    },
    {
      label: "导入教师",
      value: 3,
      beforeFun: validateStepStatus,
      disabledFun: () => {
        return paramsData.value.createComplete;
      },
    },
    {
      label: "设置角色",
      value: 4,
      beforeFun: validateStepStatus,
      disabledFun: () => {
        return paramsData.value.createComplete;
      },
    },
    {
      label: "完成发布",
      value: 5,
      beforeFun: validateStepStatus,
      disabledFun: () => {
        return paramsData.value.createComplete;
      },
    },
  ],
  succCallback: function () {
    comStepData.curstepVal = stepData.curstepVal;
    paramsData.value.curstepVal = stepData.curstepVal;
    changeStepSuccess(stepData.curstepVal);
  },
});

function validateStepStatus(item, done) {
  //当前节点，不处理
  //点击的步骤 > 当前节点
  if (stepData.curstepVal < item.value) {
    //只有切换一步的时候，校验
    if (item.value - stepData.curstepVal == 1) {
      createActivityNextOperationHandler(item, done);
    } else {
      //切换多个步骤时候，需要校验全局数据
      if (item.value == 3) {
        if (!paramsData.value.activityList) {
          tkMessage.warn("请先新建活动！");
        } else {
          done();
        }
      } else if (item.value == 4) {
        if (!paramsData.value.userList) {
          tkMessage.warn("请先导入教师！");
        } else {
          done();
        }
      } else if (item.value == 5) {
        if (!paramsData.value.groupUserList) {
          tkMessage.warn("请先设置角色！");
        } else {
          done();
        }
      }
    }
  } else if (stepData.curstepVal > item.value) {
    done();
  }
}

// 单个组件的步骤条
let comStepData = reactive({
  curstepVal: paramsData.value.curstepVal,
  hasSplit: false,
  list: [
    [
      {
        label: "下一步：新建活动",
        value: 1,
        beforeFun: (item, done) => {
          createActivityNextOperationHandler(item, done);
        },
      },
      {
        label: "暂存",
        value: 1,
        btnType: "plain",
        disabledFun: () => {
          return paramsData.value.createComplete;
        },
        beforeFun: (item, done) => {
          const ret = choiceProjectRef.value.doSubmitTemp();
          paramsData.value.project = ret.data;
          saveTemp(true);
        },
      },
    ],
    [
      {
        label: "上一步：选择项目",
        value: -1,
        beforeFun: (item, done) => {
          fileTaskPreOperationHandler(item, done);
        },
      },
      {
        label: "下一步：导入教师",
        value: 1,
        beforeFun: (item, done) => {
          createActivityNextOperationHandler(item, done);
        },
      },
      {
        label: "暂存",
        value: 1,
        btnType: "plain",
        disabledFun: () => {
          return paramsData.value.createComplete;
        },
        beforeFun: (item, done) => {
          const ret = batchCreateActivityRef.value.doSubmitTemp();
          paramsData.value.activityList = ret.data;
          saveTemp(true);
        },
      },
    ],
    [
      {
        label: "上一步：新建活动",
        value: -1,
        beforeFun: (item, done) => {
          fileTaskPreOperationHandler(item, done);
        },
      },
      {
        label: "下一步：设置角色",
        value: 1,
        beforeFun: (item, done) => {
          createActivityNextOperationHandler(item, done);
        },
      },
      {
        label: "暂存",
        value: 1,
        btnType: "plain",
        disabledFun: () => {
          return paramsData.value.createComplete;
        },
        beforeFun: (item, done) => {
          const ret = batchImportUserRef.value.doSubmitTemp();
          paramsData.value.userList = ret.data;
          saveTemp(true);
        },
      },
    ],

    [
      {
        label: "上一步：导入教师",
        value: -1,
        beforeFun: (item, done) => {
          if (paramsData.value.createComplete) {
            done();
            return;
          }
          tkConfirm(`切换上一步，将清空当前配置？`, "提示", {
            type: "warning",
            draggable: true,
            closeOnClickModal: false,
          })
            .then(() => {
              delete paramsData.value.groupUserList;
              fileTaskPreOperationHandler(item, done);
            })
            .catch(() => {});
        },
      },
      {
        label: "下一步：完成发布",
        value: 1,
        beforeFun: (item, done) => {
          createActivityNextOperationHandler(item, done);
        },
      },
      {
        label: "暂存",
        value: 1,
        btnType: "plain",
        disabledFun: () => {
          return paramsData.value.createComplete;
        },
        beforeFun: (item, done) => {
          const ret = batchSetUserActAndRole.value.doSubmitTemp();
          paramsData.value.groupUserList = ret.data;
          saveTemp(true);
        },
      },
    ],
    [
      // {
      //   label: "上一步：设置角色",
      //   value: -1,
      //   beforeFun: (item, done) => {
      //     fileTaskPreOperationHandler(item, done);
      //   },
      // },
      {
        label: "关闭",
        value: 1,
        beforeFun: (item, done) => {
          createActivityDlg.closeDlg();

          closeLoadOuterTableMethod();
        },
      },
    ],
  ],

  succCallback: function () {
    stepData.curstepVal = comStepData.curstepVal;
    paramsData.value.curstepVal = stepData.curstepVal;
    changeStepSuccess(comStepData.curstepVal);
  },
});

function onChangeCreateActivityDlgTitle(title) {
  createActivityDlg.title = `新建命题活动（${title}）`;
}

// 步骤切换成功
function changeStepSuccess(curStep) {
  if (curStep === 1) {
    choiceProjectRef.value?.doComInit(paramsData.value?.project, onChangeCreateActivityDlgTitle);
  } else if (curStep === 2) {
    batchCreateActivityRef.value?.doComInit(paramsData.value.project, paramsData.value.activityList);
  } else if (curStep == 3) {
    batchImportUserRef.value?.doComInit(paramsData.value.userList, paramsData.value.activityList);
  } else if (curStep == 4) {
    batchSetUserActAndRole.value?.doComInit(
      paramsData.value.activityList,
      paramsData.value.userList,
      paramsData.value.groupUserList
    );
  } else if (curStep == 5) {
    batchExportLoginUser.value?.doComInit(paramsData.value.groupUserList, paramsData.value.loginUserList);
  }
}

// 上一步操作
function fileTaskPreOperationHandler(item, done) {
  setTkNotificationConfig({ visible: false, list: [] });
  done();
}
// 下一步操作
function createActivityNextOperationHandler(item, done) {
  // paramsData.value.createComplete = true;
  //创建完成就不需要创建
  if (paramsData.value.createComplete) {
    done();
    return;
  }

  //当前第一步时候，需要校验项目是否选择
  if (stepData.curstepVal === 1) {
    const ret = choiceProjectRef.value.doSubmit();
    if (ret.succ) {
      paramsData.value.project = ret.data;
      done();
      saveTemp();
    }
  } else if (stepData.curstepVal === 2) {
    const ret = batchCreateActivityRef.value.doSubmit();
    if (ret.succ) {
      paramsData.value.activityList = ret.data;
      done();
      saveTemp();
    }
  } else if (stepData.curstepVal === 3) {
    const ret = batchImportUserRef.value.doSubmit();
    if (ret.succ) {
      paramsData.value.userList = ret.data;
      done();
      saveTemp();
    }
  } else if (stepData.curstepVal === 4) {
    const ret = batchSetUserActAndRole.value.doSubmit();
    if (ret.succ) {
      paramsData.value.groupUserList = ret.data;
      creatActivityFlow(done);
    } else {
      setTkNotificationConfig({ visible: true, list: ret.tipList });
    }
  } else {
    setTkNotificationConfig({ visible: false, list: [] });
    createActivityDlg.closeDlg();
  }
}

//保存暂存数据
function creatActivityFlow(done) {
  tkReq()
    .path("creatActivityFlow")
    .param({ data: JSON.stringify(paramsData.value.groupUserList) })
    .succ((res) => {
      paramsData.value.loginUserList = res.ret;

      paramsData.value.curstepVal++;
      saveTemp();
      paramsData.value.createComplete = true; //创建完成
      tkMessage.succ("生成账号成功");
      done();
    })
    .send();
}

//保存暂存数据
function saveTemp(tip) {
  tkReq()
    .path("addStageTempData")
    .param({ type: "createActivity", tempData: JSON.stringify(paramsData.value) })
    .succ((res) => {
      if (tip) {
        tkMessage.succ("暂存成功");
      }
    })
    .send();
}

// ----------------------生命周期---------------------------
const doComInit = async ({ jsonData, delStepList, callbackMethod }) => {
  closeLoadOuterTableMethod = callbackMethod;
  setTkNotificationConfig({ visible: false, list: [] });

  if (jsonData) {
    paramsData.value = JSON.parse(jsonData);
  } else {
    //重置数据
    paramsData.value = { curstepVal: 1 };
  }

  // 隐藏选择项目
  if (delStepList) {
    stepData.list = stepData.list.filter((ele) => !delStepList.includes(ele.label));
    comStepData.list = comStepData.list.map((item) => {
      return item.filter((ele) => !delStepList.find((_c) => ele.label.includes(_c)));
    });
  }

  comStepData.curstepVal = stepData.curstepVal = paramsData.value?.curstepVal ?? 1;
  console.log("🚀 ~ doComInit ~ comStepData.curstepVal :", comStepData.curstepVal);

  createActivityDlg.openDlg(
    `新建命题活动${paramsData.value?.project ? "（" + paramsData.value?.project?.name + "）" : ""}`
  );

  await nextTick();

  //打开第一个也签，并加重数据
  changeStepSuccess(stepData.curstepVal);
};

defineExpose({ doComInit });
</script>

<style lang="less" scoped>
.createActivityDrawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  &_header {
  }
  &_main {
    flex: 1;
    background-color: #fff;
  }
  &_footer {
    background-color: #fff;
  }
}
</style>
