<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-help-circle"
        :href="unpaywallAPIURL"
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

const unpaywallAPIURL = computed(() => `${runtimeConfig.public.unpaywallAPIURL}/feed/changefiles?interval=day`);

</script>
