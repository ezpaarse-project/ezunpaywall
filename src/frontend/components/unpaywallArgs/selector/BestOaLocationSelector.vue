<template>
  <v-autocomplete
    :value="value"
    :items="items"
    label="best_oa_location"
    chips
    closable-chips
    multiple
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #prepend-item>
      <v-list>
        <v-list-item
          link
          @click="selectAll()"
        >
          {{ t('unpaywallArgs.selectAll') }}
        </v-list-item>
      </v-list>
    </template>
    <template #chip="{ props, item }">
      <v-chip
        v-bind="props"
        :text="item.value.name"
      />
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="item.title"
        :subtitle="subItems[item.title]"
      />
    </template>
  </v-autocomplete>
</template>

<script setup>

const { t } = useI18n();

defineProps({
  value: { type: Array, default: () => [] },
});

const items = ref([
  'evidence',
  'host_type',
  'is_best',
  'license',
  'pmh_id',
  'updated',
  'url',
  'url_for_landing_page',
  'url_for_pdf',
  'version',
]);

const subItems = computed(() => ({
  evidence: t('unpaywallArgs.oa_locations.evidence'),
  host_type: t('unpaywallArgs.oa_locations.host_type'),
  is_best: t('unpaywallArgs.oa_locations.is_best'),
  license: t('unpaywallArgs.oa_locations.license'),
  pmh_id: t('unpaywallArgs.oa_locations.pmh_id'),
  updated: t('unpaywallArgs.oa_locations.updated'),
  url: t('unpaywallArgs.oa_locations.url'),
  url_for_landing_page: t('unpaywallArgs.oa_locations.url_for_landing_page'),
  url_for_pdf: t('unpaywallArgs.oa_locations.url_for_pdf'),
  version: t('unpaywallArgs.oa_locations.version'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
