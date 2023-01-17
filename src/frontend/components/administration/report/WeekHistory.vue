<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('reportHistory.title')" />
      <v-spacer />
      <UpdateProcessButton />
    </v-toolbar>
    <v-row v-if="reports.length === 0" align="center" justify="center">
      <v-col class="text-center" cols="12" sm="4">
        {{ $t("reportHistory.noReport") }}
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        v-for="report in reports"
        :id="report.id"
        :key="report.id"
        cols="12"
        sm="3"
        md="3"
      >
        <Success v-if="!report.data.error && report.data.done" :report="report" />
        <In-progress v-if="!report.data.error && !report.data.done" :report="report" />
        <Error v-if="report.data.error" :report="report" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import UpdateProcessButton from '~/components/administration/report/UpdateProcessButton.vue'
import Success from '~/components/administration/report/Success.vue'
import Error from '~/components/administration/report/Error.vue'
import InProgress from '~/components/administration/report/InProgress.vue'
export default {
  name: 'WeekHistory',
  components: {
    UpdateProcessButton,
    Success,
    Error,
    InProgress
  },
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
        this.$store.dispatch('snacks/error', this.$t('reportHistory.reportsError'))
      }

      const filenames = res.data

      let report

      const maxIteratore = filenames.length >= 8 ? 8 : filenames.length

      for (let i = 0; i < maxIteratore; i += 1) {
        try {
          report = await this.$update({
            method: 'GET',
            url: `/reports/${filenames[i]}`
          })
        } catch (err) {
          this.$store.dispatch('snacks/error', this.$t('reportHistory.reportError'))
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
