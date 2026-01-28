<template>
  <!-- App.vue 已不再使用，所有页面都有自己的入口文件 -->
  <!-- 此文件可以删除或保留作为备用 -->
  <div class="app-container">
    <p>此组件已不再使用，请使用对应的入口文件</p>
  </div>
</template>

<script setup lang="ts">
// App.vue 已不再使用
// 所有页面都有自己的入口文件（src/entries/ 目录下）
// main.ts 会根据 URL hash 动态加载对应的入口组件
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>
