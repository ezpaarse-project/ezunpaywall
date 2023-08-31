<template>
  <div>
    <v-data-table
      :headers="tableHeaders"
      :items="props.reports"
      :items-per-page="7"
      :loading="props.loading"
      item-key="id"
      class="elevation-1"
    >
      <template #[`item.status`]="{ item: { raw: item } }">
        <v-icon
          v-if="!item.data.error"
          right
          color="green"
        >
          mdi-check
        </v-icon>
        <v-icon
          v-else
          right
          color="red"
        >
          mdi-close
        </v-icon>
      </template>

      <template #[`item.details`]="{ item: { raw: item } }">
        <v-btn
          icon="mdi-code-json"
          x-small
          @click="showDetails(item)"
        />
      </template>
    </v-data-table>
    <DetailDialog
      v-model="dialogVisible"
      :report="reportSelected"
      @closed="setDialogVisible(false)"
    />
  </div>
</template>

<script setup>

import DetailDialog from '@/components/report/DetailDialog.vue';

const { t } = useI18n();

const props = defineProps({
  reports: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const dialogVisible = ref(false);
const reportSelected = ref({});

const tableHeaders = computed(() => [
  {
    title: 'Date',
    align: 'start',
    sortable: false,
    key: 'createdAt',
  },
  { title: t('reportHistory.status'), key: 'status', sortable: false },
  {
    title: t('reportHistory.updatedDocs'),
    key: 'data.totalUpdatedDocs',
    sortable: false,
  },
  {
    title: t('reportHistory.insertedDocs'),
    key: 'data.totalInsertedDocs',
    sortable: false,
  },
  {
    title: t('detail'), key: 'details', sortable: false, align: 'right',
  },
]);

function showDetails(item) {
  reportSelected.value = item;
  dialogVisible.value = true;
}

</script>
