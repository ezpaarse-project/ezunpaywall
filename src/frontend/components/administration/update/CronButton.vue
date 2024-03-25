<template>
  <v-tooltip location="bottom">
    <template #activator="activator">
      <v-btn
        v-bind="activator.props"
        icon="mdi-update"
        @click.stop="visible = true"
      />
    </template>
    {{ t("administration.cron.title") }}
  </v-tooltip>
  <CronDialog
    v-model="visible"
    :type="props.type"
  />
</template>

<script setup>

import CronDialog from '@/components/administration/update/CronDialog.vue';

const { t } = useI18n();

const visible = ref(false);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

</script>
