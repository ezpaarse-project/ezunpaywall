<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('home.title') }} </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <div v-html="t('home.general1', { linkUnpaywall: linkUnpaywall.value })" />
      <br>
      {{ t("home.general2") }}
      <div v-html="t('home.general3', { blogURL: blogURL.value })" />
    </v-card-text>
  </v-card>
</template>

<script setup>

const { t } = useI18n();

const runtimeConfig = useRuntimeConfig();

const blogURL = ref('https://blog.ezpaarse.org/2021/05/communication-unpaywall-un-miroir-et-une-api-a-linist-cnrs/');
const linkUnpaywall = ref(runtimeConfig.public.unpaywallHost);

</script>
