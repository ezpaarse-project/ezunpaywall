<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title>
        {{ t('administration.file.title') }}
      </v-toolbar-title>
      <v-btn icon="mdi-reload" :disabled="loading" @click.stop="getAllFiles()" />
    </v-toolbar>
    <v-tabs v-model="tab" fixed-tabs>
      <v-tab value="changefiles">
        changefiles
      </v-tab>
      <v-tab value="snapshots">
        snapshots
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="changefiles">
        <v-list v-if="changefiles.length > 0">
          <v-list-item v-for="filename in changefiles" :key="filename">
            {{ filename }}
            <template #append>
              <v-btn icon="mdi-delete" variant="text" @click.stop="openDeleteDialog('changefiles', filename)" />
            </template>
          </v-list-item>
        </v-list>
        <NoData v-else :text="t('noData')"/>
      </v-tabs-window-item>
      <v-tabs-window-item value="snapshots">
        <v-list v-if="snapshots.length > 0">
          <v-list-item v-for="filename in snapshots" :key="filename">
            {{ filename }}
            <template #append>
              <v-btn icon="mdi-delete" variant="text" @click.stop="openDeleteDialog('snapshots', filename)" />
            </template>
          </v-list-item>
        </v-list>
        <NoData v-else :text="t('noData')"/>
      </v-tabs-window-item>
    </v-tabs-window>

  </v-card>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();
const { openConfirm } = useDialogStore();

const { password } = storeToRefs(adminStore);

const tab = ref('changefiles');
const loading = ref(false);
let changefiles = ref([]);
let snapshots = ref([]);

/**
 * Get files
 */
async function getFiles(type) {
  loading.value = true;
  let files;

  try {
    files = await $admin(`/${type}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.file.get'));
    return;
  }

  loading.value = false;
  return files
}

async function getAllFiles() {
  changefiles.value = await getFiles('changefiles');
  snapshots.value = await getFiles('snapshots');
}

/**
 * Delete file.
 *
 * @param filename filename.
 */
async function deleteFile(type, filename) {
  try {
    await $admin(`/${type}/${filename}`, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.file.delete'));
    return;
  }
  snackStore.success(t('info.file.deleted'));
}

/**
 * Open dialog to delete filename.
 *
 * @param filename Filename.
 */
async function openDeleteDialog(type, filename) {
  openConfirm({
    title: t('administration.file.delete'),
    text: t('administration.file.deleteMessage', { filename }),
    agreeText: t('delete'),
    agreeIcon: 'mdi-delete',
    onAgree: async () => {
      await deleteFile(type, filename);
      await getAllFiles();
    },
  });
}

onMounted(async () => {
  await getAllFiles();
});

</script>
