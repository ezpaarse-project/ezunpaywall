<template>
  <v-tooltip bottom>
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>mdi-help-circle</v-icon>
      </v-btn>
    </template>
    {{ $t("header.help") }}
  </v-tooltip>
</template>

<script>
export default {
}
</script>

<style>
</style>
