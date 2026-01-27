<template>
  <el-steps :active="stepData.active" finish-status="success" simple>
    <el-step v-for="(item, index) in stepData.data" :title="item.title" @click="changeActive(item, index)" />
  </el-steps>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  stepData: {
    type: Object,
    default: () => {
      return {
        data: [],
        active: 0
      }
    },
    require: true,
  },
})

// 上一步
function prev() {
  if(props.stepData.active > 0) {
    props.stepData.active--
  }
}
// 下一步
function next() {
  if(props.stepData.active < (props.stepData?.data?.length??0) - 1) {
    props.stepData.active++
  }
}
// 点击切换当前步骤
function changeActive(item, index) {
  if (item.changeActive && item.changeActive instanceof Function) {
    if (item.changeActive(item, index)) {
      return
    }
  }
  props.stepData.active = index
}
defineExpose({ next });
</script>
<style lang="less" scoped>
  .el-steps--simple {
    padding: 6px 8%;
  }
</style>