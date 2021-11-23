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
          <v-chip color="grey darken-2" text-color="white">
            {{ $t('home.referencedResources') }} : {{ metrics.doi }}
          </v-chip>
          <v-chip color="grey darken-2" text-color="white">
            {{ $t('home.openAccess') }} : {{ metrics.isOA }}
          </v-chip>
        </v-card-text>
      </v-container>

      <v-divider />
      <v-container>
        <v-card-title v-text="$t('home.openAccessStatus')" />
        <v-card-text>
          <v-chip-group active-class="deep-purple accent-4 white--text" column>
            <v-chip v-for="chip in metricsChips" :key="chip.name" :color="chip.color" text-color="white">
              <v-icon left color="white">
                mdi-lock-open
              </v-icon>
              {{ chip.name }} : {{ metrics[chip.name] }}
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
      metrics: '',
      metricsChips: [
        {
          name: 'goldOA',
          color: '#FFC000'
        },
        {
          name: 'hybridOA',
          color: '#DD7931'
        },
        {
          name: 'bronzeOA',
          color: '#DD7931'
        },
        {
          name: 'greenOA',
          color: '#00F765'
        },
        {
          name: 'closedOA',
          color: '#BBBBBB'
        }
      ]
    }
  },
  mounted () {
    this.graphqlRequest()
  },
  methods: {
    async graphqlRequest () {
      this.loading = true
      let res
      try {
        res = await this.$graphql({
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
      this.metrics = res?.data?.data?.Metrics
      this.loaded = false
    }
  }
}
</script>
