<template>
  <v-row no-gutters>
    <v-col
      v-for="metric in metrics"
      :key="metric.label"
      class="pa-2"
      xs12
      md6
      lg4
      x4
    >
      <MetricCard
        :label="metric.label"
        :icon="metric.icon"
        :color="metric.iconColor"
        :value="metric?.value?.toString()"
      />
    </v-col>
  </v-row>
</template>

<script setup>

import MetricCard from '@/components/enrich/MetricCard.vue';

const { t } = useI18n();

const props = defineProps({
  state: {
    type: Object,
    default: () => ({}),
  },
  time: {
    type: Number,
    default: 0,
  },
});

const metrics = computed(() => [
  {
    label: t('enrich.readLines'),
    icon: 'mdi-file-search-outline',
    iconColor: 'bg-amber text-white',
    value: props.state.linesRead,
  },
  {
    label: t('enrich.enrichedLines'),
    icon: 'mdi-file-search-outline',
    iconColor: 'bg-light-green text-white',
    value: props.state.enrichedLines,
  },
  {
    label: t('enrich.duration'),
    icon: 'mdi-timer',
    iconColor: 'bg-blue-grey text-white',
    value: props.time,
  },
]);

</script>
