<template>
  <div class="dialog-container">
    <ServiceMonitor />
  </div>
</template>

<script setup lang="ts">
import ServiceMonitor from '../view/monitor/index.vue'
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

