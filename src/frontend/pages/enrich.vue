<template>
  <section>
    <div v-html="$t('enrich.general')" />
    <v-card class="my-3">
      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title v-text="$t('enrich.enrichFile')" />
        <v-spacer />
        <v-icon>mdi-code-json</v-icon>
      </v-toolbar>

      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step
            edit-icon="mdi-check"
            :editable="!inProcess"
            :complete="hasLogFiles"
            step="1"
            @click="resetArgs"
          >
            {{ $t("enrich.filesSelection") }}
          </v-stepper-step>

          <v-divider :color="hasLogFiles && step > 1 ? 'primary' : ''" />

          <v-stepper-step
            edit-icon="mdi-check"
            :editable="hasLogFiles"
            :complete="step > 2"
            step="2"
          >
            {{ $t("enrich.settings") }}
          </v-stepper-step>

          <v-divider :color="inProcess && step > 2 ? 'primary' : ''" />

          <v-stepper-step :editable="inProcess" step="3">
            {{ $t("enrich.enrich") }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-container>
              <v-layout row class="mb-3 ml-1">
                <v-row align="center">
                  <div class="mr-1" v-text="$t('enrich.authorizedFile')" />
                  <v-chip-group
                    v-for="extension in authorizedFile"
                    :key="extension.name"
                  >
                    <v-chip :color="extension.color" label text-color="white">
                      {{ extension.name }}
                    </v-chip>
                  </v-chip-group>
                </v-row>
                <v-spacer />
                <v-menu
                  v-model="fileSelectionHelp"
                  :close-on-content-click="false"
                  :nudge-width="200"
                  max-width="500"
                  offset-x
                  transition="slide-x-transition"
                >
                  <template #activator="{ on }">
                    <v-btn class="mr-5" icon v-on="on">
                      <v-icon>mdi-help-circle</v-icon>
                    </v-btn>
                  </template>

                  <v-card class="text-justify">
                    <v-card-text v-html="$t('enrich.explainationLogs')" />
                    <v-divider />
                    <v-card-text
                      v-html="
                        $t('enrich.explainationTestsLogs', {
                          url: logSamplesUrl,
                        })
                      "
                    />

                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        class="body-2"
                        text
                        @click="fileSelectionHelp = false"
                        v-text="$t('close')"
                      />
                    </v-card-actions>
                  </v-card>
                </v-menu>
                <v-btn
                  class="body-2"
                  color="primary"
                  @click="step = 2"
                  v-text="$t('enrich.continue')"
                />
              </v-layout>
            </v-container>
            <LogFiles class="ma-1" @files="getFiles($event)" />
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-container>
              <v-layout row align-center class="mb-3">
                <v-btn
                  class="body-2"
                  color="primary"
                  @click="step = 1"
                  v-text="$t('enrich.settings')"
                />
                <v-spacer />
                <v-btn
                  class="body-2"
                  color="primary"
                  :disabled="!hasLogFiles || !getSetting"
                  @click="
                    enrich();
                    step = 3;
                  "
                  v-text="$t('enrich.startProcess')"
                />
              </v-layout>
            </v-container>

            <v-toolbar class="secondary" dark dense flat>
              <v-toolbar-title v-text="$t('enrich.settings')" />
            </v-toolbar>

            <v-text-field
              v-model="apiKey"
              :append-icon="apiKeyVisible ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[apiKeyRules.required]"
              :type="apiKeyVisible ? 'text' : 'password'"
              :label="$t('enrich.apiKey')"
              filled
              @click:append="apiKeyVisible = !apiKeyVisible"
            />
            <v-row class="mb-3 ml-1">
              <div class="mr-1" v-text="$t('enrich.fileExtension')" />
              <v-chip
                label
                text-color="white"
                :color="extensionFileColor"
              >
                {{ extensionSelected }}
              </v-chip>
            </v-row>

            <v-toolbar class="secondary" dark dense flat>
              <v-toolbar-title v-text="$t('enrich.unpaywallAttributes')" />
              <v-menu
                v-model="unpaywallArgsHelp"
                :close-on-content-click="false"
                :nudge-width="200"
                max-width="500"
                offset-x
                transition="slide-x-transition"
              >
                <template #activator="{ on }">
                  <v-btn class="mr-5" icon v-on="on">
                    <v-icon>mdi-help-circle</v-icon>
                  </v-btn>
                </template>

                <v-card class="text-justify">
                  <v-card-text
                    v-html="$t('unpaywallArgs.help', { url: dataFormatURL })"
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      class="body-2"
                      text
                      @click="unpaywallArgsHelp = false"
                      v-text="$t('close')"
                    />
                  </v-card-actions>
                </v-card>
              </v-menu>
            </v-toolbar>

            <SettingsCSV v-if="extensionSelected === 'csv'" />
            <SettingsJSONL v-if="extensionSelected === 'jsonl'" />
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-container>
              <v-layout row justify-end class="mb-3">
                <v-btn :href="resultUrl" :disabled="inProcess || error">
                  <v-icon left>
                    mdi-download
                  </v-icon>
                  {{ $t("enrich.download") }}
                </v-btn>
              </v-layout>
            </v-container>
            <v-container v-if="inProcess" class="text-center">
              <v-progress-circular
                :size="70"
                :width="7"
                indeterminate
                color="green"
              />
              <div v-text="stepTitle" />
            </v-container>
            <v-container v-else class="text-center">
              <v-icon v-if="error" size="70" color="orange darken-2">
                mdi-alert-circle
              </v-icon>
              <v-icon v-else size="70" color="green darken-2">
                mdi-check
              </v-icon>
              <div v-if="error" v-text="$t('enrich.error')" />
              <div v-else v-text="$t('enrich.end')" />
            </v-container>
            <v-container>
              <Report :time="time" :state="state" />
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </section>
</template>

<script>
import LogFiles from '~/components/enrich/LogFiles.vue'
import SettingsCSV from '~/components/enrich/SettingsCSV.vue'
import SettingsJSONL from '~/components/enrich/SettingsJSONL.vue'
import Report from '~/components/enrich/Report.vue'

export default {
  name: 'Enrich',
  components: {
    LogFiles,
    SettingsCSV,
    SettingsJSONL,
    Report
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      // stepper
      step: 1,
      authorizedFile: [
        { name: 'csv', color: 'green' },
        { name: 'jsonl', color: 'orange' }
      ],
      // config
      files: [],
      apiKey: 'demo',
      apiKeyVisible: false,
      apiKeyRules: {
        required: value => !!value || 'Required.'
      },
      // help
      fileSelectionHelp: false,
      unpaywallArgsHelp: false,
      logSamplesUrl: 'https://github.com/ezpaarse-project/ezunpaywall',
      attrsHelp: false,
      dataFormatURL: 'https://unpaywall.org/data-format',
      // process
      state: {},
      stepTitle: '',
      timer: undefined,
      time: 0,
      inProcess: false,
      error: false,
      id: ''
    }
  },
  computed: {
    // config
    hasLogFiles () {
      return Array.isArray(this.files) && this.files.length > 0
    },
    extensionSelected () {
      if (this.files.length !== 0) {
        const ext = this.files[0].file.name.split('.')
        return ext[ext.length - 1]
      }
      return ''
    },
    getSetting () {
      const {
        simple,
        best_oa_location,
        first_oa_location,
        oa_locations,
        z_authors
      } = this.$store.state.enrich
      if (
        !simple.length &&
        !best_oa_location.length &&
        !first_oa_location.length &&
        !oa_locations.length &&
        !z_authors.length
      ) {
        return ''
      }

      const attrs = []

      if (simple.length) {
        attrs.push(simple.join(', '))
      }
      if (best_oa_location.length) {
        attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`)
      }
      if (first_oa_location.length) {
        attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`)
      }
      if (oa_locations.length) {
        attrs.push(`oa_locations { ${oa_locations.join(', ')} }`)
      }
      if (z_authors.length) {
        attrs.push(`z_authors { ${z_authors.join(', ')} }`)
      }

      return `{ ${attrs.join(', ')} }`
    },
    // process
    resultUrl () {
      return `${this.$enrich.defaults.baseURL}/enriched/${this.id}.${this.extensionSelected}`
    },

    extensionFileColor () {
      const extension = this.authorizedFile.find(
        file => file.name === this.extensionSelected
      )
      return extension?.color || 'gray'
    }
  },
  methods: {
    async enrich () {
      this.time = 0
      this.error = false
      this.startTimer(Date.now())
      this.inProcess = true

      const data = {
        type: this.extensionSelected,
        args: this.getSetting,
        separator: ','
      }

      const formData = new FormData()
      formData.append('file', this.files[0].file)

      let upload

      this.stepTitle = this.$t('enrich.stepUpload')
      try {
        upload = await this.$enrich({
          method: 'POST',
          url: '/upload',
          data: formData,
          headers: {
            'Content-Type': 'text/csv',
            'X-API-KEY': this.apiKey
          },
          responseType: 'json',
          timeout: 0
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('enrich.errorUpload'))
        return this.errored()
      }

      const { id } = upload

      this.stepTitle = this.$t('enrich.stepEnrich')
      try {
        await this.$enrich({
          method: 'POST',
          url: `/job/${id}`,
          data,
          headers: {
            'X-API-KEY': this.apiKey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('enrich.errorEnrich'))
        return this.errored()
      }

      let state

      // state of enrich
      do {
        try {
          state = await this.$enrich({
            method: 'GET',
            url: `/states/${id}.json`,
            responseType: 'json'
          })
          this.state = state?.data
        } catch (err) {
          this.$store.dispatch('snacks/error', this.$t('enrich.errorState'))
          return this.errored()
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      } while (!state?.data?.done)

      this.stopTimer()
      // done
      this.inProcess = false
      this.id = id
    },

    startTimer (startTime) {
      this.timer = setInterval(() => {
        this.time = Math.ceil((Date.now() - startTime) / 1000)
      }, 500)
    },

    stopTimer () {
      clearInterval(this.timer)
    },

    errored () {
      this.stopTimer()
      this.error = true
      this.inProcess = false
      this.state = {}
      this.id = ''
    },

    resetArgs () {
      this.$store.dispatch('enrich/resetAll')
    },

    getFiles (files) {
      this.files = files
    }
  }
}
</script>
