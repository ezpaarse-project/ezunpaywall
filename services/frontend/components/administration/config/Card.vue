<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        {{ props.name }}
      </v-toolbar-title>
    </v-toolbar>
    <JSONView :code="serviceConfig" />
  </v-card>
</template>

<script setup>

const adminStore = useAdminStore();
const { password } = storeToRefs(adminStore);

const loading = ref(false);
const serviceConfig = ref('');

const props = defineProps({
  name: { type: String, default: '' },
  host: { type: Function, default: () => {} },
});

/**
 * Get config of admin service
 */
async function getAdminConfig() {
  let appConfig;
  loading.value = true;
  try {
    appConfig = await props.host('/config', {
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
  serviceConfig.value = stringifiedConfig;
}

onMounted(() => {
  getAdminConfig();
});

</script>
