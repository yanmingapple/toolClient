<template>
  <div class="change-page-style-toolbar-con">
    
    <!-- 调整字号  -->
    <div v-if="renderArr.includes('fontSize')" class="style-toolbar-item paper-fontSize-changer-con" title="设置字号">
      <el-button class="label-con" type="primary" plain>
        <svg-icon icon-class="ic_fontSize" class-name="margin0"></svg-icon>
      </el-button>
      <div class="opt-con">
        <el-button-group>
          <el-button type="primary" plain @click="resetToDefault">
            还原
      </el-button>
          <el-button type="primary" plain :disabled="pageStyleData.fontSizeFlag<-3" @click="fontSizeChangHandler(-1)">
            <svg-icon icon-class="ic_cut"></svg-icon>
          </el-button>
          <el-button plain class="text-btn">{{fontSizeCon?.[pageStyleData?.fontSizeFlag]??'默认'}}</el-button>
          <el-button type="primary" plain :disabled="pageStyleData.fontSizeFlag>5" @click="fontSizeChangHandler(1)">
            <svg-icon icon-class="ic_add"></svg-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    <!-- 调整颜色  -->
    <div v-if="renderArr.includes('color')" class="style-toolbar-item paper-bg-color-con" title="设置试卷背景色">
      <el-popover
        placement="bottom"
        :width="153"
        trigger="hover"
        content=""
        popper-class="change-clr-pop"
      >
        <template #reference>
          <el-button class="label-con" type="primary" plain>
            <svg-icon icon-class="ic_color" class-name="margin0"></svg-icon>
          </el-button>
        </template>
        <template #default>
          <div class="color-picker-con opt-con">
            <span v-for="item in colorArr" :key="item" :style="{background: item}" @click="changeColor(item)"></span>
          </div>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  renderArr: { type: Array, default: () => ['fontSize', 'color'] },
});
const initStyleData = {
  fontSizeFlag: null,
  colorFlag: '#FFFFFF'
}
  , fontSizeCon = {
    '-4': '8pt',
    '-3': '9pt',
    '-2': '10pt',
    '-1': '11pt',
    '0': '12pt',
    '1': '13pt',
    '2': '14pt',
    '3': '15pt',
    '4': '16pt',
    '5': '17pt',
    '6': '18pt',
  }
// 修改字号
let pageStyleData = computed(() => {
  let pageStyleDataStore = tkGetters['app/pageStyleData']
  return {...initStyleData, ...pageStyleDataStore}
})
function fontSizeChangHandler(type) {
  if (type) {
    pageStyleData.value.fontSizeFlag = parseInt(pageStyleData.value.fontSizeFlag || 0)
    if((pageStyleData.value.fontSizeFlag > 5 && type == 1) || (pageStyleData.value.fontSizeFlag < -3 && type == -1)) return
    pageStyleData.value.fontSizeFlag+=type
  }
  tkCommit("SET_PAGE_STYLE", { fontSizeFlag: pageStyleData.value.fontSizeFlag || pageStyleData.value.fontSizeFlag === 0 ? pageStyleData.value.fontSizeFlag : initStyleData.fontSizeFlag });
}
// 修改颜色
let colorArr = ['#CCE8CF', '#C8D9ED', '#FFFFFF']
function changeColor(clrVal) {
  tkCommit("SET_PAGE_STYLE", { colorFlag: clrVal });
}
// 还原默认设置
function resetToDefault() {
  tkCommit("SET_PAGE_STYLE", { fontSizeFlag: null, colorFlag: initStyleData.colorFlag });
}
onMounted(() => {
  fontSizeChangHandler()
})
</script>

<style lang="less" scoped>
.change-page-style-toolbar-con {
  .style-toolbar-item {
    display: flex;
    justify-content: flex-end;
    &+.style-toolbar-item {
      margin-top: 8px;
    }
  }
  .reset-btn-con {
    :deep(.el-button) {
      border-color: #a0cfff;
    }
  }
  .paper-fontSize-changer-con {
    .label-con {
      display: block;
    }
    .opt-con {
      display: none;
    }
    &:hover {
      .label-con {
        display: none;
      }
      .opt-con {
        display: block;
      }
    }
    :deep(.el-button) {
      border-color: #a0cfff;
      &.text-btn {
        &:hover, &:active, &:focus, &:visited {
          color: #333;
        }
      }
    }
  }
}
</style>
<style lang="less">
.change-clr-pop {
    
  .color-picker-con{
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    max-width: 200px;
    max-height: 100px;
    padding-left: 6px;
    // border: 1px solid #a0cfff;
    span {
      width: 1.5rem;
      height: 1.5rem;
      border: 1px solid #aaa;
      box-sizing: border-box;
      margin-top: 6px;
      margin-right: 6px;
    }
  }
}
</style>
