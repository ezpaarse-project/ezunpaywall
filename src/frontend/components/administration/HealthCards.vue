<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('administration.health.title')" />
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>

    <v-row
      v-if="healths.length === 0"
      align="center"
      justify="center"
      class="ma-2"
    >
      <v-col class="text-center" cols="12" sm="4">
        {{ $t("administration.health.noHealths") }}
      </v-col>
    </v-row>
    <v-row v-else class="ma-2">
      <v-col
        v-for="(globalHealth, globalName) in healths"
        :key="globalName"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <v-card height="100%">
          <v-card-title class="pt-5 pl-5 pr-5">
            <v-row>
              {{ globalName }}
              <v-spacer />
              <v-icon
                :color="globalHealth.status ? 'green darken-1' : 'red darken-1'"
                size="30"
              >
                mdi-circle
              </v-icon>
            </v-row>
          </v-card-title>
          <v-divider class="ma-2" />
          <v-card-text
            v-for="(serviceDependency, serviceName) in globalHealth.services"
            :key="serviceName"
          >
            <v-row>
              <span class="ml-2">{{ serviceName }}</span>
              <v-spacer />
              <v-icon
                :color="
                  serviceDependency.status ? 'green darken-1' : 'red darken-1'
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
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'HealthCards',
  data () {
    return {
      healths: []
    }
  },
  async mounted () {
    await this.getHealth()
  },
  methods: {
    async getHealth () {
      let res
      this.loading = true
      try {
        res = await this.$health.get('/health')
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.errorHelth'))
        this.loading = false
        return
      }
      this.healths = res?.data
    }
  }
}
</script>
