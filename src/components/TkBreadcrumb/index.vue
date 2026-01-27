<template>
  <div class="tk-breadcrumb" v-bind="$attrs">
    <div class="bread-left-con">
      <el-link v-if="hasReturn" type="primary" title="返回" @click="onReturn"
        ><svg-icon class-name="ic_return" icon-class="ic_return"
      /></el-link>
      <el-breadcrumb>
        <el-breadcrumb-item v-for="(item, index) in breadData" :key="index">{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
      <slot name="breadLeft"></slot>
    </div>
    <div class="bread-right-con">
      <slot name="breadRight"> </slot>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
const $route = useRoute();

const props = defineProps({
  breadData: { type: Array, default: () => [] },
  hasReturn: { type: Boolean, default: false },
});
// 返回
function onReturn() {
  tkCommit("DEL_QUERY_DATA", $route.path);
  window.history.back();
}
</script>
<style lang="less" scoped>
.tk-breadcrumb {
  height: 40px;
  display: flex;
  align-items: center;
  // background: #f7fbff; //#deeafc;
  border-bottom: 1px solid #dcdfe6;
  .bread-left-con {
    flex: 1;
    display: flex;
    align-items: center;
    .ic_return {
      font-size: 20px;
      color: #0380ff;
    }
    & > * {
      vertical-align: middle;
    }
    :deep(.el-breadcrumb) {
      display: inline-block;
      height: 100%;
      line-height: 40px;
      margin-left: 8px;
      .el-breadcrumb__inner {
        font-weight: 600;
      }
    }
  }
}
</style>
