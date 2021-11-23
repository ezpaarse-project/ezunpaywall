<template>
  <div class="container">
    <v-divider />
    {{ $t("ui.components.header.State.createdAt") }} {{ createdAt }}
    <h3>{{ $t("ui.components.header.State.tasks") }}</h3>
    <v-data-table
      :headers="headers"
      :items="steps"
      :items-per-page="10"
      class="elevation-1"
      hide-default-footer
    >
      <template #[`item.status`]="{ item }">
        <div v-if="item.status === 'success'">
          <v-icon class="text-center" size="30" color="green darken-2">
            mdi-check
          </v-icon>
        </div>
        <div v-else-if="item.status === 'inProgress'">
          <v-progress-circular
            :size="70"
            :width="7"
            indeterminate
            color="green"
          />
        </div>
        <div v-if="item.status === 'error'">
          <p>Oh noooo !</p>
        </div>
      </template>

      <template #[`item.percent`]="{ item }">
        {{ item.percent }}%
      </template>
      <template #[`item.took`]="{ item }">
        {{ item.took }} sec
      </template>
    </v-data-table>
  </div>
</template>

<script>

export default {
  props: {
    state: {
      type: Object,
      default: () => {}
    }
  },
  data: () => {
    return {}
  },
  computed: {
    createdAt () {
      return this.$dateFns.format(this.state.createdAt, 'PPPPpp')
    },
    headers () {
      return [
        { text: this.$t('state.task'), value: 'task' },
        { text: this.$t('state.took'), value: 'took' },
        { text: this.$t('state.percent'), value: 'percent' },
        { text: this.$t('state.file'), value: 'file' },
        { text: this.$t('state.linesRead'), value: 'linesRead' },
        { text: this.$t('state.status'), value: 'status' }
      ]
    },
    steps () {
      return this.state.steps.filter(step => step.task === 'insert' || step.task === 'download')
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
