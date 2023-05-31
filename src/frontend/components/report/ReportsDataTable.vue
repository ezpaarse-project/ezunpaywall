<template>
  <div>
    <v-data-table
      :headers="tableHeaders"
      :items="reports"
      :items-per-page="7"
      :loading="loading"
      item-key="id"
      class="elevation-1"
    >
      <template #[`item.status`]="{ item }">
        <v-icon v-if="!item.data.error" right color="green">
          mdi-check
        </v-icon>
        <v-icon v-else right color="red">
          mdi-close
        </v-icon>
      </template>

      <template #[`item.details`]="{ item }">
        <v-btn fab x-small @click="showDetails(item)">
          <v-icon> mdi-code-json </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <DetailDialog
      :report="reportSelected"
      :dialog="dialogVisible"
      @closed="setDialogVisible(false)"
    />
  </div>
</template>

<script>
import DetailDialog from '~/components/report/DetailDialog.vue'

export default {
  components: {
    DetailDialog
  },
  props: {
    reports: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialogVisible: false,
      reportSelected: {}
    }
  },
  computed: {
    tableHeaders () {
      return [
        {
          text: 'Date',
          align: 'start',
          sortable: false,
          value: 'createdAt'
        },
        { text: this.$t('Status'), value: 'status', sortable: false },
        {
          text: this.$t('reportHistory.updatedDocs'),
          value: 'data.totalUpdatedDocs',
          sortable: false
        },
        {
          text: this.$t('reportHistory.insertedDocs'),
          value: 'data.totalInsertedDocs',
          sortable: false
        },
        { text: this.$t('detail'), value: 'details', sortable: false, align: 'right' }
      ]
    }
  },
  methods: {
    showDetails (item) {
      this.reportSelected = item
      this.setDialogVisible(true)
    },
    setDialogVisible (value) {
      this.dialogVisible = value
    }
  }
}
</script>

<style>
</style>
