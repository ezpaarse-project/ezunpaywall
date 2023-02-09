export default {
  namespaced: true,
  state: () => ({
    isAdmin: false,
    password: ''
  }),
  actions: {
    setIsAdmin ({ commit }, value) {
      commit('setIsAdmin', value)
    },
    setPassword ({ commit }, value) {
      commit('setPassword', value)
    }
  },
  mutations: {
    setIsAdmin (state, value) {
      state.isAdmin = value
    },
    setPassword (state, value) {
      state.password = value
    }
  }
}
