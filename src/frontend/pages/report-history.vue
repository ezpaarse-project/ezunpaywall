<template>
  <section>
    <v-row
      v-if="reports.length === 0"
      align="center"
      justify="center"
    >
      <v-col class="text-center" sm="4" cols="12">
        {{ $t("reportHistory.noReport") }}
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="report in reports" :id="report.id" :key="report.id" cols="12" class="pa-2">
        <Success v-if="!report.data.error && report.data.done" :report="report" />
        <In-progress v-if="!report.data.error && !report.data.done" :report="report" />
        <Error v-if="report.data.error" :report="report" />
      </v-col>
    </v-row>
  </section>
</template>

<script>
import Success from '~/components/report/Success.vue'
import Error from '~/components/report/Error.vue'
import InProgress from '~/components/report/InProgress.vue'

export default {
  name: 'UpdateHistory',
  components: {
    Success,
    Error,
    InProgress
  },
  transition: 'slide-x-transition',
  data () {
    return {
      reports: [],
      id: ''
    }
  },
  async mounted () {
    await this.getReports()
    this.id = this.$route.query.id
    if (this.id) {
      const index = this.reports.findIndex(e => e.data.createdAt === this.id)
      const reportSelected = this.reports[index]
      this.reports[index] = reportSelected.reveal = true
      this.$vuetify.goTo(`[id='${reportSelected.id}']`)
    }
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
        this.$store.dispatch('snacks/error', this.$t('reportHistory.reportsError'))
        return
      }

      const filenames = res.data.sort((a, b) => b.createdAt - a.createdAt)

      let report

      for (let i = 0; i < filenames.length; i += 1) {
        report = await this.getReport(filenames[i])
        report = this.parseReports(report.data)
        this.reports.push(
          {
            id: i,
            reveal: false,
            data: report,
            createdAt: this.$dateFns.format(report.createdAt)
          }
        )
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
        this.$store.dispatch('snacks/error', this.$t('reportHistory.reportError'))
        return
      }
      return report
    },
    showReportJSON (report) {
      report.reveal = !report.reveal
    }
  }
}
</script>
