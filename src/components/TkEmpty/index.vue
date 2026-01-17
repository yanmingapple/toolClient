<template>
  <div class="empty_com" v-if="show">
    <div class="empty_com_icon">
      <img :src="iconSrc" :alt="text" :style="{ width: imageSize + 'px' }" />
      <div class="text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({
  name: "EmptyCom",
});

const props = defineProps({
  // 是否显示空状态
  show: {
    type: Boolean,
    default: true,
  },
  // 空状态文本
  text: {
    type: String,
    default: "暂无数据",
  },
  // 图标路径，支持自定义
  icon: {
    type: String,
    default: "",
  },
  // 是否使用默认图标
  useDefaultIcon: {
    type: Boolean,
    default: true,
  },
  imageSize: {
    type: Number,
    default: 120,
  },
});

// 计算图标路径
const iconSrc = computed(() => {
  if (props.icon) {
    return props.icon;
  }
  if (props.useDefaultIcon) {
    return require("@/assets/imgs/tk_workbench_main_icon1.png");
  }
  return "";
});
</script>

<style lang="less" scoped>
.empty_com {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;

  .empty_com_icon {
    width: 100%;
    max-width: 300px;
    min-width: 110px;
    text-align: center;

    img {
      width: 100%;
      height: auto;
    }

    .text {
      font-weight: 500 !important;
      font-size: 1.2rem !important;
      color: #000000d9 !important;
      text-align: center;
    }
  }
}
</style>
