<template>
  <v-tooltip location="bottom">
    <template #activator="activator">
      <v-btn
        v-bind="activator.props"
        icon="mdi-download-circle"
        @click.stop="visible = true"
      />
    </template>
    {{ t("administration.job.title") }}
  </v-tooltip>
  <AdministrationUpdateProcessDialog
    v-model="visible"
    :type="props.type"
  />
</template>

<script setup>

const { t } = useI18n();

const visible = ref(false);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

</script>
