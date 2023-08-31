<template>
  <v-tooltip location="bottom">
    <template #activator="{ on }">
      <v-btn
        icon
        v-bind="on"
      >
        <v-icon>mdi-help-circle</v-icon>
      </v-btn>
    </template>
    <span> {{ t('header.help') }}</span>
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();

</script>
