<template>
  <div class="dialog-container">
    <CommandResult
      v-model="dialogVisible"
      :title="title"
      :result="result"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import CommandResult from '../clientComponents/CommandResult/index.vue'
import { closeCurrentWindow } from '../utils/electronUtils'

const dialogVisible = ref(true)
const title = ref('')
const result = ref<any>(null)

// 从 URL 参数中获取数据
onMounted(() => {
  const hash = window.location.hash
  const hashParts = hash.split('?')
  if (hashParts.length > 1) {
    const urlParams = new URLSearchParams(hashParts[1])
    const titleParam = urlParams.get('title')
    const resultParam = urlParams.get('result')
    
    if (titleParam) {
      title.value = decodeURIComponent(titleParam)
    }
    
    if (resultParam) {
      try {
        result.value = JSON.parse(decodeURIComponent(resultParam))
      } catch (e) {
        result.value = resultParam
      }
    }
  }
})

// 使用 watch 监听 dialogVisible 变化
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

