<template>
  <v-card height="100%" outlined>
    <v-progress-linear color="green darken-2" height="25" value="100" />
    <v-card-title>
      {{ report.createdAt }}
      <v-spacer />
      <v-icon right color="green">
        mdi-check
      </v-icon>
    </v-card-title>
    <Detail :report="report" />
  </v-card>
</template>

<script>
import Detail from '~/components/administration/report/Detail.vue'

export default {
  components: {
    Detail
  },
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
