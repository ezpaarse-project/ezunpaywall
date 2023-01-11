<template>
  <v-card height="100%">
    <v-card-title class="pt-5 pl-5 pr-5">
      <v-row>
        {{ globalName }}
        <v-spacer />
        <v-icon :color="globalHealth.status ? 'green darken-1' : 'red darken-1'" size="30">
          mdi-circle
        </v-icon>
      </v-row>
    </v-card-title>
    <v-divider class="ma-2" />
    <v-card-text v-for="(serviceDependency, serviceName) in globalHealth.services" :key="serviceName">
      <v-row>
        {{ serviceName }}
        <v-spacer />
        <v-icon :color="serviceDependency.status ? 'green darken-1' : 'red darken-1'" size="15">
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
    globalName: {
      type: String,
      default: ''
    },
    globalHealth: {
      type: Object,
      default: () => {}
    }
  }
}

</script>
