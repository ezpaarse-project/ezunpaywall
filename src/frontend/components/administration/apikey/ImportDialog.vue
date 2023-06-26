<template>
  <v-dialog :value="value" max-width="1000px" @input="updateVisible($event)">
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        {{ $t('administration.apikey.import') }}
      </v-toolbar>
      <v-card-text>
        <v-textarea
          v-model="apikeys"
          outlined
          rows="15"
          label="apikeys"
          :value="apikeys"
          class="mt-4"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click.stop="loadApikeys()">
          {{ $t('send') }}
        </v-btn>
        <v-btn @click.stop="updateVisible(false)">
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ImportApikeyDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: () => {
    return {
      apikeys: ''
    }
  },
  methods: {
    updateVisible (visible) {
      this.$emit('input', visible)
    },
    async loadApikeys () {
      let parsedApikeys
      try {
        parsedApikeys = JSON.parse(this.apikeys)
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error..apikey.parse'))
        return
      }

      this.loading = true

      try {
        await this.$apikey({
          method: 'POST',
          url: '/keys/load',
          data: parsedApikeys,
          headers: {
            'X-API-KEY': this.$store.state.admin.password
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.apikey.import'))
        this.loading = false
        return
      }
      this.$store.dispatch('snacks/info', this.$t('info.apikey.imported'))
      this.$emit('imported')
      this.loading = false
      this.updateVisible(false)
    }
  }
}
</script>

<style>

</style>
