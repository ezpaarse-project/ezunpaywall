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
      v-else-if="!healths || Object.keys(healths).length === 0"
      :text="t('administration.health.noHealth')"
    />
    <v-row
      v-else
      class="ma-2"
    >
      <v-col
        v-for="(health, name) in healths"
        :key="name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="3"
      >
        <HealthCard
          :name="name"
          :health="health"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

import HealthCard from '@/components/administration/health/HealthCard.vue';
import Loader from '@/components/skeleton/Loader.vue';
import NoData from '@/components/skeleton/NoData.vue';

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $health } = useNuxtApp();

const loading = ref(false);
const healths = ref(false);

async function getHealths() {
  let res;
  loading.value = true;
  try {
    res = await $health({
      method: 'GET',
      url: '/status',
    });
  } catch (e) {
    snackStore.error(t('error.health.get'));
    loading.value = false;
    return;
  }
  healths.value = res?.data;
  loading.value = false;
}

onMounted(() => {
  getHealths();
});

</script>
