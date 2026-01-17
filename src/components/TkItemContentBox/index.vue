<template>
  <div :class="'topic-items flexStart item-' + size">
    <span v-if="dataObj.title" class="topic-items__position topic-itemCode">{{dataObj.title}}</span>
    <div :class="'topic-items__position topic-items__line ml10 content-box ' + dataObj.lineClass">
        <slot name="content">
          <span v-if="dataObj.title" >&nbsp;</span>
        </slot>
    </div>
  </div>
</template>
<script setup>
import { reactive, watchEffect } from "vue";
const props = defineProps({
  dataObj: { type: Object, default: () => {
      return {};
    },
  },
  size: { type: String, default: 'normal' }
});
</script>
<style lang="less" scoped>
.topic-items {
  display: flex;
  align-items: start;
  box-sizing: border-box;
  &+.topic-items {
    margin-top: 10px;
  }
  &.item-normal {}
  .topic-itemCode {
    padding: 0.125rem 0.4375rem;
    border-radius: 0.25rem;
    opacity: 1;
    border: 1px solid #b4d7ff;
    color: #000;
    font-size: 0.875rem;
    font-weight: 400;
    white-space: nowrap;
  }
  .topic-items__position.topic-items__line {
    flex: 1;
    border-bottom: 1px dashed #b4d7ff;
    padding-bottom: 0.25rem;
    &.unBorder{
      border-bottom: none;
    }
  }
  &.item-smaller {
    .topic-itemCode,
    .topic-items__position.topic-items__line {
      // font-size: 0.8rem;
      // *, :deep(*) {
      //   font-size: 0.8rem;
      // }
    }
  }
}
</style>
