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
    <SimpleSelector
      v-if="!hideSimple"
      v-model="simpleSelected"
    />
    <BestOaLocationSelector
      v-if="!hideBestOaLocation"
      v-model="bestOaLocationSelected"
    />
    <FirstOaLocationSelector
      v-if="!hideFirstOaLocation"
      v-model="firstOaLocationSelected"
    />
    <OaLocationsSelector
      v-if="!hideOaLocations"
      v-model="oaLocationsSelected"
    />
    <ZAuthorsSelector
      v-if="!hideZAuthor"
      v-model="zAuthorsSelected"
    />
  </div>
</template>

<script setup>

import SimpleSelector from '@/components/unpaywallArgs/selector/SimpleSelector.vue';
import BestOaLocationSelector from '@/components/unpaywallArgs/selector/BestOaLocationSelector.vue';
import FirstOaLocationSelector from '@/components/unpaywallArgs/selector/FirstOaLocationSelector.vue';
import OaLocationsSelector from '@/components/unpaywallArgs/selector/OaLocationsSelector.vue';
import ZAuthorsSelector from '@/components/unpaywallArgs/selector/ZAuthorsSelector.vue';

const { t } = useI18n();

const props = defineProps({
  all: { type: Boolean, default: false },
  simple: { type: Array, default: () => [] },
  hideSimple: { type: Boolean, default: false },
  hideBestOaLocation: { type: Boolean, default: false },
  hideFirstOaLocation: { type: Boolean, default: false },
  hideOaLocations: { type: Boolean, default: false },
  hideZAuthor: { type: Boolean, default: false },
});

const emit = defineEmits(['attributes']);

const simpleSelected = ref(['doi']);
const bestOaLocationSelected = ref(['evidence', 'is_best']);
const firstOaLocationSelected = ref(['url_for_pdf']);
const oaLocationsSelected = ref([]);
const zAuthorsSelected = ref(['family', 'given']);
const unpaywallItems = ref([
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
const zAuthorsItems = ref([
  'family',
  'given',
  'ORCID',
]);
const oaLocationsItems = ref([
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

function flatten(e, attr) {
  if (!e || !Array.isArray(e) || e.length === 0) return;
  return e.map((e) => `${attr}.${e}`);
}

const attributes = computed(() => {
  const simpleSelectedValue = simpleSelected.value;
  const bestOaLocationSelectedValue = bestOaLocationSelected.value;
  const firstOaLocationSelectedValue = firstOaLocationSelected.value;
  const oaLocationsSelectedValue = oaLocationsSelected.value;
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
  if (zAuthorsSelectedValue && zAuthorsSelectedValue?.length !== 0) {
    data = data.concat(props.hideZAuthor ? [] : flatten(zAuthorsSelectedValue, 'z_authors'));
  }
  return data;
});

onMounted(() => {
  emit('attributes', attributes.value);
});

function selectAll() {
  simpleSelected.value = props.hideSimple ? [] : unpaywallItems.value;
  bestOaLocationSelected.value = props.hideOBestOaLocation ? [] : oaLocationsItems.value;
  firstOaLocationSelected.value = props.hideOFirstLocation ? [] : oaLocationsItems.value;
  oaLocationsSelected.value = props.hideOaLocations ? [] : oaLocationsItems.value;
  zAuthorsSelected.value = props.hideZAuthor ? [] : zAuthorsItems.value;
}

function unselectAll() {
  simpleSelected.value = [];
  bestOaLocationSelected.value = [];
  firstOaLocationSelected.value = [];
  oaLocationsSelected.value = [];
  zAuthorsSelected.value = [];
}

watch(
  attributes,
  (newVal) => {
    emit('attributes', newVal);
  },
);

</script>
