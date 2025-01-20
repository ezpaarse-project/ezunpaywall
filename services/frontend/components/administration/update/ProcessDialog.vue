<template>
  <v-dialog :value="value" max-width="1000px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          {{ t('administration.job.title') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-tabs v-model="tab" fixed-tabs color="primary">
        <v-tab value="classic">
          {{ t('administration.job.classic') }}
        </v-tab>
        <v-tab value="history">
          {{ t('administration.job.history') }}
        </v-tab>
        <v-tab value="file">
          {{ t('administration.job.file') }}
        </v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="classic">
            <v-form id="form" v-model="valid" @submit.prevent="startJob()">
              <v-select v-model="interval" class="mt-4" :items="intervals" :label="t('administration.job.interval')" />
              <v-text-field v-model="startDate" :label="t('administration.job.startDate')"
                :rules="[dateFormatRule, dateIsFutureRule]" autofocus />
              <v-text-field v-model="endDate" :label="t('administration.job.endDate')"
                :rules="[dateFormatRule, dateIsFutureRule]" />
              <v-text-field v-model="index" :label="t('administration.job.indexBase')" />
              <v-checkbox v-model="cleanFile" :label="t('administration.job.cleanFile')" hide-details />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item value="history">
            <v-form id="form" v-model="valid" @submit.prevent="startJob()">
              <v-select v-model="interval" class="mt-4" :items="intervals" :label="t('administration.job.interval')" />
              <v-text-field v-model="startDate" :label="t('administration.job.startDate')"
                :rules="[dateFormatRule, dateIsFutureRule]" autofocus />
              <v-text-field v-model="endDate" :label="t('administration.job.endDate')"
                :rules="[dateFormatRule, dateIsFutureRule]" />
              <v-text-field v-model="index" :label="t('administration.job.indexBase')" />
              <v-text-field v-model="indexHistory" :label="t('administration.job.indexHistory')" />
              <v-checkbox v-model="cleanFile" :label="t('administration.job.cleanFile')" hide-details />
            </v-form>
          </v-tabs-window-item>
          <v-tabs-window-item value="file">
            <v-form id="form" v-model="valid" @submit.prevent="startJob()">
              <v-select v-model="filetype" class="mt-4" :items="filetypes" :label="t('administration.job.filetype')" />
              <v-text-field v-model="filename" :label="t('administration.job.filename')" autofocus />
              <v-text-field v-model="index" :label="t('administration.job.indexBase')" />
              <v-checkbox v-model="cleanFile" :label="t('administration.job.cleanFile')" hide-details />
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-card-actions>
        <v-btn text class="red--text" @click.stop="emit('update:modelValue', false)">
          {{ t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn text type="submit" form="form" :disabled="!valid" :loading="loading" class="green--text">
          {{ t('create') }}
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
const tab = ref('classic');
const valid = ref(true);
const loading = ref(false);
const intervals = ref(['day', 'week']);
const filetypes = ref(['changefile', 'snapshot']);

const interval = ref('day');
const index = ref('unpaywall');
const indexHistory = ref(`unpaywall_history_${new Date().getFullYear()}`);
const startDate = ref(formatDate(new Date()));
const endDate = ref(formatDate(new Date()));
const filename = ref('');
const filetype = ref('changefile');
const cleanFile = ref(false);

const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

const dateFormatRule = ref((date) => dateRegex.test(date) || t('administration.job.invalidDate'));
const dateIsFutureRule = ref((date) => Date.now() > new Date(date) || t('administration.job.future'));

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

async function startJob() {
  if (tab.value === 'classic') {
    startClassicUpdate()
  }
  if (tab.value === 'history') {
    startHistoryUpdate()
  }
  if (tab.value === 'file') {
    startInsertFile()
  }
}

async function startClassicUpdate() {
  loading.value = true;
  const data = {
    index: index.value,
    interval: interval.value,
    startDate: startDate.value,
    endDate: endDate.value,
    cleanFile: cleanFile.value,
  };
  try {
    await $admin('/job/changefile/download/insert', {
      method: 'POST',
      body: data,
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.update.start'));
    loading.value = false;
    return;
  }
  loading.value = false;
  snackStore.info(t('info.update.started'));
  emit('update:modelValue', false);
}

async function startHistoryUpdate() {
  loading.value = true;
  const data = {
    index: index.value,
    indexHistory: indexHistory.value,
    interval: interval.value,
    startDate: startDate.value,
    endDate: endDate.value,
    cleanFile: cleanFile.value,
  };
  try {
    await $admin('/job/changefile/history/download/insert', {
      method: 'POST',
      body: data,
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.update.start'));
    loading.value = false;
  }
  loading.value = false;
  snackStore.info(t('info.update.started'));
  emit('update:modelValue', false);
}

async function startInsertFile() {
  loading.value = true;
  const data = {
    index: index.value,
    cleanFile: cleanFile.value,
  };
  try {
    await $admin(`/job/${filetype.value}/insert/${filename.value}`, {
      method: 'POST',
      body: data,
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.update.start'));
    loading.value = false;
  }
  loading.value = false;
  snackStore.info(t('info.update.started'));
  emit('update:modelValue', false);
}

</script>
