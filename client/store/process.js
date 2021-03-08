import Vue from 'vue'

let fileId = 1

export default {
  state: () => ({
    progress: 0,
    logFiles: [],
    cancelSource: null,
    status: null,
    report: null,
    error: null,
    logging: [],
    treatments: []
  }),
  getters: {
    cancelable (state) {
      return state.cancelSource !== null
    }
  },
  mutations: {
    SET_PROGRESS (state, data) {
      Vue.set(state, 'progress', data)
    },
    ADD_LOG_FILE (state, file) {
      state.logFiles.push({ id: fileId, file })
      fileId += 1
    },
    REMOVE_LOG_FILE (state, id) {
      Vue.set(state, 'logFiles', state.logFiles.filter(file => file.id !== id))
    },
    CLEAR_LOG_FILES (state) {
      Vue.set(state, 'logFiles', [])
    },
    SET_CANCEL_SOURCE (state, data) {
      Vue.set(state, 'cancelSource', data)
    },
    SET_ERROR (state, data) {
      Vue.set(state, 'error', data)
    }
  },
  actions: {
    PROCESS ({ commit, rootState, dispatch }) {
      commit('SET_ERROR', null)
    },
    ADD_LOG_FILE ({ commit }, file) {
      commit('ADD_LOG_FILE', file)
    },
    REMOVE_LOG_FILE ({ commit }, id) {
      commit('REMOVE_LOG_FILE', id)
    },
    CLEAR_LOG_FILES ({ commit }) {
      commit('CLEAR_LOG_FILES')
    }
  }
}
