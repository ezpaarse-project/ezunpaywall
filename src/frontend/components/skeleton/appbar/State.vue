<template>
  <div class="container">
    <v-divider />
    {{ t("ui.components.header.State.createdAt") }} {{ createdAt }}
    <h3>{{ t("ui.components.header.State.tasks") }}</h3>
    <v-data-table
      :headers="headers"
      :items="steps"
      :items-per-page="10"
      class="elevation-1"
      hide-default-footer
    >
      <template #[`item.status`]="{ item }">
        <div v-if="item.status === 'success'">
          <v-icon
            class="text-center"
            size="30"
            color="green darken-2"
          >
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
      default: () => ({}),
    },
  },
  data: () => ({}),
  computed: {
    createdAt() {
      return $dateFns.format(state.createdAt, 'PPPPpp');
    },
    headers() {
      return [
        { text: t('state.task'), value: 'task' },
        { text: t('state.took'), value: 'took' },
        { text: t('state.percent'), value: 'percent' },
        { text: t('state.file'), value: 'file' },
        { text: t('state.linesRead'), value: 'linesRead' },
        { text: t('state.status'), value: 'status' },
      ];
    },
    steps() {
      return state.steps.filter((step) => step.task === 'insert' || step.task === 'download');
    },
  },
  methods: {
    setIcon(status) {
      if (status === 'success') {
        return 'mdi-check';
      }
      return 'mdi-alert-circle';
    },
  },
};
</script>
