<template>
  <div class="dialog-container">
    <IdeaNotebook />
  </div>
</template>

<script setup lang="ts">
import IdeaNotebook from '../view/idea-notebook/index.vue'
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

