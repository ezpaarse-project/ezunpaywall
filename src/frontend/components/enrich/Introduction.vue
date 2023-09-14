<template>
  <div>
    <p v-text="t('enrich.general')" />
    <p v-text="t('enrich.example')" />
    <v-btn
      class="mx-2"
      @click="download('csv')"
    >
      <v-icon left>
        mdi-download
      </v-icon>
      csv
    </v-btn>
    <v-btn
      class="mx-2"
      @click="download('jsonl')"
    >
      <v-icon left>
        mdi-download
      </v-icon>
      jsonl
    </v-btn>
  </div>
</template>

<script setup>

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();

function forceFileDownload(response, type) {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `example.${type}`);
  document.body.appendChild(link);
  link.click();
}

async function download(type) {
  let res;
  try {
    res = await $fetch(`/api/enrich/${type}`);
  } catch (err) {
    snackStore.error(t('error.enrich.download'));
  }
  return forceFileDownload(res, type);
}

</script>
