const context = {
  namespaced: true,
  state: {
    showContextMenu: '111111' //false // 右键菜单状态
  },
  mutations: {
    SHOWCONTEXTMENUTOGGLE(state, val) {
      state.showContextMenu = val
    }
  },
}
export default context