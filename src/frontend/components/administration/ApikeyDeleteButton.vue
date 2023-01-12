<template>
  <v-col cols="auto">
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="1000"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          color="red"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <span class="mr-2" v-text="$t('administration.apikey.delete')" /> <span class="overline" v-text="apikey" />
        </v-toolbar>
        <v-card-text>
          <div class="pa-12" v-text="$t('administration.apikey.deleteMessage')" />
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            class="red--text"
            @click="dialog = false"
            v-text="$t('no')"
          />
          <v-spacer />
          <v-btn
            text
            class="green--text"
            @click="deleteApikey()"
            v-text="$t('yes')"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
export default {
  name: 'ApikeyDeleteButton',
  props: {
    apikey: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialog: false
    }
  },
  methods: {
    async deleteApikey () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'DELETE',
          url: `/keys/${this.apikey}`,
          headers: {
            'X-API-KEY': this.$store.state.admin.password
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.apikey.errorDelete'))
        this.loading = false
        return
      }
      this.$store.dispatch('snacks/info', this.$t('administration.apikey.infoDelete'))
      this.dialog = false
      this.$emit('deleted')
    }
  }
}
</script>
