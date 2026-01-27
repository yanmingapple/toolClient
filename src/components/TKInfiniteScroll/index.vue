<!--滚动翻页-->
<template>
  <div ref="loopDivRef" v-infinite-scroll="loadNextHandler" :infinite-scroll-disabled="isInfiniteScrollDisabled" 
  :infinite-scroll-distance="30"
  :style="`height: ${styleHeight}; overflow: auto;`">
    <template v-for="(_t, index) in dataList">
      <slot name="content" :value="_t" :idx="index">

      </slot>
    </template>

    <el-empty description="没有检索到数据" v-if="dataList.length == 0" style="height: 650px;overflow-y:auto;text-align:center;"></el-empty>


    <div align="center" v-if="dataList.length > 0">
      <div class="drawer-footer">
        <span v-if="pullStatus === 0">向上拉取,获取更多数据</span>
        <span v-if="pullStatus === 1">加载中……</span>
        <span v-if="pullStatus === 2">没有更多数据了</span>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

const 
loopDivRef = ref(),
isInfiniteScrollDisabled = ref(false),
pullStatus = ref(0),
pageIndex = ref(0),
pageSize = ref(10),
allDataList = ref([]),
dataList = ref([]),
styleHeight = ref("650px")
;

function loadNextHandler(){
  if(pullStatus.value != 0){
    return;
  }

  pullStatus.value = 1;
  isInfiniteScrollDisabled.value = true;

  if(allDataList.value.length > pageSize.value*pageIndex.value){
    pageIndex.value += 1
    dataList.value = allDataList.value.slice(0 ,pageSize.value*pageIndex.value)
    if(allDataList.value.length >= pageSize.value*(pageIndex.value)){
      pullStatus.value = 0;
    }else{
      pullStatus.value = 2;
    }
  }else{
    pullStatus.value = 2;
  }
  isInfiniteScrollDisabled.value = false;
}

function doComInit(data,height){
  if(height)
    styleHeight.value = height

  allDataList.value = data?data:[];
  pullStatus.value = 0
  
  pageSize.value = 10
  pageIndex.value = 0;
  dataList.value = []

  loadNextHandler();
}

function scrollTop(){
pageIndex.value = 0
loopDivRef.value.scrollTop = 0;
}

defineExpose({doComInit,scrollTop});
</script>
<style>
.drawer-footer{
  color:#abadb1

}
</style>
