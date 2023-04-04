<template>
  <v-card height="100%" outlined>
    <v-progress-linear :color="color" dark height="40" value="100">
      <span class="ma-2" v-text="report.createdAt" />
      <v-spacer />
      <v-icon v-if="status === 'success'" class="ma-2" color="white">
        mdi-check
      </v-icon>
      <v-progress-circular
        v-else-if="status === 'inprogress'"
        class="ma-2"
        :size="20"
        :width="3"
        indeterminate
        color="white"
      />
      <v-icon v-else-if="status === 'error'" class="ma-2" color="white">
        mdi-alert-circle
      </v-icon>
    </v-progress-linear>
    <v-card-actions>
      <v-container>
        <v-layout row>
          <v-icon size="22" class="pr-1">
            mdi-update
          </v-icon>
          {{ $t("reportHistory.updatedDocs", { "updatedDocs": report.data.totalUpdatedDocs }) }}
        </v-layout>
        <v-layout row>
          <v-icon size="22" class="pr-1">
            mdi-plus
          </v-icon>
          {{ $t("reportHistory.insertedDocs", { "insertedDocs": report.data.totalInsertedDocs }) }}
        </v-layout>
      </v-container>
      <v-spacer />
      <v-btn text class="mt-5" @click.stop="setDialogVisible(true)">
        {{ $t("detail") }}
      </v-btn>
    </v-card-actions>
    <DetailDialog
      :report="report"
      :dialog="dialogVisible"
      @closed="setDialogVisible(false)"
    />
  </v-card>
</template>

<script>
import DetailDialog from '~/components/report/DetailDialog.vue'

export default {
  components: {
    DetailDialog
  },
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    status () {
      if (this.report.data.error) {
        return 'error'
      }
      if (this.report.data.done) {
        return 'success'
      }
      return 'inprogress'
    },
    color () {
      switch (this.status) {
        case 'success':
          return 'green darken-2'
        case 'inprogress':
          return 'blue darken-2'
        case 'error':
          return 'red darken-2'
        default:
          return 'orange darken-2'
      }
    }
  },
  methods: {
    setDialogVisible (value) {
      this.dialogVisible = value
    }
  }
}
</script>
