<template>
  <span :style="iconStyle" :class="className" v-html="safeSvgContent" v-if="safeSvgContent"></span>
  <span v-else :style="fallbackStyle" :class="`icon-default ${className}`">
    {{ name }}
  </span>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { IconName } from './types'

const props = defineProps<{
  name: IconName
  size?: number
  color?: string
  className?: string
}>()

const svgContent = ref<string>('')

const iconModules: Record<string, () => Promise<{ default: string }>> = {
  mysql: () => import('./svg/mysql.svg?raw'),
  'mysql-filled': () => import('./svg/mysql-filled.svg?raw'),
  postgresql: () => import('./svg/postgresql.svg?raw'),
  mongodb: () => import('./svg/mongodb.svg?raw'),
  redis: () => import('./svg/redis.svg?raw'),
  sqlserver: () => import('./svg/sqlserver.svg?raw'),
  sqlite: () => import('./svg/sqlite.svg?raw'),
  database: () => import('./svg/database.svg?raw'),
  'database-filled': () => import('./svg/database-filled.svg?raw'),
  folder: () => import('./svg/folder.svg?raw'),
  'folder-open': () => import('./svg/folder-open.svg?raw'),
  table: () => import('./svg/table.svg?raw'),
  'table-filled': () => import('./svg/table-filled.svg?raw'),
  cloud: () => import('./svg/cloud.svg?raw'),
  'cloud-filled': () => import('./svg/cloud-filled.svg?raw'),
  'file-text-filled': () => import('./svg/file-text-filled.svg?raw'),
  settings: () => import('./svg/settings.svg?raw'),
  warning: () => import('./svg/warning.svg?raw'),
  'warning-filled': () => import('./svg/warning-filled.svg?raw'),
  error: () => import('./svg/error.svg?raw'),
  'error-filled': () => import('./svg/error-filled.svg?raw'),
  success: () => import('./svg/success.svg?raw'),
  'success-filled': () => import('./svg/success-filled.svg?raw'),
  loading: () => import('./svg/loading.svg?raw'),
}

const loadIcon = async () => {
  if (iconModules[props.name]) {
    try {
      const module = await iconModules[props.name]()
      svgContent.value = typeof module === 'string' ? module : (module as any).default || ''
    } catch (e) {
      svgContent.value = ''
    }
  }
}

onMounted(loadIcon)
watch(() => props.name, loadIcon)

const iconStyle = computed(() => ({
  width: `${props.size || 16}px`,
  height: `${props.size || 16}px`,
  color: props.color,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const safeSvgContent = computed(() => {
  const content = svgContent.value
  if (typeof content !== 'string') return ''
  return content
})

const fallbackStyle = computed(() => ({
  width: `${props.size || 16}px`,
  height: `${props.size || 16}px`,
  color: props.color,
  display: 'inline-block',
  verticalAlign: 'middle',
  fontSize: `${props.size || 16}px`,
  textAlign: 'center' as const,
  lineHeight: `${props.size || 16}px`,
}))
</script>

<style scoped>
.icon-default {
  font-style: italic;
  font-weight: bold;
}
:deep(.icon) {
  width: 100%;
  height: 100%;
}
</style>
