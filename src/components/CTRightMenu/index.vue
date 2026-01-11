<template>
  <Teleport to="body">
    <Transition name="menu-fade">
      <div
        v-if="visible"
        class="context-menu-overlay"
        @click="closeMenu"
        @contextmenu.prevent
      >
        <ul
          ref="menuRef"
          class="context-menu"
          :style="{
            left: `${position.x}px`,
            top: `${position.y}px`
          }"
          @click.stop
        >
          <template v-for="(item, index) in filteredMenuItems" :key="index">
            <li v-if="item.divider" class="menu-divider" />
            <li
              v-else-if="!item.visible || item.visible(props.data)"
              :class="['menu-item', { danger: item.danger, disabled: item.disabled || item.disabled?.(props.data) }]"
              @click="handleMenuClick(item)"
            >
              <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, VNode } from 'vue'
import type { Component } from 'vue'

interface MenuItem {
  /** 菜单项唯一标识 */
  key: string
  /** 菜单项标签 */
  label: string
  /** 菜单项图标 (Element Plus Icon 组件) */
  icon?: Component
  /** 是否为危险操作 */
  danger?: boolean
  /** 是否禁用 */
  disabled?: boolean | ((data: any) => boolean)
  /** 是否显示分隔线 */
  divider?: boolean
  /** 是否显示菜单项 */
  visible?: (data: any) => boolean
  /** 点击事件处理函数 */
  onClick?: (data: any) => void
}

interface CTRightMenuProps {
  /** 是否显示右键菜单 */
  visible: boolean
  /** 右键菜单位置 */
  position: { x: number; y: number }
  /** 菜单项配置 */
  menuItems: MenuItem[]
  /** 传递给菜单项的数据 */
  data?: any
}

interface CTRightMenuEmits {
  /** 更新可见性 */
  (e: 'update:visible', visible: boolean): void
  /** 菜单项点击事件 */
  (e: 'menuClick', key: string, data: any): void
}

const props = withDefaults(defineProps<CTRightMenuProps>(), {
  visible: false,
  position: () => ({ x: 0, y: 0 }),
  menuItems: () => [],
  data: null
})

const emit = defineEmits<CTRightMenuEmits>()

const menuRef = ref<HTMLElement | null>(null)

// 过滤后的菜单项
const filteredMenuItems = computed(() => {
  return props.menuItems
})

// 关闭菜单
const closeMenu = () => {
  emit('update:visible', false)
}

// 处理菜单项点击
const handleMenuClick = (item: MenuItem) => {
  // 检查是否禁用
  const isDisabled = typeof item.disabled === 'function' 
    ? item.disabled(props.data)
    : item.disabled
  
  if (isDisabled) return
  
  // 执行菜单项的点击处理函数
  if (item.onClick) {
    item.onClick(props.data)
  }
  
  // 触发菜单点击事件
  emit('menuClick', item.key, props.data)
  
  // 关闭菜单
  closeMenu()
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
    debugger
  if (props.visible && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

// 按 Esc 键关闭菜单
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: transparent;
}

.context-menu {
  position: absolute;
  min-width: 160px;
  padding: 4px 0;
  margin: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  user-select: none;
  max-height: 400px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover:not(.disabled) {
  background-color: #f5f7fa;
  color: #409eff;
}

.menu-item.danger {
  color: #f56c6c;
}

.menu-item.danger:hover:not(.disabled) {
  background-color: #fef0f0;
  color: #f56c6c;
}

.menu-item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background-color: transparent;
  color: #c0c4cc;
}

.menu-item .el-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-divider {
  height: 1px;
  margin: 4px 16px;
  background: #ebeef5;
  width: calc(100% - 32px);
  pointer-events: none;
  cursor: default;
}

/* 过渡动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
