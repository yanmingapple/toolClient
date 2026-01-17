<template>
  <div class="height100">
    <iframe id="paperViewRender" class="height100 width100" :src="'static/tk_preview_ui/paperViewEditor.html?viewType=layout&project='+project"></iframe>
  </div>
</template>

<script setup>
const props = defineProps({
  editData: {
    require: true,
    type: Object,
  },
})
  , project = process.env.VUE_APP_PROJECT
  , optList = [
    { label: '预览试卷排版', type: 'success', optType: 'preview'},
    { label: '重置试卷排版', type: 'warning', optType: 'reset'},
    { label: '保存试卷排版', type: 'primary', optType: 'save', funcName: 'saveHandler'},
    { label: '查看上次排版', type: 'primary', optType: 'previewLastTypeSet'},
    { label: '打印', type: 'info', optType: 'print'},
  ]
  , optFunc = {
    saveHandler
  }
let paperId = ''
// 设置隐藏的按钮
function setBtnsVisible() {
  optList.forEach(_b => {
    if(props.editData?.optHiddenBtns?.includes(_b.optType)) {
      _b['visible'] = 'hidden'
    }
  });
}
// 保存试卷排版
function saveHandler(paperHtmlStr, noPassArr) {
  if (noPassArr && Array.isArray(noPassArr) && noPassArr.length > 0) {
    for (let i = 0; i < noPassArr.length; i++) {
      const _n = noPassArr[i]
      if (_n.vali) {
        tkMessage.warn(_n.tips);
        return
      }
    }
  }
  paperHtmlStr = $.base64.encode(tkTools.utf16to8(paperHtmlStr), "utf-8");
  const blob = new Blob([paperHtmlStr],{type:"text/plain"})
  const file = new File([blob], "", {type:blob.type})
  tkReq()
      .path("uploadFile")
      .param({action: 'uploadimage'})
      .file(file)
      .fileName()
      .succ((res) => {
        if (res?.ret?.resMap?.id) {
          let paramObj = {
            paperId,
            paperHtml: res?.ret?.resMap?.id,
            paperEditVersion: 3,
          }
          paramObj = Object.assign(paramObj, props.editData?.saveParam?.paramObj??{})
          // tkReq()
          //   .path(props.editData?.saveParam?.path??"savePaper")
          //   .param(paramObj)
          //   .succ((res) => {
          //     tkMessage.succ("保存成功！");
          //   })
          //   .send();
        }
      })
      .send();
}
// 接受子页面的内容 ,点击操作按钮事件处理
window.addEventListener('message', function(e) {
  // WinMessage iframe内部提示信息转换成系统提示
  // funcName 操作按钮需要在外层处理的事件
  if (e.data.WinMessage && tkMessage[e.data.WinMessage] && tkMessage[e.data.WinMessage] instanceof Function && e.data.tips) {
    tkMessage[e.data.WinMessage](e.data.tips);
  } else if (e.data.funcName && optFunc[e.data.funcName] && optFunc[e.data.funcName] instanceof Function) {
    optFunc[e.data.funcName](e.data.paperHtmlStr, e.data.noPassArr)
  }
});

// 设置试卷数据
function postPaperData(paperData) {
  var wn = document.getElementById('paperViewRender').contentWindow;
  wn.onload = function() {
    wn.postMessage({paperData, optList}, '*');
  }
}
// 初始化组件，渲染数据
function doComInit (paperData) {
  paperId = paperData?.paper?.[0]?.paperId
  setBtnsVisible()
  postPaperData(paperData)
}
defineExpose({ doComInit })

</script>

<style lang="less" scoped>
</style>
