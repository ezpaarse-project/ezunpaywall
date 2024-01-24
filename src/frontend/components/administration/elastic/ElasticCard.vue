<template>
  <v-card height="100%">
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('administration.elastic.title') }} </v-toolbar-title>
      <v-spacer />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-reload"
            :disabled="loading"
            @click.stop="getElasticInfo()"
          />
        </template>
        {{ t("administration.elastic.reload") }}
      </v-tooltip>
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
      v-else-if="!indices && !aliases || indices.length === 0 && aliases.length === 0"
      :text="t('administration.elastic.noInfo')"
    />
    <v-row
      v-else
      class="ma-2"
    >
      Alias
      <v-col cols="12">
        <v-data-table
          :headers="aliasesHeaders"
          :items="aliases"
          :items-per-page="5"
          :loading="loading"
          item-key="id"
          class="elevation-1"
        />
      </v-col>
      Index
      <v-col cols="12">
        <v-data-table
          :headers="indicesHeaders"
          :items="indices"
          :items-per-page="5"
          :loading="loading"
          item-key="id"
          class="elevation-1"
        >
          <template #[`item.docs.count`]="{ item: { raw: item } }">
            {{ Number.parseInt(item['docs.count'], 10)
              .toLocaleString($i18n.locale, { useGrouping: true }) }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

import { storeToRefs } from 'pinia';

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

import Loader from '@/components/skeleton/Loader.vue';
import NoData from '@/components/skeleton/NoData.vue';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $update } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const loading = ref(false);
const indices = ref([]);
const aliases = ref([]);

const tt = 1000000000000000000000;

const indicesHeaders = computed(() => [
  {
    title: t('administration.elastic.indexName'),
    align: 'start',
    sortable: false,
    key: 'index',
  },
  {
    title: t('administration.elastic.indexCount'),
    sortable: false,
    key: 'docs.count',
  },
  {
    title: t('administration.elastic.indexSize'),
    sortable: false,
    key: 'store.size',
  },
]);

const aliasesHeaders = computed(() => [
  {
    title: t('administration.elastic.aliasName'),
    align: 'start',
    sortable: false,
    key: 'alias',
  },
  {
    title: t('administration.elastic.indexName'),
    sortable: false,
    key: 'index',
  },
]);

async function getElasticInfo() {
  loading.value = true;

  let indicesRes;
  try {
    indicesRes = await $update({
      method: 'GET',
      url: '/elastic/indices',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.elastic.indices'));
    loading.value = false;
    return;
  }
  indices.value = indicesRes?.data;

  let aliasesRes;
  try {
    aliasesRes = await $update({
      method: 'GET',
      url: '/elastic/aliases',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.elastic.aliases'));
    loading.value = false;
    return;
  }
  loading.value = false;
  aliases.value = aliasesRes?.data;
}

onMounted(() => {
  getElasticInfo();
});

</script>
