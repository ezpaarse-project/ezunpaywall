<template>
  <div id="graphqlResult">
    <div v-if="props.visible">
      <v-card-title> {{ t('graphql.result') }} </v-card-title>
      <v-card-text>
        <JSONView
          :code="stringifiedGraphqlResult"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :href="graphqlLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('graphql.linkAPI') }}
        </v-btn>
      </v-card-actions>
    </div>
  </div>
</template>

<script setup>

import JSONView from '@/components/skeleton/JSONView.vue';

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const props = defineProps({
  visible: { type: Boolean, default: false },
  attributes: { type: Array, default: () => [] },
  graphqlData: { type: Object, default: () => {} },
  query: { type: String, default: '' },
});

const stringifiedGraphqlResult = computed(() => JSON.stringify(props.graphqlData, null, 2));

const graphqlLink = computed(() => `${runtimeConfig.public.graphqlHost}/graphql?query=${props.query}&apikey=demo`);

</script>
