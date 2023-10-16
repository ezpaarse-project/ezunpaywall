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
          {{ t('administration.apikey.import') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-textarea
          v-model="apikeys"
          outlined
          rows="15"
          label="apikeys"
          :value="apikeys"
          class="mt-4"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click.stop="loadApikeys()">
          {{ t('send') }}
        </v-btn>
        <v-btn @click.stop="emit('update:modelValue', false)">
          {{ t('close') }}
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
const { $apikey } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const emit = defineEmits({
  'update:modelValue': () => true,
  imported: () => true,
});

const value = ref('false');
const apikeys = ref([]);
const loading = ref(false);

async function loadApikeys() {
  let parsedApikeys;
  try {
    parsedApikeys = JSON.parse(apikeys.value);
  } catch (err) {
    snackStore.error(t('error..apikey.parse'));
    return;
  }

  loading.value = true;

  try {
    await $apikey({
      method: 'POST',
      url: '/keys/load',
      data: parsedApikeys,
      headers: {
        'X-API-KEY': password,
      },
    });
  } catch (err) {
    snackStore.error(t('error.apikey.import'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.apikey.imported'));
  emit('imported');
  loading.value = false;
  emit('update:modelValue', false);
}

</script>
