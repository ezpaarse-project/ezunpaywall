<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('home.title')" />
      </v-toolbar>
      <v-container>
        {{ $t("home.intro") }}
      </v-container>
    </v-card>

    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('home.metrics')" />
      </v-toolbar>
      <v-container>
        <v-card-title v-text="$t('home.globalMetrics')" />
        <v-card-text>
          <v-chip color="grey darken-2" text-color="white">{{ $t('home.referencedResources') }} : {{ metrics.doi }}</v-chip>
          <v-chip color="grey darken-2" text-color="white">{{ $t('home.openAccess') }} : {{ metrics.isOA }}</v-chip>
        </v-card-text>
      </v-container>

      <v-divider />
      <v-container>
        <v-card-title v-text="$t('home.openAccessStatus')" />
        <v-card-text>
          <v-chip-group active-class="deep-purple accent-4 white--text" column>
            <v-chip color="#FFC000" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              gold : {{ metrics.goldOA }}
            </v-chip>

            <v-chip color="#DD7931" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              hybrid : {{ metrics.hybridOA }}
            </v-chip>

            <v-chip color="#DD7931" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              bronze : {{ metrics.bronzeOA }}
            </v-chip>

            <v-chip color="#00F765" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              green : {{ metrics.greenOA }}
            </v-chip>

            <v-chip color="#BBBBBB" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              locked : {{ metrics.closedOA }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-container>
    </v-card>
  </section>
</template>

<script>
export default {
  name: 'Home',
  transition: 'slide-x-transition',
  data: () => {
    return {
      loaded: false,
      metrics: ''
    }
  },
  mounted () {
    this.graphqlRequest()
  },
  methods: {
    async graphqlRequest () {
      this.loading = true
      let response
      try {
        response = await this.$graphql({
          method: 'GET',
          url: '/graphql',
          params: {
            query:
              '{ Metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }'
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorRequest'))
      }

      this.metrics = response?.data?.data.Metrics
      this.loaded = false
    }
  }
}
</script>
