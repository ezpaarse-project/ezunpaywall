export default {
  namespaced: true,
  state: () => ({
    isAdmin: false,
    password: ''
  }),
  getters: {
    getIsAdmin (state) {
      return state.isAdmin
    },
    getPassword (state) {
      return state.password
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
