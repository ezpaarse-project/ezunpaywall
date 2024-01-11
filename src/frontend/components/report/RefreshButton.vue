<template>
  <v-tooltip location="bottom">
    <template #activator="activator">
      <v-btn
        v-bind="activator.props"
        icon="mdi-reload"
        :disabled="props.loading"
        @click.stop="getReports()"
      />
    </template>
    {{ t("reports.reloadReports") }}
  </v-tooltip>
</template>

<script setup>

const { t } = useI18n();

const props = defineProps({
  loading: { type: Boolean, default: false },
});

const emit = defineEmits({
  getReports: () => true,
});

function getReports() {
  emit('getReports');
}

</script>
