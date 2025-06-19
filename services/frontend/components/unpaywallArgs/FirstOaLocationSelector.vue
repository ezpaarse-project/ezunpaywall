<template>
  <v-autocomplete
    :value="value"
    :items="items"
    label="first_oa_location"
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
  'url',
  'url_for_landing_page',
  'url_for_pdf',
  'evidence',
  'license',
  'host_type',
  'is_best',
  'pmh_id',
  'endpoint_id',
  'repository_institution',
  'oa_date',
  'updated',
]);

const subItems = computed(() => ({
  url: t('unpaywallArgs.oa_locations.url'),
  url_for_landing_page: t('unpaywallArgs.oa_locations.url_for_landing_page'),
  url_for_pdf: t('unpaywallArgs.oa_locations.url_for_pdf'),
  evidence: t('unpaywallArgs.oa_locations.evidence'),
  license: t('unpaywallArgs.oa_locations.license'),
  version: t('unpaywallArgs.oa_locations.version'),
  host_type: t('unpaywallArgs.oa_locations.host_type'),
  is_best: t('unpaywallArgs.oa_locations.is_best'),
  pmh_id: t('unpaywallArgs.oa_locations.pmh_id'),
  endpoint_id: t('unpaywallArgs.oa_locations.endpoint_id'),
  repository_institution: t('unpaywallArgs.oa_locations.repository_institution'),
  oa_date: t('unpaywallArgs.oa_locations.oa_date'),
  updated: t('unpaywallArgs.oa_locations.updated'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
