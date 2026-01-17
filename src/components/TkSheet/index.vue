<template>
  <div
    :id="container"
    style="margin: 0px; padding: 0px; width: 100%; height: 100%"
  ></div>
</template>

<script setup>
import "./plugins/css/pluginsCss.css";
import "./plugins/plugins.css";
import "./css/luckysheet.css";
import "./assets/iconfont/iconfont.css";


import "./plugins/js/plugin.js";
import luckysheet from "./sheet.js";

import { nextTick, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  sheetConfig:{},
  container:{
    type: String,
    default: 'luckysheetDiv',
  }
});

const buildOption = function () {
  nextTick(()=>{
    // 确保容器元素存在
    const containerEl = document.getElementById(props.container);
    if (!containerEl) {
      console.error(`容器元素 #${props.container} 不存在`);
      return;
    }

    // 检查容器是否有有效的尺寸
    const rect = containerEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`容器元素 #${props.container} 尺寸为0，延迟初始化`);
      setTimeout(() => buildOption(), 100);
      return;
    }

    // 如果已存在实例，先销毁
    try {
      if (luckysheet && typeof luckysheet.destroy === 'function') {
        luckysheet.destroy();
      }
    } catch (error) {
      // 忽略销毁错误
    }

    var options = {
      container: props.container, //luckysheet为容器id
      title: "-------------",
      data: [{ "name": "Sheet1", color: "", "status": "1", "order": "0", "data": [], "config": {}, "index":0 }]
    };
    $.extend(options, props.sheetConfig);

    try {
      luckysheet.create(options);
    } catch (error) {
      console.error('创建 luckysheet 失败:', error);
    }
  });
};

const initOptions = function () {
  let options = null;
  nextTick(()=>{
    const containerId = "luckysheetDiv";
    // 确保容器元素存在
    const containerEl = document.getElementById(containerId);
    if (!containerEl) {
      console.error(`容器元素 #${containerId} 不存在`);
      return;
    }

    // 检查容器是否有有效的尺寸
    const rect = containerEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`容器元素 #${containerId} 尺寸为0，延迟初始化`);
      setTimeout(() => initOptions(), 100);
      return;
    }

    // 如果已存在实例，先销毁
    try {
      if (luckysheet && typeof luckysheet.destroy === 'function') {
        luckysheet.destroy();
      }
    } catch (error) {
      // 忽略销毁错误
    }

    options = {
      container: containerId, //luckysheet为容器id
      title: "-------------",
      data: [{ "name": "Sheet1", color: "", "status": "1", "order": "0", "data": [], "config": {}, "index":0 }]
    };
    $.extend(options, props.sheetConfig);

    try {
      luckysheet.create(options);
    } catch (error) {
      console.error('创建 luckysheet 失败:', error);
    }
  });
  return options;
};




const getLuckysheet = function(){
  return luckysheet;
}

const destroySheet = function(){
  try {
    if (luckysheet && typeof luckysheet.destroy === 'function') {
      luckysheet.destroy();
    }
  } catch (error) {
    console.error('销毁 luckysheet 失败:', error);
  }
}

const getSheetData = ()=>{
    const sheetData = luckysheet.getSheetData();
    const retData = sheetData.filter(data =>{
      const notNullData = data.filter(subData =>{return (subData != null && subData.v)});
      return notNullData.length > 0;
    })
    return retData;
}

//插入批注
const insertComment =(r,c,comment)=>{
  luckysheet.insertComment(r,c,comment);
}

//删除批注
const delComment =(r,c)=>{
  try {
    luckysheet.delComment(r,c);
  } catch (error) {
  }
}

// 完成当前编辑，保存正在输入的单元格内容
const finishEditing = function(){
  try {
    if (luckysheet && typeof luckysheet.exitEditMode === 'function') {
      luckysheet.exitEditMode();
    }
  } catch (error) {
    console.error('完成编辑失败:', error);
  }
}

// 组件卸载时自动销毁
onBeforeUnmount(() => {
  destroySheet();
});

// 主动暴露childMethod方法
defineExpose({ getLuckysheet,buildOption,destroySheet,getSheetData ,insertComment,delComment,finishEditing});
</script>
<style lang="less" scoped>
/* 自定义loading演示样式 */
@keyframes loading-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

.loadingAnimation {
  width: 3em;
  height: 3em;
  animation: loading-rotate 2s linear infinite;
}

.loadingAnimation circle {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: currentColor;
  stroke-linecap: round;
}
</style>
