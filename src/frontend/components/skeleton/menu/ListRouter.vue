<template>
  <v-list
    nav
    dense
  >
    <v-list-item
      v-for="route in routers"
      :key="route.path"
      link
      router
      :to="{ path: route.path }"
      ripple
      :title="route.text"
    >
      <template #prepend>
        <v-icon :icon="route.icon" />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>

const { t } = useI18n();

const routers = computed(() => [
  { text: t('drawer.home'), icon: 'mdi-view-dashboard', path: '/' },
  { text: t('drawer.enrich'), icon: 'mdi-code-json', path: '/enrich' },
  { text: t('drawer.graphql'), icon: 'mdi-server', path: '/graphql' },
  { text: t('drawer.openapi'), icon: 'mdi-api', path: '/open-api' },
  { text: t('drawer.updateHistory'), icon: 'mdi-update', path: '/report-history' },
  { text: t('drawer.contact'), icon: 'mdi-email', path: '/contact' },
  { text: t('drawer.administration'), icon: 'mdi-security', path: '/administration' },
]);

</script>
