<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ title }} </v-toolbar-title>
      <v-spacer />
      <UpdateProcessButton
        v-if="isAdmin"
        :type="props.type"
      />
      <CronButton
        v-if="isAdmin"
        :type="props.type"
      />
      <UnpaywallButton />
      <RefreshButton
        :loading="loading"
        @get-reports="getReports()"
      />
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
      v-else-if="reports.length === 0"
      :text="t('reports.noReport')"
    />
    <ReportsDataTable
      v-else
      :type="props.type"
      :reports="reports"
    />
  </v-card>
</template>

<script setup>

/* eslint-disable no-await-in-loop */

import Loader from '@/components/skeleton/Loader.vue';
import NoData from '@/components/skeleton/NoData.vue';
import ReportsDataTable from '@/components/report/ReportsDataTable.vue';

import RefreshButton from '@/components/report/RefreshButton.vue';
import UpdateProcessButton from '@/components/administration/update/UpdateProcessButton.vue';
import CronButton from '@/components/administration/update/CronButton.vue';
import UnpaywallButton from '@/components/report/UnpaywallButton.vue';

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $update } = useNuxtApp();

const loading = ref(false);
const reports = ref([]);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

const isAdmin = computed(() => adminStore.isAdmin);

const title = computed(() => {
  if (props.type === 'unpaywall') { return t('reports.basic'); }
  if (props.type === 'unpaywallHistory') { return t('reports.history'); }
  return null;
});

async function getReport(filename) {
  let report;
  try {
    report = await $update({
      method: 'GET',
      url: `/reports/${props.type}/${filename}`,
    });
  } catch (err) {
    snackStore.error(t('error.report.get'));
    return;
  }
  return report.data;
}

function formatDate(date) {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('-');
}

async function getReports() {
  loading.value = true;
  let res;
  try {
    res = await $update({
      method: 'GET',
      url: `/reports/${props.type}`,
    });
  } catch (err) {
    snackStore.error(t('error.report.getAll'));
    loading.value = false;
    return;
  }

  const filenames = res.data.sort((a, b) => b.createdAt - a.createdAt);

  let report;

  reports.value = [];
  const newReports = [];
  for (let i = 0; i < filenames.length; i += 1) {
    report = await getReport(filenames[i]);

    newReports.push({
      id: i,
      data: report,
      createdAt: formatDate(report.createdAt),
    });
  }
  reports.value = newReports;
  loading.value = false;
}

onMounted(() => {
  getReports();
});

</script>
