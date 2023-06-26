<template>
  <v-menu
    v-model="isShowed"
    bottom
    offset-y
    :close-on-content-click="false"
    :nudge-width="200"
  >
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-progress-circular
          v-if="inUpdate"
          :size="20"
          :width="3"
          indeterminate
          color="white"
        />
        <v-icon v-else>
          mdi-check-circle
        </v-icon>
      </v-btn>
    </template>

    <v-card class="text-justify">
      <v-card-text v-if="inUpdate">
        {{ $t("status.inUpdate", { latestTaskName, percent } ) }}
      </v-card-text>
      <v-card-text v-else>
        {{ $t("status.noInUpdate") }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn class="body-2" text @click="isShowed = false">
          {{ $t("close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  data: () => {
    return {
      isShowed: false,
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
    latestTaskName () {
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
        this.$store.dispatch('snacks/error', this.$t('error.status.status'))
      }
      if (res?.data) {
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
          url: '/states',
          params: {
            latest: true
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.status.state'))
      }
      this.state = res?.data
    }
  }
}
</script>
