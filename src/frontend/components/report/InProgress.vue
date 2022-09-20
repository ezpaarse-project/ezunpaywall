<template>
  <v-card
    height="100%"
    outlined
    class="white--text"
    color="orange darken-1"
  >
    <v-container class="pt-5 pl-5 pr-5">
      <v-layout row>
        {{ report.createdAt }}
        <v-spacer />
        <v-progress-circular
          right
          :size="20"
          :width="3"
          indeterminate
          color="white"
        />
      </v-layout>
    </v-container>
    <detail :report="report" />
  </v-card>
</template>

<script>
import Detail from '~/components/report/Detail.vue'

export default {
  components: {
    Detail
  },
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
