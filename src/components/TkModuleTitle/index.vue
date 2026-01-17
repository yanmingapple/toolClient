<template>
  <div class="svgIcon">
    <svg-icon :class-name="['svgIcon-svg', props.svgName]" :icon-class="props.svgName" />
    <div>{{ props.svgTile }}</div>
  </div>
</template>

<script setup>
const props =defineProps({
  svgName:String,
  svgTile:String,
})
</script>

<style lang="less" scoped>
.svgIcon {
  display: flex;
  align-items: center;
  color: #2b8ff4;
  font-weight: 600;

  .svgIcon-svg {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    color: #409eff;
  }
}
</style>
