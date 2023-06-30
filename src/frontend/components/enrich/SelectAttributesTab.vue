<template>
  <div>
    <v-toolbar class="secondary" dark dense flat>
      <v-toolbar-title> {{ $t("enrich.settings") }} </v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="apikey"
      :append-icon="apiKeyVisible ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[apiKeyRules.required]"
      :type="apiKeyVisible ? 'text' : 'password'"
      :label="$t('enrich.apikey')"
      filled
      @click:append="apiKeyVisible = !apiKeyVisible"
    />
    <v-row class="mb-3 ml-1">
      <div class="mr-1" v-text="$t('enrich.fileExtension')" />
      <v-chip label text-color="white" :color="extensionFileColor">
        {{ type }}
      </v-chip>
    </v-row>

    <v-toolbar class="secondary" dark dense flat>
      <v-toolbar-title>
        {{ $t("enrich.unpaywallAttributes") }}
      </v-toolbar-title>
      <v-menu
        v-model="unpaywallArgsHelp"
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

        <v-card class="text-justify">
          <v-card-text>
            {{ $t("unpaywallArgs.help", { url: dataFormatURL }) }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn class="body-2" text @click="unpaywallArgsHelp = false">
              {{ $t("close") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-toolbar>

    <SettingsAttributes
      :hide-oa-locations="type === 'csv'"
      :simple="attributesSimple"
      :best-oa-location="attributesBestOaLocation"
      :first-oa-location="attributesFirstOaLocation"
      :oa-locations="attributesOaLocations"
      :z-authors="attributesZAuthors"
      @attributes="getAttributes"
    />
  </div>
</template>

<script>
import SettingsAttributes from '~/components/unpaywallArgs/SettingsAttributes.vue'

export default {
  components: {
    SettingsAttributes
  },
  data: () => {
    return {
      apiKeyVisible: true,
      apiKeyRules: {
        required: value => !!value || 'Required.'
      },
      unpaywallArgsHelp: false,
      authorizedFile: [
        { name: 'csv', color: 'green' },
        { name: 'jsonl', color: 'orange' }
      ],
      dataFormatURL: 'https://unpaywall.org/data-format'
    }
  },
  computed: {
    type () {
      return this.$store.getters['enrich/getType']
    },
    apikey: {
      get () {
        return this.$store.getters['enrich/getApikey']
      },
      set (newVal) {
        this.$store.commit('enrich/setApikey', newVal)
      }
    },
    attributes: {
      get () {
        return this.$store.getters['enrich/getAttributes']
      },
      set (newVal) {
        this.$store.commit('enrich/setAttributes', newVal)
      }
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
    extensionFileColor () {
      const extension = this.authorizedFile.find(
        file => file.name === this.type
      )
      return extension?.color || 'gray'
    }
  },
  methods: {
    getAttributes (attributesSelected) {
      this.$store.commit('enrich/setAttributes', attributesSelected)
    },
    getApikey () {
      this.$store.commit('enrich/setApikey', this.extensionSelected())
    }
  }
}
</script>

<style>
</style>
