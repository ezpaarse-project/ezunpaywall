<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('administration.apikey.title') }} </v-toolbar-title>
      <v-spacer />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-file-import"
            @click.stop="importDialogVisible = true"
          />
        </template>
        {{ t("administration.apikey.import") }}
      </v-tooltip>
      <ImportDialog
        v-model="importDialogVisible"
        @imported="getApikeys()"
        @closed="importDialogVisible = false"
      />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-export-variant"
            @click.stop="exportDialogVisible = true"
          />
        </template>
        {{ t("administration.apikey.export") }}
      </v-tooltip>
      <ExportDialog
        v-model="exportDialogVisible"
        :apikeys="apikeys"
        @created="getApikeys()"
        @closed="exportDialogVisible = false"
      />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-plus"
            @click.stop="createDialogVisible = true"
          />
        </template>
        {{ t("administration.apikey.create") }}
      </v-tooltip>
      <CreateDialog
        v-model="createDialogVisible"
        @created="getApikeys()"
        @closed="createDialogVisible = false"
      />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-reload"
            :disabled="loading"
            @click.stop="getApikeys()"
          />
        </template>
        {{ t("administration.apikey.reload") }}
      </v-tooltip>
    </v-toolbar>

    <v-row
      v-if="loading"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>
    <NoData
      v-else-if="!apikeys || apikeys.length === 0"
      :text="t('administration.apikey.noApikeys')"
    />
    <v-row
      v-else
      class="ma-2"
    >
      <v-col
        v-for="(key) in apikeys"
        :key="key.apikey"
        cols="12"
        sm="12"
        md="12"
        lg="6"
        xl="6"
      >
        <ApikeyCard
          :apikey="key.apikey"
          :config="key.config"
          @deleted="getApikeys()"
          @updated="getApikeys()"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

import CreateDialog from '@/components/administration/apikey/CreateDialog.vue';
import ImportDialog from '@/components/administration/apikey/ImportDialog.vue';
import ExportDialog from '@/components/administration/apikey/ExportDialog.vue';
import Loader from '@/components/skeleton/Loader.vue';
import NoData from '@/components/skeleton/NoData.vue';
import ApikeyCard from '@/components/administration/apikey/ApikeyCard.vue';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $apikey } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const loading = ref(false);
const createDialogVisible = ref(false);
const importDialogVisible = ref(false);
const exportDialogVisible = ref(false);
const apikeys = ref([]);

async function getApikeys() {
  let res;
  loading.value = true;
  try {
    res = await $apikey({
      method: 'GET',
      url: '/keys',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (e) {
    snackStore.error(t('error.apikey.get'));
    loading.value = false;
    return;
  }
  loading.value = false;
  apikeys.value = res?.data;
}

onMounted(() => {
  getApikeys();
});

</script>
