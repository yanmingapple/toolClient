<template>
  <div class="app-container sidebar-app-container">
    <SidebarPanel />
  </div>
</template>

<script setup lang="ts">
import SidebarPanel from '../view/sidebar/index.vue'
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>

