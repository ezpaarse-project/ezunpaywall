<template>
  <v-dialog
    :value="value"
    max-width="1000px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          {{ t('administration.cron.title') }}
          <v-chip
            label
            class="primary"
            text-color="white"
          >
            {{ title }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form
            id="form"
            @submit.prevent="updateCron()"
          >
            <v-select
              v-model="config.interval"
              class="mt-4"
              :items="intervals"
              :label="t('administration.cron.interval')"
            />
            <v-text-field
              v-model="config.schedule"
              :label="t('administration.cron.schedule')"
            />
            <v-text-field
              v-if="props.type === 'unpaywall'"
              v-model="config.index"
              :label="t('administration.cron.index')"
            />
            <v-text-field
              v-if="props.type === 'unpaywallHistory'"
              v-model="config.indexBase"
              :label="t('administration.cron.indexBase')"
            />
            <v-text-field
              v-if="props.type === 'unpaywallHistory'"
              v-model="config.indexHistory"
              :label="t('administration.cron.indexHistory')"
            />
          </v-form>
        </v-container>
        <v-card-actions>
          <span
            class="mr-2"
            v-text="`${t('administration.cron.active')} :`"
          />
          <v-checkbox v-model="config.active" />
        </v-card-actions>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="emit('update:modelValue', false)"
        >
          {{ t("cancel") }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          form="form"
          :disabled="!3"
          :loading="loading"
          class="green--text"
        >
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
});

const value = ref('false');
const loading = ref(false);
const intervals = ref(['day', 'week']);

const config = ref({});

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

const title = computed(() => {
  if (props.type === 'unpaywall') { return t('reports.basic'); }
  if (props.type === 'unpaywallHistory') { return t('reports.history'); }
  return null;
});

async function getCronConfig() {
  let cronConfig;
  try {
    cronConfig = await $admin(`/cron/${props.type}`, {
      method: 'GET',
    });
  } catch (err) {
    snackStore.error(t('error.cron.get'));
    loading.value = false;
    return;
  }
  loading.value = false;

  config.value = cronConfig;
}

async function activeCron() {
  try {
    await $admin(`/cron/${props.type}/start`, {
      method: 'POST',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.cron.active'));
    loading.value = false;
    return;
  }
  loading.value = false;
  snackStore.info(t('info.cron.activated'));
  emit('update:modelValue', false);
}

async function stopCron() {
  try {
    await $admin(`/cron/${props.type}/stop`, {
      method: 'POST',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.cron.stop'));
    loading.value = false;
    return;
  }
  loading.value = false;
  snackStore.info(t('info.cron.stopped'));
  emit('update:modelValue', false);
}

async function updateCron() {
  loading.value = true;
  let data;
  if (type === 'unpaywall') {
    data = {
      index: config.index.value,
      interval: config.interval.value,
      time: config.schedule.value,
    };
  }
  if (type === 'unpaywallHistory') {
    data = {
      indexBase: config.indexBase.value,
      indexHistory: config.indexHistory.value,
      interval: config.interval.value,
      time: config.schedule.value,
    };
  }
  try {
    await $admin(`/cron/${props.type}`, {
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

  if (active) {
    await activeCron();
  } else {
    await stopCron();
  }
}

onMounted(() => {
  getCronConfig();
});

</script>
