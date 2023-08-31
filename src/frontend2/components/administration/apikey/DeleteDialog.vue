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
          {{ t('administration.apikey.delete') }}
          <v-chip
            label
            color="secondary"
            text-color="white"
          >
            {{ apikey }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <div
          class="pa-12"
          v-text="t('administration.apikey.deleteMessage')"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="emit('update:modelValue', false)"
        >
          {{ t("no") }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          :loading="loading"
          class="green--text"
          @click="deleteApikey()"
        >
          {{ t("yes") }}
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

const props = defineProps({
  apikey: { type: String, default: '' },
});

const emit = defineEmits({
  'update:modelValue': () => true,
  deleted: () => true,
});

const value = ref('false');
const loading = ref(false);

async function deleteApikey() {
  loading.value = true;
  try {
    await $apikey({
      method: 'DELETE',
      url: `/keys/${props.apikey}`,
      headers: {
        'X-API-KEY': password,
      },
    });
  } catch (e) {
    snackStore.error(t('error.apikey.delete'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.apikey.deleted'));
  emit('deleted');
  loading.value = false;
  emit('update:modelValue', false);
}

</script>
