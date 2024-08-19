<template>
  <div>
    <v-data-table
      :headers="tableHeaders"
      :items="props.reports"
      :items-per-page="7"
      :loading="props.loading"
      item-key="createdAt"
      class="elevation-1"
    >
      <template
        #[`item.createdAt`]="{ item }"
      >
        {{ item?.createdAt.split('T')[0] }}
      </template>
      <template #[`item.error`]="{ item }">
        <v-icon
          v-if="!item?.error"
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
      <template
        #[`item.indices`]="{ item }"
      >
        <v-chip
          v-for="index in item?.indices"
          :key="index"
          class="mx-1"
        >
          {{ index.index }} :
          <v-icon
            size="x-small"
            icon="mdi-plus-circle-outline"
            class="mx-1"
          /> {{ index.added.toLocaleString($i18n.locale, { useGrouping: true }) }} -
          <v-icon
            size="x-small"
            icon="mdi-circle-edit-outline"
            class="mx-1"
          /> {{ index.updated.toLocaleString($i18n.locale, { useGrouping: true }) }}
        </v-chip>
      </template>

      <template #[`item.details`]="{ item }">
        <v-btn
          icon="mdi-code-json"
          x-small
          @click="showDetails(item)"
        />
      </template>
    </v-data-table>
    <ReportDetailDialog
      v-model="dialogVisible"
      :report="reportSelected"
      @closed="setDialogVisible(false)"
    />
  </div>
</template>

<script setup>

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
  {
    title: t('reports.status'),
    align: 'start',
    sortable: false,
    key: 'error',
  },
  {
    title: 'Type',
    align: 'start',
    sortable: false,
    key: 'type',
  },
  {
    title: 'Index',
    key: 'indices',
    align: 'start',
    sortable: false,
  },
  {
    title: t('detail'),
    key: 'details',
    sortable: false,
  },
]);

function showDetails(item) {
  reportSelected.value = item;
  dialogVisible.value = true;
}

</script>
