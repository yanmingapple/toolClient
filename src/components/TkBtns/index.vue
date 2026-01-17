<template>
  <template v-for="(_i, index) in btnsData" :key="index">
    <template v-if="!(_i.hiddenFun && _i.hiddenFun(paramData))">
      <el-dropdown
        v-if="_i.isPop"
        placement="bottom-start"
        trigger="click"
      >
        <el-button
          v-permission="_i.permission||[]"
          :class="props.class"
          :type="_i.type || 'primary'"
          :title="_i.title||''"
          :plain="!(_i.isUnPlain === true)"
          :link="_i.islink||false">
          <svg-icon v-if="_i.iconPosition !== 'right' && _i.icon" class-name="" :icon-class="_i.icon" />
          <span v-if="_i.label" v-html="_i.label+(_i?.suffixFunc?.(_i, paramData)??'')"></span>
          <svg-icon v-if="_i.iconPosition == 'right' && _i.icon" class-name="" :icon-class="_i.icon" />
          <svg-icon v-if="_i.isPop" style="margin-left: 5px" icon-class="ic_move_down2" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, itemIndex) in _i.moreData"
              :key="itemIndex"
              @click="_i.func(paramData, item, _i)">
              <svg-icon v-if="item.icon && item.iconPosition !== 'right'" class-name="" :icon-class="item.icon" />
              <span :style="item.color ? `color: ${item.color};` : ''">{{ item.label }}</span>
              <svg-icon v-if="item.icon && item.iconPosition == 'right'" class-name="" :icon-class="item.icon" />
              <svg-icon v-if="popSelData?.[_i.prop]?.includes(item.value)" class-name="check-icon" icon-class="ic_complate" />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        v-else
        v-permission="_i.permission||[]"
        :class="props.class"
        :type="_i.type || 'primary'"
        :title="_i.title||''"
        :plain="!_i.isUnPlain"
        :link="_i.islink||false"
        @click.stop="_i.func(paramData, _i)">
        <svg-icon v-if="_i.iconPosition !== 'right' && _i.icon" class-name="" :icon-class="_i.icon" />
        <span v-if="_i.label" v-html="_i.label"></span>
        <svg-icon v-if="_i.iconPosition == 'right' && _i.icon" class-name="" :icon-class="_i.icon" />
      </el-button>
    </template>
  </template>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps({
  btnsData: { type: Object, required: true },
  paramData: { type: Object },
  popSelData: { type: Object },
  class: { type: String },
})
</script>
<style lang="less" scoped>
:global(.check-icon) {
  color: #689D47;
  margin-left: 8px;
}
</style>
