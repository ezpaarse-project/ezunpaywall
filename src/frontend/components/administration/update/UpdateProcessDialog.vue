<template>
  <v-dialog :value="visible" max-width="1000px" @input="closeDialog">
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <span class="mr-2" v-text="$t('administration.update.title')" />
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form id="form" v-model="valid" @submit.prevent="startUpdate()">
            <v-select
              v-model="interval"
              class="mt-4"
              :items="intervals"
              :label="$t('administration.update.interval')"
            />
            <v-text-field
              v-model="startDate"
              :label="$t('administration.update.startDate')"
              :rules="[dateFormatRule, dateIsFutureRule]"
              autofocus
            />
            <v-text-field
              v-model="endDate"
              :label="$t('administration.update.endDate')"
              :rules="[dateFormatRule, dateIsFutureRule]"
            />
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="closeDialog()"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          form="form"
          :disabled="!valid"
          :loading="loading"
          class="green--text"
        >
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UpdateProcessDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      valid: true,
      loading: false,
      interval: 'day',
      intervals: ['day', 'week'],
      startDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      endDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      dateFormatRule: value => this.$dateFns.isMatch(value, 'yyyy-MM-dd') || 'YYYY-MM-DD',
      dateIsFutureRule: value => Date.now() > new Date(value) || this.$t('administration.update.future')
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
  methods: {
    async startUpdate () {
      this.loading = true
      try {
        await this.$update({
          method: 'POST',
          url: '/job/period',
          data: {
            interval: this.interval,
            startDate: this.startDate,
            endDate: this.endDate
          },
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.update.start'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.update.started'))
      this.closeDialog()
    },
    closeDialog () {
      this.$emit('closed')
      this.visible = false
    }
  }
}
</script>
