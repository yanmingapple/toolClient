<template>
  <tk-sheet ref="mytksheet" :sheetConfig="sheetConfig" container="batchImportUserDiv"> </tk-sheet>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, defineProps, nextTick } from "vue";
import TkSheet from "@/components/TkSheet";
import { DanxuanConfig } from "./excelTemp/danXuansheetTable.js";

const sheetConfig = ref();
const mytksheet = ref({});

//mytksheet.value.destroySheet();

let projectId;
let activityData = {}; //用于映射活动与活动类型

const doComInit = async (treeData, activityList) => {
  const danxuanConfig = new DanxuanConfig();
  sheetConfig.value = danxuanConfig.getData();

  // 安全检查：确保 data 数组存在且有元素
  if (!sheetConfig.value?.data || !Array.isArray(sheetConfig.value.data) || sheetConfig.value.data.length === 0) {
    console.error("sheetConfig.data 未正确初始化");
    return;
  }

  if (!sheetConfig.value.data[0]?.data) {
    console.error("sheetConfig.data[0].data 未正确初始化");
    return;
  }

  let dataList = sheetConfig.value.data[0].data;

  if (activityList?.length) {
    activityList.forEach((_el) => {
      activityData[_el.name] = _el.activityTypeName;
    });

    let value = activityList?.map((_el) => _el.name)?.join(",") ?? [];
    sheetConfig.value.data[0].dataVerification = formatVerification({
      columnIndex: "0",
      dataLength: sheetConfig.value.data[0].data.length,
      value: value,
    });
  }

  let index = 1;

  if (treeData?.length) {
    function loop(el) {
      //当前行数据有没有，没有创建
      if (!dataList[index]) {
        dataList[index] = [];
      }
      dataList[index][0] = { m: el.activityName, v: el.activityName, ct: { fa: "General", t: "g" } };
      dataList[index][1] = { m: el.userName, v: el.userName, ct: { fa: "General", t: "g" } };
      dataList[index][2] = { m: el.userIdCard, v: el.userIdCard, ct: { fa: "General", t: "g" } };
      dataList[index][3] = { m: el.userPhone, v: el.userPhone, ct: { fa: "General", t: "g" } };

      index++;
    }

    treeData.forEach((el, index) => {
      loop(el);
    });
  } else {
    // 确保 dataList[1] 存在
    if (!dataList[1]) {
      dataList[1] = [];
    }
    dataList[1][0] = { m: "", v: "", ct: { fa: "General", t: "g" } };
    dataList[1][1] = { m: "张三", v: "张三", ct: { fa: "General", t: "g" } };
    dataList[1][2] = { m: "420621184411442222", v: "420621184411442222", ct: { fa: "General", t: "g" } };
    dataList[1][3] = { m: "133xxxx", v: "133xxxx", ct: { fa: "General", t: "g" } };
  }

  sheetConfig.value.hook.workbookCreateAfter = (book) => {
    danxuanConfig.luckSheet = mytksheet.value.getLuckysheet();
  };

  // 当单元格更新后，如果单元格有内容，则清除该单元格的批注（校验错误标记）
  sheetConfig.value.hook.cellUpdated = (r, c, oldValue, newValue, isRefresh) => {
    // 如果新值存在且有内容，清除该单元格的批注
    if (newValue && (newValue.m || newValue.v)) {
      try {
        mytksheet.value.delComment(r, c);
      } catch (error) {
        // 忽略删除批注时的错误
      }
    }
  };

  await nextTick();
  mytksheet.value.buildOption();
};

function doSubmit() {
  const ret = {
    succ: true,
    data: [],
  };

  // 保存当前正在编辑的单元格内容
  mytksheet.value.finishEditing();

  const sheetData = mytksheet.value.getSheetData();

  // 安全检查：确保 sheetData 存在且有数据
  if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
    tkMessage.warn("没有内容需要提交");
    ret.succ = false;
    return ret;
  }

  if (sheetData.length == 1) {
    tkMessage.warn("没有内容需要提交");
    ret.succ = false;
    return ret;
  }

  let isError = false;

  const hearder = sheetData[0];

  // 安全检查：确保 hearder 存在
  if (!hearder || !Array.isArray(hearder)) {
    tkMessage.warn("数据格式错误");
    ret.succ = false;
    return ret;
  }

  const existActivityName = [];
  // 用于记录身份证号及其出现的行号，用于检测重复
  const userIdCardMap = new Map();

  for (var i = 1; i < sheetData.length; i++) {
    const data = sheetData[i];
    if (!data || !Array.isArray(data)) {
      continue;
    }

    // 获取活动名称，去除首尾空格
    const activityName = data[0]?.m ? String(data[0].m).trim() : "";
    const userName = data[1]?.m ? String(data[1].m).trim() : "";
    const userIdCard = data[2]?.m ? String(data[2].m).trim() : "";

    if (!activityName) {
      isError = true;
      mytksheet.value.insertComment(i, 0, `${hearder[0]?.m || "活动名称"}没有填写`);
    } else {
      // 只有当活动名称有内容，且教师姓名也有内容时，才认为该活动已设置教师信息
      if (userName) {
        // 避免重复添加相同的活动名称
        if (!existActivityName.includes(activityName)) {
          existActivityName.push(activityName);
        }
      }
    }

    if (!userName) {
      isError = true;
      mytksheet.value.insertComment(i, 1, `${hearder[1]?.m || "教师姓名"}没有填写`);
    }

    if (!userIdCard) {
      isError = true;
      mytksheet.value.insertComment(i, 2, `${hearder[2]?.m || "身份证"}没有填写`);
    } else {
      // 记录身份证号及其出现的行号
      if (!userIdCardMap.has(userIdCard)) {
        userIdCardMap.set(userIdCard, []);
      }
      userIdCardMap.get(userIdCard).push(i);
    }
  }

  // 检查身份证号是否重复
  for (const [userIdCard, rowIndexes] of userIdCardMap.entries()) {
    if (rowIndexes.length > 1) {
      // 如果身份证号出现多次，在所有出现该身份证的行添加批注
      isError = true;
      rowIndexes.forEach((rowIndex) => {
        mytksheet.value.insertComment(rowIndex, 2, `${hearder[2]?.m || "身份证"}重复`);
      });
    }
  }

  const notSetActivity = [];
  for (let key in activityData) {
    if (!existActivityName.includes(key)) {
      notSetActivity.push(key);
    }
  }

  if (notSetActivity.length > 0) {
    isError = true;
    let errorMessage = "";
    if (notSetActivity.length === 1) {
      errorMessage = `活动"${notSetActivity[0]}"未设置教师信息，请至少为该活动添加一条教师数据`;
    } else {
      const maxDisplayCount = 5; // 最多显示的活动数量
      const displayActivities = notSetActivity.slice(0, maxDisplayCount);
      const remainingCount = notSetActivity.length - maxDisplayCount;

      if (remainingCount > 0) {
        errorMessage = `共有 ${notSetActivity.length} 个活动未设置教师信息：${displayActivities.map(name => `"${name}"`).join("、")}等，请为这些活动至少各添加一条教师数据`;
      } else {
        errorMessage = `共有 ${notSetActivity.length} 个活动未设置教师信息：${displayActivities.map(name => `"${name}"`).join("、")}，请为这些活动至少各添加一条教师数据`;
      }
    }
    tkMessage.warn(errorMessage);
    ret.succ = false;
    return ret;
  }

  if (isError) {
    tkMessage.warn("请关注有错误提示的行");
    ret.succ = false;
    return ret;
  }

  let paramArray = [];
  for (var i = 1; i < sheetData.length; i++) {
    const data = sheetData[i];
    // 安全检查：确保 data 存在且为数组
    if (!data || !Array.isArray(data)) {
      continue;
    }

    // 获取活动名称，去除首尾空格，用于匹配 activityData
    const activityName = data[0]?.m ? String(data[0].m).trim() : "";

    let newCurrData = {
      activityName: activityName,
      userName: data[1]?.m ? String(data[1].m).trim() : "",
      userIdCard: data[2]?.m ? String(data[2].m).trim() : "",
      userPhone: data[3]?.m ? String(data[3].m).trim() : undefined,
      activityTypeName: activityData[activityName] || "",
    };

    paramArray.push(newCurrData);
  }

  ret.data = paramArray;
  return ret;
}

function doSubmitTemp() {
  const ret = {
    succ: true,
    data: [],
  };

  const sheetData = mytksheet.value.getSheetData();

  // 安全检查：确保 sheetData 存在且有数据
  if (!sheetData || !Array.isArray(sheetData) || sheetData.length <= 1) {
    return ret;
  }

  let paramArray = [];
  for (var i = 1; i < sheetData.length; i++) {
    const data = sheetData[i];
    // 安全检查：确保 data 存在且为数组
    if (!data || !Array.isArray(data)) {
      continue;
    }

    // 获取活动名称，去除首尾空格，用于匹配 activityData
    const activityName = data[0]?.m ? String(data[0].m).trim() : "";

    let newCurrData = {
      activityName: activityName,
      userName: data[1]?.m ? String(data[1].m).trim() : "",
      userIdCard: data[2]?.m ? String(data[2].m).trim() : "",
      userPhone: data[3]?.m ? String(data[3].m).trim() : undefined,
      activityTypeName: activityData[activityName] || "",
    };

    paramArray.push(newCurrData);
  }

  ret.data = paramArray;
  return ret;
}

// 表格内容 格式修改 （下拉）
function formatVerification({ columnIndex, dataLength, value }) {
  let dataVerification = {};
  if (!value) return dataVerification;

  let dropdownTypeData = {
    type: "dropdown",
    type2: false, //多选true 单选false
    value1: value,
    value2: value,
    checked: false,
    remote: false,
    prohibitInput: false,
    hintShow: false,
    hintText: "",
  };

  //   单选和多选内容下拉
  for (let rowIndex = 1; rowIndex < dataLength; rowIndex++) {
    dataVerification[`${rowIndex}_${columnIndex}`] = {
      ...dropdownTypeData,
    };
  }
  return dataVerification;
}

defineExpose({ doComInit, doSubmit, doSubmitTemp });
</script>

<style lang="less" scoped></style>
