export default {
  namespaced: true,
  state: () => ({
    status: false,
    password: ''
  }),
  actions: {
    setAdmin ({ commit }, value) {
      commit('setAdmin', value)
    },
    setPassword ({ commit }, value) {
      commit('setPassword', value)
    }
  },
  mutations: {
    setAdmin (state, value) {
      state.status = value
    },
    setPassword (state, value) {
      state.password = value
    }
  }
}
