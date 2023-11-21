<template>
  <v-card class="my-3">
    <v-toolbar
      color="secondary"
      dark
      dense
      flat
    >
      <v-toolbar-title> {{ t('enrich.enrichFile') }} </v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon>
        <v-icon>mdi-code-json</v-icon>
      </v-app-bar-nav-icon>
    </v-toolbar>
    <v-stepper
      v-model="step"
      hide-actions
      :items="stepItem"
    >
      <template #item.1>
        <v-card flat>
          <v-card-actions>
            <v-spacer />
            <v-btn
              append-icon="mdi-chevron-right"
              variant="tonal"
              :disabled="!hasFile"
              @click="setStep(2)"
            >
              {{ t("enrich.settings") }}
            </v-btn>
          </v-card-actions>
          <LogFileTab />
        </v-card>
      </template>

      <template #item.2>
        <v-card flat>
          <v-card-actions>
            <v-btn
              prepend-icon="mdi-chevron-left"
              variant="tonal"
              @click="setStep(1)"
            >
              {{ t("enrich.filesSelection") }}
            </v-btn>
            <v-spacer />
            <v-btn
              append-icon="mdi-chevron-right"
              variant="tonal"
              @click="startEnrich()"
            >
              {{ t("enrich.startProcess") }}
            </v-btn>
          </v-card-actions>
          <SettingsTab />
        </v-card>
      </template>

      <template #item.3>
        <v-card flat>
          <v-card-actions>
            <v-btn
              prepend-icon="mdi-chevron-left"
              variant="tonal"
              @click="setStep(2)"
            >
              {{ t("enrich.settings") }}
            </v-btn>
            <v-spacer />
            <DownloadButton />
          </v-card-actions>
          <!-- <ProcessTab /> -->
          <!-- copy -->
          <v-card>
            <div
              v-if="isProcessing"
              class="text-center"
            >
              <v-progress-circular
                :size="70"
                :width="7"
                indeterminate
                color="green"
              />
              <p> {{ stepTitle }} </p>
            </div>
            <div
              v-else
              class="text-center"
            >
              <v-icon
                v-if="isError"
                size="70"
                color="orange darken-2"
              >
                mdi-alert-circle
              </v-icon>
              <v-icon
                v-else
                size="70"
                color="green darken-2"
              >
                mdi-check
              </v-icon>
              <div
                v-if="isError"
                v-text="t('error.enrich.job')"
              />
              <div
                v-else
                v-text="t('enrich.end')"
              />
            </div>
            <Report
              :time="time"
              :state="state"
            />
          </v-card>
        </v-card>
      </template>
    </v-stepper>
  </v-card>
</template>

<script setup>

import { storeToRefs } from 'pinia';
import LogFileTab from '@/components/enrich/LogFileTab.vue';
import SettingsTab from '@/components/enrich/SettingsTab.vue';
import DownloadButton from '@/components/enrich/DownloadButton.vue';

import { useEnrichStore } from '@/store/enrich';

// #region COPY
// FIXME

/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

import Report from '@/components/enrich/Report.vue';

import { useSnacksStore } from '@/store/snacks';

const enrichStore = useEnrichStore();

const { t } = useI18n();

const step = ref(1);

function setStep(value) {
  step.value = value;
}

const stepItem = computed(() => ([
  t('enrich.filesSelection'),
  t('enrich.settings'),
  t('enrich.enrich'),
]));

const snackStore = useSnacksStore();
const { $enrich } = useNuxtApp();

const {
  isProcessing,
  type,
  apikey,
  attributes,
  fileSeparator,
  enrichedFileSeparator,
  files,
  isError,
} = storeToRefs(enrichStore);

const state = ref({});
const stepTitle = ref('');
const timer = ref(undefined);
const time = ref(0);

const attributesFiltered = computed(() => {
  if (type.value === 'csv') {
    return attributes.value.filter((e) => !e.includes('oa_locations'));
  }
  return attributes.value;
});

const hasFile = computed(() => files.value.length > 0);

function startTimer(startTime) {
  timer.value = setInterval(() => {
    time.value = Math.ceil((Date.now() - startTime) / 1000);
  }, 500);
}

function stopTimer() {
  clearInterval(timer.value);
}

function errored() {
  stopTimer();
  enrichStore.setIsError(true);
  enrichStore.setIsProcessing(false);
  state.value = {};
}

async function upload() {
  const formData = new FormData();
  formData.append('file', files.value[0]);

  let res;

  stepTitle.value = t('enrich.stepUpload');
  try {
    res = await $enrich({
      method: 'POST',
      url: '/upload',
      data: formData,
      headers: {
        'Content-Type': 'text/csv',
        'x-api-key': apikey.value,
      },
      responseType: 'json',
    });
  } catch (err) {
    snackStore.error(t('error.enrich.uploadFile'));
    return errored();
  }
  const id = res.data;

  return id;
}

async function enrich(id, data) {
  try {
    await $enrich({
      method: 'POST',
      url: `/job/${id}`,
      data,
      headers: {
        'x-api-key': apikey.value,
      },
      responseType: 'json',
    });
  } catch (err) {
    snackStore.error(t('error.enrich.job'));
    return errored();
  }
  return true;
}

function parseUnpaywallAttributesToGraphqlAttributes(args) {
  const simple = args.filter((e) => !e.includes('.'));
  let best_oa_location = args.filter((e) => e.includes('best_oa_location'));
  let first_oa_location = args.filter((e) => e.includes('first_oa_location'));
  let oa_locations = args.filter((e) => e.includes('oa_locations'));
  let z_authors = args.filter((e) => e.includes('z_authors'));

  if (
    !simple.length
    && !best_oa_location.length
    && !first_oa_location.length
    && !oa_locations.length
    && !z_authors.length
  ) {
    return '';
  }
  const attrs = [];
  if (simple.length) {
    attrs.push(simple.join(', '));
  }
  if (best_oa_location.length) {
    best_oa_location = best_oa_location.map((e) => e.split('.')[1]);
    attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`);
  }
  if (first_oa_location.length) {
    first_oa_location = first_oa_location.map((e) => e.split('.')[1]);
    attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`);
  }
  if (oa_locations.length) {
    oa_locations = oa_locations.map((e) => e.split('.')[1]);
    attrs.push(`oa_locations { ${oa_locations.join(', ')} }`);
  }
  if (z_authors.length) {
    z_authors = z_authors.map((e) => e.split('.')[1]);
    attrs.push(`z_authors { ${z_authors.join(', ')} }`);
  }
  return `{ ${attrs.join(', ')} }`;
}

async function getStateOfEnrichJob(id) {
  let stateEnrich;

  do {
    try {
      stateEnrich = await $enrich({
        method: 'GET',
        url: `/states/${id}.json`,
        responseType: 'json',
        headers: {
          'x-api-key': apikey.value,
        },
      });
      state.value = stateEnrich?.data;
    } catch (err) {
      snackStore.error(t('error.enrich.state'));
      return errored();
    }
    await new Promise((resolve) => { setTimeout(resolve, 1000); });
  } while (!stateEnrich?.data?.done);
  return true;
}

async function startEnrich() {
  setStep(3);
  time.value = 0;
  enrichStore.setIsError(false);
  enrichStore.setIsProcessing(true);
  startTimer(Date.now());

  const graphqlAttributes = parseUnpaywallAttributesToGraphqlAttributes(attributesFiltered.value);
  const idProcess = await upload();

  if (!isError.value) {
    const data = {
      type: type.value,
      args: graphqlAttributes,
      separator: enrichedFileSeparator.value,
    };
    await enrich(idProcess, data);
  }

  if (!isError.value) {
    stepTitle.value = t('enrich.stepEnrich');
    await getStateOfEnrichJob(idProcess);
  }

  stopTimer();
  enrichStore.setIsProcessing(false);
  enrichStore.setResultID(idProcess);
}

</script>
