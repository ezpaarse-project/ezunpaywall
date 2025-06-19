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
  'title',
  'genre',
  'is_paratext',
  'published_date',
  'year',
  'doi_url',
  'journal_name',
  'journal_issns',
  'journal_issn_l',
  'journal_is_oa',
  'journal_is_in_doaj',
  'publisher',
  'is_oa',
  'oa_status',
  'has_repository_copy',
  'updated',
]);

const subItems = computed(() => ({
  doi: t('unpaywallArgs.general.doi'),
  data_standard: t('unpaywallArgs.general.data_standard'),
  title: t('unpaywallArgs.general.title'),
  genre: t('unpaywallArgs.general.genre'),
  doi_url: t('unpaywallArgs.general.doi_url'),
  is_paratext: t('unpaywallArgs.general.is_paratext'),
  published_date: t('unpaywallArgs.general.published_date'),
  year: t('unpaywallArgs.general.year'),
  is_oa: t('unpaywallArgs.general.is_oa'),
  journal_name: t('unpaywallArgs.general.journal_name'),
  journal_issns: t('unpaywallArgs.general.journal_issns'),
  journal_issn_l: t('unpaywallArgs.general.journal_issn_l'),
  journal_is_oa: t('unpaywallArgs.general.journal_is_oa'),
  journal_is_in_doaj: t('unpaywallArgs.general.journal_is_in_doaj'),
  publisher: t('unpaywallArgs.general.publisher'),
  is_oa: t('unpaywallArgs.general.is_oa'),
  oa_status: t('unpaywallArgs.general.oa_status'),
  has_repository_copy: t('unpaywallArgs.general.has_repository_copy'),
  updated: t('unpaywallArgs.general.updated'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
