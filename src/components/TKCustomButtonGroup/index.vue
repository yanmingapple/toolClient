<template>
  <div class="TKCustomButtonGroup">
    <div
      :class="['TKCustomButton', { active: isActive(option.value) }]"
      v-for="option in options"
      :key="'TKCustomButton' + option.value"
      @click="handleButtonClick(option.value)"
    >
      <div>{{ option.label }}</div>
      <div class="count" v-if="option?.count">{{ option?.count }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: "",
  },
  options: {
    type: Array,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "onButtonClick"]);

// 用于存储选中的按钮
const normalizeToArray = (val) => (Array.isArray(val) ? val : [val ?? ""]);
const selectedValues = ref(normalizeToArray(props.modelValue));

// 父组件更新 modelValue 时，同步内部选中状态
watch(
  () => props.modelValue,
  (val) => {
    selectedValues.value = normalizeToArray(val);
  }
);

const handleButtonClick = (value) => {
  if (props.multiple) {
    // 多选模式
    if (selectedValues.value.includes(value)) {
      // 如果已经选中，则移除
      selectedValues.value = selectedValues.value.filter((item) => item !== value);
    } else {
      // 否则添加
      selectedValues.value.push(value);
    }
  } else {
    // 单选模式
    selectedValues.value = [value];
  }
  emit("update:modelValue", props.multiple ? selectedValues.value : selectedValues.value[0]);
  emit("onButtonClick", props.multiple ? selectedValues.value : selectedValues.value[0]);
};

const isActive = (value) => {
  if (props.multiple) {
    return selectedValues.value.includes(value);
  }
  return selectedValues?.value?.[0] === value;
};
</script>

<style lang="less" scoped>
.TKCustomButtonGroup {
  display: flex;
  .TKCustomButton {
    padding: 7px 12.5px;
    cursor: pointer;
    border-radius: 2px 0 0 2px;
    background: #ffffff;
    border: 1px solid #d8d8d8;
    font-size: 14px;
    color: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: none;
    letter-spacing: 1.2px;
    font-weight: 500;
    min-height: 40px;
    box-sizing: border-box;
    &:first-child {
      border-left: 1px solid #d8d8d8;
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }
    &:last-child {
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }

    .count {
      display: flex; /* 使用 flexbox 来居中内容 */
      justify-content: center; /* 水平居中 */
      align-items: center; /* 垂直居中 */
      min-width: 27px;
      height: 21px;
      border-radius: 43%;
      color: #0380ff; /* 字体颜色为蓝色 */
      font-size: 14px; /* 字体大小 */
      margin-left: 9px;
      text-align: center;
      background-color: #f1f6ff;
      letter-spacing: 1px;
    }

    &.active {
      color: white;
      background: #0380ff;
      border: 1px solid #0080ff;
      font-weight: 600;
      .count {
        background-color: #ffffff; /* 背景色为白色 */
        border: 1px solid #0380ff; /* 可选：给圆形添加蓝色边框 */
      }
    }
  }
}
</style>
