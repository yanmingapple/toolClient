<template>
  <div class="know-view-con" v-if="knowList.length > 0 && !showPop">
    <!-- ['know-item', (item.mainlevel || item.level) == 1 ? 'red' : ''] -->
    <template v-for="(item, index) in knowList" :key="index">
      <div v-if="item.name || item.knowledgeModelStr || item.knowledgeStr" :class="{
        'know-item': OverflowIsHidden,
        'red': (item.mainlevel || item.level) == 1
      }">
        <svg-icon class-name="ic_Highlighted" icon-class="ic_highlighted"></svg-icon>
        {{ item.name || item.knowledgeModelStr || item.knowledgeStr }}
      </div>
    </template>
  </div>
  <el-popover placement="right" :width="300" v-else-if="knowList.length > 0 && showPop">
    <template #reference>
      <div class="know-view-con">
        <!-- ['know-item', (item.mainlevel || item.level) == 1 ? 'red' : ''] -->
        <template v-for="(item, index) in knowList" :key="index">
          <div v-if="item.name || item.knowledgeModelStr || item.knowledgeStr" :class="{ 'know-item': OverflowIsHidden, 'red': (item.mainlevel || item.level) == 1 }">
            <svg-icon class-name="ic_Highlighted" icon-class="ic_highlighted"></svg-icon>
            {{ item.name || item.knowledgeModelStr || item.knowledgeStr }}
          </div>
        </template>
      </div>
    </template>
      <div :class="['know-item pop-know-item', (item.mainlevel || item.level) == 1 ? 'red' : '']" v-for="(item, index) in knowList" :key="index">
        <svg-icon class-name="ic_Highlighted" icon-class="ic_highlighted"></svg-icon>
        {{ item.name || item.knowledgeModelStr || item.knowledgeStr }}
      </div>
  </el-popover>
  <span v-else>-</span>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'
  const props = defineProps({
    knowList: {type: Array, default: () => []},
    OverflowIsHidden: {type: Boolean, default: true},
    showPop: { type: Boolean, default: true}
  })
  // watch(() => props.knowList, (newV, oldV) => {
  //   console.log(newV)
  // }, {
  //   deep: true
  // })
</script>

<style lang="less" scoped>
  .know-view-con {
    .know-item {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: left;
    }
  }
</style>
<style>
  .pop-know-item {
    padding: 10px 0;
  }
</style>