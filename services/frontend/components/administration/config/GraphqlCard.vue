<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        Graphql
      </v-toolbar-title>
    </v-toolbar>
    <JSONView :code="APIconfig" />
  </v-card>
</template>

<script setup>

const adminStore = useAdminStore();
const { password } = storeToRefs(adminStore);

const { $graphql } = useNuxtApp();

const loading = ref(false);
const APIconfig = ref('');

/**
 * Get config of graphql service
 */
async function getGraphqlConfig() {
  let appConfig;
  loading.value = true;
  try {
    appConfig = await $graphql('/config', {
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
  getGraphqlConfig();
});

</script>
