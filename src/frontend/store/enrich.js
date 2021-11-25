export default {
  namespaced: true,
  state: () => ({
    simple: [],
    best_oa_location: [],
    first_oa_location: [],
    oa_locations: [],
    z_authors: []
  }),
  actions: {
    add ({ commit }, value) {
      commit('add', { source: value.source, attrs: value.attrs })
    },
    update ({ commit }, value) {
      commit('update', { source: value.source, attrs: value.attrs })
    },
    del ({ commit }, value) {
      commit('del', { source: value.source, attrs: value.attrs })
    },
    resetAll ({ commit }) {
      commit('resetAll')
    }
  },
  mutations: {
    add (state, value) {
      if (Array.isArray(value?.attrs)) {
        state[value?.source].push(value?.attrs)
      }
    },
    update (state, value) {
      if (Array.isArray(value?.attrs)) {
        state[value?.source] = value?.attrs
      }
    },
    del (state, value) {
      if (Array.isArray(value?.attrs)) {
        state[value?.source] = state[value?.source].filter(e => e === value)
      }
    },
    resetAll (state) {
      state.simple = []
      state.best_oa_location = []
      state.first_oa_location = []
      state.oa_locations = []
      state.z_authors = []
    }
  }
}
