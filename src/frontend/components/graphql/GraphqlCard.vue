<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('graphql.title') }} </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      {{ t('graphql.general1') }} <br>
      {{ t('graphql.general2') }} <br>
      {{ t('graphql.general3') }} <br>
      {{ t('graphql.general4') }} <br>
    </v-card-text>
  </v-card>
</template>

<script setup>

const { t } = useI18n();

</script>
