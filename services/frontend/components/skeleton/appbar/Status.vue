<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        icon
        v-bind="props"
      >
        <v-progress-circular
          v-if="inUpdate"
          :size="20"
          :width="3"
          indeterminate
          color="white"
        />
        <v-icon v-else-if="!error">
          mdi-check-circle
        </v-icon>
        <v-icon v-else>
          mdi-alert
        </v-icon>
      </v-btn>
    </template>
    <label v-if="inUpdate">
      {{ t("status.inUpdate", { task: latestTaskName, percent, file: latestFilename }) }}
    </label>
    <label v-else-if="!error">
      {{ t("status.noInUpdate") }}
    </label>
    <label v-else>
      {{ t("status.error") }}
    </label>
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $admin } = useNuxtApp();

const timeout = ref(null);
const inUpdate = ref(false);
const error = ref(false);
const state = ref({});

const latestStep = computed(() => {
  if (Array.isArray(state.value?.steps)) {
    return state.value.steps[state.value.steps.length - 1];
  }
  return null;
});

const latestTaskName = computed(() => latestStep.value?.task);
const percent = computed(() => latestStep.value?.percent);
const latestFilename = computed(() => latestStep.value?.file);

async function getState() {
  let res;
  try {
    res = await $admin('/states', {
      method: 'get',
      params: {
        latest: true,
      },
    });
  } catch (err) {
    snackStore.error(t('error.status'));
  }
  state.value = res;
}

async function checkIfUpdate() {
  let res;
  try {
    res = await $admin('/job/status', {
      method: 'get',
    });
  } catch (err) {
    error.value = true;
  }
  if (!error.value) {
    if (res) {
      inUpdate.value = true;
      await getState();
    } else {
      inUpdate.value = false;
    }
    error.value = false;
  }

  timeout.value = await new Promise((resolve) => { setTimeout(resolve, 10000); });
  await checkIfUpdate();
}

onMounted(async () => {
  await checkIfUpdate();
});

</script>
