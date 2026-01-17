<template>
  <div class="height100">
    <iframe id="paperAnswerViewRender" class="height100 width100" :src="'static/tk_preview_ui/paperAnswerView.html?viewType=layout&project='+project"></iframe>
  </div>
</template>

<script setup>
import {nextTick} from 'vue'
const project = process.env.VUE_APP_PROJECT
let paperAnswerDataParam

function postPaperData() {
  var wn = document.getElementById('paperAnswerViewRender').contentWindow;
  if (paperAnswerDataParam?.comType == 'page') {
    wn.postMessage(paperAnswerDataParam, '*');
  } else {
    wn.onload = function() {
      wn.postMessage(paperAnswerDataParam, '*');
    }
  }
}

// 接受子页面的内容 ,点击操作按钮事件处理
window.addEventListener('message', function(e) {
  if (paperAnswerDataParam?.comType == 'page' && e.data?.loadOverCls) {
    nextTick(() => {
      // var wn = document.getElementById('paperAnswerViewRender').contentWindow;
      // document.body.innerHTML = (wn.document.head.innerHTML||'') + (wn.document.body.innerHTML||'')
      $('body').addClass(e.data?.loadOverCls)
    })
  }
});

// 初始化组件，渲染数据
function doComInit (paperAnswerData) {
  paperAnswerDataParam = paperAnswerData
  postPaperData()
}

defineExpose({ doComInit })
</script>

<style lang="less" scoped>
</style>
