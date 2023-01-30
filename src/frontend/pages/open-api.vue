<template>
  <div>
    <v-tabs v-model="tab" fixed-tabs color="primary">
      <v-tab
        v-for="item in items"
        :key="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>

    <Openapi :host="host" />
  </div>
</template>

<script>

import Openapi from '~/components/openapi/Openapi.vue'

export default {
  components: {
    Openapi
  },
  data: () => ({
    tab: null,
    items: [
      'Graphql',
      'Enrich',
      'Update',
      'Apikey',
      'Mail',
      'Health'
    ]
  }),
  head () {
    return {
      title: 'Documentation'
    }
  },
  computed: {
    host () {
      if (this.tab === 1) { return this.$config.enrichHost }
      if (this.tab === 2) { return this.$config.updateHost }
      if (this.tab === 3) { return this.$config.apikeyHost }
      if (this.tab === 4) { return this.$config.mailHost }
      if (this.tab === 5) { return this.$config.healthHost }
      return this.$config.graphqlHost
    }
  }
}
</script>
