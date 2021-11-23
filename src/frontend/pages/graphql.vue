<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('graphql.constructor')" />
        <v-spacer />
        <v-icon>mdi-api</v-icon>
      </v-toolbar>
      <v-container>
        <v-text-field v-model="apikey" :label="$t('graphql.apiKey')" filled />
        <v-text-field v-model="doi" label="DOI" filled />
      </v-container>
    </v-card>

    <v-card class="my-3">
      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title v-text="$t('graphql.settings')" />
      </v-toolbar>

      <v-container>
        <SettingsGraphql />
      </v-container>
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
        <v-card-title v-text="$t('graphql.result')" />
        <v-card-text>
          <pre>{{ JSON.stringify(response.data, null, 2) }} </pre>
        </v-card-text>
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
      apikey: 'example',
      doi: '10.1111/jvp.12137',
      loading: false,
      response: ''
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
      } = this.$store.state.enrichArgs

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
      // 10.1111/jvp.12137
      try {
        this.response = await this.$graphql({
          method: 'GET',
          url: '/graphql',
          params: {
            query: this.query
          },
          headers: {
            'X-API-KEY': this.apiKey || 'admin'
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
  color: #f60;
}
</style>
