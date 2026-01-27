<template>
  <div class="tk-detail">
    <ul>
      <li
        v-for="(item, index) in data"
        :class="'divide' + (item.divide || 1)"
        :key="index"
      >
        <label v-if="item.label"
          ><span>{{ item.label }}</span
          ><span>：</span></label
        >
        <slot v-if="item.slot" :name="item.slot" :itemData="item.data"></slot>
        <span
          v-else
          v-html="item.value"
          @click="
            item.clickHan && typeof item.clickHan === 'function'
              ? item.clickHan(item)
              : ''
          "
        ></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] },
});
</script>

<style lang="less" scoped>
.tk-detail {
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: inline-block;
    margin-bottom: 6px;
    vertical-align: top;
    label,
    span {
      vertical-align: top;
      display: inline-block;
    }
    label {
      span {
        &:first-of-type {
          width: 90px;
          text-align: right;
          letter-spacing: 1.2px;
        }
        &:last-of-type {
          width: 16px;
        }
      }
    }
    span {
      width: calc(100% - 106px);
      word-break: break-all;
    }
    &.divide1 {
      display: block;
    }
    &.divide2 {
      width: 50%;
    }
    &.divide3 {
      width: 33%;
    }
  }
}
</style>
