<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('home.title')" />
      </v-toolbar>
      <v-card-text>
        <div v-html="$t('home.general1', { unpaywallURL })" />
        <br>
        {{ $t("home.general2") }}
        <div v-html="$t('home.general3', { blogURL })" />
      </v-card-text>
    </v-card>

    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title
          v-text="$t('home.metrics', { env: getElasticEnvironment() })"
        />
      </v-toolbar>
      <v-card-title v-text="$t('home.globalMetrics')" />
      <v-card-text>
        <v-menu
          v-for="chip in metricsGlobalMetricsChips"
          :key="chip.name"
          v-model="chip.help"
          offset-y
          bottom
          right
          transition="scale-transition"
          origin="top left"
        >
          <template #activator="{ on }">
            <v-chip
              :color="chip.color"
              text-color="white"
              class="ma-1"
              v-on="on"
            >
              {{ $t(chip.title) }} : {{ chip.value }}
            </v-chip>
          </template>

          <v-card class="text-justify">
            <v-card-text v-html="$t(chip.text)" />

            <v-card-actions>
              <v-spacer />
              <v-btn
                class="body-2"
                text
                @click="chip.help = false"
                v-text="$t('close')"
              />
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-card-text>

      <v-divider />

      <v-card-title v-text="$t('home.openAccessStatus')" />
      <v-card-text>
        <v-menu
          v-for="chip in metricsOAStatusChips"
          :key="chip.name"
          v-model="chip.help"
          offset-y
          bottom
          right
          transition="scale-transition"
          origin="top left"
        >
          <template #activator="{ on }">
            <v-chip
              :color="chip.color"
              text-color="white"
              class="ma-1"
              v-on="on"
            >
              <v-icon left color="white">
                {{ chip.icon }}
              </v-icon>
              {{ chip.name }} : {{ chip.value }}
            </v-chip>
          </template>

          <v-card class="text-justify">
            <v-card-text v-html="$t(chip.text)" />

            <v-card-actions>
              <v-spacer />
              <v-btn
                class="body-2"
                text
                @click="chip.help = false"
                v-text="$t('close')"
              />
            </v-card-actions>
          </v-card>
        </v-menu>
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
      }
    }
  },
  head () {
    return {
      title: 'Home'
    }
  },
  computed: {
    referencedRessourceHelp () {
      return this.$t('home.referencedRessourceHelp')
    },
    metricsOAStatusChips () {
      return [
        {
          name: 'goldOA',
          color: '#FFC000',
          icon: 'mdi-lock-open',
          text: 'home.goldOAHelp',
          help: false,
          value: this.metrics.goldOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
        },
        {
          name: 'hybridOA',
          color: '#DD7931',
          icon: 'mdi-lock-open',
          text: 'home.hybridOAHelp',
          help: false,
          value: this.metrics.hybridOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
        },
        {
          name: 'bronzeOA',
          color: '#DD7931',
          icon: 'mdi-lock-open',
          text: 'home.bronzeOAHelp',
          help: false,
          value: this.metrics.bronzeOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
        },
        {
          name: 'greenOA',
          color: '#4CAF50',
          icon: 'mdi-lock-open',
          text: 'home.greenOAHelp',
          help: false,
          value: this.metrics.greenOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
        },
        {
          name: 'closedOA',
          color: '#BBBBBB',
          icon: 'mdi-lock',
          text: 'home.closedOAHelp',
          help: false,
          value: this.metrics.closedOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
        }
      ]
    },
    metricsGlobalMetricsChips () {
      return [
        {
          name: 'doi',
          title: 'home.referencedResources',
          color: 'grey darken-2',
          text: 'home.referencedRessourceHelp',
          help: false,
          value: this.metrics.doi.toLocaleString(this.$i18n.locale, { useGrouping: true })
        },
        {
          name: 'isOA',
          title: 'home.openAccess',
          color: 'grey darken-2',
          text: 'home.openAccessHelp',
          help: false,
          value: this.metrics.isOA.toLocaleString(this.$i18n.locale, { useGrouping: true })
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
    getElasticEnvironment () {
      if (
        !(this.$config.elasticEnv === 'integration' ||
        this.$config.elasticEnv === 'production')
      ) {
        return this.$t('development')
      }
      if (this.$config.elasticEnv === 'integration') {
        return this.$t('integration')
      }
      return ''
    }
  }
}
</script>
