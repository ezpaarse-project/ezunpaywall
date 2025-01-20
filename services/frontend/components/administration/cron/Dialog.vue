<template>
  <v-dialog :value="value" max-width="1000px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          {{ t('administration.cron.title') }}
          <v-chip label class="primary" text-color="white">
            {{ t('reports.basic') }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form id="form" @submit.prevent="updateCron()">
            <v-text-field
              v-for="(item, index) in localConfig"
              :key="localConfig[index]"
              v-model="localConfig[index][Object.keys(item)[0]]" 
              :label="Object.keys(localConfig[index])"
              class="mt-4"
            />
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn text class="red--text" @click.stop="emit('update:modelValue', false)">
          {{ t("cancel") }}
        </v-btn>
        <v-spacer />
        <v-btn text type="submit" form="form" :loading="loading" class="green--text">
          {{ t("update") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const emit = defineEmits({
  'update:modelValue': () => true,
  updated: () => true,
});

const props = defineProps({
  name: { type: String, default: '' },
  config: { type: Array, default: () => [] },
});

const localConfig = computed({
  get() {
    return props.config;
  },
  set(newValues) {
    newValues.forEach((item, index) => {
      Object.assign(localConfig.value[index], item);
    });
  },
});

const value = ref('false');
const loading = ref(false);

async function updateCron() {
  loading.value = true;
  const data = Object.assign({}, ...localConfig.value);
  try {
    await $admin(`/cron/${props.name}`, {
      method: 'PATCH',
      body: data,
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.cron.update'));
    loading.value = false;
    return;
  }
  loading.value = false;
  snackStore.info(t('info.cron.updated'));

  emit('updated');
  emit('update:modelValue', false);
}

</script>
