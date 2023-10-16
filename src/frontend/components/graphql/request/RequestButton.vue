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
  // 10.1001/jama.2016.9797
  try {
    res = await $graphql({
      method: 'GET',
      url: '/graphql',
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
  emit('graphql-data', res?.data?.data);
  await nextTick();
  document.getElementById('graphqlResult').scrollIntoView({ behavior: 'smooth' });
  loading.value = false;
}

</script>
