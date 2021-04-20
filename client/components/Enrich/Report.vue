<template>
  <v-layout row wrap>
    <v-flex
      v-for="metric in metrics"
      :key="metric.label"
      class="pa-2"
      xs12
      md6
      lg4
      x4
    >
      <Metric
        :label="metric.label"
        :icon="metric.icon"
        :color="metric.iconColor"
        :value="metric.value"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import Metric from '~/components/Enrich/Metric.vue'

export default {
  components: {
    Metric
  },
  props: {
    state: {
      type: Object,
      default: () => ({})
    },
    time: {
      type: Number,
      default: () => (0)
    }
  },
  computed: {
    metrics () {
      return [
        {
          label: 'linesRead',
          icon: 'mdi-file-search-outline',
          iconColor: 'amber',
          value: this.state.linesRead
        },
        {
          label: 'linesEnriched',
          icon: 'mdi-file-search-outline',
          iconColor: 'light-green',
          value: this.state.enrichedLines
        },
        {
          label: 'treatmentDuration',
          icon: 'mdi-timer',
          iconColor: 'blue-grey',
          value: this.time
        }
      ]
    }
  }
}
</script>
