<template>
  <section>
    <div v-html="$t('graphql.general')" />
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('graphql.constructor')" />
        <v-spacer />
        <v-icon>mdi-api</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-text-field v-model="apiKey" :label="$t('graphql.apiKey')" />
        <v-text-field v-model="doi" label="DOIs" />
      </v-card-text>

      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title v-text="$t('graphql.settings')" />
        <v-menu
          v-model="attrsHelp"
          :close-on-content-click="false"
          :nudge-width="200"
          max-width="500"
          offset-x
          transition="slide-x-transition"
        >
          <template #activator="{ on }">
            <v-btn class="mr-5" icon v-on="on">
              <v-icon>mdi-help-circle</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-text
              class="text-justify"
              v-html="$t('unpaywallArgs.help', { url: dataFormatURL })"
            />
            <v-card-actions>
              <v-spacer />
              <v-btn
                class="body-2"
                text
                @click="attrsHelp = false"
                v-text="$t('close')"
              />
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-toolbar>
      <v-card-text>
        <SettingsGraphql />
      </v-card-text>
    </v-card>
    <v-card class="mx-auto">
      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title v-text="$t('graphql.request')" />
      </v-toolbar>
      <v-card-text>
        <v-textarea
          outlined
          readonly
          label="query"
          :value="query"
          rows="4"
          append-icon="mdi-content-copy"
          @click:append="copyText()"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :loading="loading"
          :disabled="!getSetting"
          @click="graphqlRequest"
          v-text="$t('graphql.start')"
        />
      </v-card-actions>
      <div id="graphqlResponse">
        <div v-if="response.data">
          <v-card-title v-text="$t('graphql.result')" />
          <v-card-text>
            <pre>
                <code v-highlight class="json">{{ JSON.stringify(response.data, null, 2) }}</code>
            </pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :href="linkGraphql"
              target="_blank"
              v-text="$t('graphql.linkAPI')"
            />
          </v-card-actions>
        </div>
      </div>
    </v-card>
  </section>
</template>

<script>
import SettingsGraphql from '~/components/unpaywallArgs/SettingsGraphql.vue'

export default {
  name: 'Graphql',
  components: {
    SettingsGraphql
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      apiKey: 'demo',
      doi: '10.1001/jama.2016.9797',
      loading: false,
      response: '',
      // help
      attrsHelp: false,
      dataFormatURL: 'https://unpaywall.org/data-format'
    }
  },
  head () {
    return {
      title: 'Graphql'
    }
  },
  computed: {
    formatDOIs () {
      const dois = this.doi.split(',')
      return `"${dois.join('", "')}"`
    },
    getSetting () {
      const {
        simple,
        best_oa_location,
        first_oa_location,
        oa_locations,
        z_authors
      } = this.$store.state.graphql

      if (
        !simple.length &&
        !best_oa_location.length &&
        !first_oa_location.length &&
        !oa_locations.length &&
        !z_authors.length
      ) {
        return ''
      }

      const attrs = []

      if (simple.length) {
        attrs.push(simple.join(', '))
      }
      if (best_oa_location.length) {
        attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`)
      }
      if (first_oa_location.length) {
        attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`)
      }
      if (oa_locations.length) {
        attrs.push(`oa_locations { ${oa_locations.join(', ')} }`)
      }
      if (z_authors.length) {
        attrs.push(`z_authors { ${z_authors.join(', ')} }`)
      }
      return `{ ${attrs.join(', ')} }`
    },
    query () {
      return `{ GetByDOI(dois: [${this.formatDOIs}]) ${this.getSetting} }`
    },
    linkGraphql () {
      return `${this.$graphql.defaults.baseURL}/graphql?query=${this.query}&apikey=demo`
    }
  },
  methods: {
    copyText () {
      try {
        navigator.clipboard.writeText(this.query)
        this.$store.dispatch('snacks/info', 'request copied')
      } catch (err) {
        this.$store.dispatch(
          'snacks/error',
          this.$t('graphql.errorCopyRequest')
        )
      }
    },
    async graphqlRequest () {
      this.loading = true
      // 10.1001/jama.2016.9797
      try {
        this.response = await this.$graphql({
          method: 'GET',
          url: '/graphql',
          params: {
            query: this.query
          },
          headers: {
            'x-api-key': this.apiKey
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorRequest'))
      }
      this.loading = false

      this.$vuetify.goTo('#graphqlResponse')
    }
  }
}
</script>
<style>
pre {
  display: block;
  padding: 12px;
}
</style>
