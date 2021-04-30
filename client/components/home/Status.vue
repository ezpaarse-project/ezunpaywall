<template>
  <div class="container">
    <v-divider />
    <h2>General</h2>
    créé le : {{ status.task.createdAt }}
    <h3>Taches</h3>
    <v-card-text v-for="step in status.task.steps" :key="step.took">
      <v-data-table
        v-if="step.task === 'download'"
        :headers="headerDownload"
        :items="[step]"
        :items-per-page="1"
        class="elevation-1"
        hide-default-footer
      >
        <template #item.status="{ item }">
          <div v-if="item.status === 'success'">
            <v-icon class="text-center" size="30" color="green darken-2">
              mdi-check
            </v-icon>
          </div>
          <div v-else>
            <v-progress-circular
              :size="70"
              :width="7"
              indeterminate
              color="green"
            />
          </div>
        </template>

        <template #item.percent="{ item }"> {{ item.percent }}% </template>
        <template #item.took="{ item }"> {{ item.took }} sec </template>
      </v-data-table>

      <v-data-table
        v-if="step.task === 'insert'"
        :headers="headerInsert"
        :items="[step]"
        :items-per-page="1"
        class="elevation-1"
        hide-default-footer
      >
        <template #item.status="{ item }">
          <div v-if="item.status === 'success'">
            <v-icon class="text-center" size="30" color="green darken-2">
              mdi-check
            </v-icon>
          </div>
          <div v-else>
            <v-progress-circular
              :size="30"
              :width="3"
              indeterminate
              color="green"
            />
          </div>
        </template>
        <template #item.percent="{ item }"> {{ item.percent }}% </template>
        <template #item.took="{ item }"> {{ item.took }} sec </template>
      </v-data-table>
    </v-card-text>
  </div>
</template>

<script>
export default {
  props: {
    status: Object
  },
  data: () => {
    return {}
  },
  computed: {
    headerInsert () {
      return [
        { text: this.$t('ui.components.home.Status.task'), value: 'task' },
        { text: this.$t('ui.components.home.Status.took'), value: 'took' },
        { text: this.$t('ui.components.home.Status.percent'), value: 'percent' },
        { text: this.$t('ui.components.home.Status.file'), value: 'file' },
        { text: this.$t('ui.components.home.Status.linesRead'), value: 'linesRead' },
        { text: this.$t('ui.components.home.Status.status'), value: 'status' }
      ]
    },
    headerDownload () {
      return [
        { text: this.$t('ui.components.home.Status.task'), value: 'task' },
        { text: this.$t('ui.components.home.Status.took'), value: 'took' },
        { text: this.$t('ui.components.home.Status.percent'), value: 'percent' },
        { text: this.$t('ui.components.home.Status.file'), value: 'file' },
        { text: this.$t('ui.components.home.Status.status'), value: 'status' }
      ]
    }
  },
  methods: {
    setIcon (status) {
      if (status === 'success') {
        return 'mdi-check'
      }
      return 'mdi-alert-circle'
    }
  }
}
</script>
