<template>
  <div
    v-if="visible"
    ref="menuRef"
    class="tk-context-menu"
    :style="{ left: positionX + 'px', top: positionY + 'px' }"
    @click.stop
    @mousedown.stop
  >
    <!-- 菜单标题 -->
    <div class="menu-header" v-if="title">
      <span class="menu-title">{{ title }}</span>
    </div>
    <!-- 配置化菜单项 -->
    <template v-if="menuItems && menuItems.length > 0">
      <template v-for="(item, index) in menuItems" :key="index">
        <div 
          v-if="item.type === 'divider'" 
          class="menu-divider"
        ></div>
        <div 
          v-else
          class="menu-item" 
          :class="{ 'menu-item-danger': item.type === 'danger', 'menu-item-disabled': item.disabled }"
          @click="!item.disabled && item.handler ? handleMenuItemClick(item) : null"
        >
          <svg-icon v-if="item.icon" :icon-class="item.icon"></svg-icon>
          <span>{{ item.label }}</span>
        </div>
      </template>
    </template>
    
    <!-- 菜单项插槽（向后兼容） -->
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  menuWidth: {
    type: Number,
    default: 160
  },
  menuHeight: {
    type: Number,
    default: 250
  },
  padding: {
    type: Number,
    default: 10
  },
  // 菜单项配置数组
  menuItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'close', 'menu-item-click'])

// 处理菜单项点击
function handleMenuItemClick(item) {
  if (item.handler && typeof item.handler === 'function') {
    item.handler(item)
  }
  emit('menu-item-click', item)
}

const menuRef = ref(null)
const positionX = ref(0)
const positionY = ref(0)
let closeMenuHandler = null
let closeScrollHandler = null

// 计算菜单位置，确保菜单始终在可视区域内
function calculatePosition(x, y) {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  let menuX = x
  let menuY = y
  
  // 检查右边界，如果菜单会超出右边界，向左调整
  if (menuX + props.menuWidth + props.padding > windowWidth) {
    menuX = windowWidth - props.menuWidth - props.padding
  }
  
  // 检查下边界，如果菜单会超出下边界，向上调整
  if (menuY + props.menuHeight + props.padding > windowHeight) {
    menuY = windowHeight - props.menuHeight - props.padding
    // 如果向上调整后位置太小，则放在鼠标上方
    if (menuY < y - props.menuHeight) {
      menuY = y - props.menuHeight
    }
  }
  
  // 确保菜单不会超出左边界和上边界
  if (menuX < props.padding) {
    menuX = props.padding
  }
  if (menuY < props.padding) {
    menuY = props.padding
  }
  
  return { x: menuX, y: menuY }
}

// 关闭菜单
function closeMenu() {
  if (!props.visible) return
  
  emit('update:visible', false)
  emit('close')
  
  // 清理事件监听器
  if (closeMenuHandler) {
    document.removeEventListener('mousedown', closeMenuHandler, false)
    document.removeEventListener('click', closeMenuHandler, false)
    closeMenuHandler = null
  }
  if (closeScrollHandler) {
    window.removeEventListener('scroll', closeScrollHandler, true)
    closeScrollHandler = null
  }
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 计算初始位置
    const pos = calculatePosition(props.x, props.y)
    positionX.value = pos.x
    positionY.value = pos.y
    
    // 在 nextTick 中调整位置
    nextTick(() => {
      // 获取菜单实际尺寸，再次调整位置（如果需要）
      if (menuRef.value) {
        const actualHeight = menuRef.value.offsetHeight
        const actualWidth = menuRef.value.offsetWidth
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        
        // 如果实际高度超出下边界，再次调整
        if (positionY.value + actualHeight + props.padding > windowHeight) {
          positionY.value = windowHeight - actualHeight - props.padding
          if (positionY.value < props.padding) {
            positionY.value = props.padding
          }
        }
        
        // 如果实际宽度超出右边界，再次调整
        if (positionX.value + actualWidth + props.padding > windowWidth) {
          positionX.value = windowWidth - actualWidth - props.padding
          if (positionX.value < props.padding) {
            positionX.value = props.padding
          }
        }
      }
      
      // 点击外部区域关闭菜单
      closeMenuHandler = (e) => {
        if (!props.visible) {
          return
        }
        
        // 检查点击的目标是否在菜单内部
        const menuElement = menuRef.value
        if (menuElement && 
            menuElement.nodeType === 1 && 
            typeof menuElement.contains === 'function' && 
            menuElement.contains(e.target)) {
          return // 点击菜单内部，不关闭
        }
        
        // 点击菜单外部的任何地方，都关闭菜单
        closeMenu()
      }
      
      // 滚动时关闭菜单
      closeScrollHandler = () => {
        if (props.visible) {
          closeMenu()
        }
      }
      
      // 延迟添加事件监听器，避免右键点击事件立即触发关闭
      setTimeout(() => {
        if (props.visible) {
          document.addEventListener('click', closeMenuHandler, false)
          document.addEventListener('mousedown', closeMenuHandler, false)
          window.addEventListener('scroll', closeScrollHandler, true)
        }
      }, 0)
    })
  } else {
    closeMenu()
  }
})

// 监听位置变化
watch([() => props.x, () => props.y], ([newX, newY]) => {
  if (props.visible) {
    const pos = calculatePosition(newX, newY)
    positionX.value = pos.x
    positionY.value = pos.y
  }
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  closeMenu()
})
</script>

<style lang="less" scoped>
.tk-context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  min-width: 160px;
  padding: 4px 0;
  
  .menu-header {
    padding: 8px 16px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .menu-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }
  
  .menu-divider {
    height: 1px;
    background-color: #e4e7ed;
    margin: 4px 0;
  }
  
  // 菜单项样式（供插槽内容使用）
  :deep(.menu-item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f7fa;
      color: #409eff;
    }
    
    .svg-icon {
      width: 14px;
      height: 14px;
    }
  }
  
  :deep(.menu-item-danger) {
    color: #f67b80;
    
    &:hover {
      background-color: #fef0f0;
      color: #f67b80;
    }
  }
  
  :deep(.menu-item-disabled) {
    color: #c0c4cc;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
      color: #c0c4cc;
    }
  }
}
</style>

