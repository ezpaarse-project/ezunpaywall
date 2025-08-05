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
      <i18n-t
        scope="global"
        keypath="home.general1"
        tag="p"
        class="my-4"
      >
        <template #link>
          <a
            :href="unpaywallURL"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unpaywall
          </a>
        </template>
      </i18n-t>
      <br>
      {{ t("home.general2") }}
      <i18n-t
        scope="global"
        keypath="home.general3"
        tag="p"
        class="my-4"
      >
        <template #link>
          <a
            :href="blogURL"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('home.blogPost') }}
          </a>
        </template>
      </i18n-t>
    </v-card-text>
  </v-card>
</template>

<script setup>

const { t } = useI18n();

const runtimeConfig = useRuntimeConfig();

const blogURL = ref('https://blog.ezpaarse.org/2021/05/communication-unpaywall-un-miroir-et-une-api-a-linist-cnrs/');
const unpaywallURL = ref(runtimeConfig.public.unpaywallURL);

</script>
