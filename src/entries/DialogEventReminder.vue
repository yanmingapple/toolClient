<template>
  <div class="dialog-container">
    <EventReminder />
  </div>
</template>

<script setup lang="ts">
import EventReminder from '../view/event-reminder/index.vue'
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

