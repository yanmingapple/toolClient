import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "@/style/tk-common.less";
import "@/style/tk-public.less";
import './index.css'
import './utils/CTMessage'
import tkCom from '@/components/index.ts';
import useTable from "@/hooks/useTable";
import useForm from "@/hooks/useForm";
import useDlg from "@/hooks/useDlg";

import tkTools from "@/utils/tkTools";
import { globallyComponent } from "@/assets/icons"; // 支持svg

// 根据 URL 加载不同的入口组件
async function initApp() {
  const hash = window.location.hash
  const pathname = window.location.pathname
  
  console.log('[main.ts] Initializing app with hash:', hash, 'pathname:', pathname)
  
  let EntryComponent: any
  
  // 检查是否为侧边栏窗口
  if (pathname === '/sidebar' || hash === '#sidebar') {
    EntryComponent = (await import('./entries/Sidebar.vue')).default
  }
  // 检查是否为对话框窗口
  else if (hash.startsWith('#dialog-connection')) {
    EntryComponent = (await import('./entries/DialogConnection.vue')).default
  }
  else if (hash.startsWith('#dialog-command-result')) {
    EntryComponent = (await import('./entries/DialogCommandResult.vue')).default
  }
  else if (hash.startsWith('#dialog-terminal')) {
    EntryComponent = (await import('./entries/DialogTerminal.vue')).default
  }
  else if (hash.startsWith('#dialog-event-reminder')) {
    EntryComponent = (await import('./entries/DialogEventReminder.vue')).default
  }
  else if (hash.startsWith('#dialog-credit-card')) {
    EntryComponent = (await import('./entries/DialogCreditCard.vue')).default
  }
  else if (hash.startsWith('#dialog-service-monitor')) {
    console.log('[main.ts] Loading DialogServiceMonitor component')
    EntryComponent = (await import('./entries/DialogServiceMonitor.vue')).default
  }
  else if (hash.startsWith('#dialog-idea-notebook')) {
    console.log('[main.ts] Loading DialogIdeaNotebook component')
    EntryComponent = (await import('./entries/DialogIdeaNotebook.vue')).default
  }
  // 检查是否为工作区页面
  else if (hash === '#workspace') {
    EntryComponent = (await import('./entries/Workspace.vue')).default
  }
  // 默认显示工具面板
  else {
    console.log('[main.ts] No matching route, loading default ToolPanel. Hash was:', hash)
    EntryComponent = (await import('./entries/ToolPanel.vue')).default
  }
  
  // 创建应用实例
  const app = createApp(EntryComponent)
  
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  // 注册公共组件
  for (const key in tkCom) {
    app.component(key, tkCom[key]);
  }
  
  window.useTable = useTable;
  window.useForm = useForm;
  window.useDlg = useDlg;
  
  window.tkTools = tkTools;
  
  globallyComponent(app);
  
  app.use(createPinia())
  app.use(ElementPlus)
  
  app.mount('#app')
}

// 初始化应用
initApp()
