<!-- eslint-disable max-len -->
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
        <v-chip
          v-for="alias in aliases"
          :key="alias"
          class="mx-1"
        >
          alias: {{ alias.alias }}
          <v-icon
            size="x-small"
            icon="mdi-arrow-right"
            class="mx-1"
          />
          index: {{ alias.index }}
        </v-chip>
      </v-col>
      Index
      <v-col cols="12">
        <v-chip
          v-for="index in indices"
          :key="index"
          class="mx-1"
        >
          <v-icon
            icon="mdi-circle"
            class="mx-1"
            :color="index.health"
          />
          {{ index.index }}:
          {{ Number.parseInt(index['docs.count']).toLocaleString($i18n.locale, { useGrouping: true }) }}
          {{ t('administration.elastic.documents') }} -
          {{ index['store.size'] }}
        </v-chip>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const loading = ref(false);
const indices = ref([]);
const aliases = ref([]);

async function getElasticInfo() {
  loading.value = true;

  let indicesRes;
  try {
    indicesRes = await $admin('/elastic/indices',{
      method: 'GET',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.elastic.indices'));
    loading.value = false;
    return;
  }
  indices.value = indicesRes;

  let aliasesRes;
  try {
    aliasesRes = await $admin('/elastic/aliases', {
      method: 'GET',
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
  aliases.value = aliasesRes;
}

onMounted(() => {
  getElasticInfo();
});

</script>
