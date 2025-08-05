<template>
  <section class="ma-3">
    <v-tabs
      v-model="tab"
      fixed-tabs
    >
      <v-tab value="admin">
        admin
      </v-tab>
      <v-tab value="graphql">
        graphql
      </v-tab>
      <v-tab value="enrich">
        enrich
      </v-tab>
      <v-tab value="frontend">
        frontend
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="admin">
        <AdministrationConfigAdminCard />
      </v-tabs-window-item>
      <v-tabs-window-item value="graphql">
        <AdministrationConfigGraphqlCard />
      </v-tabs-window-item>
      <v-tabs-window-item value="enrich">
        <AdministrationConfigEnrichCard />
      </v-tabs-window-item>
      <v-tabs-window-item value="frontend">
        <AdministrationConfigFrontendCard />
      </v-tabs-window-item>
    </v-tabs-window>
  </section>
</template>

<script setup>

const tab = ref('admin');

definePageMeta({
  middleware: 'admin',
});

</script>
