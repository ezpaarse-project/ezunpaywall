<template>
  <v-list-item
    v-if="!isAdmin"
    link
    router
    :to="{ path: '/administration' }"
    ripple
    :title="t('menu.administration.title')"
  >
    <template #prepend>
      <v-icon icon="mdi-security" />
    </template>
  </v-list-item>
  <v-list
    v-else
    v-model:opened="open"
  >
    <v-list-group value="Admin">
      <template #activator="{ props }">
        <v-list-item v-bind="props">
          <template #prepend>
            <v-icon icon="mdi-security" />
          </template>
          <v-list-item-title class="custom-font-style">
            {{ t('menu.administration.title') }}
          </v-list-item-title>
        </v-list-item>
      </template>
      <SkeletonMenuAdminList />
    </v-list-group>
  </v-list>
</template>

<script setup>

const { t } = useI18n();

const adminStore = useAdminStore();

const isAdmin = computed(() => adminStore.isAdmin);

const open = ref(['Admin']);

</script>

<style>
.custom-font-style {
  font-size: 0.8125em;
  font-weight: 500;
}
</style>
