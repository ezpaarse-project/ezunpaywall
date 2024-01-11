<template>
  <v-tooltip location="bottom">
    <template #activator="activator">
      <v-btn
        v-bind="activator.props"
        icon="mdi-download-circle"
        @click.stop="visible = true"
      />
    </template>
    {{ t("administration.update.title") }}
  </v-tooltip>
  <UpdateProcessDialog
    v-model="visible"
    :type="props.type"
  />
</template>

<script setup>

import UpdateProcessDialog from '@/components/administration/update/UpdateProcessDialog.vue';

const { t } = useI18n();

const visible = ref(false);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

</script>
