<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title> {{ $t("reportHistory.title") }} </v-toolbar-title>
        <v-spacer />
        <v-menu
          v-model="showHelp"
          :close-on-content-click="false"
          :nudge-width="200"
          max-width="500"
          offset-x
        >
          <template #activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>mdi-help-circle</v-icon>
            </v-btn>
          </template>
          <v-card class="text-justify">
            <v-card-text>
              {{ $t("reportHistory.source") }}
            </v-card-text>

            <v-card-actions>
              <v-btn
                class="body-2"
                text
                :href="linkUnpaywall"
                target="_blank"
                @click="showHelp = false"
              >
                {{ $t("reportHistory.goTo") }}
              </v-btn>
              <v-spacer />
              <v-btn class="body-2" text @click="showHelp = false">
                {{ $t("close") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
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
      <v-row v-else class="pa-1">
        <v-col
          v-for="report in reports"
          :id="report.id"
          :key="report.id"
          cols="12"
          class="pa-2"
        >
          <ReportCard :report="report" :status="getStatusOfReport(report)" />
        </v-col>
      </v-row>
    </v-card>
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
      showHelp: false,
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
    getStatusOfReport (report) {
      if (!report.data.error && report.data.done) {
        return 'success'
      }
      if (!report.data.error && !report.data.done) {
        return 'inprogress'
      }
      if (report.data.error) {
        return 'error'
      }
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
