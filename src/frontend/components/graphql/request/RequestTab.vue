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
      <RequestButton
        :query="query"
        :apikey="apikey"
        :disabled="disabled"
        @graphql-data="setGraphqlData"
      />
    </v-card-actions>
  </div>
</template>

<script setup>

/* eslint-disable camelcase */

import RequestButton from '@/components/graphql/request/RequestButton';

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
  const doisSplited = doisValue.split(',');
  return `"${doisSplited.join('", "')}"`;
});

function parseUnpaywallAttributesToGraphqlAttributes(args) {
  const simple = args.filter((e) => !e?.includes('.'));
  let best_oa_location = args.filter((e) => e?.includes('best_oa_location'));
  let first_oa_location = args.filter((e) => e?.includes('first_oa_location'));
  let oa_locations = args.filter((e) => e?.includes('oa_locations'));
  let z_authors = args.filter((e) => e?.includes('z_authors'));

  if (
    !simple.length
    && !best_oa_location.length
    && !first_oa_location.length
    && !oa_locations.length
    && !z_authors.length
  ) {
    return '';
  }
  const attrs = [];
  if (simple.length) {
    attrs.push(simple.join(', '));
  }
  if (best_oa_location.length) {
    best_oa_location = best_oa_location.map((e) => e.split('.')[1]);
    attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`);
  }
  if (first_oa_location.length) {
    first_oa_location = first_oa_location.map((e) => e.split('.')[1]);
    attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`);
  }
  if (oa_locations.length) {
    oa_locations = oa_locations.map((e) => e.split('.')[1]);
    attrs.push(`oa_locations { ${oa_locations.join(', ')} }`);
  }
  if (z_authors.length) {
    z_authors = z_authors.map((e) => e.split('.')[1]);
    attrs.push(`z_authors { ${z_authors.join(', ')} }`);
  }
  return `{ ${attrs.join(', ')} }`;
}

const query = computed(() => `{ GetByDOI(dois: [${formatDOIs.value}]) ${parseUnpaywallAttributesToGraphqlAttributes(props.attributes)} }`);

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
