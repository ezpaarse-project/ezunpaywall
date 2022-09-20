<template>
  <div>
    <v-card-actions>
      <v-container>
        <v-layout row>
          <v-icon size="22" class="pr-1" color="white">
            mdi-update
          </v-icon>
          {{ report.data.totalUpdatedDocs }} {{ $t("weekHistory.updatedDocs") }}
        </v-layout>
        <v-layout row>
          <v-icon size="22" class="pr-1" color="white">
            mdi-plus
          </v-icon>
          {{ report.data.totalInsertedDocs }}
          {{ $t("weekHistory.insertedDocs") }}
        </v-layout>
      </v-container>
      <v-spacer />
      <v-btn text class="mt-5" color="white" @click="showReportJSON(report)">
        DETAILS
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-if="report.reveal">
        <v-card
          style="height: 100%"
        >
          <v-card-text class="pb-0">
            <pre>{{ JSON.stringify(report, null, 2) }} </pre>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-spacer />
            <v-btn color="secondary" dark @click="showReportJSON(report)">
              <v-icon size="40" color="white">
                mdi-chevron-up
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    showReportJSON (report) {
      report.reveal = !report.reveal
    }
  }
}
</script>
