import store from "@/store/index.js";
import { computed } from "vue";
import { mapState, mapActions, mapMutations, mapGetters, useStore } from "vuex";
export const tkState = store.state;
export const tkGetters = store.getters;
export const tkCommit = function (moduleFun, params) {
  return store.commit("app/" + moduleFun, params);
};
export const tkActions = function (moduleFun, params) {
  return store.dispatch("app/" + moduleFun, params);
};

/**
 * 获取加载消息提示配置
 * @returns
 */
export function getTkNotificationConfig() {
  return computed(() => {
    return tkState.app.notificationConfig;
  });
}

/**
 * 获取项目UI风格
 * @returns
 */
export function getTkProjectUIStyle() {
  return computed(() => {
    return tkState.app.projectUIStyle;
  });
}
/**
 * 获取加载状态
 * @returns
 */
export function getTkLoading() {
  return computed(() => {
    return tkState.app.loading > 0;
  });
}
/**
 * 获取菜单列表
 * @returns
 */
export function getInvalidMenu() {
  return computed(() => {
    return tkState.app.invalidMenu;
  });
}

/**
 * 获取校验菜单列表
 * @returns
 */
export function getValidateMenu() {
  return computed(() => {
    return tkState.app.validateMenu;
  });
}

/**
 * 获取当前URL请求参数
 * @returns
 */
export function getTkUrlQueryData(needQueryUrl) {
  const urlQueryData = tkGetters["app/urlQueryData"];
  return urlQueryData(needQueryUrl);
}

/**
 * 获取系统参数
 * @returns
 */
export function getTkSystemData() {
  return computed(() => {
    return {
      subName: "科目",
      optionsCount: 4,
      ...tkGetters["app/systemData"],
    };
  });
}

/**
 * 设置路由参数
 * @returns
 */
export function setAppQueryData(data) {
  store.commit("app/SET_QUERY_DATA", data);
}

/**
 * 设置请求参数
 * @returns
 */
export function setAppReqQueryData(data) {
  store.commit("app/SET_REQ_QUERY_DATA", data);
}

/**
 * 获取请求参数
 * @returns
 */
export function getCurReqQueryData(needQueryUrl) {
  const curReqQueryData = tkGetters["app/curReqQueryData"];
  return curReqQueryData(needQueryUrl);
}

/**
 * 获取默认菜单URL
 * @returns
 */
export function getDefaultUrl() {
  return computed(() => {
    return tkState.app.defaultUrl;
  });
}
/**
 * 设置菜单
 * @returns
 */
export function setinvalideMenu(data) {
  store.commit("app/SET_INVALIDE_MENU", data);
}

/**
 * 设置校验菜单
 * @returns
 */
export function setValidateMenu(data) {
  store.commit("app/SET_VALIDATE_MENU", data);
}

/**
 * 设置提示配置项
 * @returns
 */
export function setTkNotificationConfig(data) {
  store.commit("app/SET_NOTIFICATIONCONFIG", data);
}

/**
 * 获取活动知识模型或知识点
 * @returns
 */
export function getKnowType() {
  return computed(() => {
    return tkState.app.knowType;
  });
}

/**
 *
 * @param mapperFn  传入的map辅助函数，mapState, mapGetters, mapActions, mapMutations
 * @param mapper    方法或者属性的名字，actions或者mutations或者getter的函数名，state的属性名字
 * @param module    开启命名空间后的模块名
 * @resultFn {{}}    返回数组，数组内容为fn函数，fn函数为每个属性所对应的map辅助函数
 */
const hooks = (mapperFn, mapper, module = "app") => {
  const store = useStore(); // 引入vuex中的useStore函数
  const resultFn = {};
  let mapData = {};
  if (module) {
    // 判断是否存在命名空间，如果存在则绑定
    mapData = mapperFn(module, mapper);
  } else {
    mapData = mapperFn(mapper);
  }
  Object.keys(mapData).forEach((item) => {
    const fn = mapData[item].bind({ $store: store }); // 使用bind方法将得到map函数结果绑定到vuex上
    resultFn[item] = fn;
  });
  return resultFn;
};

/**
 * 满足mapState和mapGetters调用
 * @param mapperFn  传入的map辅助函数，主要是mapState和mapGetters
 * @param mapper    数组类型，主要是变量或者返回值的key
 * @param module    打开命名空间，模块名称，非必传
 * 调用hooks函数后得到其返回值，然后将返回值放在computed中做一个监听，
 * computed参会可以是函数的返回值，即这样就完成了对数据的返回监听
 */
const useDataHooks = (mapperFn, mapper, module = "app") => {
  const store = useStore();

  const storeState = {};

  let hooksData = hooks(mapperFn, mapper, module);

  Object.keys(hooksData).forEach((fnKey) => {
    const fn = hooksData[fnKey].bind({ $store: store });
    storeState[fnKey] = computed(fn);
  });
  return storeState;
};

/**
 * 封装useState函数
 * @param module   命名空间，名称
 * @param mapper  数组， state中定义的变量名称
 */
export const useState = (mapper, module) => {
  return useDataHooks(mapState, mapper, module);
};

/**
 * 封装useGetters函数
 * @param module  命名空间，
 * @param mapper 数组，即getters中的返回值名称
 */
export const useGetters = (mapper, module) => {
  return useDataHooks(mapGetters, mapper, module);
};

/**
 * 封装mapMutations函数
 * @param mapper  数组，mutations中函数的名称
 * @param module  命名空间，模块名称
 */
export const useMutations = (mapper, module) => {
  return hooks(mapMutations, mapper, module);
};

/**
 * 封装mapActions函数
 * @param mapper  数组，actions中函数的名称
 * @param module  命名空间，模块名称
 */
export const useActions = (mapper, module) => {
  return hooks(mapActions, mapper, module);
};

/**
 * 获取活动角色列表
 * @returns
 */
export function getAcitivityRolesList() {
  return computed(() => {
    return tkState.system.activityRoles;
  });
}
/**
 * 获取系统角色列表
 * @returns
 */
export function getRolesList() {
  return computed(() => {
    return tkState.system.roles;
  });
}

/**
 * 获取系统角色列表
 * @returns
 */
export function getCurrRole() {
  return computed(() => {
    return tkState.system.currentRole;
  });
}

/**
 * 设置活动角色列表
 * @returns
 */
export function SET_ACITIVITY_ROLES(data) {
  store.commit("system/SET_ACITIVITY_ROLES", data);
}

/**
 * 设置系统角色列表
 * @returns
 */
export function SET_ROLES(data) {
  store.commit("system/SET_ROLES", data);
}

/**
 * 清空页面vuex 数据
 * @returns
 */
export function DEL_ALL_QUERY_DATA() {
  store.commit("app/DEL_ALL_QUERY_DATA");
}
/**
 * 清空页面vuex 数据
 * @returns
 */
export function DEL_ALL_REQ_QUERY_DATA() {
  store.commit("app/DEL_ALL_REQ_QUERY_DATA");
}

/**
 * 设置江苏工具数据
 * @returns
 */
export function setToolJsData(data) {
  store.commit("app/SET_TOOL_JS_DATA", data);
}

/**
 * 获取江苏工具数据
 * @returns
 */
export function getToolJsData() {
  return computed(() => {
    return tkState.app.toolJsData;
  });
}

/**
 * 设置当前角色_工具
 * @returns
 */
export function SET_CURRENT_ROLE(data) {
  store.commit("system/SET_CURRENT_ROLE", data);
}

/**
 * 获取当前角色_工具
 * @returns
 */
export function getCurrentRole() {
  return computed(() => {
    return tkState.system.currentRole;
  });
}
/**
 * 获取当前角色是否管理员_工具
 * @returns
 */
export function getIsMger() {
  return computed(() => {
    return tkState.system.currentRole.type == 0;
  });
}
/**
 * 获取 试卷结构临时存储数据
 */
export function getEditingPaperStructure() {
  return computed(() => {
    return tkState.createTestQuertions_hn.editingPaperStructure;
  });
}
/**
 * 修改 试卷结构临时存储数据
 */
export function updateEditingPaperStructure(params) {
  store.commit("createTestQuertions_hn/UPDATE_PAPER_STRUCTURE", params);
}
