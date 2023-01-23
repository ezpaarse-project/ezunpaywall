<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('reportHistory.title')" />
      <v-spacer />
      <v-col class="text-right">
        <v-btn
          @click.stop="setDialogShow(true)"
          v-text="$t('update')"
        />
      </v-col>
      <UpdateDialog :dialog="dialogShow" @closed="setDialogShow(false)" />
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
        sm="12"
        md="6"
        lg="3"
      >
        <Card :report="report" :status="getStatusOfReport(report)" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import UpdateDialog from '~/components/administration/report/UpdateDialog.vue'
import Card from '~/components/report/Card.vue'

export default {
  name: 'WeekHistory',
  components: {
    UpdateDialog,
    Card
  },
  data () {
    return {
      dialogShow: false,
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
    },
    setDialogShow (value) {
      this.dialogShow = value
    }
  }
}
</script>
