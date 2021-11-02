<template>
  <div>
    <v-text-field v-model="apikey" label="clé d'api" />
    <v-text-field v-model="doi" label="DOI" />
    <SettingsGraphql />
    <v-card class="mx-auto">
      <v-card-title>requête graphql</v-card-title>
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
        <v-btn :loading="loading" @click="graphqlRequest">
          Lancement de la requête
        </v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="show">
          <v-card-title>Résultat</v-card-title>
          <v-card-text>
            <pre>{{ JSON.stringify(response.data, null, 2) }} </pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="show = false">
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script>

import SettingsGraphql from '~/components/home/SettingsGraphql.vue'

export default {
  name: 'Home',
  components: {
    SettingsGraphql
  },
  transition: 'slide-x-transition',

  data: () => {
    return {
      apikey: 'example',
      doi: '10.1111/jvp.12137',
      loading: false,
      response: '',
      show: false
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

      if (!simple.length && !best_oa_location.length && !first_oa_location.length && !oa_locations.length && !z_authors.length) {
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
        this.$store.dispatch('snacks/error', 'impossible to save graphql request')
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
        this.$store.dispatch('snacks/error', 'Cannot do graphql request')
      }
      this.loading = false
      this.show = true
    }
  }
}
</script>
<style>

pre {
 tab-width: 4;
 display: block;
 padding: 12px;
 color: #F60;
}
</style>
