<template>
  <v-dialog
    v-model="show"
    transition="dialog-top-transition"
    max-width="1000px"
    @click:outside="closeDialog()"
  >
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
            :items="intervalAttr"
            label="interval"
          />
          <v-text-field
            v-model="startDate"
            label="startDate"
            :rules="dateRule(startDate)"
          />
          <v-text-field
            v-model="endDate"
            label="dateEnd"
            :rules="dateRule(endDate)"
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
      interval: 'day',
      startDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      endDate: this.$dateFns.format(new Date(), 'yyyy-MM-dd'),
      name: ''
    }
  },
  computed: {
    intervalAttr () {
      return ['day', 'week']
    },
    show: {
      get () {
        return this.dialog
      },
      set (dialog) {
        this.$emit('input', dialog)
      }
    }
  },
  methods: {
    dateRule (date) {
      if (!date) { return ['YYYY-MM-DD'] }
      const match = date.match(/\d{4}-\d{2}-\d{2}/gm)
      if (match) { return [true] }
      return ['YYYY-MM-DD']
    },
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
      this.$store.dispatch('snacks/info', this.$t('administration.update.infoUpdate'))
      this.closeDialog()
    },
    closeDialog () {
      this.$emit('closed')
      this.show = false
    }
  }
}
</script>
