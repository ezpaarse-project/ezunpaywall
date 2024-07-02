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
    <SearchBar
      v-model="searchValue"
      @update:model-value="updateSearchValue"
    />
    <v-row
      v-if="loading"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>
    <NoData
      v-else-if="!apikeysFiltered || apikeysFiltered.length === 0"
      :text="t('administration.apikey.noApikeys')"
    />
    <v-row
      v-else
      class="ma-2"
    >
      <v-col
        v-for="(key) in apikeysFiltered"
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
          @click:delete="openDeleteDialog(key.apikey)"
          @click:update="openUpdateDialog(key.apikey)"
        />
      </v-col>
    </v-row>
    <UpdateDialog
      v-model="updateDialogVisible"
      v-model:apikey="selectedApikey"
      v-model:name="selectedName"
      v-model:description="selectedDescription"
      v-model:owner="selectedOwner"
      v-model:access="selectedAccess"
      v-model:attributes="selectedAttributes"
      v-model:allowed="selectedAllowed"
      @closed="setUpdateDialogVisible(false)"
      @updated="getApikeys()"
    />
    <DeleteDialog
      v-model="deleteDialogVisible"
      :apikey="selectedApikey"
      @closed="setDeleteDialogVisible(false)"
      @deleted="getApikeys()"
    />
    <CreateDialog
      v-model="createDialogVisible"
      @created="getApikeys()"
      @closed="createDialogVisible = false"
    />
  </v-card>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

import SearchBar from '@/components/administration/apikey/SearchBar.vue';
import CreateDialog from '@/components/administration/apikey/CreateDialog.vue';
import DeleteDialog from '@/components/administration/apikey/DeleteDialog.vue';
import UpdateDialog from '@/components/administration/apikey/UpdateDialog.vue';
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

const searchValue = ref('');

const createDialogVisible = ref(false);
const updateDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const importDialogVisible = ref(false);
const exportDialogVisible = ref(false);

// TODO, use one ref
const selectedApikey = ref('');
const selectedName = ref('');
const selectedDescription = ref('');
const selectedOwner = ref('');
const selectedAccess = ref([]);
const selectedAttributes = ref([]);
const selectedAllowed = ref(false);
const apikeys = ref([]);

const apikeysFiltered = computed(() => {
  let filteredAPIkeys = apikeys.value;
  if (searchValue.value) {
    filteredAPIkeys = apikeys.value.filter(
      (key) => key.apikey.includes(searchValue.value),
    );
    return filteredAPIkeys;
  }
  return apikeys.value;
});

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

async function openUpdateDialog(id) {
  const apikey = apikeys.value.find((e) => e.apikey === id);
  selectedApikey.value = id;
  selectedName.value = apikey.config.name;
  selectedDescription.value = apikey.config.description;
  selectedOwner.value = apikey.config.owner;
  selectedAccess.value = apikey.config.access;
  selectedAttributes.value = apikey.config.attributes;
  selectedAllowed.value = apikey.config.allowed;
  await nextTick();
  updateDialogVisible.value = true;
}

async function openDeleteDialog(id) {
  selectedApikey.value = id;
  deleteDialogVisible.value = true;
}

function updateSearchValue(newValue) {
  searchValue.value = newValue;
}

onMounted(() => {
  getApikeys();
});

</script>
