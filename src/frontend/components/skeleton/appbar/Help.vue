<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-help-circle"
        v-bind="props"
      />
    </template>
    <span> {{ t('header.help') }}</span>
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();

</script>
