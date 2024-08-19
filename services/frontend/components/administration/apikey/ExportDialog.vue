<template>
  <v-dialog
    :value="value"
    max-width="1000px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          {{ t('administration.apikey.export') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <JSONView
          :code="apikeysStringified"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="downloadItem()">
          {{ t("download") }}
        </v-btn>
        <v-btn @click="copyText()">
          {{ t("copy") }}
        </v-btn>
        <v-btn @click.stop="emit('update:modelValue', false)">
          {{ t("close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();

const value = ref('false');

const props = defineProps({
  apikeys: { type: Array, default: () => [] },
});

const apikeysStringified = computed(() => JSON.stringify(props.apikeys, null, 2));

function downloadItem() {
  const element = document.createElement('a');
  const stringifiedApikey = encodeURIComponent(JSON.stringify(props.apikeys, null, 2));
  element.setAttribute('href', `data:text/plain;charset=utf-8,${stringifiedApikey}`);
  element.setAttribute('download', `${new Date()}.apikeys-export.json`);
  element.style.display = 'none';
  element.click();
}

function unsecuredCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('display', 'none');
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
}
function copyText() {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(props.apikeys, null, 2));
    } else {
      unsecuredCopyToClipboard(JSON.stringify(props.apikeys, null, 2));
    }
  } catch (err) {
    snackStore.error(t('error.apikey.copy'));
    return;
  }
  snackStore.info(t('info.apikey.copied'));
}

const emit = defineEmits({
  'update:modelValue': () => true,
});

</script>
