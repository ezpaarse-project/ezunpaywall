export default {
  namespaced: true,
  state: () => ({
    files: [],
    type: '',
    apikey: 'demo',
    attributes: []
  }),
  actions: {},
  getters: {
    getAttributes (state) {
      return state.attributes
    }
  },
  mutations: {
    setFiles (state, value) {
      state.files = value
    },
    setType (state, value) {
      state.type = value
    },
    setApikey (state, value) {
      state.apikey = value
    },
    setAttributes (state, value) {
      state.attributes = value
    }
  }
}
