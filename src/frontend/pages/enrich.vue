<template>
  <v-card>
    <v-toolbar class="secondary" dark dense flat>
      <v-toolbar-title> {{ $t("ui.pages.enrich.title") }} </v-toolbar-title>
    </v-toolbar>

    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!inProcess"
          :complete="hasLogFiles"
          step="1"
        >
          {{ $t("ui.pages.enrich.stepper.filesSelection") }}
        </v-stepper-step>

        <v-divider :color="hasLogFiles && step > 1 ? 'primary' : ''" />

        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!inProcess"
          :complete="step > 2"
          step="2"
        >
          {{ $t("ui.pages.enrich.stepper.settings") }}
        </v-stepper-step>

        <v-divider :color="inProcess && step > 2 ? 'primary' : ''" />

        <v-stepper-step :editable="inProcess" step="3">
          {{ $t("ui.pages.enrich.stepper.enrich") }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-container>
            <v-layout row justify-end class="mb-3">
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
                  <v-card-text
                    v-html="
                      $t('ui.pages.enrich.filesSelection.explainationLogs')
                    "
                  />
                  <v-divider />
                  <v-card-text
                    v-html="
                      $t(
                        'ui.pages.enrich.filesSelection.explainationTestsLogs',
                        {
                          url: logSamplesUrl,
                        }
                      )
                    "
                  />

                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      class="body-2"
                      text
                      @click="fileSelectionHelp = false"
                      v-text="$t('ui.pages.enrich.filesSelection.close')"
                    />
                  </v-card-actions>
                </v-card>
              </v-menu>

              <v-btn
                class="body-2"
                color="primary"
                @click="step = 2"
                v-text="$t('ui.pages.enrich.filesSelection.continue')"
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
                v-text="$t('ui.pages.enrich.settings.filesSelection')"
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
                v-text="$t('ui.pages.enrich.settings.startProcess')"
              />
            </v-layout>
          </v-container>

          <v-toolbar class="secondary" dark dense flat>
            <v-toolbar-title>
              {{ $t("ui.pages.enrich.settings.title") }}
            </v-toolbar-title>
          </v-toolbar>

          <v-text-field
            v-model="apiKey"
            :append-icon="apiKeyVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[apiKeyRules.required]"
            :type="apiKeyVisible ? 'text' : 'password'"
            label="api key"
            filled
            @click:append="apiKeyVisible = !apiKeyVisible"
          />

          <v-select
            v-model="extensionSelected"
            :items="extensions"
            label="file extension"
            filled
          />

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
                {{ $t("ui.pages.enrich.process.download") }}
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
            <div v-text="$t('ui.pages.enrich.process.inProcess')" />
          </v-container>
          <v-container v-else class="text-center">
            <v-icon v-if="error" size="70" color="orange darken-2">
              mdi-alert-circle
            </v-icon>
            <v-icon v-else size="70" color="green darken-2">
              mdi-check
            </v-icon>
            <div v-if="error" v-text="$t('ui.pages.enrich.process.error')" />
            <div v-else v-text="$t('ui.pages.enrich.process.end')" />
          </v-container>
          <v-container>
            <Report :time="time" :state="state" />
          </v-container>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
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
      // config
      files: [],
      apiKey: '',
      apiKeyVisible: false,
      apiKeyRules: {
        required: value => !!value || 'Required.'
      },
      extensions: ['csv', 'jsonl'],
      // help
      fileSelectionHelp: false,
      logSamplesUrl: 'https://github.com/ezpaarse-project/ezunpaywall',
      // process
      state: {},
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
        const [, ext] = this.files[0].file.name.split('.')
        return ext
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
      } = this.$store.state.enrichArgs

      if (!simple.length && !best_oa_location.length && !first_oa_location.length && !oa_locations.length && !z_authors.length) {
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
    }
  },
  methods: {
    async enrich () {
      this.error = false
      this.inProcess = true

      const data = {
        type: this.extensionSelected,
        args: this.getSetting,
        separator: ','
      }

      const formData = new FormData()
      formData.append('file', this.files[0].file)

      let upload

      // upload
      try {
        upload = await this.$enrich({
          method: 'POST',
          url: '/upload',
          data: formData,
          headers: {
            'Content-Type': 'text/csv',
            'X-API-KEY': this.apiKey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', 'Cannot upload file')
        return this.errored()
      }

      data.id = upload?.data?.id

      // enrich
      try {
        await this.$enrich({
          method: 'POST',
          url: '/job',
          data,
          headers: {
            'X-API-KEY': this.apiKey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', 'Cannot enrich file')
        return this.errored()
      }

      let state

      // state of enrich
      do {
        try {
          state = await this.$enrich({
            method: 'GET',
            url: `/state/${data.id}.json`,
            responseType: 'json'
          })
          this.state = state?.data?.state
          // TODO use computed
          if (Number.isInteger(this.state?.createdAt)) {
            this.time = Math.round((Date.now() - this.state?.createdAt) / 1000)
          } else {
            this.time = 0
          }
        } catch (err) {
          this.$store.dispatch('snacks/error', 'Cannot get state of enrich')
          return this.errored()
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      } while (!state?.data?.state?.done)

      // done
      this.inProcess = false
      this.id = data.id
    },

    errored () {
      this.error = true
      this.inProcess = false
      this.state = {}
      this.time = 0
      this.id = ''
    },

    getFiles (files) {
      this.files = files
    }
  }
}
</script>
