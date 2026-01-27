<template>
  <div class="height100">
    <iframe id="paperViewRender" :class="'height100 width100'" :src="'static/tk_preview_ui/paperView.html?viewType=layout&project='+project"></iframe>
  </div>
</template>

<script setup>
import {ref, nextTick} from 'vue'
const project = process.env.VUE_APP_PROJECT
let paperDataParam

function postPaperData() {
  var wn = document.getElementById('paperViewRender').contentWindow;
  if (paperDataParam?.comType == 'page') {
    wn.postMessage(paperDataParam, '*');
  } else {
    wn.onload = function() {
      wn.postMessage(paperDataParam, '*');
    }
  }
}

// 接受子页面的内容 ,点击操作按钮事件处理
window.addEventListener('message', function(e) {
  if (paperDataParam?.comType == 'page' && e.data?.loadOverCls) {
    nextTick(() => {
      // var wn = document.getElementById('paperViewRender').contentWindow;
      // document.body.innerHTML = (wn.document.head.innerHTML||'') + (wn.document.body.innerHTML||'')
      $('body').addClass(e.data?.loadOverCls)
    })
  }
});

// 初始化组件，渲染数据
function doComInit (paperData) {
  paperDataParam = paperData
  postPaperData()
}

defineExpose({ doComInit })
</script>

<style scoped>
</style>
