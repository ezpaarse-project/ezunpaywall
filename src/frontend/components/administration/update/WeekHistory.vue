<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('reportHistory.title') }} </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click.stop="setDialogVisible(true)"
      >
        <v-icon>mdi-download-circle</v-icon>
      </v-btn>
      <UpdateDialog
        :dialog="dialogVisible"
        @closed="setDialogVisible(false)"
      />
      <v-btn
        icon
        :disabled="loading"
        @click.stop="getReports()"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </v-toolbar>
    <v-row
      v-if="loading"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>
    <NoData v-else-if="!reports || reports.length === 0" :text="$t('reportHistory.noReport')" />
    <v-row v-else class="ma-2">
      <v-col
        v-for="report in reports"
        :id="report.id"
        :key="report.id"
        cols="12"
        sm="12"
        md="6"
        lg="3"
      >
        <ReportCard :report="report" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import UpdateDialog from '~/components/administration/update/UpdateProcessDialog.vue'
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'
import ReportCard from '~/components/report/ReportCard.vue'

export default {
  name: 'WeekHistory',
  components: {
    UpdateDialog,
    Loader,
    NoData,
    ReportCard
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      reports: []
    }
  },
  mounted () {
    this.getReports()
  },
  methods: {
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

      let filenames = Array.isArray(res?.data) ? res.data : []

      let report

      filenames = filenames.slice(0, 8)
      this.reports = []
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
      this.loading = false
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
    },
    setDialogVisible (value) {
      this.dialogVisible = value
    }
  }
}
</script>
