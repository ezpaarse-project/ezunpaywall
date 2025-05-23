<template>
  <v-card>
    <v-card-title class="pa-6">
      <v-row class="justify-center align-center">
        {{ props.name }}
        <v-spacer />
        <v-switch
          v-model="cronConfig.active"
          label="Active"
          color="green-darken-3"
          hide-details="true"
          @change="updateActive"
        />
      </v-row>
    </v-card-title>
    <v-list>
      <v-list-item
        v-for="(item, index) in configAsArray"
        :key="index"
      >
        {{ Object.keys(item)[0] }} : {{ Object.values(item)[0] }}
      </v-list-item>
    </v-list>
    <v-card-actions>
      <v-spacer />
      <v-btn @click.stop="visible = true">
        {{ t('update') }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <AdministrationCronDialog
    v-model="visible"
    :name="props.name"
    :host="props.host"
    :config="configAsArray"
    @updated="getCron()"
  />
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();

const { password } = storeToRefs(adminStore);

const props = defineProps({
  name: { type: String, default: '' },
  host: { type: Function, default: () => {} },
});

const visible = ref(false);
const loading = ref(false);
const cronConfig = ref({});

const filteredConfig = computed(() => {
  const copyCronConfig = { ...cronConfig.value };
  delete copyCronConfig.name;
  delete copyCronConfig.active;
  return copyCronConfig;
});

const action = computed(() => (cronConfig.value.active ? 'start' : 'stop'));

const configAsArray = computed(
  () => Object.keys(filteredConfig.value).map((key) => ({ [key]: filteredConfig.value[key] })),
);

async function getCron() {
  let res;
  loading.value = true;
  try {
    res = await props.host(`/cron/${props.name}`, {
      method: 'GET',
    });
  } catch (err) {
    loading.value = false;
    return;
  }
  cronConfig.value = res;
  loading.value = false;
}

async function updateActive() {
  loading.value = true;

  try {
    await props.host(`/cron/${props.name}/${action.value}`, {
      method: 'POST',
      headers: {
        'x-api-key': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.cron.active'));
    return;
  } finally {
    loading.value = false;
  }

  snackStore.info(t('info.cron.updated'));

  await getCron();
}

onMounted(async () => {
  await getCron();
});
</script>
