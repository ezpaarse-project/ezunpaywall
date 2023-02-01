<template>
  <v-card height="100%">
    <v-card-title class="pt-5 pl-5 pr-5">
      <v-row>
        {{ name }}
        <v-spacer />
        <v-icon
          :color="config.healthy ? 'green darken-1' : 'red darken-1'"
          size="30"
        >
          mdi-circle
        </v-icon>
      </v-row>
    </v-card-title>
    <v-divider class="ma-2" />
    <v-card-text
      v-for="(serviceDependency, serviceName) in config.services"
      :key="serviceName"
    >
      <v-row>
        <span class="ml-2">{{ serviceName }}</span>
        <v-spacer />
        <v-icon
          :color="
            serviceDependency.healthy ? 'green darken-1' : 'red darken-1'
          "
          size="15"
        >
          mdi-circle
        </v-icon>
      </v-row>
      <v-row v-if="serviceDependency.error">
        Error: {{ serviceDependency.error }}
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'HealthCard',
  props: {
    name: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
