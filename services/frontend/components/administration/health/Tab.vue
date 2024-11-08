<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        {{ t("administration.health.title") }}
      </v-toolbar-title>
      <v-spacer />
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-reload"
            :disabled="loading"
            :loading="loading"
            @click.stop="getHealths()"
          />
        </template>
        {{ t("administration.health.reload") }}
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
      v-else-if="!services || Object.keys(services).length === 0"
      :text="t('administration.health.noHealth')"
    />
    <v-row
      v-else
      class="ma-2"
    >
      <v-col
        v-for="service in services"
        :key="service.name"
        cols="12"
        sm="6"
        md="4"
        lg="4"
        xl="4"
      >
        <AdministrationHealthCard
          ref="healthCards"
          :name="service.name"
          :url="service.url"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

const { t } = useI18n();

const loading = ref(false);

const healthCards = ref([]);

const { $graphql, $admin, $enrich } = useNuxtApp();

const services = [
  { name: 'graphql', url: $graphql.baseURL },
  { name: 'admin', url: $admin.baseURL },
  { name: 'enrich', url: $enrich.baseURL },
];

/**
 * Execute getHealth to every child
 */
function getHealths() {
  loading.value = true;
  if (healthCards.value) {
    healthCards.value.forEach((card) => {
      if (card?.getHealth) {
        card.getHealth();
      }
    });
  }
  loading.value = false;
}
</script>
