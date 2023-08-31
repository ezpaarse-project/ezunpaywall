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
      <GlobalMetricsChips
        :loading="loading"
        :doi="metrics.doi"
        :is-o-a="metrics.isOA"
      />
      <hr class="my-4">
      <v-card-title> {{ t('home.openAccessStatus') }} </v-card-title>
      <OpenAccessMetricsChips
        :loading="loading"
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

import GlobalMetricsChips from '@/components/home/GlobalMetricsChips.vue';
import OpenAccessMetricsChips from '@/components/home/OpenAccessMetricsChips.vue';

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();
const runtimeConfig = useRuntimeConfig();
const { $graphql } = useNuxtApp();

const loading = ref(false);

const metrics = ref({
  doi: 0,
  isOA: 0,
  goldOA: 0,
  hybridOA: 0,
  bronzeOA: 0,
  greenOA: 0,
  closedOA: 0,
});

async function getMetrics() {
  let res;
  try {
    loading.value = true;
    res = await $graphql({
      method: 'GET',
      url: '/graphql',
      params: {
        query:
          '{ DailyMetrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }',
      },
    });
  } catch (err) {
    snackStore.error(t('error.graphql.request'));
  }

  loading.value = false;

  if (res?.data?.data?.DailyMetrics) {
    metrics.value.doi = res?.data?.data?.DailyMetrics.doi;
    metrics.value.isOA = res?.data?.data?.DailyMetrics.isOA;
    metrics.value.goldOA = res?.data?.data?.DailyMetrics.goldOA;
    metrics.value.hybridOA = res?.data?.data?.DailyMetrics.hybridOA;
    metrics.value.bronzeOA = res?.data?.data?.DailyMetrics.bronzeOA;
    metrics.value.greenOA = res?.data?.data?.DailyMetrics.greenOA;
    metrics.value.closedOA = res?.data?.data?.DailyMetrics.closedOA;
  }
}

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

onMounted(async () => {
  await getMetrics();
});

</script>
