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
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form
            id="form"
            @submit.prevent="updateCron()"
          >
            <v-select
              v-model="interval"
              class="mt-4"
              :items="intervals"
              :label="t('administration.cron.interval')"
            />
            <v-text-field
              v-model="schedule"
              :label="t('administration.cron.schedule')"
            />
            <v-text-field
              v-model="index"
              :label="t('administration.cron.index')"
            />
          </v-form>
        </v-container>
        <v-card-actions>
          <span
            class="mr-2"
            v-text="`${t('administration.cron.active')} :`"
          />
          <v-checkbox v-model="active" />
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

import { storeToRefs } from 'pinia';
import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $update } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const emit = defineEmits({
  'update:modelValue': () => true,
});

const value = ref('false');
const loading = ref(false);
const intervals = ref(['day', 'week']);
const index = ref('day');
const schedule = ref('0 0 0 * * *');
const interval = ref('unpaywall');
const active = ref(false);

async function getUpdateCronConfig() {
  let cronConfig;
  try {
    cronConfig = await $update({
      method: 'GET',
      url: '/cron',
    });
  } catch (err) {
    snackStore.error(t('error.cron.get'));
    loading.value = false;
    return;
  }
  loading.value = false;
  cronConfig = cronConfig?.data;
  index.value = cronConfig.index;
  interval.value = cronConfig.interval;
  schedule.value = cronConfig.schedule;
  active.value = cronConfig.active;
}

async function activeCron() {
  try {
    await $update({
      method: 'POST',
      url: '/cron/start',
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
    await $update({
      method: 'POST',
      url: '/cron/stop',
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
  try {
    await $update({
      method: 'PATCH',
      url: '/cron',
      data: {
        index: index.value,
        interval: interval.value,
        time: schedule.value,
      },
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
  getUpdateCronConfig();
});

</script>
