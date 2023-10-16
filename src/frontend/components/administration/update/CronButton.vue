<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-update"
        @click.stop="visible = true"
      />
    </template>
    {{ t("administration.cron.title") }}
  </v-tooltip>
  <CronDialog v-model="visible" />
</template>

<script setup>

import CronDialog from '@/components/administration/update/CronDialog.vue';

const { t } = useI18n();

const visible = ref(false);

</script>
