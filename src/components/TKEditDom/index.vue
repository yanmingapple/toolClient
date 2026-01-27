<template>
  <div
    :class="'edit-dom' + (content.trim() ? '' : ' inlineBlock-dom')"
    v-html="textData"
    :placeholder="placeholder"
    :contenteditable="canEdit"
    @blur="blurHandler" 
    @keydown.13="keyDown($event)"
    @input="changeTextHandler"
  ></div>
</template>
<script setup>
import { ref, watch , reactive } from "vue";
const emit = defineEmits(['update:textData', 'change'])
//当前行数据
const props = defineProps({
  textData: { type: String, default: "",},
  placeholder: {
    type: String,
    default: "",
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
  //禁止换行
  nowrap: {
    type: Boolean,
    default: false,
  },
});
  let content = ref(props.textData)

  watch(() => props.textData, (newV, oldV) => {
    content.value = newV
  })

// 离开编辑框，值双向绑定(传出值)
function blurHandler(e) {
  // 解决：末尾换行，看不见的<br>，删不掉，造成清空无法出现placeholder文字
  if (e.target.innerHTML == "<br>") {
    e.target.innerHTML = "";
  }
  emit("update:textData", e.target.innerHTML);
  emit("change", e.target.innerHTML);
}

function keyDown(e) {
  if (this.nowrap) {
    e.preventDefault();
  }
}
// 值变动，内部内容同步变动
function changeTextHandler(e) {
  content.value = e.target.innerHTML
}
</script>
<style>
.edit-dom {
  outline: none;
}
.inlineBlock-dom {
  display: inline-block !important;
  padding: 0 1rem;
}
</style>
