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
      <template
        v-if="props.type ==='unpaywall'"
        #[`item.data.totalInsertedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data.totalInsertedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywall'"
        #[`item.data.totalUpdatedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data.totalUpdatedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywallHistory'"
        #[`item.data.totalBaseInsertedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data?.totalBaseInsertedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywallHistory'"
        #[`item.data.totalBaseUpdatedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data?.totalBaseUpdatedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywallHistory'"
        #[`item.data.totalHistoryInsertedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data.totalHistoryInsertedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywallHistory'"
        #[`item.data.totalHistoryUpdatedDocs`]="{ item: { raw: item } }"
      >
        {{ item.data.totalHistoryUpdatedDocs.toLocaleString($i18n.locale, { useGrouping: true }) }}
      </template>
      <template
        v-if="props.type ==='unpaywallHistory'"
        #[`item.status`]="{ item: { raw: item } }"
      >
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
  type: { type: String, default: '' },
  reports: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const dialogVisible = ref(false);
const reportSelected = ref({});

const tableHeaders = computed(() => {
  if (props.type === 'unpaywall') {
    return [
      {
        title: 'Date',
        align: 'start',
        sortable: false,
        key: 'createdAt',
      },
      {
        title: t('reports.status'),
        key: 'status',
        sortable: false,
      },
      {
        title: 'Index',
        key: 'data.index',
        sortable: false,
      },
      {
        title: t('reports.updatedDocs'),
        key: 'data.totalUpdatedDocs',
        sortable: false,
      },
      {
        title: t('reports.insertedDocs'),
        key: 'data.totalInsertedDocs',
        sortable: false,
      },
      {
        title: t('detail'),
        key: 'details',
        sortable: false,
        align: 'right',
      },
    ];
  }
  if (props.type === 'unpaywallHistory') {
    return [
      {
        title: 'Date',
        align: 'start',
        sortable: false,
        key: 'createdAt',
      },
      {
        title: t('reports.status'),
        key: 'status',
        sortable: false,
      },
      {
        title: 'IndexBase',
        key: 'data.indexBase',
        sortable: false,
      },
      {
        title: t('reports.updatedDocs'),
        key: 'data.totalBaseInsertedDocs',
        sortable: false,
      },
      {
        title: t('reports.insertedDocs'),
        key: 'data.totalBaseUpdatedDocs',
        sortable: false,
      },
      {
        title: 'IndexHistory',
        key: 'data.indexHistory',
        sortable: false,
      },
      {
        title: t('reports.updatedDocs'),
        key: 'data.totalHistoryInsertedDocs',
        sortable: false,
      },
      {
        title: t('reports.insertedDocs'),
        key: 'data.totalHistoryUpdatedDocs',
        sortable: false,
      },
      {
        title: t('detail'),
        key: 'details',
        sortable: false,
      },
    ];
  }
  return [];
});

function showDetails(item) {
  reportSelected.value = item;
  dialogVisible.value = true;
}

</script>
