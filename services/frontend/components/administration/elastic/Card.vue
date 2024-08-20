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
            :disabled="indicesPending === 'pending' || aliasesPending === 'pending'"
            @click.stop="refreshElasticInfo()"
          />
        </template>
        {{ t("administration.elastic.reload") }}
      </v-tooltip>
    </v-toolbar>

    <v-row
      v-if="indicesPending  === 'pending' || aliasesPending === 'pending'"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>

    <NoData
      v-else-if="!indices.length && !aliases.length"
      :text="t('administration.elastic.noInfo')"
    />

    <v-row
      v-else
      class="ma-2"
    >
      <v-col cols="12">
        <div>Alias</div>
        <v-chip
          v-for="alias in aliases"
          :key="alias.alias"
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

      <v-col cols="12">
        <div>Index</div>
        <v-chip
          v-for="index in indices"
          :key="index.index"
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

// Fetch indices
const { data: indices, status: indicesPending, refresh: refreshIndices } = useFetch('/elastic/indices', {
  baseURL: $admin.baseURL,
  method: 'GET',
  headers: {
    'X-API-KEY': password.value,
  },
  onResponseError() {
    snackStore.error(t('error.elastic.indices'));
  }
});

// Fetch aliases
const { data: aliases, status: aliasesPending, refresh: refreshAliases } = useFetch('/elastic/aliases', {
  baseURL: $admin.baseURL,
  method: 'GET',
  headers: {
    'X-API-KEY': password.value,
  },
  onResponseError() {
    snackStore.error(t('error.elastic.aliases'));
  }
});

function refreshElasticInfo() {
  refreshIndices();
  refreshAliases();
}

</script>