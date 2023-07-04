<template>
  <section>
    <div v-text="$t('enrich.general')" />
    <div v-text="$t('enrich.example')" />
    <v-btn @click="download()">
      <v-icon left>
        mdi-download
      </v-icon>
      csv
    </v-btn>
    <v-btn @click="download()">
      <v-icon left>
        mdi-download
      </v-icon>
      jsonl
    </v-btn>
    <v-card class="my-3">
      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title> {{ $t('enrich.enrichFile') }} </v-toolbar-title>
        <v-spacer />
        <v-icon>mdi-code-json</v-icon>
      </v-toolbar>

      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step
            edit-icon="mdi-check"
            :editable="!isProcessing"
            :complete="hasFiles"
            step="1"
          >
            {{ $t("enrich.filesSelection") }}
          </v-stepper-step>

          <v-divider :color="hasFiles && step > 1 ? 'primary' : ''" />

          <v-stepper-step
            edit-icon="mdi-check"
            :editable="hasFiles && !isProcessing"
            :complete="step > 2"
            step="2"
          >
            {{ $t("enrich.settings") }}
          </v-stepper-step>

          <v-divider :color="hasUnpaywallAttributes && step > 2 ? 'primary' : ''" />

          <v-stepper-step step="3">
            {{ $t("enrich.enrich") }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-row class="my-3 mx-1">
              <v-spacer />
              <v-btn
                class="body-2"
                color="primary"
                :disabled="!hasFiles"
                @click="setStep(2)"
              >
                {{ $t("enrich.continue") }}
              </v-btn>
            </v-row>
            <LogFileTab />
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-row align-center class="my-3 mx-1">
              <v-btn class="body-2" color="primary" @click="setStep(1)">
                {{ $t("enrich.settings") }}
              </v-btn>
              <v-spacer />
              <v-btn
                class="body-2"
                color="primary"
                :disabled="!hasUnpaywallAttributes"
                @click="setStep(3)"
              >
                {{ $t("enrich.startProcess") }}
              </v-btn>
            </v-row>
            <ConfigJobTab />
          </v-stepper-content>

          <v-stepper-content step="3">
            <ProcessTab ref="process" @isProcessing="setIsProcessing($event)" @status="setIsProcessing($event)" />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </section>
</template>

<script>
import LogFileTab from '~/components/enrich/LogFileTab.vue'
import ConfigJobTab from '~/components/enrich/ConfigJobTab.vue'
import ProcessTab from '~/components/enrich/ProcessTab.vue'

export default {
  name: 'Enrich',
  components: {
    LogFileTab,
    ConfigJobTab,
    ProcessTab
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      // stepper
      step: 1,
      // status
      isProcessing: false,
      type: 'csv'
    }
  },
  head () {
    return {
      title: 'Enrich'
    }
  },
  computed: {
    files () {
      return this.$store.getters['enrich/getFiles']
    },
    attributes () {
      return this.$store.getters['enrich/getAttributes']
    },
    hasFiles () {
      return Array.isArray(this.files) && this.files.length > 0
    },
    hasUnpaywallAttributes () {
      return Array.isArray(this.attributes) && this.attributes.length > 0
    }
  },
  methods: {
    setStep (step) {
      this.step = step
      if (step === 3) {
        this.$root.$emit('startEnrich')
      }
    },
    setIsProcessing (isProcessing) {
      this.isProcessing = isProcessing
    },
    async download () {
      let download
      try {
        download = await this.$enrich({
          method: 'GET',
          url: `/example/${this.type}`,
          responseType: 'blob'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.enrich.download'))
        return this.errored()
      }
      this.forceFileDownload(download)
    },

    forceFileDownload (response) {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      console.log(response.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', this.resultID)
      document.body.appendChild(link)
      link.click()
    }
  }
}
</script>
