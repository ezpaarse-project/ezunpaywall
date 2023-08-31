<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t("reportHistory.title") }} </v-toolbar-title>
      <v-spacer />
      <UpdateProcessButton v-if="isAdmin" />
      <CronButton v-if="isAdmin" />
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
      :text="t('reportHistory.noReport')"
    />
    <ReportsDataTable
      v-else
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
const { $dateFns } = useNuxtApp();

const loading = ref(false);
const reports = ref([]);

const isAdmin = computed(() => adminStore.isAdmin);

async function getReport(filename) {
  let report;
  try {
    report = await $update({
      method: 'GET',
      url: `/reports/${filename}`,
    });
  } catch (err) {
    snackStore.error(t('error.report.get'));
    return;
  }
  return report.data;
}

async function getReports() {
  loading.value = true;
  let res;
  try {
    res = await $update({
      method: 'GET',
      url: '/reports',
    });
  } catch (err) {
    snackStore.error(t('error.report.getAll'));
    loading.value = false;
    return;
  }

  const filenames = res.data.sort((a, b) => b.createdAt - a.createdAt);

  let report;

  reports.value = [];
  const r = [];
  for (let i = 0; i < filenames.length; i += 1) {
    report = await getReport(filenames[i]);

    r.push({
      id: i,
      data: report,
      createdAt: $dateFns.format(report.createdAt),
    });
  }
  reports.value = r;
  loading.value = false;
}

onMounted(() => {
  getReports();
});

</script>
