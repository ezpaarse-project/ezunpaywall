<template>
  <v-list>
    <v-list-item link router :to="{ path: '/administration/update' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-database-refresh" />
      </template>
      <v-list-item-title class="custom-font-style">
        {{ t('menu.administration.update') }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :to="{ path: '/administration/cron' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-update" />
      </template>
      <v-list-item-title class="custom-font-style">
        {{ t('menu.administration.cron') }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :to="{ path: '/administration/apikey' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-key" />
      </template>
      <v-list-item-title class="custom-font-style">
        {{ t('menu.administration.apikey') }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :to="{ path: '/administration/file' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-file" />
      </template>
      <v-list-item-title class="custom-font-style">
        {{ t('menu.administration.file') }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :to="{ path: '/administration/health' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-heart-pulse" />
      </template>
      <v-list-item-title class="custom-font-style">
        {{ t('menu.administration.health') }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router to="/administration/elastic" ripple>
      <template #prepend>
        <v-avatar rounded="0">
          <img src="/static/images/elastic.png" alt="Elastic Logo" style="max-width: 30px; max-height: 30px; width: auto; height: auto;">
        </v-avatar>
      </template>
      <v-list-item-title class="custom-font-style ml-2">
        Elastic
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :href="runtimeConfig.public.kibanaURL" target="_blank" rel="noopener noreferrer" ripple>
      <template #prepend>
        <v-avatar rounded="0">
          <img src="/static/images/kibana.png" alt="Kibana Logo" style="max-width: 30px; max-height: 30px; width: auto; height: auto;">
        </v-avatar>
      </template>
      <v-list-item-title class="custom-font-style ml-2">
        ezMETA
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :href="runtimeConfig.public.ezmesureURL" target="_blank" rel="noopener noreferrer" ripple>
      <template #prepend>
        <v-avatar rounded="0">
          <img src="/static/images/ezmesure-logo.svg" alt="ezMESURE Logo" style="max-width: 30px; max-height: 30px; width: auto; height: auto;">
        </v-avatar>
      </template>
      <v-list-item-title class="custom-font-style ml-2">
        ezMESURE
      </v-list-item-title>
    </v-list-item>

    <v-list-item link router :to="{ path: '/administration/config' }" ripple>
      <template #prepend>
        <v-icon icon="mdi-code-json" />
      </template>
      <v-list-item-title class="custom-font-style">
        Config
      </v-list-item-title>
    </v-list-item>

    <v-list-item class="custom-font-style bg-red-lighten-4" ripple :title="t('menu.administration.logout')" @click="logout()">
      <template #prepend>
        <v-icon icon="mdi-logout" />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>

const runtimeConfig = useRuntimeConfig();
const adminStore = useAdminStore();

const router = useRouter();

const { t } = useI18n();

/**
 * Disconnect admin user and move him to administration.
 */
function logout() {
  adminStore.setIsAdmin(false);
  adminStore.setPassword('');

  router.push('/administration');
}

</script>

<style>
.custom-font-style {
  font-size: 0.8125em;
  font-weight: 500;
}
</style>