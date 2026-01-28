<template>
  <div class="dialog-container">
    <TerminalConsole 
      v-model="dialogVisible" 
      @close="handleClose" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TerminalConsole from '../clientComponents/TerminalConsole/index.vue'
import { closeCurrentWindow } from '../utils/electronUtils'

const dialogVisible = ref(true)

const handleClose = () => {
  closeCurrentWindow()
}

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    closeCurrentWindow()
  }
})
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
</style>

