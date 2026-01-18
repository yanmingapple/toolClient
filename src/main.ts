import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 为 @paddlejs-models/ocr 提供全局 Module 对象
(window as any).Module = {}
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
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

const app = createApp(App)

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
