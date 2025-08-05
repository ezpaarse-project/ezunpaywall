<template>
  <v-card>
    <div
      v-if="isProcessing"
      class="text-center"
    >
      <v-progress-circular
        :size="70"
        :width="7"
        indeterminate
        color="green"
      />
      <p> {{ stepTitle }} </p>
    </div>
    <div
      v-else
      class="text-center"
    >
      <v-icon
        v-if="isError"
        size="70"
        color="orange darken-2"
      >
        mdi-alert-circle
      </v-icon>
      <v-icon
        v-else
        size="70"
        color="green darken-2"
      >
        mdi-check
      </v-icon>
      <div
        v-if="isError"
        v-text="t('error.enrich.job')"
      />
      <div
        v-else
        v-text="t('enrich.end')"
      />
    </div>
    <EnrichReport
      :time="time"
      :state="state"
    />
  </v-card>
</template>

<script setup>

/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

const { t } = useI18n();
const enrichStore = useEnrichStore();

const {
  isProcessing, isError,
} = storeToRefs(enrichStore);

const state = ref({});
const stepTitle = ref('');
const time = ref(0);

</script>
