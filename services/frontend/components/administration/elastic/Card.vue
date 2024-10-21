<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title>
        {{ t('administration.elastic.title') }}
      </v-toolbar-title>
      <v-btn icon="mdi-reload" :disabled="loading" @click.stop="getIndices()" />
    </v-toolbar>
    <v-list v-if="indices.length > 0">
      <v-list-item v-for="index in indices" :key="index.index">
        <v-col cols="12">
          <v-icon icon="mdi-circle" class="mx-1" :color="index.health" />
          <v-chip class="ma-2" color="green" variant="outlined">
            {{ index.index }}
          </v-chip>
          <v-chip class="ma-2" color="blue" variant="outlined">
            {{ Number.parseInt(index['docs.count']).toLocaleString($i18n.locale, { useGrouping: true }) }}
            {{ t('administration.elastic.documents') }}
          </v-chip>
          <v-chip class="ma-2" color="orange" variant="outlined">
            {{ index['store.size'] }}
          </v-chip>
        </v-col>
        <template #append>
          <v-btn icon="mdi-delete" variant="text" @click.stop="openDeleteDialog(index.index)" />
        </template>
      </v-list-item>
    </v-list>
    <NoData v-else :text="t('noData')"/>
  </v-card>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();
const { openConfirm } = useDialogStore();

const { password } = storeToRefs(adminStore);

const loading = ref(false);
const indices = ref([]);

/**
 * Get all indices in ezMETA
 */
async function getIndices() {
  loading.value = true;
  let indicesRes;

  try {
    indicesRes = await $admin('/elastic/indices', {
      method: 'GET',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.elastic.indices'));
    return;
  }

  indices.value = indicesRes;
  loading.value = false;
}

/**
 * Delete elastic index.
 *
 * @param indexName Index name.
 */
async function deleteIndex(indexName) {
  try {
    await $admin(`/elastic/indices/${indexName}`, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    console.log(err);
    snackStore.error(t('error.index.delete'));
    return;
  }
  snackStore.info(t('success.index.deleted'));
}

/**
 * Open dialog to delete index.
 *
 * @param indexName Index name.
 */
async function openDeleteDialog(indexName) {
  openConfirm({
    title: t('administration.elastic.deleteIndex'),
    text: t('administration.elastic.deleteMessage', { indexName }),
    agreeText: t('delete'),
    agreeIcon: 'mdi-delete',
    onAgree: async () => {
      await deleteIndex(indexName);
      await getIndices();
    },
  });
}

onMounted(async () => {
  await getIndices();
});

</script>
