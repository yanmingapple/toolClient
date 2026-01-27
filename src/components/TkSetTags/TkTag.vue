<template>
  <div
    v-for="(item, index) in tagData"
    :class="[
      'tag-box' + (selectTags.includes(item.id) ? ' selected' : ''),
      { isView: isView },
    ]"
    :key="'tag_' + index"
    :style="{
      backgroundColor: convertColorRgb(item.color, 0.1),
      color: item.color,
    }"
    @click="selectHandler(item)"
  >
    <span class="tag-text">{{ item.name }}</span>
    <svg-icon
      v-if="del"
      class-name="del_svg"
      icon-class="ic_close"
      :style="{ color: item.color }"
      @click="delTagHandler(item.id, item.name)"
    ></svg-icon>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from "vue";
import { convertColorRgb } from "@/utils";
const emit = defineEmits(["update:selTags", "update:selTagNames", "delTag"]);
const props = defineProps({
  tagData: { type: Array, default: [] },
  selTags: { type: Array, default: [] },
  selTagNames: { type: Array, default: [] },
  del: { type: Boolean, default: false },
  addInfo: { type: Object },
  isView: { type: Boolean, default: false },
});
let selectTags = ref(props.selTags),
  selectTagNames = ref(props.selTagNames);
// 选中标签
function selectHandler(tag) {
  if (props.del) return;
  if (tag && tag.id) {
    if (!selectTags.value.includes(tag.id)) {
      selectTags.value.push(tag.id);
      selectTagNames.value.push(tag.name);
    } else {
      let curIndex = selectTags.value.indexOf(tag.id);
      selectTags.value.splice(curIndex, 1);
      let curNameIndex = selectTagNames.value.indexOf(tag.id);
      selectTagNames.value.splice(curNameIndex, 1);
    }
    emit("update:selTags", [...selectTags.value]);
    emit("update:selTagNames", [...selectTagNames.value]);
  }
}
// 删除标签 changeTagOfQst
function delTagHandler(id, name) {
  emit("delTag", id, name, props.addInfo);
}

watchEffect(() => {
  selectTags.value = props.selTags;
  selectTagNames.value = props.selTagNames;
});
</script>

<style lang="less" scoped>
.tag-box {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 14px;
  & + .tag-box {
    margin: 6px 0 0 6px;
  }
  &.isView {
    margin-right: 20px;
    padding: 8px 30px;
    cursor: pointer;
  }
  &.selected {
    background-color: #ecf5ff;
    position: relative;
    &::after {
      content: "\221a";
      background-color: #39d854;
      position: absolute;
      top: -6px;
      right: -6px;
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 50%;
      font-size: 13px;
      color: #fff;
      border: 1px solid #1caf32;
    }
  }
  &:hover {
    background-color: #ecf5ff;
  }
  .del_svg {
    margin-left: 8px;
    cursor: pointer;
  }
}
</style>
