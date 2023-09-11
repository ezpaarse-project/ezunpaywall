<template>
  <v-chip
    v-for="metric in globalMetrics"
    :key="metric.name"
    class="bg-grey-darken-2 ma-1"
  >
    {{ t(metric.title) }} : {{ metric.count }}
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
  doi: { type: Number, default: 0 },
  isOA: { type: Number, default: 0 },
});

const globalMetrics = computed(() => [
  {
    name: 'doi',
    title: 'home.referencedResources',
    text: 'home.referencedRessourceHelp',
    count: props.doi.toLocaleString($i18n.locale, { useGrouping: true }),
  },
  {
    name: 'isOA',
    title: 'home.openAccess',
    text: 'home.openAccessHelp',
    count: props.isOA.toLocaleString($i18n.locale, { useGrouping: true }),
  },
]);

</script>
