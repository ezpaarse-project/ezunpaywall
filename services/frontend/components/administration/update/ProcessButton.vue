<template>
  <v-container class="d-flex justify-center">
    <v-tooltip location="bottom">
      <template #activator="activator">
        <v-btn
          v-bind="activator.props"
          append-icon="mdi-download-circle"
          @click.stop="visible = true"
        >
          {{ t("update") }}
        </v-btn>
      </template>
      {{ t("administration.job.title") }}
    </v-tooltip>
    <AdministrationUpdateProcessDialog
      v-model="visible"
      :type="props.type"
    />
  </v-container>
</template>

<script setup>

const { t } = useI18n();

const visible = ref(false);

const props = defineProps({
  type: { type: String, default: 'unpaywall' },
});

</script>
