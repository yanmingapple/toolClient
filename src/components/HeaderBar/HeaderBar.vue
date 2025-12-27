<template>
  <el-header style="display: flex; align-items: center; padding: 0 16px; background: #fff; border-bottom: 1px solid #e8e8e8; height: 64px">
    <div style="display: flex; align-items: center; height: 100%; gap: 16px">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        @click="item.onClick"
      >
        <component :is="renderIcon(item)" v-if="item.key !== 'other'" />
        <div v-else class="other-icon">
          <span>⋮</span>
          <span>⋮</span>
          <span>⋮</span>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { Connection, Plus, View, SetUp, User, Search, Download, RefreshRight, Grid, PieChart } from '@element-plus/icons-vue'
import { Icon } from '../../icons'

interface NavItem {
  key: string
  label: string
  iconType: 'custom' | 'antd'
  iconName?: string
  icon?: any
  iconProps?: Record<string, any>
  onClick: () => void
}

interface HeaderBarProps {
  onConnect?: () => void
  onNewQuery?: () => void
  onTable?: () => void
  onView?: () => void
  onFunction?: () => void
  onUser?: () => void
  onOther?: () => void
  onSearch?: () => void
  onBackup?: () => void
  onAutoRun?: () => void
  onModel?: () => void
  onBI?: () => void
}

const props = withDefaults(defineProps<HeaderBarProps>(), {
  onConnect: () => {},
  onNewQuery: () => {},
  onTable: () => {},
  onView: () => {},
  onFunction: () => {},
  onUser: () => {},
  onOther: () => {},
  onSearch: () => {},
  onBackup: () => {},
  onAutoRun: () => {},
  onModel: () => {},
  onBI: () => {}
})

const emit = defineEmits<{
  (e: 'connect'): void
  (e: 'newQuery'): void
  (e: 'table'): void
  (e: 'view'): void
  (e: 'function'): void
  (e: 'user'): void
  (e: 'other'): void
  (e: 'search'): void
  (e: 'backup'): void
  (e: 'autoRun'): void
  (e: 'model'): void
  (e: 'bi'): void
}>()

const navItems: NavItem[] = [
  {
    key: 'connect',
    label: '连接',
    iconType: 'custom',
    iconName: 'database',
    iconProps: { size: 24, style: { height: '24px' } },
    onClick: () => emit('connect')
  },
  {
    key: 'newQuery',
    label: '新建查询',
    iconType: 'antd',
    icon: Plus,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('newQuery')
  },
  {
    key: 'table',
    label: '表',
    iconType: 'custom',
    iconName: 'table',
    iconProps: { size: 24, style: { height: '24px' } },
    onClick: () => emit('table')
  },
  {
    key: 'view',
    label: '视图',
    iconType: 'antd',
    icon: View,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('view')
  },
  {
    key: 'function',
    label: '函数',
    iconType: 'antd',
    icon: SetUp,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('function')
  },
  {
    key: 'user',
    label: '用户',
    iconType: 'antd',
    icon: User,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('user')
  },
  {
    key: 'other',
    label: '其他',
    iconType: 'custom',
    iconProps: { height: '24px' },
    onClick: () => emit('other')
  },
  {
    key: 'search',
    label: '查询',
    iconType: 'antd',
    icon: Search,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('search')
  },
  {
    key: 'backup',
    label: '备份',
    iconType: 'antd',
    icon: Download,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('backup')
  },
  {
    key: 'autoRun',
    label: '自动运行',
    iconType: 'antd',
    icon: RefreshRight,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('autoRun')
  },
  {
    key: 'model',
    label: '模型',
    iconType: 'antd',
    icon: Grid,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('model')
  },
  {
    key: 'bi',
    label: 'BI',
    iconType: 'antd',
    icon: PieChart,
    iconProps: { style: { height: '24px' } },
    onClick: () => emit('bi')
  }
]

const renderIcon = (item: NavItem) => {
  if (item.iconType === 'custom' && item.iconName) {
    return h(Icon, { name: item.iconName, ...item.iconProps })
  }
  if (item.iconType === 'antd' && item.icon) {
    return h(item.icon, item.iconProps)
  }
  return null
}
</script>

<style scoped>
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 4px;
  min-height: 60px;
  gap: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #e6f7ff;
}

.nav-label {
  font-size: 12px;
  line-height: normal;
}

.other-icon {
  display: flex;
  align-items: center;
  height: 24px;
}

.other-icon span {
  margin-right: 2px;
}
</style>
