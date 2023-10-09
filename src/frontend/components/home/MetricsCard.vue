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
          '{ dailyMetrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }',
      },
    });
  } catch (err) {
    snackStore.error(t('error.graphql.request'));
  }

  loading.value = false;

  if (res?.data?.data?.metrics) {
    metrics.value.doi = res?.data?.data?.metrics.doi;
    metrics.value.isOA = res?.data?.data?.metrics.isOA;
    metrics.value.goldOA = res?.data?.data?.metrics.goldOA;
    metrics.value.hybridOA = res?.data?.data?.metrics.hybridOA;
    metrics.value.bronzeOA = res?.data?.data?.metrics.bronzeOA;
    metrics.value.greenOA = res?.data?.data?.metrics.greenOA;
    metrics.value.closedOA = res?.data?.data?.metrics.closedOA;
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
