<template>
  <v-list>
    <v-list-item
      v-for="config in configs"
      :key="config.name"
      link
      router
      :to="{ path: config.path }"
    >
      <template #prepend>
        <v-icon :icon="config.icon" />
      </template>
      <v-list-item-title class="custom-font-style ml-2">
        {{ config.name }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>

const configs = ref([
  { name: 'Admin', icon: 'mdi-api', path: '/administration/config/admin' },
  { name: 'Graphql', icon: 'mdi-api', path: '/administration/config/graphql' },
  { name: 'Enrich', icon: 'mdi-api', path: '/administration/config/enrich' },
  { name: 'Interface', icon: 'mdi-application', path: '/administration/config/frontend' },
]);

</script>
