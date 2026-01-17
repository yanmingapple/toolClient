<template>
  <div class="footer-con" :style="styleStr">
    <span>{{ systemData.copyRight || '' }}</span>
    <span>{{ systemData.appVersion ? 'V' + systemData.appVersion : ''}}</span>
  </div>
</template>

<script setup>
  import { getTkSystemData } from "@/store/tkStore";

  const props = defineProps({
    styleStr: {type: String, default: ''}
  })
  const systemData  = getTkSystemData();
</script>

<style lang="less" scoped>
.footer-con {
  background-color: #000;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-size: 13px;
  padding: 2px 0;
  span {
    margin-right: 10px;

    &:last-of-type {
      margin-right: 0;
    }
  }
}
</style>
