import { TkReq } from "@/interface";
// import router from '@/router'
const state = {
  systemData: "{}",
  urlQueryDataJson: "{}",
  reqQueryData: "{}",
  pageStyleData: {},
  loading: 0,
  notificationConfig: {
    color: "red",
    title: "错误提示",
    height: "600px",
    visible: false,
    panelOrButtonVisible: true,
    position: "bottomRight",
    showBtns: false,
    list: [],
    optHander: function (item, index) {},
  }, //消息提示配置
  invalidMenu: [],
  validateMenu:[],
  knowType: 0, //0 知识模型 1知识点
  actSettingMenu: [],
  toolJsData: {}, //江苏工具数据
  projectUIStyle: "",
  defaultUrl: "",
};

const getters = {
  systemData: (state) => {
    if (process.env.VUE_APP_STORAGE_ENCODE) {
      return JSON.parse(state.systemData.tkDecrypt());
    } else {
      return JSON.parse(state.systemData);
    }
  },
  urlQueryData: (state) => {
    return (needQueryUrl) => {
      const pathName = needQueryUrl || router.currentRoute.value.path;
      const paramJson = state.urlQueryDataJson[pathName];
      if (!paramJson) return {};
      if (process.env.VUE_APP_STORAGE_ENCODE) {
        return JSON.parse(paramJson.tkDecrypt());
      } else {
        return JSON.parse(paramJson);
      }
    };
  },
  curReqQueryData: (state) => {
    return (needQueryUrl) => {
      const pathName = needQueryUrl || router.currentRoute.value.path;
      const paramJson = state.reqQueryData[pathName];
      if (!paramJson) return {};
      if (process.env.VUE_APP_STORAGE_ENCODE) {
        return JSON.parse(paramJson.tkDecrypt());
      } else {
        return JSON.parse(paramJson);
      }
    };
  },
  actSettingMenu: (state) => {
    return state.actSettingMenu;
  },

  pageStyleData: (state) => {
    return state.pageStyleData;
  },
};

const mutations = {
  // 增加页面参数
  SET_QUERY_DATA: (state, data) => {
    try {
      //对象转json字符串
      let json = JSON.stringify(data.data);
      if (process.env.VUE_APP_STORAGE_ENCODE) {
        json = json.tkEncrypt();
      }

      if (typeof state.urlQueryDataJson === "string") state.urlQueryDataJson = JSON.parse(state.urlQueryDataJson);
      state.urlQueryDataJson[data.location] = json;
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  },
  // 删除页面参数
  DEL_QUERY_DATA: (state, pathName) => {
    delete state.urlQueryDataJson[pathName];
  },
  // 清空页面参数
  DEL_ALL_QUERY_DATA: (state) => {
    state.urlQueryDataJson = {};
  },
  // 增加页面接口请求参数
  SET_REQ_QUERY_DATA: (state, data) => {
    //对象转json字符串
    let json = JSON.stringify(data.data);
    if (process.env.VUE_APP_STORAGE_ENCODE) {
      json = json.tkEncrypt();
    }
    if (typeof state.reqQueryData === "string") state.reqQueryData = JSON.parse(state.reqQueryData);
    state.reqQueryData[data.location] = json;
  },
  // 将缓存的vuex数据设置
  SET_STORE_DATA_FROM_STORAGE: (state) => {
    let vuex = JSON.parse(window.sessionStorage.getItem("vuex"));
    for (const key in vuex) {
      if (Object.hasOwnProperty.call(vuex, key)) {
        state[key] = vuex[key];
      }
    }
  },
  // 删除页面接口请求参数
  DEL_REQ_QUERY_DATA: (state, pathName) => {
    delete state.reqQueryData[pathName];
  },
  // 清空页面接口请求参数
  DEL_ALL_REQ_QUERY_DATA: (state) => {
    state.reqQueryData = {};
  },
  // 设置全局的loading
  SET_LOADING: (state, loading) => {
    state.loading += loading;
    state.loading = state.loading < 0 ? 0 : state.loading;
  },
  // 设置全局UI界面风格
  SET_PROJECTUISTYLE: (state, type) => {
    state.projectUIStyle = type;
  },
  // 设置全局的notificationConfig
  SET_NOTIFICATIONCONFIG: (state, data) => {
    state.notificationConfig = { ...state.notificationConfig, ...data };
  },

  // 设置系统信息
  SET_SYSTEM_DATA: (state, data) => {
    //对象转json字符串
    let json = JSON.stringify(data);
    if (process.env.VUE_APP_STORAGE_ENCODE) {
      json = json.tkEncrypt();
    }
    state.systemData = json;
  },
  // 设置有效菜单 使用时机：1：登录 2：切换用户 3：进入项目加载时候，无菜单的时候
  SET_INVALIDE_MENU: (state, data) => {
    state.invalidMenu = data;
    // 返回第一个跳转路由-防止写死404路由
    const defultMenu = state.invalidMenu?.[0] ?? {};
    if (!defultMenu?.viewUrl) return "";
    state.defaultUrl = defultMenu?.childrens?.length
      ? `/${defultMenu.viewUrl}/${defultMenu?.childrens?.[0]?.viewUrl}`
      : `/${defultMenu.viewUrl}`;
  },

  SET_VALIDATE_MENU: (state, data) => {
    state.validateMenu = data;
    // 返回第一个跳转路由-防止写死404路由
    const defultMenu = state.validateMenu?.[0] ?? {};
    if (!defultMenu?.viewUrl) return "";
    state.defaultUrl = defultMenu?.childrens?.length
      ? `/${defultMenu.viewUrl}/${defultMenu?.childrens?.[0]?.viewUrl}`
      : `/${defultMenu.viewUrl}`;
  },
  // 设置活动知识点还是知识模型
  SET_ACT_KNOW_TYPE: (state, data) => {
    state.knowType = data;
  },
  // 设置活动设置菜单
  SET_ACT_SETTING_MENU: (state, data) => {
    state.actSettingMenu = data;
  },
  // 设置页面样式数据
  SET_PAGE_STYLE: (state, data) => {
    state.pageStyleData = { ...state.pageStyleData, ...data };
  },
  // 清空页面样式数据
  CLEAR_PAGE_STYLE: (state, data) => {
    state.pageStyleData = {};
  },
  // 设置页面样式数据
  SET_TOOL_JS_DATA: (state, data) => {
    state.toolJsData = { ...state.toolJsData, ...data };
  },
};

const actions = {
  // 接口 设置系统信息
  getSystemInfo({ commit }) {
    const exsitSystemData = JSON.stringify(state.systemData) === "{}";
    // if (!exsitSystemData) return;

    new TkReq()
      .path("getSystemInfo")
      .succ((res) => {
        commit("SET_SYSTEM_DATA", res.ret);
      })
      .send();
  },

  // 进入活动详情页面，更改活动详情页面全局存储数据
  async EnterTheActivityDetailPage({ commit }, { activityInfo = {}, projectInfo = {} }) {
    try {
      await tkConfirm("您将离开该页面，进入活动详情页面，确认是否继续？", "提示", {
        type: "warning",
        draggable: true,
        closeOnClickModal: false,
        customClass: "LatestStyle",
      });

      // 根据活动id查询左侧菜单列表
      const { ret: activityMenuList = [] } = await tkReq()
        .path("getMenuList")
        .param({
          activityId: activityInfo?.id ?? "",
          menuType: "1",
        })
        .send();

      // 菜单数据为空返回错误提示，并且不跳转页面
      if (!activityMenuList?.length) {
        // tkMessage.err("该活动没有设置活动菜单");
        return;
      }

      // 当前活动角色列表
      const { ret: activityRoleList = [] } = await tkReq()
        .path("getActivityRoleList")
        .param({ activityId: activityInfo?.id ?? "", isLoginFlag: "Y" })
        .send();

      const EnterActivityDetailPageData = {
        activityInfo: { ...activityInfo, subjectId: activityInfo.subject },
        activityMenuList,
        activityRoleList,
        projectInfo,
      };
      console.log("🚀 ~ EnterTheActivityDetailPage ~ EnterActivityDetailPageData:", EnterActivityDetailPageData);

      //存储数据，跳转页面
      commit("SET_QUERY_DATA", {
        location: "/activity/activityDetail",
        data: EnterActivityDetailPageData,
      });

      // 默认跳转左侧菜单第一个路由
      $push("/activity/activityDetail/" + activityMenuList?.[0]?.viewUrl);
    } catch (error) {
      // 取消进去详情页面
      console.log("🚀 ~ EnterTheActivityDetailPage ~ error:", error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
