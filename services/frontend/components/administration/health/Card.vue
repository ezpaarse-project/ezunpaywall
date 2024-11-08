<template>
  <v-card height="100%">
    <v-card-title class="pa-6">
      <v-row class="justify-center align-center">
        {{ props.name }}
        <v-spacer />
        <v-btn
          :prepend-icon="health ? 'mdi-check' : 'mdi-close'"
          :color="health ? 'success' : 'error'"
          append-icon="mdi-reload"
          variant="text"
          :disabled="loading"
          :loading="loading"
          @click.stop="getHealth()"
        >
          {{ health?.elapsedTime }} ms
        </v-btn>
      </v-row>
    </v-card-title>
    <v-card-text>
      {{ props.url }}
      <v-list>
      <v-list-item
        v-for="(serviceDependency, serviceName) in services"
        :key="serviceName"
        :value="serviceDependency"
      >
        <v-list-item-title> {{ serviceName }} </v-list-item-title>
        <span v-if="serviceDependency?.error">
          Error: {{ serviceDependency?.error }}
        </span>

        <template #append>
          <v-chip :color="serviceDependency?.healthy ? 'green darken-1' : 'red darken-1'">
            {{ serviceDependency?.elapsedTime }} ms
            <v-icon right>
              {{ serviceDependency?.healthy ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>

const runtimeConfig = useRuntimeConfig();

const loading = ref(false);
const health = ref({});

const props = defineProps({
  name: { type: String, default: '' },
  url: { type: String, default: '' },
});

/**
 * Get all health.
 * API and Elastic.
 */
async function getHealth() {
  let res;
  loading.value = true;
  try {
    res = await $fetch(`${props.url}/health`, {
      method: 'GET',
    });
  } catch (err) {
    loading.value = false;
    return;
  }
  health.value = res;
  loading.value = false;
}

const services = computed(() => {
  const copyHealth = { ...health.value };
  delete copyHealth.elapsedTime;
  delete copyHealth.healthy;
  return copyHealth;
});

defineExpose({
  getHealth,
});

onMounted(() => {
  getHealth();
});

</script>
