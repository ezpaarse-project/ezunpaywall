<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('reportHistory.title') }} </v-toolbar-title>
      <v-spacer />
      <v-col class="text-right">
        <v-btn
          @click.stop="setDialogVisible(true)"
        >
          {{ $t('update') }}
        </v-btn>
      </v-col>
      <UpdateDialog :dialog="dialogVisible" @closed="setDialogVisible(false)" />
    </v-toolbar>
    <Loader v-if="loading" />
    <NoData v-else-if="reports.length === 0" :local-key="$t('reportHistory.noReport')" />
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
    },
    setDialogVisible (value) {
      this.dialogVisible = value
    }
  }
}
</script>
