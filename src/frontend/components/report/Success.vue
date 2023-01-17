<template>
  <v-card height="100%" outlined>
    <v-progress-linear
      color="green darken-2"
      dark
      height="40"
      value="100"
    >
      <span class="ma-2" v-text="report.createdAt" />
      <v-spacer />
      <v-icon class="ma-2" color="white">
        mdi-check
      </v-icon>
    </v-progress-linear>
    <Detail :report="report" />
  </v-card>
</template>

<script>
import Detail from '~/components/report/Detail.vue'

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
