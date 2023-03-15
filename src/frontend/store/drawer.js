export default {
  namespaced: true,
  state: () => ({
    status: true
  }),
  getters: {
    getStatus (state) {
      return state.status
    }
  },
  mutations: {
    setDrawer (state, value) {
      state.status = value
    }
  }
}
