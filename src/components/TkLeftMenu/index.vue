<template>
  <el-menu
    id="leftUserMenu"
    class="el-menu-vertical-demo"
    :collapse="!isCollapse"
    :default-active="defaultActive"
    @select="selectMenu"
  >
    <slot name="actInfo"></slot>
    <el-menu-item
      v-for="(item,index) in props.menuList"
      :key="index"
      :index="item.type"
      :title="item.title"
    >
      <i v-if="item.icon" :class="item.icon"></i>
      <svg-icon v-else-if="item.svgIcon" :icon-class="item.svgIcon" :class-name="item.svgIcon" />
      <span>{{item.title}}</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
const props = defineProps({
  isCollapse: { type: Boolean, default: true },
  defaultActive: { type: String, default: '' },
  menuList: { type: Array, default: () => { return [] } }
});

const emit = defineEmits()

function selectMenu (index, indexPath) {
  emit('selectMenu', index)
}

</script>

<style lang="less" scoped>
.el-menu-vertical-demo {
  :deep(.el-menu-item) {
    padding: 0 0px 0 14px !important;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.svg-icon {
  margin-right: 8px;
  width: 20px;
  height: 20px;
}
</style>
