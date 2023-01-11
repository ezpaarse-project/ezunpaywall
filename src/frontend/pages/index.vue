<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('home.title')" />
      </v-toolbar>
      <v-card-text v-html="$t('home.intro', { unpaywallURL, blogURL })" />
    </v-card>

    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title
          v-text="$t('home.metrics', { env: getEnvironment() })"
        />
      </v-toolbar>
      <v-card-title v-text="$t('home.globalMetrics')" />
      <v-card-text>
        <v-chip color="grey darken-2" text-color="white">
          {{ $t("home.referencedResources") }} : {{ metrics.doi }}
        </v-chip>
        <v-chip color="grey darken-2" text-color="white">
          {{ $t("home.openAccess") }} : {{ metrics.isOA }}
        </v-chip>
      </v-card-text>

      <v-divider />

      <v-card-title v-text="$t('home.openAccessStatus')" />
      <v-card-text>
        <v-chip
          v-for="chip in metricsChips"
          :key="chip.name"
          :color="chip.color"
          text-color="white"
          class="ma-1"
        >
          <v-icon left color="white">
            mdi-lock-open
          </v-icon>
          {{ chip.name }} : {{ metrics[chip.name] }}
        </v-chip>
      </v-card-text>
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
      blogURL:
        'https://blog.ezpaarse.org/2021/05/communication-unpaywall-un-miroir-et-une-api-a-linist-cnrs/',
      unpaywallURL: 'https://unpaywall.org/',
      metrics: {
        doi: 0,
        isOA: 0,
        goldOA: 0,
        hybridOA: 0,
        bronzeOA: 0,
        greenOA: 0,
        closedOA: 0
      },
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
  head () {
    return {
      title: 'Home'
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
              '{ DailyMetrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }'
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorRequest'))
      }
      if (res?.data?.data?.DailyMetrics) {
        this.metrics = res?.data?.data?.DailyMetrics
      }
      this.loaded = false
    },
    getEnvironment () {
      return this.$config.environment
    }
  }
}
</script>
