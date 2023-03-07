<template>
  <v-menu
    v-model="help"
    :close-on-content-click="false"
    :nudge-width="200"
    max-width="500"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>mdi-help-circle</v-icon>
      </v-btn>
    </template>

    <v-card class="text-justify">
      <v-card-text>
        {{ $t("header.help") }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn class="body-2" text @click="help = false">
          {{ $t("close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  data: () => {
    return {
      help: false
    }
  }
}
</script>

<style>
</style>
