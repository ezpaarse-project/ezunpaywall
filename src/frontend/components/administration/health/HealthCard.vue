<template>
  <v-card height="100%">
    <v-card-title class="pt-5 pl-5 pr-5">
      <v-row>
        {{ name }}
        <v-spacer />
        <v-chip
          :color="health.healthy ? 'green darken-1' : 'red darken-1'"
          outlined
        >
          {{ health.elapsedTime }} ms
          <v-icon right>
            {{ health.healthy ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </v-chip>
      </v-row>
    </v-card-title>
    <v-divider class="ma-2" />
    <v-list>
      <v-list-item
        v-for="(serviceDependency, serviceName) in health.services"
        :key="serviceName"
        ripple
      >
        <v-list-item-content>
          <v-list-item-title> {{ serviceName }} </v-list-item-title>
          <span v-if="serviceDependency.error">
            Error: {{ serviceDependency.error }}
          </span>
        </v-list-item-content>
        <v-list-item-icon>
          <v-chip
            :color="serviceDependency.healthy ? 'green darken-1' : 'red darken-1'"
            outlined
          >
            {{ serviceDependency.elapsedTime }} ms
            <v-icon right>
              {{ serviceDependency.healthy ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
          </v-chip>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
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
    health: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
