<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-download-circle"
        @click.stop="visible = true"
      />
    </template>
    {{ t("administration.update.title") }}
  </v-tooltip>
  <UpdateProcessDialog v-model="visible" />
</template>

<script setup>

import UpdateProcessDialog from '@/components/administration/update/UpdateProcessDialog.vue';

const { t } = useI18n();

const visible = ref(false);

</script>
