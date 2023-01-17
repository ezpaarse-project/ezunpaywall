<template>
  <v-col cols="auto">
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="1000"
    >
      <template #activator="{ on, attrs }">
        <v-card-actions>
          <v-container>
            <v-layout row>
              <v-icon size="22" class="pr-1">
                mdi-update
              </v-icon>
              {{ report.data.totalUpdatedDocs }} {{ $t("reportHistory.updatedDocs") }}
            </v-layout>
            <v-layout row>
              <v-icon size="22" class="pr-1">
                mdi-plus
              </v-icon>
              {{ report.data.totalInsertedDocs }}
              {{ $t("reportHistory.insertedDocs") }}
            </v-layout>
          </v-container>
          <v-spacer />
          <v-btn v-bind="attrs" text class="mt-5" v-on="on">
            DETAILS
          </v-btn>
        </v-card-actions>
      </template>
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <span class="mr-2" v-text="report.createdAt" />
        </v-toolbar>
        <v-card-text class="pb-0">
          <pre>{{ JSON.stringify(report.data, null, 2) }} </pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            class="green--text"
            @click="dialog = !dialog"
            v-text="$t('close')"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
export default {
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dialog: false
    }
  }
}
</script>
