<template>
  <v-row class="my-5 mx-1">
    <div>
      <v-select
        v-model="fileSeparator"
        :items="separators"
        label="File separator"
        filled
        dense
      />
    </div>
    <v-spacer />
    <div>
      <v-select
        v-model="enrichFileSeparator"
        :items="separators"
        label="Enriched file separator"
        filled
        dense
      />
    </div>
  </v-row>
</template>

<script>
export default {
  name: 'EnrichSeparator',
  data: () => {
    return {
      separators: [',', ';']
    }
  },
  computed: {
    fileSeparator: {
      get () {
        return this.$store.getters['enrich/getFileSeparator']
      },
      set (newVal) {
        this.$store.commit('enrich/setFileSeparator', newVal)
      }
    },
    enrichFileSeparator: {
      get () {
        return this.$store.getters['enrich/getEnrichedFileSeparator']
      },
      set (newVal) {
        this.$store.commit('enrich/setEnrichedFileSeparator', newVal)
      }
    }
  }
}
</script>
