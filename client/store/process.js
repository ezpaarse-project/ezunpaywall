import Vue from 'vue'

let fileId = 1

export default {
  state: () => ({
    step: 1,
    progress: 0,
    logLines: '',
    logFiles: [],
    cancelSource: null,
    jobId: null,
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
    SET_JOB_ID (state, value) {
      Vue.set(state, 'jobId', value)
    },
    SET_PROCESS_STEP (state, step) {
      Vue.set(state, 'step', step)
    },
    SET_PROGRESS (state, data) {
      Vue.set(state, 'progress', data)
    },
    SET_LOG_LINES (state, data) {
      Vue.set(state, 'logLines', data)
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
    SET_STATUS (state, data) {
      Vue.set(state, 'status', data)
    },
    SET_REPORT (state, data) {
      Vue.set(state, 'report', data)
    },
    SET_LOGGING (state, data) {
      Vue.set(state, 'logging', data)
    },
    SET_ERROR (state, data) {
      Vue.set(state, 'error', data)
    },
    SET_TREATMENTS (state, data) {
      Vue.set(state, 'treatments', data)
    }
  },
  actions: {
    PROCESS ({ commit, rootState, dispatch }) {
      commit('SET_PROCESS_STEP', 3)
      commit('SET_ERROR', null)
    },
    CANCEL_PROCESS ({ commit, state }) {
      if (state.cancelSource) {
        state.cancelSource.cancel('Query canceled')
        commit('SET_CANCEL_SOURCE', null)
      }
      commit('SET_STATUS', 'abort')
    },
    SET_PROCESS_STEP ({ commit, state }, value) {
      const { status } = state
      let newStep = parseInt(value, 10)

      if (newStep >= 3 && !status) {
        newStep = state.step
      } else if (status === 'progress' || status === 'finalization') {
        newStep = 3
      } else if (newStep < 0) {
        newStep = 1
      } else if (newStep > 3) {
        newStep = 3
      }

      commit('SET_PROCESS_STEP', newStep)
    },
    SET_LOG_LINES ({ commit }, data) {
      commit('SET_LOG_LINES', data)
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
