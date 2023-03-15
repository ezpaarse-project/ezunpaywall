export default {
  namespaced: true,
  state: () => ({
    status: true
  }),
  mutations: {
    setDrawer (state, value) {
      state.status = value
    }
  }
}
