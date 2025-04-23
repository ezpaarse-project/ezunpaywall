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
        <p>{{ t('doi.text1') }}</p>
        <p>{{ t('doi.text2') }}</p>
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
    </v-card>
  </section>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $admin } = useNuxtApp();

const loading = ref(false);
const dois = ref('');
const counter = ref(0);

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
  snackStore.info(t('info.doi.reported'));
  await getCounter();
  loading.value = false;
}

onMounted(async () => {
  await getCounter();
});

</script>
