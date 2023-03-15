export default {
  namespaced: true,
  state: () => ({
    isAdmin: false,
    password: ''
  }),
  mutations: {
    setIsAdmin (state, value) {
      state.isAdmin = value
    },
    setPassword (state, value) {
      state.password = value
    }
  }
}
