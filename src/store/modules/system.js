import { TkReq } from "@/interface";

const state = {
  token: "", //getToken(),
  name: "asfdaf",
  avatar: "",
  introduction: "",
  systemData: {},
  roles: [],
  activityRoles: [],
  currentRole: {},
};

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_ACITIVITY_ROLES: (state, roles) => {
    state.activityRoles = roles;
  },
  SET_SYSTEM_DATA: (state, data) => {
    state.systemData = data;
  },
  SET_CURRENT_ROLE: (state, role) => {
    state.currentRole = role;
  },
};

const actions = {
  getSystemInfo({ commit }) {
    new TkReq()
      .path("getSystemInfo")
      .succ((res) => {
        commit("SET_SYSTEM_DATA", res.ret);
      })
      .send();
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
