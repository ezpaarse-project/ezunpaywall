<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-help-circle"
        :href="unpaywallLink"
        target="_blank"
        rel="noopener noreferrer"
      />
    </template>
    {{ t("reportHistory.source") }}
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const unpaywallLink = computed(() => `${runtimeConfig.public.unpaywallAPIHost}/feed/changefiles?interval=day`);

</script>
