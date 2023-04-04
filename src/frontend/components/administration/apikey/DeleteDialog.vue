<template>
  <v-dialog :value="value" max-width="1000px" @input="updateVisible($event)">
    <v-card>
      <v-toolbar color="primary" dark>
        <span class="mr-2" v-text="$t('administration.apikey.delete')" />
        <v-chip label color="secondary" text-color="white">
          {{ apikey }}
        </v-chip>
      </v-toolbar>
      <v-card-text>
        <div class="pa-12" v-text="$t('administration.apikey.deleteMessage')" />
      </v-card-text>
      <v-card-actions>
        <v-btn text class="red--text" @click.stop="updateVisible(false)">
          {{ $t("no") }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          :loading="loading"
          class="green--text"
          @click="deleteApikey()"
        >
          {{ $t("yes") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ApikeyDeleteDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    apikey: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    updateVisible (visible) {
      this.$emit('input', visible)
    },
    async deleteApikey () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'DELETE',
          url: `/keys/${this.apikey}`,
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (e) {
        this.$store.dispatch(
          'snacks/error',
          this.$t('administration.apikey.errorDelete')
        )
        this.loading = false
        return
      }
      this.$store.dispatch(
        'snacks/info',
        this.$t('administration.apikey.infoDeleted')
      )
      this.$emit('deleted')
      this.loading = false
      this.updateVisible(false)
    }
  }
}
</script>
