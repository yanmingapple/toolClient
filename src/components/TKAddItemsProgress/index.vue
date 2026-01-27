<template>
  <tk-dialog :dlgObj="dlgData">
    <div class="progress-container">
      <el-progress type="dashboard" :percentage="percentage" :color="colors" :format="formatHandler" />
    </div>
  </tk-dialog>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, reactive, computed } from 'vue'
const  actData = reactive(tkTransferParamsData('/activity/activityDetail', 'multi'))
  , $route = useRoute()
  , props = defineProps({
    dlgData: { type: Object }
  })
  , uploadItemsCount = reactive({
    addedCount: 0,
    totalCount: 0
  })
  , percentage = computed(() => {
    if (uploadItemsCount.totalCount) {
      return tkTools.formatterNumber2(uploadItemsCount.addedCount/uploadItemsCount.totalCount*100)
    } else {
      return 0
    }
  })
  , colors = [
    { color: '#ff8080', percentage: 20 },
    { color: '#e6a23c', percentage: 60 },
    { color: '#5cb87a', percentage: 100 },
  ]
  , timer = ref()
function getProgressData () {
  timer.value =	setTimeout(function() {
    let param = props.dlgData.param
    tkReq()
      .path("getAllItemsToActProgress")
      .noLoading()
      .param(param)
      .succ((res) => {
        console.log("🚀 ~ getProgressData ~ res):", res)
        
        if (res?.ret && res.ret?.isFinished === '0') {
          uploadItemsCount.addedCount = res.ret.importInfo.addedCount
          uploadItemsCount.totalCount = res.ret.importInfo.totalCount
          getProgressData()
        } else {
          props.dlgData.closeDlg()
          tkMessage.succ('操作成功！')
          clearTimeout(timer);
          uploadItemsCount.addedCount = res.ret?.importInfo?.addedCount??0
          uploadItemsCount.totalCount = res.ret?.importInfo?.addedCount??0
          if (props.dlgData.succFun && props.dlgData.succFun instanceof Function) {
            props.dlgData.succFun()
          }
        }
      })
      .err(error => {
        props.dlgData.closeDlg()
      })
      .send()
  }, 1000)
}
function formatHandler() {
  if (uploadItemsCount.totalCount) {
    return uploadItemsCount.addedCount+'/'+uploadItemsCount.totalCount
  } else {
    return 0
  }
}

props.dlgData.open = () => {
  getProgressData()
}
</script>

<style lang="less" scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>