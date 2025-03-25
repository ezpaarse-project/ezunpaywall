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

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const tab = ref(0);
const items = ref([
  'Graphql',
  'Enrich',
  'Admin',
]);

const host = computed(() => {
  if (tab.value === 0) { return runtimeConfig.public.graphqlURL; }
  if (tab.value === 1) { return runtimeConfig.public.enrichURL; }
  if (tab.value === 2) { return runtimeConfig.public.adminUrl; }
  return runtimeConfig.public.graphqlURL;
});

onMounted(() => {
  const presSelectedDoc = route?.query?.doc;
  if (presSelectedDoc === 'graphql') { tab.value = 0; }
  if (presSelectedDoc === 'enrich') { tab.value = 1; }
  if (presSelectedDoc === 'admin') { tab.value = 2; }
});

</script>
