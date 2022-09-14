<template>
  <v-row>
    <v-col
      v-for="report in reports"
      :key="report.createdAt"
      xs="12"
      sm="6"
      md="4"
      lg="2"
    >
      <v-card v-if="!report.error && report.done" height="100%" outlined class="white--text" color="green darken-1">
        <v-container class="pt-5 pl-5 pr-5">
          <v-layout row>
            {{ report.createdAt }}
            <v-spacer />
            <v-icon right color="white">
              mdi-check
            </v-icon>
          </v-layout>
        </v-container>
        <v-container class="pa-5">
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-update
            </v-icon>
            {{ report.totalUpdatedDocs }} {{ $t("weekHistory.updatedDocs") }}
          </v-layout>
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-plus
            </v-icon>
            {{ report.totalInsertedDocs }} {{ $t("weekHistory.insertedDocs") }}
          </v-layout>
        </v-container>
      </v-card>

      <v-card v-if="!report.error && !report.done" height="100%" class="white--text" color="orange darken-1">
        <v-container class="pt-5 pl-5 pr-5">
          <v-layout row>
            {{ report.createdAt }}
            <v-spacer />
            <v-progress-circular right :size="20" :width="3" indeterminate color="white" />
          </v-layout>
        </v-container>
        <v-container class="pa-5">
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-update
            </v-icon>
            {{ report.totalUpdatedDocs }} {{ $t("weekHistory.updatedDocs") }}
          </v-layout>
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-plus
            </v-icon>
            {{ report.totalInsertedDocs }} {{ $t("weekHistory.insertedDocs") }}
          </v-layout>
        </v-container>
      </v-card>

      <v-card v-if="report.error" height="100%" class="white--text" color="red darken-1">
        <v-container class="pt-5 pl-5 pr-5">
          <v-layout row>
            {{ report.createdAt }}
            <v-spacer />
            <v-icon right color="white">
              mdi-alert-circle
            </v-icon>
          </v-layout>
        </v-container>
        <v-container class="pa-5">
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-update
            </v-icon>
            {{ report.totalUpdatedDocs }} {{ $t("weekHistory.updatedDocs") }}
          </v-layout>
          <v-layout row>
            <v-icon size="22" class="pr-1" color="white">
              mdi-plus
            </v-icon>
            {{ report.totalInsertedDocs }} {{ $t("weekHistory.insertedDocs") }}
          </v-layout>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
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
      report.createdAt = this.$dateFns.format(report.createdAt)
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
        this.reports.push(report)
      }
      this.loaded = false
    }
  }
}
</script>
<style scoped>
.short{
  width: 100%;
}

</style>
