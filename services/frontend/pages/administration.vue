<template>
  <section class="ma-3">
    <AdministrationLogin v-if="!isAdmin" />
    <div v-else>
      <v-row class="my-4 mx-1">
        <AdministrationLogoutButton />
        <v-spacer />
        <AdministrationEzmesureButton />
      </v-row>
      <AdministrationElasticCard
        class="my-4"
      />
      <ReportCard
        class="my-4"
      />
      <AdministrationHealthTab class="my-4" />
      <AdministrationApikeyTab class="my-4" />
    </div>
  </section>
</template>

<script setup>

const adminStore = useAdminStore();

const isAdmin = computed(() => adminStore.isAdmin);

</script>
