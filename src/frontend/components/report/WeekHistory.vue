<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('reportHistory.title')" />
    </v-toolbar>
    <v-row v-if="reports.length === 0" align="center" justify="center">
      <v-col class="text-center" cols="12" sm="4">
        {{ $t("reportHistory.noReport") }}
      </v-col>
    </v-row>
    <v-row v-else class="ma-2">
      <v-col
        v-for="report in reports"
        :key="report.data.createdAt"
        xs="12"
        sm="6"
        md="4"
        lg="2"
      >
        <v-card
          v-if="!report.data.error && report.data.done"
          height="100%"
          outlined
          class="white--text"
          color="green darken-1"
        >
          <v-card-text class="white--text pt-5 pl-5 pr-5">
            <v-row>
              {{ report.createdAt }}
              <v-spacer />
              <v-icon right color="white">
                mdi-check
              </v-icon>
            </v-row>
          </v-card-text>
          <v-card-text class="white--text pa-5">
            <v-row>
              <v-icon size="22" class="pr-1" color="white">
                mdi-update
              </v-icon>
              {{ report.data.totalUpdatedDocs }}
              {{ $t("reportHistory.updatedDocs") }}
            </v-row>
            <v-row>
              <v-icon size="22" class="pr-1" color="white">
                mdi-plus
              </v-icon>
              {{ report.data.totalInsertedDocs }}
              {{ $t("reportHistory.insertedDocs") }}
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-0">
            <v-spacer />
            <v-btn
              text
              color="white"
              router
              :to="{ path: '/report-history', query: { id: report.data.createdAt } }"
            >
              DETAILS
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card
          v-if="!report.data.error && !report.data.done"
          height="100%"
          class="white--text"
          color="blue darken-1"
        >
          <v-card-text class="white--text pt-5 pl-5 pr-5">
            <v-row>
              {{ report.createdAt }}
              <v-spacer />
              <v-progress-circular
                right
                :size="20"
                :width="3"
                indeterminate
                color="white"
              />
            </v-row>
          </v-card-text>
          <v-card-text class="white--text pa-5">
            <v-row>
              <v-icon size="22" class="pr-1" color="white">
                mdi-update
              </v-icon>
              {{ report.data.totalUpdatedDocs }}
              {{ $t("reportHistory.updatedDocs") }}
            </v-row>
            <v-row>
              <v-icon size="22" class="pr-1" color="white">
                mdi-plus
              </v-icon>
              {{ report.data.totalInsertedDocs }}
              {{ $t("reportHistory.insertedDocs") }}
            </v-row>
          </v-card-text>
        </v-card>

        <v-card
          v-if="report.data.error"
          height="100%"
          class="white--text"
          color="red darken-1"
        >
          <v-card-text class="white--text pt-5 pl-5 pr-5">
            <v-row>
              {{ report.createdAt }}
              <v-spacer />
              <v-icon right color="white">
                mdi-alert-circle
              </v-icon>
            </v-row>
          </v-card-text>
          <v-card-text class="pa-5">
            <v-row>
              <v-icon size="22" class="white--text pr-1" color="white">
                mdi-update
              </v-icon>
              {{ report.data.totalUpdatedDocs }}
              {{ $t("reportHistory.updatedDocs") }}
            </v-row>
            <v-row>
              <v-icon size="22" class="pr-1" color="white">
                mdi-plus
              </v-icon>
              {{ report.totalInsertedDocs }}
              {{ $t("reportHistory.insertedDocs") }}
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'WeekHistory',
  data () {
    return {
      reports: []
    }
  },
  mounted () {
    this.getReports()
  },
  methods: {
    parseReports (report) {
      report.steps = report.steps.filter(e => e.task === 'insert')
      let totalInsertedDocs = 0
      let totalUpdatedDocs = 0
      report.steps.forEach((e) => {
        totalInsertedDocs += e.insertedDocs
      })
      report.totalInsertedDocs = totalInsertedDocs
      report.steps.forEach((e) => {
        totalUpdatedDocs += e.updatedDocs
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

      const maxIteratore = filenames.length >= 6 ? 6 : filenames.length

      for (let i = 0; i < maxIteratore; i += 1) {
        try {
          report = await this.$update({
            method: 'GET',
            url: `/reports/${filenames[i]}`
          })
        } catch (err) {
          this.$store.dispatch('snacks/error', this.$t('update.reportsError'))
          return
        }
        report = this.parseReports(report.data)
        this.reports.push({
          id: i,
          createdAt: this.$dateFns.format(report.createdAt),
          data: report
        })
      }
      this.loaded = false
    }
  }
}
</script>
<style scoped>
.short {
  width: 100%;
}
</style>
