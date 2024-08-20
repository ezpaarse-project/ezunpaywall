<template>
  <v-card height="100%">
    <v-card-title class="pt-5 pl-5 pr-5">
      <v-row>
        {{ props.name }}
        <v-spacer />
        <v-chip :color="health?.healthy ? 'green darken-1' : 'red darken-1'">
          {{ health?.elapsedTime }} ms
          <v-icon right>
            {{ health?.healthy ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </v-chip>
      </v-row>
    </v-card-title>
    <v-divider class="ma-2" />
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
  </v-card>
</template>

<script setup>

const props = defineProps({
  name: { type: String, default: '' },
  api: { type: Function, default: () => 1 },
});

const { data: health, refresh } = await useFetch('/health', {
  baseURL: props.api.baseURL,
  method: 'GET',
  onResponseError() {
    snackStore.error(t('error.apikey.get'));
  }
});

const services = computed(() => {
  const copyHealth = { ...health.value };
  delete copyHealth.elapsedTime;
  delete copyHealth.healthy;
  return copyHealth;
});

function refreshHealth() {
  refresh();
}

defineExpose({
  refreshHealth,
});

</script>
