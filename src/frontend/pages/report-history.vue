<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title> {{ $t("reportHistory.title") }} </v-toolbar-title>
        <v-spacer />
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              :href="linkUnpaywall"
              target="_blank"
              v-on="on"
            >
              <v-icon>mdi-help-circle</v-icon>
            </v-btn>
          </template>
          {{ $t("reportHistory.source") }}
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              :disabled="loading"
              @click.stop="getReports()"
              v-on="on"
            >
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </template>
          {{ $t("reportHistory.reloadReports") }}
        </v-tooltip>
      </v-toolbar>
      <v-row v-if="loading" align="center" justify="center" class="ma-2">
        <Loader />
      </v-row>
      <NoData
        v-else-if="reports.length === 0"
        :text="$t('reportHistory.noReport')"
      />
      <ReportsDataTable v-else :loading="loading" :reports="reports" />
    </v-card>
  </section>
</template>

<script>
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'
import ReportsDataTable from '~/components/report/ReportsDataTable.vue'

export default {
  name: 'UpdateHistory',
  components: {
    Loader,
    NoData,
    ReportsDataTable
  },
  transition: 'slide-x-transition',
  data () {
    return {
      loading: false,
      reports: [],
      id: ''
    }
  },
  computed: {
    linkUnpaywall () {
      return `${this.$config.unpaywallAPIHost}/feed/changefiles?interval=day`
    }
  },
  async mounted () {
    await this.getReports()
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
        this.$store.dispatch(
          'snacks/error',
          this.$t('reportHistory.reportsError')
        )
        this.loading = false
        return
      }
      this.loading = false

      const filenames = res.data.sort((a, b) => b.createdAt - a.createdAt)

      let report

      this.reports = []
      for (let i = 0; i < filenames.length; i += 1) {
        report = await this.getReport(filenames[i])
        this.reports.push({
          id: i,
          data: report,
          createdAt: this.$dateFns.format(report.createdAt)
        })
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
        this.$store.dispatch(
          'snacks/error',
          this.$t('reportHistory.reportError')
        )
        return
      }
      return report.data
    }
  }
}
</script>
