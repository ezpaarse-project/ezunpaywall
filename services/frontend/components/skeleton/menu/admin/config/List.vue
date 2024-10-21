<template>
  <v-list>
    <v-list-item
      v-for="config in configs"
      :key="config.name"
      :title="config.name"
      link
      router
      :to="{ path: config.path }"
    >
      <template #prepend>
        <v-icon :icon="config.icon" />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>

const configs = ref([
  { name: 'admin', icon: 'mdi-api', path: '/administration/config/admin' },
  { name: 'graphql', icon: 'mdi-api', path: '/administration/config/graphql' },
  { name: 'enrich', icon: 'mdi-api', path: '/administration/config/enrich' },
  { name: 'Interface', icon: 'mdi-application', path: '/administration/config/frontend' },
]);

</script>
