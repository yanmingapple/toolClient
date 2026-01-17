
<template>
    <div v-if="pageParams?.total>pageParams?.pageSize" class="simple-pagination-con tk_public_row_between_flex">
      <svg-icon :class-name="pageParams.page == 1 ? 'disabled-btn' : ''" icon-class="ic_arrow_left" @click="changePaperHandler(-1)"/>
      <div class="">
        <el-input-number class="uncontrol" size="default" :min="1" :max="maxPage" v-model="pageParams.page" @change="changeNumHandler"/> / {{Math.ceil(pageParams.total/pageParams.pageSize)}}
      </div>
      <svg-icon :class-name="pageParams.page == maxPage ? 'disabled-btn' : ''" icon-class="ic_arrow_right" @click="changePaperHandler(1)"/>
    </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
const props = defineProps({
  pageParams: { type: Object }
})
  , maxPage = computed(() => {
    return props.pageParams.total && props.pageParams.pageSize ? Math.ceil(props.pageParams.total/props.pageParams.pageSize) : 1
  })

function changePaperHandler(type) {
  if(props.pageParams.page == maxPage.value && type== 1 || props.pageParams.page == 1 && type == -1) return
  props.pageParams.page+=type
  changeNumHandler()
}

function changeNumHandler() {
  if(props.pageParams?.pageChange && props.pageParams.pageChange instanceof Function) props.pageParams.pageChange(props.pageParams.page)
}


</script>
<style lang="less" scoped>
.simple-pagination-con {
  .uncontrol {
    width: 50px;
    :deep(.el-input__inner) {
      text-align: center;
    }
  }
  .svg-icon {
    font-size: 24px;
    color: #3282dc;
    &.disabled-btn {
      cursor: not-allowed;
      color: #aaa;
    }
  }
}
</style>
