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

const runtimeConfig = useRuntimeConfig();

const tab = ref(1);
const items = ref([
  'Graphql',
  'Enrich',
  'Update',
  'Apikey',
  'Mail',
  'Health',
]);

const host = computed(() => {
  if (tab.value === 1) { return runtimeConfig.public.enrichHost; }
  if (tab.value === 2) { return runtimeConfig.public.updateHost; }
  if (tab.value === 3) { return runtimeConfig.public.apikeyHost; }
  if (tab.value === 4) { return runtimeConfig.public.mailHost; }
  if (tab.value === 5) { return runtimeConfig.public.healthHost; }
  return runtimeConfig.public.graphqlHost;
});

</script>
