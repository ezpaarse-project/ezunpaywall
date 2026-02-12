<template>
  <section class="ma-3">
    <v-tabs v-model="tab" fixed-tabs color="primary">
      <v-tab v-for="item in items" :key="item.name" :value="item.name">
        {{ item.name }}
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="item in items" :key="item.name" :value="item.name">
        <AdministrationConfigCard :name="item.name" :host="item.host" />
      </v-tabs-window-item>
    </v-tabs-window>
  </section>
</template>

<script setup>
const route = useRoute();
const { $admin, $enrich, $graphql, $harvesterUnpaywall } = useNuxtApp();

const tab = ref('Admin');

const items = ref([
  { name: 'Graphql', host: $graphql },
  { name: 'Enrich', host: $enrich },
  { name: 'Admin', host: $admin },
  { name: 'Harvester-unpaywall', host: $harvesterUnpaywall },
]);

onMounted(() => {
  const presSelectedDoc = route?.query?.doc?.toLowerCase();
  if (presSelectedDoc === 'graphql') { tab.value = 'Graphql'; }
  if (presSelectedDoc === 'enrich') { tab.value = 'Enrich'; }
  if (presSelectedDoc === 'admin') { tab.value = 'Admin'; }
  if (presSelectedDoc === 'harvester-unpaywall') { tab.value = 'Harvester-unpaywall'; }
});

definePageMeta({
  middleware: 'admin',
});
</script>
