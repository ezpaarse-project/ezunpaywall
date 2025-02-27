<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-help-circle"
        :href="unpaywallApiUrl"
        target="_blank"
        rel="noopener noreferrer"
      />
    </template>
    {{ t("reports.source") }}
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const unpaywallApiUrl = computed(() => `${runtimeConfig.public.unpaywallApiUrl}/feed/changefiles?interval=day`);

</script>
