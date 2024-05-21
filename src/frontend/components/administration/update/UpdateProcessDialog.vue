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
          {{ t('administration.job.title') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container fluid>
          <v-form
            id="form"
            v-model="valid"
            @submit.prevent="startUpdate()"
          >
            <v-select
              v-model="interval"
              class="mt-4"
              :items="intervals"
              :label="t('administration.job.interval')"
            />
            <v-text-field
              v-if="props.type === 'unpaywall'"
              v-model="indexBase"
              :label="t('administration.job.index')"
            />
            <v-text-field
              v-model="startDate"
              :label="t('administration.job.startDate')"
              :rules="[dateFormatRule, dateIsFutureRule]"
              autofocus
            />
            <v-text-field
              v-if="props.type === 'unpaywall'"
              v-model="endDate"
              :label="t('administration.job.endDate')"
              :rules="[dateFormatRule, dateIsFutureRule]"
            />
            <v-text-field
              v-if="props.type === 'unpaywallHistory'"
              v-model="indexBase"
              :label="t('administration.job.indexBase')"
            />
            <v-text-field
              v-if="props.type === 'unpaywallHistory'"
              v-model="indexHistory"
              :label="t('administration.job.indexHistory')"
            />
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="emit('update:modelValue', false)"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          form="form"
          :disabled="!valid"
          :loading="loading"
          class="green--text"
        >
          {{ t('create') }}
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

function formatDate(date) {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('-');
}

const value = ref('false');
const valid = ref(true);
const loading = ref(false);
const intervals = ref(['day', 'week']);

const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

const dateFormatRule = ref((date) => dateRegex.test(date) || t('administration.job.invalidDate'));
const dateIsFutureRule = ref((date) => Date.now() > new Date(date) || t('administration.job.future'));

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

const interval = ref('day');
const indexBase = ref('unpaywall_base');
const indexHistory = ref('unpaywall_history');
const startDate = ref(formatDate(new Date()));
const endDate = ref(formatDate(new Date()));

function startUpdatePeriod(data) {
  return $update({
    method: 'POST',
    url: '/job/period',
    data,
    headers: {
      'X-API-KEY': password.value,
    },
  });
}

function startUpdateHistory(data) {
  return $update({
    method: 'POST',
    url: '/job/history',
    data,
    headers: {
      'X-API-KEY': password.value,
    },
  });
}

async function startUpdate() {
  loading.value = true;
  let data;
  if (props.type === 'unpaywall') {
    data = {
      index: indexBase.value,
      interval: interval.value,
      startDate: startDate.value,
      endDate: endDate.value,
    };
    try {
      await startUpdatePeriod(data);
    } catch (err) {
      snackStore.error(t('error.update.start'));
      loading.value = false;
    }
  }
  if (props.type === 'unpaywallHistory') {
    data = {
      indexBase: indexBase.value,
      indexHistory: indexHistory.value,
      interval: interval.value,
    };
    try {
      await startUpdateHistory(data);
    } catch (err) {
      snackStore.error(t('error.update.start'));
      loading.value = false;
    }
  }
  loading.value = false;
  snackStore.info(t('info.update.started'));
  emit('update:modelValue', false);
}

</script>
