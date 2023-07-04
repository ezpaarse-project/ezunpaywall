<template>
  <div>
    <v-row class="ma-3">
      <v-row align="center">
        <div class="mr-1" v-text="$t('enrich.authorizedFile')" />
        <v-chip-group v-for="extension in authorizedFile" :key="extension.name">
          <v-chip :color="extension.color" label text-color="white">
            {{ extension.name }}
          </v-chip>
        </v-chip-group>
      </v-row>
      <v-spacer />
      <v-menu
        v-model="fileSelectionHelp"
        :close-on-content-click="false"
        :nudge-width="200"
        max-width="500"
        offset-x
        transition="slide-x-transition"
      >
        <template #activator="{ on }">
          <v-btn class="mr-5" icon v-on="on">
            <v-icon>mdi-help-circle</v-icon>
          </v-btn>
        </template>

        <v-card class="text-justify">
          <v-card-text> {{ $t("enrich.explainationLogs") }} </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="body-2" text @click="fileSelectionHelp = false">
              {{ $t("close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-row>
    <LogFiles class="ma-1" />
  </div>
</template>

<script>
import LogFiles from '~/components/enrich/LogFiles.vue'

export default {
  name: 'EnrichLogFileTab',
  components: {
    LogFiles
  },
  data: () => {
    return {
      fileSelectionHelp: false,
      authorizedFile: [
        { name: 'csv', color: 'green' },
        { name: 'jsonl', color: 'orange' }
      ]
    }
  },
  computed: {
    hasFiles () {
      return Array.isArray(this.files) && this.files.length > 0
    },
    files () {
      return this.$store.getters['enrich/getFiles']
    }
  }
}
</script>
