<template>
  <div class="TkTabs" ref="TkTabs">
    <div class="tabs__nav-wrap">
      <div class="tabs__nav-scroll">
        <span
          class="el-tabs__nav-prev"
          v-if="isScoroll"
          @click="handleLeftMoved"
        >
          <svg-icon icon-class="ic_to_prev"></svg-icon>
        </span>
        <span
          class="el-tabs__nav-next"
          v-if="isScoroll"
          @click="handleRightMoved"
        >
          <svg-icon icon-class="ic_to_next"></svg-icon>
        </span>
        <ul
          class="tabs__nav"
          v-if="!isArray"
          ref="tabsNav"
          :style="{ transform: `translateX(${xDistance}px)` }"
        >
          <li
            :class="[
              'tabs__item',
              'is-closable',
              'tabs__nav',
              (tabItem.clsName||''),
              { 'is-active': props.modelValue === key },
            ]"
            v-for="(tabItem, key) in tabMaps"
            :key="tabItem + 'tabs' + key"
            @click="hanldeClick({ label: tabItem, value: key })"
          >
            {{ tabItem }}
            <slot name="tabItemRight" :value="key"></slot>
          </li>
          <slot name="tabLeft"></slot>
        </ul>

        <ul
          class="tabs__nav"
          :style="{ transform: `translateX(${xDistance}px)` }"
          ref="tabsNav"
          v-else
        >
          <li
            :class="[
              'tabs__item',
              'is-closable',
              'tabs__nav',
              (tabItem.clsName||''),
              { 'is-active': props.modelValue === tabItem.value },
            ]"
            v-for="(tabItem, tabIndex) in tabMaps"
            :key="tabItem.value + 'tabs' + tabIndex"
            @click="hanldeClick({ label: tabItem.label, value: tabItem.value })"
          >
            {{ tabItem.label }}
          </li>
          <slot name="tabLeft"></slot>
        </ul>
        <div>
          <slot name="tabRight"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";

const props = defineProps({
  tabMaps: {
    type: Object,
    require: true,
    defalt: () => {},
  },
  modelValue: {
    type: [Number, String],
    defalt: "",
  },
});
const emits = defineEmits(["update:modelValue", "change"]);
const xDistance = ref(0);
const tabsNav = ref(null);
const TkTabs = ref(null);

const isScoroll = ref(false);

const isArray = computed(() => {
  return Array.isArray(props.tabMaps);
});
const hanldeClick = (currItem) => {
  emits("update:modelValue", currItem.value);
  emits("change", currItem);
};

const handleRightMoved = () => {
  nextTick(() => {
    const offsetWidth = tabsNav.value?.offsetWidth ?? "0";
    const clientWidth = TkTabs.value?.offsetWidth ?? "0";
    if (xDistance.value * -1 >= offsetWidth - clientWidth) return;
    xDistance.value = xDistance.value - 300;
  });
};

const handleLeftMoved = () => {
  if (xDistance.value >= 0) return;
  xDistance.value = xDistance.value + 300;
};

watch(
  () => props.tabMaps,
  (newValue) => {
    setIsScroll()
  },
  { deep: true }
);
function setIsScroll() {
  nextTick(() => {
    const offsetWidth = tabsNav.value?.offsetWidth ?? "0";
    const clientWidth = TkTabs.value?.offsetWidth ?? "0";
    isScoroll.value = offsetWidth > clientWidth;
  });
}

onMounted(() => {
  setIsScroll()
});
</script>

<style lang="less" scoped>
// 主题色
@primary-color: #0380ff;
@text-active: #0380ff;
@text-inactive: #666;
@border-color: #e4e7ed;

.TkTabs {
  border-bottom: 1px solid @border-color;
  padding: 0;
  position: relative;
  background: #fff;

  .tabs__nav-wrap {
    overflow: hidden;
    position: relative;

    .tabs__nav-scroll {
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      padding: 0 15px;
      box-sizing: border-box;
      min-height: 48px;
      position: relative;

      .tabs__nav {
        display: flex;
        border: none;
        box-sizing: border-box;
        white-space: nowrap;
        position: relative;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        float: left;
        z-index: 2;
        gap: 32px;

        .tabs__item {
          margin: 0;
          border: none;
          border-radius: 0;
          transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 12px 0;
          box-sizing: border-box;
          display: inline-block;
          font-size: 14px;
          font-weight: 500;
          color: @text-inactive;
          position: relative;
          cursor: pointer;
          background: transparent;
          white-space: nowrap;
          user-select: none;

          // 悬停效果
          &:hover {
            color: @text-active;
          }

          // 激活状态
          &.is-active {
            color: @text-active;
            font-weight: 600;

            // 底部蓝色下划线（稍微超出文字宽度）
            &::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 50%;
              transform: translateX(-50%);
              width: calc(100% + 8px);
              height: 2px;
              background: @primary-color;
              animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          }

          // 激活且可关闭
          &.is-active.is-closable {
            padding-left: 0;
            padding-right: 0;
          }
        }
      }
    }
  }
}

// 导航按钮样式
.el-tabs__nav-next,
.el-tabs__nav-prev {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  width: 32px;
  height: 32px;
  padding: 0;
  color: @text-inactive;
  background: #fff;
  border: 1px solid @border-color;
  border-radius: 6px;
  z-index: 10;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    color: @primary-color;
    border-color: @primary-color;
    background: rgba(3, 128, 255, 0.08);
    box-shadow: 0 2px 6px rgba(3, 128, 255, 0.12);
    transform: translateY(-50%) translateY(-1px);
  }

  &:active {
    transform: translateY(-50%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .ic_to_next,
  .ic_to_prev {
    width: 16px;
    height: 16px;
    transition: transform 0.2s;
  }

  &:hover .ic_to_next,
  &:hover .ic_to_prev {
    transform: scale(1.1);
  }
}

.el-tabs__nav-prev {
  left: 8px;
}

.el-tabs__nav-next {
  right: 8px;
}

// 下划线滑入动画
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

// Element UI 深度样式覆盖
:deep(.el-tabs__item) {
  height: auto !important;
  line-height: 1.5 !important;
  padding: 12px 0 !important;
}
</style>
