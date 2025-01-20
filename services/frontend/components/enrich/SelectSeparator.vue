<template>
  <v-row class="my-5 mx-1">
    <v-select
      v-model="fileSeparator"
      :items="separators"
      label="File separator"
      filled
      dense
    />
    <v-spacer />
    <v-select
      v-model="enrichedFileSeparator"
      :items="separators"
      label="Enriched file separator"
      filled
      dense
    />
  </v-row>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useEnrichStore } from '@/store/enrich';

const enrichStore = useEnrichStore();

const { fileSeparator } = storeToRefs(enrichStore);
const { enrichedFileSeparator } = storeToRefs(enrichStore);

const separators = ref([',', ';']);

</script>
