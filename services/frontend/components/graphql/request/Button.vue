<template>
  <v-btn
    :loading="loading"
    :disabled="disabled"
    @click="graphqlRequest"
  >
    {{ t('graphql.start') }}
  </v-btn>
</template>

<script setup>

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $graphql } = useNuxtApp();

const props = defineProps({
  disabled: { type: Boolean, default: false },
  query: { type: String, default: '' },
  apikey: { type: String, default: '' },
});

const emit = defineEmits({
  'graphql-data': (data) => data,
});

const loading = ref(false);

async function graphqlRequest() {
  loading.value = true;
  let res;
  try {
    res = await $graphql('/graphql', {
      method: 'GET',
      params: {
        query: props.query,
      },
      headers: {
        'x-api-key': props.apikey,
      },
    });
  } catch (err) {
    snackStore.error(t('error.graphql.request'));
  }
  emit('graphql-data', res);
  await nextTick();
  document.getElementById('graphqlResult').scrollIntoView({ behavior: 'smooth' });
  loading.value = false;
}

</script>
