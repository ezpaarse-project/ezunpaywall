<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        Cron
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-tabs
      v-model="tab"
      fixed-tabs
      color="primary"
    >
      <v-tab
        v-for="item in items"
        :key="item"
        :value="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>
    <v-row
      class="ma-2"
    >
      <v-col
        v-for="name in names"
        :key="`${tab}-${name}`"
        cols="12"
        sm="6"
        md="6"
        lg="6"
        xl="6"
      >
        <AdministrationCronCard
          :name="name"
          :host="host"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

const route = useRoute();

const {
  $admin,
  $enrich,
  $graphql,
  $harvesterUnpaywall,
} = useNuxtApp();

const tab = ref('Graphql');
const items = ref([
  'Graphql',
  'Enrich',
  'Admin',
  'Harvester-unpaywall',
]);

const names = computed(() => {
  if (tab.value === 'Graphql') { return ['cleanFile', 'metrics']; }
  if (tab.value === 'Enrich') { return ['cleanFile']; }
  if (tab.value === 'Admin') { return ['cleanFile', 'demoApiKey']; }
  if (tab.value === 'Harvester-unpaywall') { return ['cleanFile', 'downloadSnapshot', 'dataUpdate']; }
  return [];
});

const host = computed(() => {
  if (tab.value === 'Graphql') { return $graphql; }
  if (tab.value === 'Enrich') { return $enrich; }
  if (tab.value === 'Admin') { return $admin; }
  if (tab.value === 'Harvester-unpaywall') { return $harvesterUnpaywall; }
  return [];
});

onMounted(() => {
  const presSelectedDoc = route?.query?.doc;
  if (presSelectedDoc === 'graphql') { tab.value = 'Graphql'; }
  if (presSelectedDoc === 'enrich') { tab.value = 'Enrich'; }
  if (presSelectedDoc === 'admin') { tab.value = 'Admin'; }
  if (presSelectedDoc === 'Harvester-unpaywall') { tab.value = 'Harvester-unpaywall'; }
});

definePageMeta({
  middleware: 'admin',
});

</script>
