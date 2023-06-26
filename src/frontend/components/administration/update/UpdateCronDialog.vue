<template>
  <v-dialog :value="visible" max-width="1000px" @input="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark>
        <span class="mr-2" v-text="$t('administration.cron.title')" />
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form id="form" @submit.prevent="updateCron()">
            <v-select
              v-model="interval"
              class="mt-4"
              :items="intervals"
              :label="$t('administration.cron.interval')"
            />
            <v-text-field
              v-model="schedule"
              :label="$t('administration.cron.schedule')"
            />
            <v-text-field
              v-model="index"
              :label="$t('administration.cron.index')"
            />
          </v-form>
        </v-container>
        <v-card-actions>
          <span class="mr-2" v-text="`${$t('administration.cron.active')} :`" />
          <v-checkbox
            v-model="active"
          />
        </v-card-actions>
      </v-card-text>
      <v-card-actions>
        <v-btn text class="red--text" @click.stop="closeDialog()">
          {{ $t("cancel") }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          form="form"
          :disabled="!3"
          :loading="loading"
          class="green--text"
        >
          {{ $t("update") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UpdateCronDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      intervals: ['day', 'week'],
      index: 'day',
      schedule: '0 0 0 * * *',
      interval: 'unpaywall',
      active: false
    }
  },
  computed: {
    visible: {
      get () {
        return this.dialog
      },
      set (dialog) {
        this.$emit('input', dialog)
      }
    }
  },
  async mounted () {
    await this.getUpdateCronConfig()
  },
  methods: {
    async getUpdateCronConfig () {
      let cronConfig
      try {
        cronConfig = await this.$update({
          method: 'GET',
          url: '/cron'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.get'))
        this.loading = false
        return
      }
      this.loading = false
      cronConfig = cronConfig?.data
      this.index = cronConfig.index
      this.interval = cronConfig.interval
      this.schedule = cronConfig.schedule
      this.active = cronConfig.active
    },
    async updateCron () {
      this.loading = true
      try {
        await this.$update({
          method: 'PATCH',
          url: '/cron',
          data: {
            index: this.index,
            interval: this.interval,
            time: this.schedule
          },
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.update'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.cron.updated'))

      if (this.active) {
        await this.activeCron()
      } else {
        await this.stopCron()
      }
      this.closeDialog()
    },
    async activeCron () {
      try {
        await this.$update({
          method: 'POST',
          url: '/cron/start',
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.active'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.cron.activated'))
    },
    async stopCron () {
      try {
        await this.$update({
          method: 'POST',
          url: '/cron/stop',
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.stop'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.cron.stoped'))
    },
    closeDialog () {
      this.$emit('closed')
      this.visible = false
    }
  }
}
</script>
