<template>
  <v-autocomplete
    :value="value"
    :items="items"
    label="simple"
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
  'doi',
  'data_standard',
  'doi_url',
  'genre',
  'is_oa',
  'is_paratext',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issn_l',
  'journal_issns',
  'journal_name',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
]);

const subItems = computed(() => ({
  doi: t('unpaywallArgs.general.doi'),
  data_standard: t('unpaywallArgs.general.data_standard'),
  doi_url: t('unpaywallArgs.general.doi_url'),
  genre: t('unpaywallArgs.general.genre'),
  is_oa: t('unpaywallArgs.general.is_oa'),
  is_paratext: t('unpaywallArgs.general.is_paratext'),
  journal_is_in_doaj: t('unpaywallArgs.general.journal_is_in_doaj'),
  journal_is_oa: t('unpaywallArgs.general.journal_is_oa'),
  journal_issn_l: t('unpaywallArgs.general.journal_issn_l'),
  journal_issns: t('unpaywallArgs.general.journal_issns'),
  journal_name: t('unpaywallArgs.general.journal_name'),
  oa_status: t('unpaywallArgs.general.oa_status'),
  published_date: t('unpaywallArgs.general.published_date'),
  publisher: t('unpaywallArgs.general.publisher'),
  title: t('unpaywallArgs.general.title'),
  updated: t('unpaywallArgs.general.updated'),
  year: t('unpaywallArgs.general.year'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
