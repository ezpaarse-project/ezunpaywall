<template>
  <v-dialog :value="value" max-width="1000px" @input="updateVisible($event)">
    <v-card>
      <v-toolbar color="primary" dark>
        {{ $t("administration.apikey.export") }}
      </v-toolbar>
      <v-card-text>
        <pre>
          <code v-highlight class="json"> {{ apikeys }} </code>
        </pre>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="downloadItem()">
          {{ $t("download") }}
        </v-btn>
        <v-btn @click="copyText()">
          {{ $t("copy") }}
        </v-btn>
        <v-btn @click.stop="updateVisible(false)">
          {{ $t("close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ExportApikeyDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    apikeys: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    downloadItem () {
      const element = document.createElement('a')
      const stringifiedApikey = encodeURIComponent(JSON.stringify(this.apikeys, null, 2))
      element.setAttribute('href', `data:text/plain;charset=utf-8,${stringifiedApikey}`)
      element.setAttribute('download', `${this.$dateFns.format(new Date(), 'yyyy-MM-dd')}.apikeys-export.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    },
    /**
     * Necessary on preprod
     * (http environment)
     */
    unsecuredCopyToClipboard (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.setAttribute('display', 'none')
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        this.$store.dispatch(
          'snacks/error',
          this.$t('apikey.errorCopyRequest')
        )
      }
      document.body.removeChild(textArea)
    },
    copyText () {
      try {
        if (window.isSecureContext && navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(this.apikeys, null, 2))
        } else {
          this.unsecuredCopyToClipboard(JSON.stringify(this.apikeys, null, 2))
        }
        this.$store.dispatch('snacks/info', this.$t('administration.apikey.copyAPIkey'))
      } catch (err) {
        this.$store.dispatch(
          'snacks/error',
          this.$t('apikey.errorCopyRequest')
        )
      }
    },
    updateVisible (visible) {
      this.$emit('input', visible)
    }
  }
}
</script>

<style>
</style>
