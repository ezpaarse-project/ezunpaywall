<template>
  <div>
    <v-bottom-navigation :value="value" color="primary" horizontal>
      <v-btn @click="setValue(0)">
        <span>Graphql</span>
      </v-btn>

      <v-btn @click="setValue(1)">
        <span>Enrich</span>
      </v-btn>

      <v-btn @click="setValue(2)">
        <span>Update</span>
      </v-btn>

      <v-btn @click="setValue(3)">
        <span>Apikey</span>
      </v-btn>

      <v-btn @click="setValue(4)">
        <span>Mail</span>
      </v-btn>

      <v-btn @click="setValue(5)">
        <span>Health</span>
      </v-btn>
    </v-bottom-navigation>

    <Openapi v-if="value === 0" :host="graphqlHost" />
    <Openapi v-if="value === 1" :host="enrichHost" />
    <Openapi v-if="value === 2" :host="updateHost" />
    <Openapi v-if="value === 3" :host="apikeyHost" />
    <Openapi v-if="value === 4" :host="mailHost" />
    <Openapi v-if="value === 5" :host="healthHost" />
  </div>
</template>

<script>

import Openapi from '~/components/openapi/Openapi.vue'

export default {
  components: {
    Openapi
  },
  data: () => ({ value: 0 }),
  head () {
    return {
      title: 'Doc'
    }
  },
  computed: {
    graphqlHost () {
      return this.$config.graphqlHost
    },
    updateHost () {
      return this.$config.updateHost
    },
    enrichHost () {
      return this.$config.enrichHost
    },
    apikeyHost () {
      return this.$config.apikeyHost
    },
    mailHost () {
      return this.$config.mailHost
    },
    healthHost () {
      return this.$config.healthHost
    }
  },
  methods: {
    setValue (value) {
      this.value = value
    }
  }
}
</script>
