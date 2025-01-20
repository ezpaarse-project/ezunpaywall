<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        Admin
      </v-toolbar-title>
    </v-toolbar>
    <JSONView :code="APIconfig" />
  </v-card>
</template>

<script setup>

const adminStore = useAdminStore();
const { password } = storeToRefs(adminStore);

const { $admin } = useNuxtApp();

const { t } = useI18n();

const loading = ref(false);
const APIconfig = ref('');

/**
 * Get config of admin service
 */
async function getAdminConfig() {
  let appConfig;
  loading.value = true;
  try {
    appConfig = await $admin('/config', {
      method: 'GET',
      headers: {
        'x-api-key': password.value,
      },
    });
  } catch (err) {
    loading.value = false;
    return;
  }

  loading.value = false;

  const stringifiedConfig = JSON.stringify(appConfig, null, 2);
  APIconfig.value = stringifiedConfig;
}

onMounted(() => {
  getAdminConfig();
});

</script>
