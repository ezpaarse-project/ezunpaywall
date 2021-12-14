<template>
  <v-chip v-if="inUpdate">
    <div>
      {{ $t('status.inUpdate') }} - {{ latestTask }} - {{ percent }}%
      <v-progress-circular right :size="20" :width="3" indeterminate color="green" />
    </div>
  </v-chip>
  <v-chip v-else>
    {{ $t('status.noInUpdate') }}
    <v-icon right>
      mdi-check
    </v-icon>
  </v-chip>
</template>

<script>
export default {
  data: () => {
    return {
      timeout: '',
      inUpdate: false,
      state: null
    }
  },
  computed: {
    latestStep () {
      if (Array.isArray(this.state?.steps)) {
        return this.state.steps[this.state.steps.length - 1]
      }
      return null
    },
    latestTask () {
      return this.latestStep?.task
    },
    percent () {
      return this.latestStep?.percent
    }
  },
  mounted () {
    this.checkIfUpdate()
  },
  destroyed () {
    clearTimeout(this.timeout)
  },
  methods: {
    async checkIfUpdate () {
      let res
      try {
        res = await this.$update({
          method: 'get',
          url: '/status'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('status.errorStatus'))
      }
      if (res?.data?.inUpdate) {
        this.inUpdate = true
        await this.getState()
      } else {
        this.inUpdate = false
      }
      this.timeout = await new Promise(resolve => setTimeout(resolve, 10000))
      await this.checkIfUpdate()
    },
    async getState () {
      let res
      try {
        res = await this.$update({
          method: 'get',
          url: '/state',
          params: {
            latest: true
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('status.errorState'))
      }
      this.state = res?.data?.state
    }
  }
}
</script>
