<template>
  <div class="TkCheckbox">
    <div class="mb10">
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
        >全选</el-checkbox
      >
      <el-checkbox v-model="reverse" @change="handleCheckReverse"
        >反选</el-checkbox
      >
    </div>

    <el-checkbox-group v-model="checkedList">
      <template v-for="item in list">
        <el-checkbox
          :label="item.value"
          :key="item.value"
          v-if="!item.isHidden"
          >{{ item.label }}</el-checkbox
        >
      </template>
    </el-checkbox-group>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const checkedList = ref([]);
const reverse = ref(false);

watch(
  () => checkedList.value,
  (val) => {
    // 更改原数组isChecked字段
    props.list.forEach((_c) => {
      _c.isChecked = val.includes(_c.value);
      return _c;
    });
  }
);

// 未加入deep 所以只有初始化变化一次，不会无线循环
watch(
  () => props.list,
  (val) => {
    if (!val) return;
    if (val.length === 0) return;
    const checkedListStart = val.filter((_c) => _c.isChecked && !_c.isHidden);
    if (checkedListStart.length === 0) return;
    checkedList.value = checkedListStart.map((_c) => _c.value);
  },
  { immediate: true }
);

// 全选状态
const checkAll = computed(() => {
  if (!props.list) return false;
  const allLen = props.list.length;
  const checkedLen = checkedList.value.length;
  if (allLen === checkedLen) {
    return true;
  } else if (checkedLen === 0) {
    return false;
  }
});

// 选中但未全选状态
const isIndeterminate = computed(() => {
  if (!props.list) return false;
  const allLen = props.list.length;
  const checkedLen = checkedList.value.length;
  return checkedLen > 0 && allLen !== checkedLen;
});

// 全选逻辑
function handleCheckAllChange(val) {
  const allCheckData = props.list.map((item) => item.value);
  checkedList.value = val ? allCheckData : [];
}

// 反选
function handleCheckReverse() {
  let unCheckedData = [];
  props.list.forEach((item) => {
    if (!checkedList.value.includes(item.value)) {
      unCheckedData.push(item.value);
    }
  });
  checkedList.value = unCheckedData;
}
</script>

<style lang="less" scoped>
:deep(.el-checkbox-group .el-checkbox) {
  width: 29% !important;
  align-items: left !important;
  height: auto !important;
  margin-bottom: 10px;
}
:deep(.el-checkbox-group .el-checkbox .el-checkbox__label) {
  word-break: break-all; //英文
  white-space: pre-wrap; //中文
  line-height: 18px;
}
:deep(.el-checkbox-group .el-checkbox&:nth-child(3n)) {
  margin-right: 0;
}
</style>
