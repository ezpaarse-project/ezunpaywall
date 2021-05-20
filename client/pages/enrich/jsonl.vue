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
                :disabled="!hasLogFiles || !setting.length"
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

          <Settings @setting="getSetting($event)" />
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
import { v4 } from 'uuid'

import LogFiles from '~/components/enrich/LogFiles.vue'
import Settings from '~/components/enrich/SettingsJSONL.vue'
import Report from '~/components/enrich/Report.vue'

export default {
  name: 'CSV',
  components: {
    LogFiles,
    Settings,
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
      logSamplesUrl: 'https://github.com/ezpaarse-project/ezunpaywall'
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
      return `${this.$axios.defaults.baseURL}/enrich/${this.enrichedFile}`
    }
  },
  methods: {
    async process () {
      this.inProcess = true
      const id = v4()
      this.enrichedFile = `${id}.jsonl`
      this.enrich(id)
      await this.poll(id)
    },

    enrich (id) {
      try {
        this.$axios({
          method: 'POST',
          url: `/enrich/json/${id}`,
          params: {
            args: this.setting
          },
          data: this.files[0].file,
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'json'
        })
      } catch (err) {
        console.log(err)
      }
    },

    async poll (id) {
      let res
      try {
        res = await this.$axios({
          method: 'GET',
          url: `/enrich/state/${id}`,
          responseType: 'json'
        })
      } catch (err) {
        console.log(err)
      }
      this.state = res?.data?.state
      // TODO put it on computer
      if (Number.isInteger(this.state?.createdAt)) {
        this.time = Math.round((Date.now() - this.state?.createdAt) / 1000)
      } else {
        this.time = 0
      }
      if (this.state?.done === true) {
        this.inProcess = false
      } else {
        setTimeout(() => this.poll(id), 1000)
      }
    },

    getSetting (setting) {
      this.setting = setting
    },
    getFiles (files) {
      this.files = files
    }
  }
}
</script>
