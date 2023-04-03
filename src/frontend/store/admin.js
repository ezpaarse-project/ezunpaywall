export default {
  namespaced: true,
  state: () => ({
    isAdmin: false,
    password: ''
  }),
  getters: {
    getPassword (state) {
      return state.password
    },
    getIsAdmin (state) {
      return state.isAdmin
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
