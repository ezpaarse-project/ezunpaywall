<template>
  <div>
    <v-card-actions>
      <v-btn
        variant="tonal"
        @click="unselectAll()"
      >
        {{ t('unpaywallArgs.unselectAll') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="tonal"
        @click="selectAll()"
      >
        {{ t('unpaywallArgs.selectAll') }}
      </v-btn>
    </v-card-actions>
    <UnpaywallArgsSimpleSelector
      v-if="!hideSimple"
      v-model="simpleSelected"
    />
    <UnpaywallArgsOaLocationsSelector
      v-if="!hideBestOaLocation"
      v-model="bestOaLocationSelected"
      :name="'best_oa_location'"
    />
    <UnpaywallArgsOaLocationsSelector
      v-if="!hideFirstOaLocation"
      v-model="firstOaLocationSelected"
      :name="'first_oa_location'"
    />
    <UnpaywallArgsOaLocationsSelector
      v-if="!hideOaLocations"
      v-model="oaLocationsSelected"
      :name="'oa_locations'"
    />
    <UnpaywallArgsOaLocationsSelector
      v-if="!hideOaLocationsEmbargoed"
      v-model="oaLocationsEmbargoedSelected"
      :name="'oa_locations_embargoed'"
    />
    <UnpaywallArgsZAuthorsSelector
      v-if="!hideZAuthor"
      v-model="zAuthorsSelected"
    />
  </div>
</template>

<script setup>

const { t } = useI18n();

const props = defineProps({
  all: { type: Boolean, default: false },
  defaultSimple: { type: Array, default: () => [] },
  defaultBestOaLocation: { type: Array, default: () => [] },
  defaultFirstOaLocation: { type: Array, default: () => [] },
  defaultOaLocations: { type: Array, default: () => [] },
  defaultOaLocationsEmbargoed: { type: Array, default: () => [] },
  defaultZAuthors: { type: Array, default: () => [] },
  hideSimple: { type: Boolean, default: false },
  hideBestOaLocation: { type: Boolean, default: false },
  hideFirstOaLocation: { type: Boolean, default: false },
  hideOaLocations: { type: Boolean, default: false },
  hideOaLocationsEmbargoed: { type: Boolean, default: false },
  hideZAuthor: { type: Boolean, default: false },
});

const emit = defineEmits(['attributes']);

const allSelected = ref(props.all);
const simpleSelected = ref(props.defaultSimple);
const bestOaLocationSelected = ref(props.defaultBestOaLocation);
const firstOaLocationSelected = ref(props.defaultFirstOaLocation);
const oaLocationsSelected = ref(props.defaultOaLocations);
const oaLocationsEmbargoedSelected = ref(props.defaultOaLocationsEmbargoed);
const zAuthorsSelected = ref(props.defaultZAuthors);

const unpaywallItems = ref([
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

const zAuthorsItems = ref([
  'author_position',
  'raw_author_name',
  'is_corresponding',
  'raw_affiliation_strings',
]);

const oaLocationsItems = ref([
  'url',
  'url_for_landing_page',
  'url_for_pdf',
  'license',
  'host_type',
  'version',
  'is_best',
  'pmh_id',
  'endpoint_id',
  'repository_institution',
  'oa_date',
]);

function flatten(el, attr) {
  if (!el || !Array.isArray(el) || el.length === 0) return '';
  return el.map((e) => `${attr}.${e}`);
}

const attributes = computed(() => {
  const simpleSelectedValue = simpleSelected.value;
  const bestOaLocationSelectedValue = bestOaLocationSelected.value;
  const firstOaLocationSelectedValue = firstOaLocationSelected.value;
  const oaLocationsSelectedValue = oaLocationsSelected.value;
  const oaLocationsEmbargoedSelectedValue = oaLocationsEmbargoedSelected.value;
  const zAuthorsSelectedValue = zAuthorsSelected.value;

  let data = simpleSelectedValue;

  if (bestOaLocationSelectedValue && bestOaLocationSelectedValue?.length !== 0) {
    data = data.concat(props.hideOBestOaLocation ? [] : flatten(bestOaLocationSelectedValue, 'best_oa_location'));
  }
  if (firstOaLocationSelectedValue && firstOaLocationSelectedValue?.length !== 0) {
    data = data.concat(props.hideOFirstLocation ? [] : flatten(firstOaLocationSelectedValue, 'first_oa_location'));
  }
  if (oaLocationsSelectedValue && oaLocationsSelectedValue?.length !== 0) {
    data = data.concat(props.hideOaLocations ? [] : flatten(oaLocationsSelectedValue, 'oa_locations'));
  }
  if (oaLocationsEmbargoedSelectedValue && oaLocationsEmbargoedSelectedValue?.length !== 0) {
    data = data.concat(props.hideOaLocationsEmbargoed ? [] : flatten(oaLocationsEmbargoedSelectedValue, 'oa_locations_embargoed'));
  }
  if (zAuthorsSelectedValue && zAuthorsSelectedValue?.length !== 0) {
    data = data.concat(props.hideZAuthor ? [] : flatten(zAuthorsSelectedValue, 'z_authors'));
  }
  return data;
});

function selectAll() {
  simpleSelected.value = props.hideSimple ? [] : unpaywallItems.value;
  bestOaLocationSelected.value = props.hideOBestOaLocation ? [] : oaLocationsItems.value;
  firstOaLocationSelected.value = props.hideOFirstLocation ? [] : oaLocationsItems.value;
  oaLocationsSelected.value = props.hideOaLocations ? [] : oaLocationsItems.value;
  oaLocationsEmbargoedSelected.value = props.hideOaLocationsEmbargoed ? [] : oaLocationsItems.value;
  zAuthorsSelected.value = props.hideZAuthor ? [] : zAuthorsItems.value;
}

function unselectAll() {
  simpleSelected.value = [];
  bestOaLocationSelected.value = [];
  firstOaLocationSelected.value = [];
  oaLocationsSelected.value = [];
  oaLocationsEmbargoedSelected.value = [];
  zAuthorsSelected.value = [];
}

onMounted(() => {
  emit('attributes', attributes.value);
  if (allSelected.value) {
    selectAll();
  }
});

watch(
  attributes,
  (newVal) => {
    emit('attributes', newVal);
  },
);

</script>
