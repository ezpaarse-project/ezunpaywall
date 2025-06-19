<template>
  <div>
    <v-card-text>
      {{ t('graphql.request') }}
      <v-row justify="center">
        <v-col class="flex-grow-1 flex-shrink-0">
          <v-textarea
            outlined
            readonly
            label="query"
            :model-value="query"
            rows="4"
          />
        </v-col>
        <v-col class="flex-grow-0 flex-shrink-1 text-center pa-0">
          <v-btn
            icon="mdi-content-copy"
            variant="plain"
            class="ma-0"
            @click="copyText()"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <GraphqlRequestButton
        :query="query"
        :apikey="apikey"
        :disabled="disabled"
        @graphql-data="setGraphqlData"
      />
    </v-card-actions>
  </div>
</template>

<script setup>

import { useSnacksStore } from '@/store/snacks';

const { t } = useI18n();
const snackStore = useSnacksStore();

const props = defineProps({
  dois: { type: String, default: '' },
  apikey: { type: String, default: 'demo' },
  attributes: { type: Array, default: () => [] },
});

const emit = defineEmits({
  'graphql-data': (data) => data,
  query: (data) => data,
});

const formatDOIs = computed(() => {
  const doisValue = props.dois;
  const doisSplitted = doisValue.split(',');
  return `"${doisSplitted.join('", "')}"`;
});

function parseUnpaywallAttributesToGraphqlAttributes(args) {
  const simple = args.filter((e) => !e?.includes('.'));
  let bestOaLocation = args.filter((e) => e?.includes('best_oa_location.'));
  let firstOaLocation = args.filter((e) => e?.includes('first_oa_location.'));
  let oaLocations = args.filter((e) => e?.includes('oa_locations.'));
  let oaLocationEmbargoed = args.filter((e) => e?.includes('oa_locations_embargoed.'));
  let zAuthors = args.filter((e) => e?.includes('z_authors'));

  if (
    !simple.length
    && !bestOaLocation.length
    && !firstOaLocation.length
    && !oaLocations.length
    && !oaLocationEmbargoed.length
    && !zAuthors.length
  ) {
    return '';
  }
  const attrs = [];
  if (simple.length) {
    attrs.push(simple.join(', '));
  }
  if (bestOaLocation.length) {
    bestOaLocation = bestOaLocation.map((e) => e.split('.')[1]);
    attrs.push(`best_oa_location { ${bestOaLocation.join(', ')} }`);
  }
  if (firstOaLocation.length) {
    firstOaLocation = firstOaLocation.map((e) => e.split('.')[1]);
    attrs.push(`first_oa_location { ${firstOaLocation.join(', ')} }`);
  }
  if (oaLocations.length) {
    oaLocations = oaLocations.map((e) => e.split('.')[1]);
    attrs.push(`oa_locations { ${oaLocations.join(', ')} }`);
  }
  if (oaLocationEmbargoed.length) {
    oaLocationEmbargoed = oaLocationEmbargoed.map((e) => e.split('.')[1]);
    attrs.push(`oa_locations_embargoed { ${oaLocationEmbargoed.join(', ')} }`);
  }
  if (zAuthors.length) {
    zAuthors = zAuthors.map((e) => e.split('.')[1]);
    attrs.push(`z_authors { ${zAuthors.join(', ')} }`);
  }
  return `{ ${attrs.join(', ')} }`;
}

const query = computed(() => `{ unpaywall(dois: [${formatDOIs.value}]) ${parseUnpaywallAttributesToGraphqlAttributes(props.attributes)} }`);

const disabled = computed(() => props.attributes.length === 0);

/**
  * Necessary on preprod
  * (http environment)
  */
function unsecuredCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('display', 'none');
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    snackStore.error(t('error.graphql.copyRequest'));
  }
  document.body.removeChild(textArea);
}

function copyText() {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(query);
    } else {
      unsecuredCopyToClipboard(query);
    }
  } catch (err) {
    snackStore.error(t('error.graphql.copyRequest'));
    return;
  }
  snackStore.info(t('info.graphql.copyRequest'));
}

function setGraphqlData(data) {
  emit('graphql-data', data);
}

watch(
  query,
  (newVal) => {
    emit('query', newVal);
  },
);

</script>
