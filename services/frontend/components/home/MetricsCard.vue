<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('home.metrics', { env: getElasticEnvironment() }) }} </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-card-title> {{ t('home.globalMetrics') }} </v-card-title>
      <HomeGlobalMetricsChips
        :loading="status === 'pending'"
        :doi="metrics.doi"
        :is-o-a="metrics.isOA"
      />
      <hr class="my-4">
      <v-card-title> {{ t('home.openAccessStatus') }} </v-card-title>
      <HomeOpenAccessMetricsChips
        :loading="status === 'pending'"
        :gold-o-a="metrics.goldOA"
        :hybrid-o-a="metrics.hybridOA"
        :bronze-o-a="metrics.bronzeOA"
        :green-o-a="metrics.greenOA"
        :closed-o-a="metrics.closedOA"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const runtimeConfig = useRuntimeConfig();
const { $graphql } = useNuxtApp();

const { data, status } = useFetch('/graphql', {
  baseURL: $graphql.baseURL,
  method: 'GET',
  params: {
    query: '{ dailyMetrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }',
  },
  onResponseError() {
    snackStore.error(t('error.graphql.request'));
  }
});

const metrics = computed(() => {
  return {
    doi: data?.value?.data?.dailyMetrics?.doi || 0,
    isOA: data?.value?.data?.dailyMetrics?.isOA || 0,
    goldOA: data?.value?.data?.dailyMetrics?.goldOA || 0,
    hybridOA: data?.value?.data?.dailyMetrics?.hybridOA || 0,
    bronzeOA: data?.value?.data?.dailyMetrics?.bronzeOA || 0,
    greenOA: data?.value?.data?.dailyMetrics?.greenOA || 0,
    closedOA: data?.value?.data?.dailyMetrics?.closedOA || 0
  }
});

function getElasticEnvironment() {
  if (
    !(runtimeConfig.public.elasticEnv === 'integration'
      || runtimeConfig.public.elasticEnv === 'production')
  ) {
    return t('development');
  }
  if (runtimeConfig.public.elasticEnv === 'integration') {
    return t('integration');
  }
  return '';
}

</script>
