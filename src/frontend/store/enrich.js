export default {
  namespaced: true,
  state: () => ({
    files: [],
    type: '',
    apikey: 'demo',
    attributes: []
  }),
  getters: {
    getFiles (state) {
      return state.files
    },
    getType (state) {
      return state.type
    },
    getApikey (state) {
      return state.apikey
    },
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
