<template>
  <v-tooltip
    location="right"
    close-delay="3000"
    max-width="500px"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        density="comfortable"
        icon="mdi-help-circle"
        :href="dataFormatURL"
        target="_blank"
        rel="noopener noreferrer"
      />
    </template>
    <span> {{ t('unpaywallArgs.help') }} </span>
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();

const dataFormatURL = ref('https://unpaywall.org/data-format');

</script>
