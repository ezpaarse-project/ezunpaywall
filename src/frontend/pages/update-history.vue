<template>
  <section>
    <v-row>
      <v-col v-for="report in reports" :key="report.id" cols="12">
        <v-card
          v-if="!report.data.error && report.data.done"
          height="100%"
          outlined
          class="white--text"
          color="green darken-1"
        >
          <v-container class="pt-5 pl-5 pr-5">
            <v-layout row>
              {{ report.data.createdAt }}
              <v-spacer />
              <v-icon right color="white">
                mdi-check
              </v-icon>
            </v-layout>
          </v-container>
          <v-container class="pa-5">
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
          <v-card-actions>
            <v-spacer />
            <v-btn text color="teal accent-4" @click="showReportJSON(report)">
              DETAILS
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <v-card
              v-if="report.reveal"
              class="transition-fast-in-fast-out v-card--reveal"
              style="height: 100%"
            >
              <v-card-text class="pb-0">
                <pre>{{ JSON.stringify(report, null, 2) }} </pre>
              </v-card-text>
              <v-card-actions class="pt-0">
                <v-spacer />
                <v-btn text color="teal accent-4" @click="showReportJSON(report)">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expand-transition>
        </v-card>

        <v-card
          v-if="!report.data.error && !report.data.done"
          height="100%"
          class="white--text"
          color="orange darken-1"
        >
          <v-container class="pt-5 pl-5 pr-5">
            <v-layout row>
              {{ report.data.createdAt }}
              <v-spacer />
              <v-progress-circular
                right
                :size="20"
                :width="3"
                indeterminate
                color="white"
              />
            </v-layout>
          </v-container>
          <v-container class="pa-5">
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
          <v-card-actions>
            <v-spacer />
            <v-btn text color="teal accent-4" @click="showReportJSON(report)">
              DETAILS
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <v-card
              v-if="report.reveal"
              class="transition-fast-in-fast-out v-card--reveal"
              style="height: 100%"
            >
              <v-card-text class="pb-0">
                <pre>{{ JSON.stringify(report, null, 2) }} </pre>
              </v-card-text>
              <v-card-actions class="pt-0">
                <v-spacer />
                <v-btn text color="teal accent-4" @click="showReportJSON(report)">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expand-transition>
        </v-card>

        <v-card
          v-if="report.data.error"
          height="100%"
          class="white--text"
          color="red darken-1"
        >
          <v-container class="pt-5 pl-5 pr-5">
            <v-layout row>
              {{ report.data.createdAt }}
              <v-spacer />
              <v-icon right color="white">
                mdi-alert-circle
              </v-icon>
            </v-layout>
          </v-container>
          <v-container class="pa-5">
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
          <v-card-actions>
            <v-spacer />
            <v-btn text color="teal accent-4" @click="showReportJSON(report)">
              DETAILS
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <v-card
              v-if="report.reveal"
              class="transition-fast-in-fast-out v-card--reveal"
              style="height: 100%"
            >
              <v-card-text class="pb-0">
                <pre>{{ JSON.stringify(report, null, 2) }} </pre>
              </v-card-text>
              <v-card-actions class="pt-0">
                <v-spacer />
                <v-btn text color="teal accent-4" @click="showReportJSON(report)">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script>
export default {
  name: 'UpdateHistory',
  transition: 'slide-x-transition',
  data () {
    return {
      reports: [],
      reveal: false
    }
  },
  mounted () {
    this.getReports()
  },
  methods: {
    parseReports (report) {
      let totalInsertedDocs = 0
      let totalUpdatedDocs = 0
      report.steps.forEach((e) => {
        totalInsertedDocs += e?.insertedDocs || 0
      })
      report.totalInsertedDocs = totalInsertedDocs
      report.steps.forEach((e) => {
        totalUpdatedDocs += e?.updatedDocs || 0
      })
      report.totalUpdatedDocs = totalUpdatedDocs
      return report
    },
    async getReports () {
      this.loading = true
      let res
      try {
        res = await this.$update({
          method: 'GET',
          url: '/reports'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('update.reportsError'))
      }

      const filenames = res.data

      let report

      for (let i = 0; i < filenames.length; i += 1) {
        report = await this.getReport(filenames[i])
        report = this.parseReports(report.data)
        this.reports.push({ id: i, reveal: false, data: report })
      }
      this.loaded = false
    },
    async getReport (filename) {
      let report
      try {
        report = await this.$update({
          method: 'GET',
          url: `/reports/${filename}`
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('update.reportsError'))
        return
      }
      return report
    },
    showReportJSON (report) {
      console.log(report.reveal)
      report.reveal = !report.reveal
    }
  }
}
</script>
