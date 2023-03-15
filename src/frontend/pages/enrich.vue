<template>
  <section>
    <div v-html="$t('enrich.general')" />
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
            :editable="!processingInProgress"
            :complete="filesRule"
            step="1"
          >
            {{ $t("enrich.filesSelection") }}
          </v-stepper-step>

          <v-divider :color="filesRule && step > 1 ? 'primary' : ''" />

          <v-stepper-step
            edit-icon="mdi-check"
            :editable="filesRule && !processingInProgress"
            :complete="step > 2"
            step="2"
          >
            {{ $t("enrich.settings") }}
          </v-stepper-step>

          <v-divider :color="unpaywallAttributesRule && step > 2 ? 'primary' : ''" />

          <v-stepper-step step="3">
            {{ $t("enrich.enrich") }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <LogFileTab @nextStep="setStep($event)" />
          </v-stepper-content>

          <v-stepper-content step="2">
            <SelectAttributesTab @nextStep="setStep($event)" />
          </v-stepper-content>

          <v-stepper-content step="3">
            <ProcessTab ref="process" @processingInProgress="setProcessingInProgress($event)" @status="setProcessingInProgress($event)" />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </section>
</template>

<script>
import LogFileTab from '~/components/enrich/LogFileTab.vue'
import SelectAttributesTab from '~/components/enrich/SelectAttributesTab.vue'
import ProcessTab from '~/components/enrich/ProcessTab.vue'

export default {
  name: 'Enrich',
  components: {
    LogFileTab,
    SelectAttributesTab,
    ProcessTab
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      // stepper
      step: 1,
      // status
      processingInProgress: false
    }
  },
  head () {
    return {
      title: 'Enrich'
    }
  },
  computed: {
    files () {
      return this.$store.state.enrich.files
    },
    attributes () {
      return this.$store.state.enrich.attributes
    },
    filesRule () {
      return Array.isArray(this.files) && this.files.length > 0
    },
    unpaywallAttributesRule () {
      return Array.isArray(this.attributes) && this.attributes.length > 0
    }
  },
  methods: {
    setStep (step) {
      this.step = step
    },
    setProcessingInProgress (processingInProgress) {
      this.processingInProgress = processingInProgress
    }
  }
}
</script>
