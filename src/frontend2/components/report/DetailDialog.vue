<template>
  <v-dialog
    :value="props.value"
    max-width="1000px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          {{ report.createdAt }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        {{ stringifiedReport }}
        <highlightjs
          language="json"
          :code="stringifiedReport"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          class="red--text"
          @click.stop="emit('update:modelValue', false)"
        >
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

const { t } = useI18n();

const props = defineProps({
  value: { type: Boolean, default: false },
  report: { type: Object, default: () => {} },
});

const stringifiedReport = computed(() => JSON.stringify(props.report.data, null, 2));

const emit = defineEmits({
  'update:modelValue': () => true,
});

</script>
