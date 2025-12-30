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
          :style="{ left: position.x + 'px', top: position.y + 'px' }"
          @click.stop
        >
          <template v-for="(item, index) in currentMenuItems" :key="index">
            <li
              v-if="!item.visible || item.visible(props.node, connectionStates)"
              :class="['menu-item', { danger: item.danger }]"
              @click="handleMenuClick(item.action)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Connection,
  Remove,
  Close,
  Edit,
  Delete,
  Document,
  Refresh,
  InfoFilled,
  Grid,
  View,
  VideoPlay,
  Link,
  Upload,
  Download
} from '@element-plus/icons-vue'
import type { TreeNode } from '../../types/leftTree/tree'
import { TreeNodeType } from '../../types/leftTree/tree'
import { ConnectionStatus } from '../../../electron/model/database'

interface ContextMenuProps {
  visible: boolean
  position: { x: number; y: number }
  node: TreeNode | null
  connectionStates: Map<string, ConnectionStatus> | undefined
}

interface ContextMenuEmits {
  (e: 'update:visible', visible: boolean): void
  (e: 'menuClick', action: string, node: TreeNode | null): void
}

interface MenuItem {
  action: string
  label: string
  icon: any
  danger?: boolean
  visible?: (node: TreeNode | null, connectionStates: Map<string, ConnectionStatus> | undefined) => boolean
}

const props = withDefaults(defineProps<ContextMenuProps>(), {
  visible: false,
  position: () => ({ x: 0, y: 0 }),
  node: null,
  connectionStates: undefined
})

const emit = defineEmits<ContextMenuEmits>()

const menuRef = ref<HTMLElement>()

const isNodeConnected = computed(() => {
  if (!props.node || props.node.type !== TreeNodeType.CONNECTION) return false
  const connectionId = props.node.key
  const status = props.connectionStates?.get(connectionId)
  return status === ConnectionStatus.CONNECTED
})

const isDatabaseConnected = computed(() => {
  if (!props.node || props.node.type !== TreeNodeType.DATABASE) return false
  return props.node.children && props.node.children.length > 0
})

const menuConfig: Record<string, MenuItem[]> = {
  connection: [
    {
      action: 'openConnection',
      label: '打开连接',
      icon: Connection,
      visible: () => !isNodeConnected.value
    },
    {
      action: 'disconnect',
      label: '断开连接',
      icon: Remove,
      visible: () => isNodeConnected.value
    },
    {
      action: 'newConnection',
      label: '新建连接',
      icon: Plus
    },
    {
      action: 'editConnection',
      label: '编辑连接',
      icon: Edit
    },
    {
      action: 'deleteConnection',
      label: '删除连接',
      icon: Delete,
      danger: true
    },
    {
      action: 'refreshDatabase',
      label: '刷新数据库',
      icon: Refresh
    },
  ],
  database: [
    {
      action: 'openDatabase',
      label: '打开数据库',
      icon: Link,
      visible: () => !isDatabaseConnected.value
    },
      {
      action: 'closeDatabase',
      label: '关闭数据库',
      icon: Remove,
      visible: () => isDatabaseConnected.value
    },
    {
      action: 'newDatabase',
      label: '新建数据库',
      icon: Plus
    },
    {
      action: 'newQuery',
      label: '新建查询',
      icon: Document
    },
    {
      action: 'refreshDatabase',
      label: '刷新数据库',
      icon: Refresh
    },
    {
      action: 'deleteDatabase',
      label: '删除数据库',
      icon: Delete,
      danger: true
    }
  ],
  table: [
    {
      action: 'newTable',
      label: '新建表',
      icon: Plus
    },
    {
      action: 'newTableQuery',
      label: '新建表查询',
      icon: Document
    },
    {
      action: 'viewStructure',
      label: '查看表结构',
      icon: InfoFilled
    },
    {
      action: 'viewData',
      label: '查看数据',
      icon: Grid
    },
    {
      action: 'importData',
      label: '导入数据',
      icon: Upload
    },
    {
      action: 'exportData',
      label: '导出数据',
      icon: Download
    },
    {
      action: 'deleteTable',
      label: '删除表',
      icon: Delete,
      danger: true
    },
    {
      action: 'refreshTable',
      label: '刷新表',
      icon: Refresh
    },
  ],
  view: [
    {
      action: 'newView',
      label: '新建视图',
      icon: Plus
    },
    {
      action: 'newQuery',
      label: '新建查询',
      icon: Document
    },
    {
      action: 'viewView',
      label: '查看视图',
      icon: View
    },
    {
      action: 'deleteView',
      label: '删除视图',
      icon: Delete,
      danger: true
    }
  ],
  function: [
    {
      action: 'newFunction',
      label: '新建函数',
      icon: Plus
    },
    {
      action: 'newQuery',
      label: '新建查询',
      icon: Document
    },
    {
      action: 'execute',
      label: '执行',
      icon: VideoPlay
    },
    {
      action: 'deleteFunction',
      label: '删除存储过程',
      icon: Delete,
      danger: true
    }
  ],
  default: [
    {
      action: 'newConnection',
      label: '新建连接',
      icon: Plus
    }
  ]
}

const menuType = computed(() => {
  if (!props.node) return 'default'
  switch (props.node.type) {
    case TreeNodeType.CONNECTION:
      return 'connection'
    case TreeNodeType.DATABASE:
      return 'database'
    case TreeNodeType.TABLE:
      return 'table'
    case TreeNodeType.VIEW:
      return 'view'
    case TreeNodeType.FUNCTION:
      return 'function'
    default:
      return 'default'
  }
})

const currentMenuItems = computed(() => {
  return menuConfig[menuType.value] || menuConfig.default
})

const closeMenu = () => {
  emit('update:visible', false)
}

const handleMenuClick = (action: string) => {
  emit('menuClick', action, props.node)
  closeMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  if (props.visible && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

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

.menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.menu-item.danger {
  color: #f56c6c;
}

.menu-item.danger:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

.menu-item .el-icon {
  font-size: 16px;
}

.menu-divider {
  height: 1px;
  margin: 4px 0;
  background: #ebeef5;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
