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
      <AdministrationApikeyImportDialog
        v-model="importDialogVisible"
        @imported="refreshApikey()"
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
      <AdministrationApikeyExportDialog
        v-model="exportDialogVisible"
        :apikeys="apikeys"
        @created="refreshApikey()"
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
            :disabled="status === 'pending'"
            @click.stop="refreshApikey"
          />
        </template>
        {{ t("administration.apikey.reload") }}
      </v-tooltip>
    </v-toolbar>
    <AdministrationApikeySearchBar
      v-model="searchValue"
      @update:model-value="updateSearchValue"
    />
    <v-row
      v-if="status === 'pending'"
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
        <AdministrationApikeyCard
          :apikey="key.apikey"
          :config="key.config"
          @click:delete="openDeleteDialog(key.apikey)"
          @click:update="openUpdateDialog(key.apikey)"
        />
      </v-col>
    </v-row>
    <AdministrationApikeyUpdateDialog
      v-model="updateDialogVisible"
      v-model:apikey="selectedApikey"
      v-model:name="selectedName"
      v-model:description="selectedDescription"
      v-model:owner="selectedOwner"
      v-model:access="selectedAccess"
      v-model:attributes="selectedAttributes"
      v-model:allowed="selectedAllowed"
      @closed="setUpdateDialogVisible(false)"
      @updated="refreshApikey()"
    />
    <AdministrationApikeyDeleteDialog
      v-model="deleteDialogVisible"
      :apikey="selectedApikey"
      @closed="setDeleteDialogVisible(false)"
      @deleted="refreshApikey()"
    />
    <AdministrationApikeyCreateDialog
      v-model="createDialogVisible"
      @created="refreshApikey()"
      @closed="createDialogVisible = false"
    />
  </v-card>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const { password } = storeToRefs(adminStore);

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

const { data: apikeys, status, refresh: refreshApikey } = useFetch('/apikeys', {
  baseURL: $admin.baseURL,
  method: 'GET',
  headers: {
    'X-API-KEY': password.value,
  },
  onResponseError() {
    snackStore.error(t('error.apikey.get'));
  }
});

const apikeysFiltered = computed(() => {
  if (searchValue.value) {
    return apikeys.value.filter((key) =>
      key.apikey.includes(searchValue.value)
    );
  }
  return apikeys.value;
});

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

// TODO
/**
 * Open dialog to delete apikey.
 *
 * @param filename apikey.
 */
 async function openDeleteDialog(filename) {
  openConfirm({
    title: t('administration.apikey.delete'),
    text: t('administration.apikey.deleteMessage', { apikey }),
    agreeText: t('delete'),
    agreeIcon: 'mdi-delete',
    onAgree: async () => {
      // TODO
    },
  });
}

async function openDeleteDialog(id) {
  selectedApikey.value = id;
  deleteDialogVisible.value = true;
}

function updateSearchValue(newValue) {
  searchValue.value = newValue;
}

</script>