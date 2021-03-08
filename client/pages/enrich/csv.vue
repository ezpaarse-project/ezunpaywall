<template>
  <v-card>
    <v-toolbar class="secondary" dark dense flat>
      <v-toolbar-title> {{ $t("ui.pages.enrich.title") }} </v-toolbar-title>
    </v-toolbar>

    <v-stepper v-model="formStep">
      <v-stepper-header>
        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!jobInProgress"
          :complete="hasLogFiles"
          step="1"
        >
          {{ $t("ui.pages.enrich.stepper.filesSelection") }}
        </v-stepper-step>

        <v-divider :color="hasLogFiles && formStep > 1 ? 'primary' : ''" />

        <v-stepper-step
          edit-icon="mdi-check"
          :editable="!jobInProgress"
          :complete="formStep > 2"
          step="2"
        >
          {{ $t("ui.pages.enrich.stepper.settings") }}
        </v-stepper-step>

        <v-divider :color="hasJob && formStep > 2 ? 'primary' : ''" />

        <v-stepper-step :editable="hasJob" step="3">
          {{ $t("ui.pages.enrich.stepper.enrich") }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-container>
            <v-layout row justify-end class="mb-3">
              <v-btn
                class="body-2"
                color="primary"
                @click="setFormStep(2)"
                v-text="$t('ui.pages.enrich.filesSelection.continue')"
              />
            </v-layout>
          </v-container>

          <LogFiles class="ma-1" />
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-container>
            <v-layout row align-center class="mb-3">
              <v-btn
                class="body-2"
                color="primary"
                @click="setFormStep(1)"
                v-text="$t('ui.pages.enrich.settings.filesSelection')"
              />
              <v-spacer />
              <v-btn
                class="body-2"
                color="primary"
                :disabled="!hasLogFiles"
                @click="
                  process();
                  setFormStep(3);
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
            <v-layout row align-center class="mb-3">
              <v-btn v-if="jobIsCancelable" color="error" @click="cancelJob">
                <v-icon left>
                  mdi-cancel
                </v-icon>
              </v-btn>
            </v-layout>
            <v-spacer />
            <v-layout row justify-end class="mb-3">
              <v-btn :href="resultUrl">
                <v-icon left>
                  mdi-download
                </v-icon>
                {{ $t("ui.pages.enrich.process.download") }}
              </v-btn>
            </v-layout>
          </v-container>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
import axios from 'axios'

import LogFiles from '~/components/Enrich/LogFiles.vue'
import Settings from '~/components/Enrich/SettingsCSV.vue'

export default {
  name: 'CSV',
  components: {
    LogFiles,
    Settings
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      enrichedFile: '',
      setting: []
    }
  },
  computed: {
    formStep: {
      get () {
        return this.$store.state.process.step
      },
      set (value) {
        return this.setFormStep(value)
      }
    },
    logFiles () {
      return this.$store.state.process.logFiles
    },
    hasLogFiles () {
      return Array.isArray(this.logFiles) && this.logFiles.length > 0
    },
    status () {
      return this.$store.state.process.status
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
      return `http://localhost:8080/enrich/${this.enrichedFile}`
    }
  },
  methods: {
    cancelJob () {
      this.$store.dispatch('process/CANCEL_PROCESS')
    },
    setFormStep (value) {
      this.$store.dispatch('process/SET_PROCESS_STEP', value)
    },
    async process () {
      this.$store.dispatch('process/PROCESS')
      let res
      try {
        res = await axios({
          method: 'POST',
          url: 'http://localhost:8080/enrich/csv',
          params: {
            args: this.setting.join(',')
          },
          data: this.$store.state.process.logFiles[0].file,
          headers: {
            'Content-Type': 'text/csv'
          },
          responseType: 'json'
        })
      } catch (err) {
        console.log(err)
      }
      this.enrichedFile = res.data.file
    },
    getSetting (setting) {
      this.setting = setting
    }
  }
}
</script>
