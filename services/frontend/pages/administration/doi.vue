<template>
  <section class="ma-3">
    <v-card>
      <v-toolbar
        color="secondary"
        dark
        flat
        dense
      >
        <v-toolbar-title> {{ t('doi.title') }} </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <div class="text-center">
          <v-chip
            class="ma-2"
            label
          >
            {{ t('doi.counter', counter) }}
          </v-chip>
        </div>
        <br>
        <br>
        <v-text-field
          v-model="dois"
          :label="label"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :loading="loading"
          :disabled="!valid"
          color="primary"
          @click="updateDOI()"
        >
          {{ t("update") }}
        </v-btn>
      </v-card-actions>
      <v-list>
        <v-list-subheader>{{ t("doi.list") }}</v-list-subheader>
        <v-list-item
          v-for="c in cache"
          :key="c"
          link
          ripple
        >
          {{ c }}
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>

<script setup>

definePageMeta({
  middleware: 'admin',
});

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $admin } = useNuxtApp();

const loading = ref(false);
const dois = ref('');
const counter = ref(0);
const cache = ref([]);

const valid = computed(() => dois.value
  .split(',')
  .map((doi) => doi.trim())
  .filter((text) => text.length > 0).length > 0);

const label = computed(() => t('doi.comma'));

async function getCounter() {
  loading.value = true;
  let res;
  try {
    res = await $admin('/doi/update/count', {
      method: 'GET',
    });
  } catch (err) {
    snackStore.error(t('error.doi.counter'));
    loading.value = false;
    return;
  }
  counter.value = res;

  loading.value = false;
}

async function getCache() {
  loading.value = true;
  let res;
  try {
    res = await $admin('/doi/update/cache', {
      method: 'GET',
    });
  } catch (err) {
    snackStore.error(t('error.doi.cached'));
    loading.value = false;
    return;
  }
  cache.value = res;

  loading.value = false;
}

async function updateDOI() {
  loading.value = true;
  try {
    await $admin('/doi/update', {
      method: 'POST',
      body: {
        dois: dois.value.split(','),
      },
    });
  } catch (err) {
    snackStore.error(t('error.doi.report'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.doi.updated'));
  await getCounter();
  await getCache();
  loading.value = false;
}

onMounted(async () => {
  await getCounter();
  await getCache();
});

</script>
