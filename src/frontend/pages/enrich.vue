<template>
  <v-card>
    <v-toolbar class="secondary" dark dense flat>
      <v-toolbar-title> {{ $t("ui.pages.enrich.title") }} </v-toolbar-title>
    </v-toolbar>

    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!jobInProgress"
          :complete="hasLogFiles"
          step="1"
        >
          {{ $t("ui.pages.enrich.stepper.filesSelection") }}
        </v-stepper-step>

        <v-divider :color="hasLogFiles && step > 1 ? 'primary' : ''" />

        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!jobInProgress"
          :complete="step > 2"
          step="2"
        >
          {{ $t("ui.pages.enrich.stepper.settings") }}
        </v-stepper-step>

        <v-divider :color="hasJob && step > 2 ? 'primary' : ''" />

        <v-stepper-step :editable="hasJob" step="3">
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
                :disabled="!hasLogFiles || !setting"
                @click="
                  process();
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
            :items="extension"
            label="file extension"
            filled
          />

          <SettingsCSV
            v-if="extensionSelected === 'csv'"
          />
          <SettingsJSONL
            v-if="extensionSelected === 'jsonl'"
          />
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-container>
            <v-layout row justify-end class="mb-3">
              <v-btn :href="resultUrl" :disabled="inProcess">
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
            <v-icon size="70" color="green darken-2">
              mdi-check
            </v-icon>
            <div v-text="$t('ui.pages.enrich.process.end')" />
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
      step: 1,
      files: [],
      enrichedFile: '',
      setting: [],
      status: null,
      state: {},
      time: 0,
      inProcess: false,
      fileSelectionHelp: false,
      logSamplesUrl: 'https://github.com/ezpaarse-project/ezunpaywall',
      apiKey: '',
      apiKeyVisible: false,
      apiKeyRules: {
        required: value => !!value || 'Required.'
      },
      extension: ['csv', 'jsonl'],
      extensionSelected: ''
    }
  },
  computed: {
    hasLogFiles () {
      return Array.isArray(this.files) && this.files.length > 0
    },
    jobInProgress () {
      return this.status === 'progress' || this.status === 'finalization'
    },
    hasJob () {
      return this.status !== null
    },
    jobIsCancelable () {
      return this.$store.getters['process/cancelable']
    },
    resultUrl () {
      return `${this.$enrich}/enriched/${this.enrichedFile}`
    }
  },
  methods: {
    async process () {
      this.inProcess = true
      const id = this.enrich()
      await this.poll(id)
    },

    async enrich () {
      const data = {
        // TODO type,
        separator: ','
      }

      let upload

      // upload
      try {
        await this.$enrich({
          method: 'POST',
          url: '/api/enrich/upload',
          data: this.files[0].file,
          headers: {
            'Content-Type': 'text/csv',
            'X-API-KEY': this.apiKey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch(
          'snacks/error',
          `Cannot request ${this.$enrich.baseURL}/api/enrich/upload`
        )
      }

      const id = upload?.data?.id
      data.id = id

      // enrich
      try {
        await this.$enrich({
          method: 'POST',
          url: '/api/enrich/job',
          data,
          headers: {
            'Content-length': this.files[0].size,
            'X-API-KEY': this.apiKey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch(
          'snacks/error',
          `Cannot request ${this.$enrich.baseURL}/api/enrich/job`
        )
      }

      let state

      // state of enrich
      do {
        try {
          state = await this.$enrich({
            method: 'GET',
            url: `/api/enrich/state/${id}.json`,
            responseType: 'json'
          })
          this.state = state?.data?.state
          // TODO use computed
          if (Number.isInteger(this.state?.createdAt)) {
            this.time = Math.round((Date.now() - this.state?.createdAt) / 1000)
          } else {
            this.time = 0
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (err) {
          this.$store.dispatch(
            'snacks/error',
            `Cannot request ${this.$enrich.baseURL}/api/enrich/state/${id}.json`
          )
        }
      } while (!state?.data?.state?.done)

      // done
      this.inProcess = false
    },
    getSetting () {
      console.log('test')
      const { simple } = this.$store.state
      let { best_oa_location } = this.$store.state
      let { first_oa_location } = this.$store.state
      let { oa_location } = this.$store.state

      if (this.best_oa_location.length) {
        best_oa_location = `,best_oa_location { ${this.best_oa_location.join(',')} }`
      }
      if (this.first_oa_location.length) {
        first_oa_location = `,first_oa_location { ${this.first_oa_location.join(',')} }`
      }
      if (this.oa_locations.length) {
        oa_location = `,oa_locations { ${this.oa_locations.join(',')} }`
      }
      const setting = `{ ${simple.join(',')} ${best_oa_location} ${first_oa_location} ${oa_location} }`
      this.setting = setting
    },
    getFiles (files) {
      this.files = files
    }
  }
}
</script>
