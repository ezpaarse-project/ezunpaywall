<template>
  <v-card height="100%" outlined>
    <v-progress-linear color="blue darken-2" height="25" value="100" />
    <v-row class="ma-2">
      {{ report.createdAt }}
      <v-spacer />
      <v-progress-circular
        right
        :size="20"
        :width="3"
        indeterminate
        color="blue darken-2"
      />
    </v-row>
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
