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
  'family',
  'given',
  'ORCID',
]);

const subItems = ref(() => ({
  family: t('unpaywallArgs.z_authors.family'),
  given: t('unpaywallArgs.z_authors.given'),
  ORCID: t('unpaywallArgs.z_authors.ORCID'),
}));

const emit = defineEmits({
  'update:modelValue': (data) => data,
});

async function selectAll() {
  emit('update:modelValue', items.value);
}

</script>
