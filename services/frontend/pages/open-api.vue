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

    <AdministrationOpenApi :host="host" />
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
  if (tab.value === 2) { return runtimeConfig.public.adminURL; }
  return runtimeConfig.public.graphqlURL;
});

onMounted(() => {
  const presSelectionedDoc = route?.query?.doc;
  if (presSelectionedDoc === 'graphql') { tab.value = 0; }
  if (presSelectionedDoc === 'enrich') { tab.value = 1; }
  if (presSelectionedDoc === 'admin') { tab.value = 2; }
});

</script>
