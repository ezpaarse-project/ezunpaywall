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
          <v-select
            v-model="interval"
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
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="closeDialog()"
          v-text="$t('cancel')"
        />
        <v-spacer />
        <v-btn
          text
          :loading="loading"
          class="green--text"
          @click="startUpdate()"
          v-text="$t('create')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UpdateDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      interval: 'day',
      startDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      endDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      dateFormatRule: value => this.$dateFns.isMatch(value, 'yyyy-MM-dd') || 'YYYY-MM-DD',
      dateIsFutureRule: value => Date.now() > new Date(value) || this.$t('administration.update.future')
    }
  },
  computed: {
    intervals () {
      return ['day', 'week']
    },
    validForm () {
      return this.$dateFns.isMatch(this.startDate, 'yyyy-MM-dd') &&
        this.$dateFns.isMatch(this.endDate, 'yyyy-MM-dd') &&
        new Date(this.endDate) <= Date.now()
    },
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
            'X-API-KEY': this.$store.state.admin.password
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.update.errorUpdate'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('administration.update.infoUpdate'))
      this.closeDialog()
    },
    closeDialog () {
      this.$emit('closed')
      this.visible = false
    }
  }
}
</script>
