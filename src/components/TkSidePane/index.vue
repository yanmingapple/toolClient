<template>
  <div
    class="side-pane"
    :class="{ fold: fold }"
    :style="{ height: props.height }"
  >
    <!-- 侧边内容 -->
    <div
      class="side-pane-left"
      :style="{ width: fold ? '0' : props.sideWidth }"
      v-if="props.Direction === 'left'"
    >
      <svg-icon
        :class-name="'fold-btn-left ' + (fold ? 'fold' : 'unfold')"
        :icon-class="fold ? 'ic_arrow_right' : 'ic_arrow_left'"
        @click="changeFold"
      />
      <transition name="side-pane-left">
        <div class="side-pane-left-con" v-show="!fold">
          <div class="side-pane-left-header" v-if="$slots.leftHeader">
            <slot name="leftHeader"></slot>
          </div>

          <!-- 侧边主体内容区 -->
          <div class="side-pane-left-body">
            <slot name="left"></slot>
          </div>
        </div>
      </transition>
    </div>

    <!-- 主体内容 -->
    <div
      class="side-pane-main"
      :style="(props.Direction === 'left' ? { marginLeft } : { marginRight }) +
      (';width: ' + (fold ? '100%' : 'calc(100% - ' + props.sideWidth + ')'))"
    >
      <div class="side-pane-main-header" v-if="$slots.mainHeader">
        <slot name="mainHeader"></slot>
      </div>

      <!-- 主体内容区 -->
      <div class="side-pane-main-body">
        <slot name="main"></slot>
      </div>
    </div>

    <!-- 侧边内容 -->
    <div
      class="side-pane-right"
      :style="{ width: fold ? '0' : props.sideWidth }"
      v-if="props.Direction === 'right'"
    >
      <svg-icon
        :class-name="'fold-btn-right ' + (fold ? 'fold' : 'unfold')"
        :icon-class="fold ? 'ic_arrow_left' : 'ic_arrow_right'"
        @click="changeFold"
      />
      <transition name="side-pane-right">
        <div class="side-pane-right-con" v-show="!fold">
          <div class="side-pane-right-header" v-if="$slots.rightHeader">
            <slot name="rightHeader"></slot>
          </div>

          <!-- 侧边主体内容区 -->
          <div class="side-pane-right-body">
            <slot name="right"></slot>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  Direction: {
    type: String,
    default: "left",
  },
  height: {
    type: String,
    default: "100%",
  },
  sideWidth: {
    type: String,
    default: "25%",
  },
  leftHidden: {
    type: Boolean,
    default: false,
  },
});
const fold = ref(props.leftHidden);
const bodyPadding = computed(() => {
  if (props.Direction === "left") {
    return fold.value ? "8px 18px" : "0";
  } else {
    return fold.value ? "0px 26px 0 0" : "0px 30px 0px 0px";
  }
});
const marginLeft = computed(() => {
  return fold.value ? 0 : props.sideWidth;
});
const marginRight = computed(() => {
  return fold.value ? 0 : props.sideWidth;
});

/**
 * @method changeFold 收起/展开侧边菜单
 */
const changeFold = () => {
  fold.value = !fold.value;
};
</script>
<style lang="less" scoped>
.side-pane {
  display: flex;
  background-color: #fff;
  .side-pane-main {
    height: 100%;
    .side-pane-main-body {
      height: 100%;
      overflow: auto;
    }
  }
  .side-pane-left, .side-pane-right {
    position: relative;
  }
  .side-pane-left {
    border: 1px solid #ccc;
    .side-pane-left-con, .side-pane-left-body {
      height: 100%;
    }
  }
  .side-pane-right {
    border: 1px solid #ccc;
    .side-pane-right-con, .side-pane-right-body {
      height: 100%;
    }
  }
  .fold-btn-left,
  .fold-btn-right {
    position: absolute;
    width: 16px;
    height: 200px;
    top: calc(50% - 100px);
    color: #666;
    border: 1px solid #ccc;
    background-color: #d0d0d0;
    // z-index: 9;
    &:hover {
      background-color: #ddd;
    }
  }
  .fold-btn-left {
    right: -17px;
    cursor: pointer;
  }
  .fold-btn-right {
    left: -17px;
    cursor: pointer;
  }


  // 收缩
  &.fold {
    .side-pane-left, .side-pane-right {
      // height: 0;
      border: none;
    }
  }
}
</style>
