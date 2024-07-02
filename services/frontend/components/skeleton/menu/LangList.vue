<template>
  <v-list>
    <v-list-item
      v-for="lang in langs"
      :key="lang.locale"
      :title="lang.language"
      @click="i18n.setLocale(lang.locale)"
    >
      <template #prepend>
        <img
          width="24"
          class="mr-2"
          :src="lang.pathImage"
          :alt="lang.locale"
        >
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>

import frFlag from '@/static/images/lang/fr.png';
import enFlag from '@/static/images/lang/en.png';

const i18n = useI18n();

const langs = ref([
  {
    locale: 'fr',
    pathImage: frFlag,
    language: 'Français',
  },
  {
    locale: 'en',
    pathImage: enFlag,
    language: 'English',
  },
]);

</script>
