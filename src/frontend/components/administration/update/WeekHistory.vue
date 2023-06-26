<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('reportHistory.title') }} </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click.stop="setUpdateCronDialogVisible(true)"
      >
        <v-icon>mdi-update</v-icon>
      </v-btn>
      <UpdateCronDialog
        :dialog="updateCronDialogVisible"
        @closed="setUpdateCronDialogVisible(false)"
      />
      <v-btn
        icon
        @click.stop="setUpdateProcessDialogVisible(true)"
      >
        <v-icon>mdi-download-circle</v-icon>
      </v-btn>
      <UpdateProcessDialog
        :dialog="updateProcessDialogVisible"
        @closed="setUpdateProcessDialogVisible(false)"
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
    <ReportsDataTable v-else :reports="reports" />
  </v-card>
</template>

<script>
import UpdateProcessDialog from '~/components/administration/update/UpdateProcessDialog.vue'
import UpdateCronDialog from '~/components/administration/update/UpdateCronDialog.vue'
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'
import ReportsDataTable from '~/components/report/ReportsDataTable.vue'

export default {
  name: 'WeekHistory',
  components: {
    UpdateProcessDialog,
    UpdateCronDialog,
    Loader,
    NoData,
    ReportsDataTable
  },
  data () {
    return {
      loading: false,
      updateCronDialogVisible: false,
      updateProcessDialogVisible: false,
      cronConfig: {},
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
        this.$store.dispatch('snacks/error', this.$t('error.report.getAll'))
        this.loading = false
        return
      }
      this.loading = false

      let filenames = Array.isArray(res?.data) ? res.data : []

      let report

      filenames = filenames.slice(0, 7)
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
      this.loading = true
      try {
        report = await this.$update({
          method: 'GET',
          url: `/reports/${filename}`
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.report.get'))
        this.loading = false
        return
      }
      this.loading = false
      return report?.data
    },
    async getUpdateCronConfig () {
      let cronConfig
      try {
        cronConfig = await this.$update({
          method: 'GET',
          url: '/cron'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.cron.get'))
        this.loading = false
        return
      }
      this.loading = false
      this.cronConfig = cronConfig?.data
    },
    setUpdateProcessDialogVisible (value) {
      this.updateProcessDialogVisible = value
    },
    setUpdateCronDialogVisible (value) {
      this.updateCronDialogVisible = value
    }
  }
}
</script>
