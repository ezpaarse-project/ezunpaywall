<template>
  <section>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title> {{ $t('graphql.title') }} </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        {{ $t('graphql.general1') }} <br>
        {{ $t('graphql.general2') }} <br>
        {{ $t('graphql.general3') }} <br>
        {{ $t('graphql.general4') }} <br>
      </v-card-text>
    </v-card>
    <v-card class="my-3">
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title> {{ $t('graphql.constructor') }} </v-toolbar-title>
        <v-spacer />
        <v-icon>mdi-api</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-text-field v-model="apikey" :label="$t('graphql.apikey')" />
        <v-text-field v-model="doi" label="DOIs" />
      </v-card-text>

      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title> {{ $t('graphql.settings') }} </v-toolbar-title>
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
            <!-- eslint-disable-next-line -->
            <v-card-text class="text-justify" v-html="$t('unpaywallArgs.help', { url: dataFormatURL })" />
            <v-card-actions>
              <v-spacer />
              <v-btn
                class="body-2"
                text
                @click="attrsHelp = false"
              >
                {{ $t('close') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-toolbar>
      <v-card-text>
        <SettingsAttributes
          :simple="attributesSimple"
          :best-oa-location="attributesBestOaLocation"
          :first-oa-location="attributesFirstOaLocation"
          :oa-locations="attributesOaLocations"
          :z-authors="attributesZAuthors"
          @attributes="getAttributes"
        />
      </v-card-text>
    </v-card>
    <v-card class="mx-auto">
      <v-toolbar class="secondary" dark dense flat>
        <v-toolbar-title> {{ $t('graphql.request') }} </v-toolbar-title>
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
          :disabled="!attributes.length"
          @click="graphqlRequest"
        >
          {{ $t('graphql.start') }}
        </v-btn>
      </v-card-actions>
      <div id="graphqlResult">
        <div v-if="result">
          <v-card-title> {{ $t('graphql.result') }} </v-card-title>
          <v-card-text>
            <highlightjs language="json" :code="stringifiedGraphqlResult" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :href="linkGraphql"
              target="_blank"
              :disabled="!attributes.length"
            >
              {{ $t('graphql.linkAPI') }}
            </v-btn>
          </v-card-actions>
        </div>
      </div>
    </v-card>
  </section>
</template>

<script>
import SettingsAttributes from '~/components/unpaywallArgs/SettingsAttributes.vue'

export default {
  name: 'Graphql',
  components: {
    SettingsAttributes
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      apikey: 'demo',
      doi: '10.1001/jama.2016.9797',
      attributes: ['doi', 'best_oa_location.evidence', 'best_oa_location.is_best', 'first_oa_location.url_for_pdf', 'z_authors.family', 'z_authors.given'],
      loading: false,
      result: '',
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
    attributesSimple () {
      return this.attributes?.filter(e => !e.includes('.'))
    },
    attributesBestOaLocation () {
      return this.attributes?.filter(e => e.includes('best_oa_location')).map(e => e.split('.')[1])
    },
    attributesFirstOaLocation () {
      return this.attributes?.filter(e => e.includes('first_oa_location')).map(e => e.split('.')[1])
    },
    attributesOaLocations () {
      return this.attributes?.filter(e => e.includes('oa_locations')).map(e => e.split('.')[1])
    },
    attributesZAuthors () {
      return this.attributes?.filter(e => e.includes('z_authors')).map(e => e.split('.')[1])
    },
    query () {
      return `{ GetByDOI(dois: [${this.formatDOIs}]) ${this.parseUnpaywallAttributesToGraphqlAttributes(this.attributes)} }`
    },
    linkGraphql () {
      return `${this.$graphql.defaults.baseURL}/graphql?query=${this.query}&apikey=demo`
    },
    stringifiedGraphqlResult () {
      return JSON.stringify(this.result.data, null, 2)
    }
  },
  methods: {
    parseUnpaywallAttributesToGraphqlAttributes (attributes) {
      const simple = attributes.filter((e) => { return !e.includes('.') })
      let best_oa_location = attributes.filter((e) => { return e.includes('best_oa_location') })
      let first_oa_location = attributes.filter((e) => { return e.includes('first_oa_location') })
      let oa_locations = attributes.filter((e) => { return e.includes('oa_locations') })
      let z_authors = attributes.filter((e) => { return e.includes('z_authors') })

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
        best_oa_location = best_oa_location.map((e) => { return e.split('.')[1] })
        attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`)
      }
      if (first_oa_location.length) {
        first_oa_location = first_oa_location.map((e) => { return e.split('.')[1] })
        attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`)
      }
      if (oa_locations.length) {
        oa_locations = oa_locations.map((e) => { return e.split('.')[1] })
        attrs.push(`oa_locations { ${oa_locations.join(', ')} }`)
      }
      if (z_authors.length) {
        z_authors = z_authors.map((e) => { return e.split('.')[1] })
        attrs.push(`z_authors { ${z_authors.join(', ')} }`)
      }
      return `{ ${attrs.join(', ')} }`
    },
    getAttributes (attributesSelected) {
      this.attributes = attributesSelected
    },
    /**
     * Necessary on preprod
     * (http environment)
     */
    unsecuredCopyToClipboard (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.setAttribute('display', 'none')
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorCopyRequest'))
      }
      document.body.removeChild(textArea)
    },
    copyText () {
      try {
        if (window.isSecureContext && navigator.clipboard) {
          navigator.clipboard.writeText(this.query)
        } else {
          this.unsecuredCopyToClipboard(this.query)
        }
        this.$store.dispatch('snacks/info', this.$t('graphql.copyRequest'))
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorCopyRequest'))
      }
    },
    async graphqlRequest () {
      this.loading = true
      let res
      // 10.1001/jama.2016.9797
      try {
        res = await this.$graphql({
          method: 'GET',
          url: '/graphql',
          params: {
            query: this.query
          },
          headers: {
            'x-api-key': this.apikey
          }
        })
        this.$vuetify.goTo('#graphqlResult')
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('graphql.errorRequest'))
      }

      this.result = res?.data
      this.loading = false
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
