<template>
  <v-card class="my-3">
    <v-toolbar color="secondary" dark dense flat>
      <v-toolbar-title> {{ t('enrich.enrichFile') }} </v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon>
        <v-icon>mdi-code-json</v-icon>
      </v-app-bar-nav-icon>
    </v-toolbar>
    <v-stepper v-model="step" hide-actions editable :items="['1. Select files', '2. Settings', '3. Enrich']">
      <template #item.1>
        <v-card flat>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="setStep(2)">
              {{ t("enrich.continue") }}
            </v-btn>
          </v-card-actions>
          <LogFileTab />
        </v-card>
      </template>

      <template #item.2>
        <v-card flat>
          <v-card-actions>
            <v-btn @click="setStep(1)">
              {{ t("enrich.settings") }}
            </v-btn>
            <v-spacer />
            <v-btn @click="startEnrich()">
              {{ t("enrich.startProcess") }}
            </v-btn>
          </v-card-actions>
          <SettingsTab />
        </v-card>
      </template>

      <template #item.3>
        <v-card flat>
          <v-card-actions>
            <v-btn @click="setStep(1)">
              {{ t("enrich.settings") }}
            </v-btn>
            <v-spacer />
            <DownloadButton />
          </v-card-actions>
          <ProcessTab ref="process" />
        </v-card>
      </template>
    </v-stepper>
  </v-card>
</template>

<script setup>

import LogFileTab from '@/components/enrich/LogFileTab.vue';
import SettingsTab from '@/components/enrich/SettingsTab.vue';
import ProcessTab from '@/components/enrich/ProcessTab.vue';
import DownloadButton from '@/components/enrich/DownloadButton.vue';

const { $emitter } = useNuxtApp();

const { t } = useI18n();

const step = ref(1);

function setStep(value) {
  step.value = value;
}

function startEnrich() {
  step.value = 3;
  $emitter.emit('enrich:start', true);
}

</script>
