<template>
  <div>
    <v-row class="ma-3">
      <v-row align="center">
        <div
          class="mr-1"
          v-text="t('enrich.authorizedFile')"
        />
        <v-chip
          v-for="extension in authorizedFile"
          :key="extension.name"
          :class="extension.class"
          label
          text-color="white"
        >
          {{ extension.name }}
        </v-chip>
      </v-row>
      <v-spacer />

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-help-circle"
            class="mr-5"
          />
        </template>
        {{ t("enrich.explainationLogs") }}
      </v-tooltip>
    </v-row>
    <EnrichLogFiles class="ma-1" />
  </div>
</template>

<script setup>

const { t } = useI18n();

const authorizedFile = ref([
  { name: 'csv', class: 'bg-green-darken-4 text-white ma-1' },
  { name: 'jsonl', class: 'bg-orange-darken-4 text-white ma-1' },
]);

</script>
