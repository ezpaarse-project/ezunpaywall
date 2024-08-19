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
        :loading="loading"
        :doi="metrics.doi"
        :is-o-a="metrics.isOA"
      />
      <hr class="my-4">
      <v-card-title> {{ t('home.openAccessStatus') }} </v-card-title>
      <HomeOpenAccessMetricsChips
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
    res = await $graphql('/graphql', {
      method: 'GET',
      params: {
        query:
          '{ dailyMetrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }',
      },
    });
  } catch (err) {
    snackStore.error(t('error.graphql.request'));
  }

  loading.value = false;

  if (res?.data?.dailyMetrics) {
    metrics.value.doi = res?.data?.dailyMetrics.doi;
    metrics.value.isOA = res?.data?.dailyMetrics.isOA;
    metrics.value.goldOA = res?.data?.dailyMetrics.goldOA;
    metrics.value.hybridOA = res?.data?.dailyMetrics.hybridOA;
    metrics.value.bronzeOA = res?.data?.dailyMetrics.bronzeOA;
    metrics.value.greenOA = res?.data?.dailyMetrics.greenOA;
    metrics.value.closedOA = res?.data?.dailyMetrics.closedOA;
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
