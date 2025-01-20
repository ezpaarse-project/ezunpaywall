<template>
  <div id="graphqlResult">
    <div v-if="props.visible">
      <v-card-title> {{ t('graphql.result') }} </v-card-title>
      <v-card-text>
        <v-row justify="center">
          <v-col class="flex-grow-1 flex-shrink-0">
            <JSONView
              :code="stringifiedGraphqlResult"
            />
          </v-col>
          <v-col class="flex-grow-0 flex-shrink-1 text-center pa-0">
            <v-btn
              icon="mdi-content-copy"
              variant="plain"
              @click="copyResult()"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
      </v-card-actions>
    </div>
  </div>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();

const props = defineProps({
  visible: { type: Boolean, default: false },
  attributes: { type: Array, default: () => [] },
  graphqlData: { type: Object, default: () => {} },
  query: { type: String, default: '' },
});

const stringifiedGraphqlResult = computed(() => JSON.stringify(props.graphqlData, null, 2));

function unsecuredCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('display', 'none');
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
}
function copyResult() {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(props.graphqlData, null, 2));
    } else {
      unsecuredCopyToClipboard(JSON.stringify(props.graphqlData, null, 2));
    }
  } catch (err) {
    snackStore.error(t('error.graphql.copyResult'));
    return;
  }
  snackStore.info(t('info.graphql.copyResult'));
}

</script>
