<template>
  <div>
    <v-tabs
      v-model="tab"
      fixed-tabs
      color="primary"
    >
      <v-tab
        v-for="item in items"
        :key="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>

    <OpenApi :host="host" />
  </div>
</template>

<script setup>

import OpenApi from '@/components/openapi/OpenApi.vue';
import { useRoute } from 'vue-router';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const tab = ref(0);
const items = ref([
  'Graphql',
  'Enrich',
  'Update',
  'Apikey',
  'Mail',
  'Health',
]);

const host = computed(() => {
  if (tab.value === 0) { return runtimeConfig.public.graphqlHost; }
  if (tab.value === 1) { return runtimeConfig.public.enrichHost; }
  if (tab.value === 2) { return runtimeConfig.public.updateHost; }
  if (tab.value === 3) { return runtimeConfig.public.apikeyHost; }
  if (tab.value === 4) { return runtimeConfig.public.mailHost; }
  if (tab.value === 5) { return runtimeConfig.public.healthHost; }
  return runtimeConfig.public.graphqlHost;
});

onMounted(() => {
  const presSelectionedDoc = route?.query?.doc;
  if (presSelectionedDoc === 'graphql') { tab.value = 0; }
  if (presSelectionedDoc === 'enrich') { tab.value = 1; }
  if (presSelectionedDoc === 'update') { tab.value = 2; }
  if (presSelectionedDoc === 'apikey') { tab.value = 3; }
  if (presSelectionedDoc === 'mail') { tab.value = 4; }
  if (presSelectionedDoc === 'health') { tab.value = 5; }
});

</script>
