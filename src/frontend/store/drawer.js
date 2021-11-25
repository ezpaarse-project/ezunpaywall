export default {
  namespaced: true,
  state: () => ({
    status: true
  }),
  actions: {
    setDrawer ({ commit }, value) {
      commit('setDrawer', value)
    }
  },
  mutations: {
    setDrawer (state, value) {
      state.status = value
    }
  }
}
