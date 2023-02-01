<template>
  <v-card height="100%" outlined>
    <v-progress-linear color="red darken-2" height="25" value="100" />
    <v-row class="ma-2">
      {{ report.createdAt }}
      <v-spacer />
      <v-icon right color="red darken-2">
        mdi-alert-circle
      </v-icon>
    </v-row>
    <DetailDialog :report="report" />
  </v-card>
</template>

<script>
import DetailDialog from '~/components/report/DetailDialog.vue'

export default {
  components: {
    DetailDialog
  },
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
