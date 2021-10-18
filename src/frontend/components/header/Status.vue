<template>
  <v-chip v-if="inUpdate">
    <div>
      Mise à jour en cours - {{ latestTask }} - {{ percent }}%
      <v-progress-circular right :size="20" :width="3" indeterminate color="green" />
    </div>
  </v-chip>
  <v-chip v-else>
    Les données sont à jour
    <v-icon right>mdi-check</v-icon>
  </v-chip>
</template>

<script>
export default {
  data: () => {
    return {
      inUpdate: false,
      state: null
    }
  },
  computed: {
    latestTask () {
      if (this.state) {
        return this.state.steps[this.state.steps.length - 1].task
      }
      return null
    },
    percent () {
      if (this.state) {
        return this.state.steps[this.state.steps.length - 1].percent
      }
      return null
    }
  },
  mounted () {
    this.checkIfUpdate()
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
        this.$store.dispatch('snacks/error', 'Cannot get status of update')
      }
      if (res?.data?.inUpdate) {
        this.inUpdate = true
        await this.getState()
      } else {
        this.inUpdate = false
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
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
        this.$store.dispatch('snacks/error', 'Cannot get state of update')
      }
      this.state = res?.data?.state
    }
  }
}
</script>
