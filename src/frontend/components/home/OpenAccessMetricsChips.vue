<template>
  <v-chip
    v-for="metric in oaMetric"
    :key="metric.name"
    :class="metric.class"
  >
    <span>{{ (metric.name) }} : {{ metric.count }}</span>
    <v-tooltip
      activator="parent"
      location="bottom"
    >
      {{ t(metric.text) }}
    </v-tooltip>
  </v-chip>
</template>

<script setup>

const { t } = useI18n();
const { $i18n } = useNuxtApp();

const props = defineProps({
  loading: { type: Boolean, default: false },
  goldOA: { type: Number, default: 0 },
  hybridOA: { type: Number, default: 0 },
  bronzeOA: { type: Number, default: 0 },
  greenOA: { type: Number, default: 0 },
  closedOA: { type: Number, default: 0 },
});

const oaMetric = computed(() => [
  {
    name: 'goldOA',
    class: 'bg-yellow-accent-4 ma-1 text-white',
    icon: 'mdi-lock-open',
    text: 'home.goldOAHelp',
    count: props.goldOA.toLocaleString($i18n.locale.value, { useGrouping: true }),
  },
  {
    name: 'hybridOA',
    class: 'bg-yellow-darken-4 ma-1 text-white',
    icon: 'mdi-lock-open',
    text: 'home.hybridOAHelp',
    count: props.hybridOA.toLocaleString($i18n.locale.value, { useGrouping: true }),
  },
  {
    name: 'bronzeOA',
    class: 'bg-yellow-darken-4 ma-1',
    icon: 'mdi-lock-open',
    text: 'home.bronzeOAHelp',
    count: props.bronzeOA.toLocaleString($i18n.locale.value, { useGrouping: true }),
  },
  {
    name: 'greenOA',
    class: 'bg-green-darken-1 ma-1',
    icon: 'mdi-lock-open',
    text: 'home.greenOAHelp',
    count: props.greenOA.toLocaleString($i18n.locale.value, { useGrouping: true }),
  },
  {
    name: 'closedOA',
    class: 'bg-grey-lighten-1 ma-1 text-white',
    icon: 'mdi-lock',
    text: 'home.closedOAHelp',
    count: props.closedOA.toLocaleString($i18n.locale.value, { useGrouping: true }),
  },
]);

</script>
