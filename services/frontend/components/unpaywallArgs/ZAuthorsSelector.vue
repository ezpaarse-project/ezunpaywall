<template>
  <v-autocomplete
    :value="value"
    :items="items"
    label="z_authors"
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
  'author_position',
  'raw_author_name',
  'is_corresponding',
  'raw_affiliation_strings',
]);

const subItems = computed(() => ({
  author_position: t('unpaywallArgs.z_authors.author_position'),
  raw_author_name: t('unpaywallArgs.z_authors.raw_author_name'),
  is_corresponding: t('unpaywallArgs.z_authors.is_corresponding'),
  raw_affiliation_strings: t('unpaywallArgs.z_authors.raw_affiliation_strings'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
