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
    <SkeletonMenuAdminMenu />
  </v-list>
</template>

<script setup>

const { t } = useI18n();

const routers = computed(() => [
  { text: t('menu.home'), icon: 'mdi-view-dashboard', path: '/' },
  { text: t('menu.enrich'), icon: 'mdi-code-json', path: '/enrich' },
  { text: t('menu.graphql'), icon: 'mdi-server', path: '/graphql' },
  { text: t('menu.updateHistory'), icon: 'mdi-update', path: '/report-history' },
  { text: t('menu.doi'), icon: 'mdi-identifier', path: '/doi' },
  { text: t('menu.contact'), icon: 'mdi-email', path: '/contact' },
  { text: t('menu.openapi'), icon: 'mdi-api', path: '/open-api' },
]);

</script>
