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
          <v-form id="form">
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
  name: 'UpdateDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
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
    async updateCron () {
      this.loading = true
      try {
        await this.$update({
          method: 'POST',
          url: '/cron/patch',
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.update'))
        this.loading = false
        return
      }
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.cron.updated'))
      this.closeDialog()
    },
    closeDialog () {
      this.$emit('closed')
      this.visible = false
    }
  }
}
</script>
