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
        <v-icon v-else>
          mdi-check-circle
        </v-icon>
      </v-btn>
    </template>
    <label v-if="inUpdate">
      {{ t("status.inUpdate", { latestTaskName, percent }) }}
    </label>
    <label v-else>
      {{ t("status.noInUpdate") }}
    </label>
  </v-tooltip>
</template>

<script setup>

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();
const { $update } = useNuxtApp();

const timeout = ref(null);
const inUpdate = ref(false);
const state = ref({});

const latestStep = computed(() => {
  if (Array.isArray(state.value?.steps)) {
    return state.value.steps[state.value.steps.length - 1];
  }
  return null;
});

const latestTaskName = computed(() => latestStep?.task);

const percent = computed(() => latestStep?.percent);

async function getState() {
  let res;
  try {
    res = await $update({
      method: 'get',
      url: '/states',
      params: {
        latest: true,
      },
    });
  } catch (err) {
    snackStore.error(t('error.status'));
  }
  state.value = res?.data;
}

async function checkIfUpdate() {
  let res;
  try {
    res = await $update({
      method: 'get',
      url: '/status',
    });
  } catch (err) {
    snackStore.error(t('error.status'));
  }
  if (res?.data) {
    inUpdate.value = true;
    await getState();
  } else {
    inUpdate.value = false;
  }
  timeout.value = await new Promise((resolve) => { setTimeout(resolve, 10000); });
  await checkIfUpdate();
}

onMounted(async () => {
  await checkIfUpdate();
});

</script>
