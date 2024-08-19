<template>
  <v-card-actions>
    <v-spacer />
    <v-btn
      :disabled="isProcessing || isError"
      variant="tonal"
      @click="download()"
    >
      <template #prepend>
        <v-icon>mdi-download</v-icon>
      </template>
      {{ t("enrich.download") }}
    </v-btn>
  </v-card-actions>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useEnrichStore } from '@/store/enrich';
import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const { $enrich } = useNuxtApp();
const enrichStore = useEnrichStore();
const snackStore = useSnacksStore();

const {
  apikey, resultID, type, isProcessing, isError,
} = storeToRefs(enrichStore);

function forceFileDownload(response) {
  const url = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${resultID.value}.${type.value}`);
  document.body.appendChild(link);
  link.click();
}

async function download() {
  let res;
  try {
    res = await $enrich(`/enriched/${resultID.value}.${type.value}`, {
      method: 'GET',
      headers: {
        'x-api-key': apikey.value,
      },
      responseType: 'blob',
    });
  } catch (err) {
    snackStore.error(t('error.enrich.download'));
    return errored();
  }
  return forceFileDownload(res);
}

</script>
