// 引入vuex
import { createStore } from "vuex";

// 引入持久化
import createPersistedState from "vuex-persistedstate";

// 加载所有模块 - 使用 Vite 的 import.meta.glob 替代 require.context
function loadModules() {
  // 使用 Vite 的 import.meta.glob 来动态导入模块
  const moduleFiles = import.meta.glob("./modules/*.js", { eager: true });
  const modules = Object.keys(moduleFiles)
    .map((path) => {
      const name = path.match(/\/([a-z_]+)\.js$/i)?.[1];
      return { path, name, module: moduleFiles[path] };
    })
    .filter(({ name }) => name) // 过滤掉无效的模块名
    .reduce(
      (modules, { name, module }) => ({
        ...modules,
        [name]: module.default || module,
      }),
      {}
    );
  return { modules };
}

const { modules } = loadModules();

const store = createStore({
  state: {},
  //里面定义方法，操作state 的方法
  mutations: {},
  // 操作异步操作mutation
  actions: {},
  modules, // : {
  //   mouseModule
  // },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      paths: [
        "app.systemData",
        "app.urlQueryDataJson",
        "app.reqQueryData",
        "app.pageStyleData",
        "system.currentRole", //当前角色
        "system.roles", //角色列表
        "app.defaultUrl", //默认跳转首页
        "app.invalidMenu", //有效菜单
        "app.validateMenu",//校验菜单
      ],
    }),
  ],
});

// Vite 内置 HMR，如果需要手动处理热更新可以使用 import.meta.hot
if (import.meta.hot) {
  // Vite 的 HMR 会自动处理模块更新
  // 如果需要手动更新 store，可以使用以下代码：
  import.meta.hot.on('vite:beforeUpdate', () => {
    const { modules } = loadModules();
    store.hotUpdate({
      modules,
    });
  });
}

export default store;
