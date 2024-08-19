<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('reports.title') }} </v-toolbar-title>
      <v-spacer />
      <AdministrationUpdateProcessButton
        v-if="isAdmin"
        :type="props.type"
      />
      <AdministrationUpdateCronButton
        v-if="isAdmin"
        :type="props.type"
      />
      <ReportUnpaywallButton />
      <ReportRefreshButton
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
    <ReportDataTable
      v-else
      :type="props.type"
      :reports="reports"
    />
  </v-card>
</template>

<script setup>

/* eslint-disable no-await-in-loop */

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const loading = ref(false);
const reports = ref([]);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

const isAdmin = computed(() => adminStore.isAdmin);

async function getReport(filename) {
  let report;
  try {
    report = await $admin(`/reports/${filename}`, {
      method: 'GET',
    });
  } catch (err) {
    snackStore.error(t('error.report.get'));
    return;
  }
  return report;
}

async function getReports() {
  loading.value = true;
  let res;

  try {
    res = await $admin('/reports', {
      method: 'GET',
    });
  } catch (err) {
    snackStore.error(t('error.report.getAll'));
    loading.value = false;
    return;
  }

  const filenames = res.sort((a, b) => b.createdAt - a.createdAt);

  let report;

  reports.value = [];
  const newReports = [];
  for (let i = 0; i < filenames.length; i += 1) {
    report = await getReport(filenames[i]);
    newReports.push(report);
  }
  reports.value = newReports;
  loading.value = false;
}

onMounted(() => {
  getReports();
});

</script>
