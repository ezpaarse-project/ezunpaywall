<template>
  <div>
    <v-file-input
      v-model="files"
      accept=".jsonl, .csv"
      :label="t('fileSelector.clickToAdd')"
      :show-size="true"
      @change="inputChanged"
    />
  </div>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useSnacksStore } from '@/store/snacks';
import { useEnrichStore } from '@/store/enrich';

const { t } = useI18n();
const snackStore = useSnacksStore();
const enrichStore = useEnrichStore();

const { files } = storeToRefs(enrichStore);

function inputChanged() {
  const ext = files.value[0].name.split('.').pop();
  if (ext !== 'jsonl' && ext !== 'csv') {
    snackStore.error(t('error.enrich.typeOfFile'));
    enrichStore.setFiles([]);
  }
  if (ext === 'csv') {
    const { type } = files.value[0];
    if (type !== 'text/csv') {
      snackStore.error(t('error.enrich.typeOfFile'));
      enrichStore.setFiles([]);
    }
  }
  enrichStore.setType(ext);
}

</script>
