<template>
  <div :class="['custom-collapse', { unClickable: !clickable }]">
    <!-- 标题区域 -->
    <div v-if="!hideTitle" :class="['collapse-header', headerClass]" @click="handleClick">
      <div class="title">
        <div class="title_icon" v-if="svgIcon">
          <svg-icon :icon-class="svgIcon" />
        </div>

        <div class="title_img" v-else>
          <img :src="require('@/assets/imgs/customCollapse.png')" />
        </div>
        <div>{{ title }}</div>
        <slot name="afterTitle"></slot>
      </div>
      <slot name="right"></slot>
    </div>
    <!-- 内容区域 -->
    <transition name="slide">
      <div v-show="!collapse" class="collapse-content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    hideTitle: {
      // 👈 新增：控制是否隐藏标题
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    //   modelValue: {
    //     type: Boolean,
    //     default: false,
    //   },
    headerClass: {
      type: String,
      default: '',
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    svgIcon: {
      type: String,
      default: '',
    },
  });

  // const emit = defineEmits(["update:modelValue"]);

  let collapse = ref(false);

  function toggle() {
    collapse.value = !collapse.value;
    //   emit("update:modelValue", collapse.value);
  }

  function handleClick() {
    if (props.clickable) {
      toggle();
    }
  }
</script>

<style lang="less" scoped>
  .custom-collapse {
    border: 1px solid #cacedb;
    overflow: hidden;
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
    &:hover {
      border: 1px solid #0380ff;
    }
    &.unHover {
      border: 1px solid #cacedb;
    }

    &.unClickable {
      border: none;
      &.custom-collapse {
        &:hover {
          border: none;
        }
        .collapse-content {
          padding: 0 !important;
        }
      }
    }
  }

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    background: #f8f9fd;
    color: #000;

    cursor: pointer;
    transition: background-color 0.3s;
    border: 1px solid transparent;
    border-bottom: 1px solid #cacedb;
    box-sizing: border-box;
    font-size: 13px;

    .title {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #000000;
      background: #f8f9fd;
      font-weight: bold;
      .title_img {
        display: flex;
        align-items: center;
        width: 19px;
        height: auto;
        margin-right: 2px;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .title_icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 8px;
        .svg-icon {
          width: 17px;
          height: 17px;
        }
      }
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: max-height 0.3s ease-out;
    max-height: 744px;
    overflow: hidden;
  }

  .slide-enter,
  .slide-leave-to {
    max-height: 0;
  }

  .collapse-content {
    display: flex;
    flex-direction: column;
    gap: 11px;
    color: #000000;
    padding: 8px 15px;
    box-sizing: border-box;
  }

  .custom-collapse-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-edit{
     .custom-collapse {
    border: 0.265mm solid #cacedb;
    overflow: hidden;
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
    &:hover {
      border: 0.265mm solid #0380ff;
    }
    &.unHover {
      border: 0.265mm solid #cacedb;
    }

    &.unClickable {
      border: none;
      &.custom-collapse {
        &:hover {
          border: none;
        }
        .collapse-content {
          padding: 0 !important;
        }
      }
    }
  }

  .collapse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3mm 0mm;
    background: #f8f9fd;
    color: #000;

    cursor: pointer;
    transition: background-color 0.3s;
    border: 0.265mm solid transparent;
    border-bottom: 0.265mm solid #cacedb;
    box-sizing: border-box;
    font-size: 3.4mm;

    .title {
      display: flex;
      align-items: center;
      font-size: 3.5mm;
      color: #000000;
      background: #f8f9fd;
      font-weight: bold;
      .title_img {
        display: flex;
        align-items: center;
        width: 5mm;
        height: auto;
        margin-right: 0.5mm;
        img {
          width: 100%;
          height: 100%;
        }
      }

      .title_icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 2mm;
        .svg-icon {
          width: 4 5mm;
          height: 4.5mm;
        }
      }
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: max-height 0.3s ease-out;
    max-height: 196.85mm;
    overflow: hidden;
  }

  .slide-enter,
  .slide-leave-to {
    max-height: 0;
  }

  .collapse-content {
    display: flex;
    flex-direction: column;
    gap: 3mm;
    color: #000000;
    padding: 2mm 4mm;
    box-sizing: border-box;
  }

  .custom-collapse-header {
    flex-direction: column;
    align-items: flex-start;
  }
  }
</style>
