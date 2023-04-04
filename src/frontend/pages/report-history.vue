<template>
  <section>
    <v-row
      v-if="loading"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>
    <NoData v-else-if="reports.length === 0" :text="$t('reportHistory.noReport')" />
    <v-row v-else>
      <v-col v-for="report in reports" :id="report.id" :key="report.id" cols="12" class="pa-2">
        <ReportCard :report="report" :status="getStatusOfReport(report)" />
      </v-col>
    </v-row>
  </section>
</template>

<script>

import ReportCard from '~/components/report/ReportCard.vue'
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'

export default {
  name: 'UpdateHistory',
  components: {
    ReportCard,
    Loader,
    NoData
  },
  transition: 'slide-x-transition',
  data () {
    return {
      loading: false,
      reports: []
    }
  },
  async mounted () {
    await this.getReports()
  },
  methods: {
    getStatusOfReport (report) {
      if (!report.data.error && report.data.done) { return 'success' }
      if (!report.data.error && !report.data.done) { return 'inprogress' }
      if (report.data.error) { return 'error' }
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
        this.loading = false
        return
      }
      this.loading = false

      const filenames = res.data.sort((a, b) => b.createdAt - a.createdAt)

      let report
      for (let i = 0; i < filenames.length; i += 1) {
        report = await this.getReport(filenames[i])
        this.reports.push(
          {
            id: i,
            data: report,
            createdAt: this.$dateFns.format(report.createdAt)
          }
        )
      }
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
      return report.data
    }
  }
}
</script>
