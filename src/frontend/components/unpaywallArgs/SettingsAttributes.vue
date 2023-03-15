<template>
  <div>
    <v-card-actions>
      <v-btn @click="unselectAll()">
        <span v-text="$t('unpaywallArgs.unselectAll')" />
      </v-btn>
      <v-spacer />
      <v-btn @click="selectAll()">
        <span v-text="$t('unpaywallArgs.selectAll')" />
      </v-btn>
    </v-card-actions>

    <SelectAttributes
      v-if="!hideSimple"
      :items="unpaywallAttr"
      label="simple"
      :selected="simpleSelected"
      @simple="setAttributes('simpleSelected', $event)"
    />
    <SelectAttributes
      v-if="!hideBestOaLocation"
      :items="oaLocationAttr"
      label="best_oa_location"
      :selected="bestOaLocationSelected"
      @best_oa_location="setAttributes('bestOaLocationSelected', $event)"
    />
    <SelectAttributes
      v-if="!hideFirstOaLocation"
      :items="oaLocationAttr"
      label="first_oa_location"
      :selected="firstOaLocationSelected"
      @first_oa_location="setAttributes('firstOaLocationSelected', $event)"
    />
    <SelectAttributes
      v-if="!hideOaLocations"
      :items="oaLocationAttr"
      label="oa_locations"
      :selected="oaLocationsSelected"
      @oa_locations="setAttributes('oaLocationsSelected', $event)"
    />
    <SelectAttributes
      v-if="!hideZAuthor"
      :items="zAuthorsAttr"
      label="z_authors"
      :selected="zAuthorsSelected"
      @z_authors="setAttributes('zAuthorsSelected', $event)"
    />
  </div>
</template>
<script>
import SelectAttributes from '~/components/unpaywallArgs/SelectAttributes.vue'

export default {
  components: {
    SelectAttributes
  },
  props: {
    all: {
      type: Boolean,
      default: false
    },
    simple: {
      type: Array,
      default: () => []
    },
    bestOaLocation: {
      type: Array,
      default: () => []
    },
    firstOaLocation: {
      type: Array,
      default: () => []
    },
    oaLocations: {
      type: Array,
      default: () => []
    },
    zAuthors: {
      type: Array,
      default: () => []
    },
    hideSimple: {
      type: Boolean,
      default: () => false
    },
    hideBestOaLocation: {
      type: Boolean,
      default: () => false
    },
    hideFirstOaLocation: {
      type: Boolean,
      default: () => false
    },
    hideOaLocations: {
      type: Boolean,
      default: () => false
    },
    hideZAuthor: {
      type: Boolean,
      default: () => false
    }
  },
  data: () => {
    return {
      simpleSelected: [],
      bestOaLocationSelected: [],
      firstOaLocationSelected: [],
      oaLocationsSelected: [],
      zAuthorsSelected: []
    }
  },
  computed: {
    unpaywallAttr () {
      return [
        { name: 'doi', info: this.$t('unpaywallArgs.general.doi') },
        { name: 'data_standard', info: this.$t('unpaywallArgs.general.data_standard') },
        { name: 'doi_url', info: this.$t('unpaywallArgs.general.doi_url') },
        { name: 'genre', info: this.$t('unpaywallArgs.general.genre') },
        { name: 'is_oa', info: this.$t('unpaywallArgs.general.is_oa') },
        { name: 'is_paratext', info: this.$t('unpaywallArgs.general.is_paratext') },
        { name: 'journal_is_in_doaj', info: this.$t('unpaywallArgs.general.journal_is_in_doaj') },
        { name: 'journal_is_oa', info: this.$t('unpaywallArgs.general.journal_is_oa') },
        { name: 'journal_issn_l', info: this.$t('unpaywallArgs.general.journal_issn_l') },
        { name: 'journal_issns', info: this.$t('unpaywallArgs.general.journal_issns') },
        { name: 'journal_name', info: this.$t('unpaywallArgs.general.journal_name') },
        { name: 'oa_status', info: this.$t('unpaywallArgs.general.oa_status') },
        { name: 'published_date', info: this.$t('unpaywallArgs.general.published_date') },
        { name: 'publisher', info: this.$t('unpaywallArgs.general.publisher') },
        { name: 'title', info: this.$t('unpaywallArgs.general.title') },
        { name: 'updated', info: this.$t('unpaywallArgs.general.updated') },
        { name: 'year', info: this.$t('unpaywallArgs.general.year') }
      ]
    },
    oaLocationAttr () {
      return [
        { name: 'evidence', info: this.$t('unpaywallArgs.oa_locations.evidence') },
        { name: 'host_type', info: this.$t('unpaywallArgs.oa_locations.host_type') },
        { name: 'is_best', info: this.$t('unpaywallArgs.oa_locations.is_best') },
        { name: 'license', info: this.$t('unpaywallArgs.oa_locations.license') },
        { name: 'pmh_id', info: this.$t('unpaywallArgs.oa_locations.pmh_id') },
        { name: 'updated', info: this.$t('unpaywallArgs.oa_locations.updated') },
        { name: 'url', info: this.$t('unpaywallArgs.oa_locations.url') },
        { name: 'url_for_landing_page', info: this.$t('unpaywallArgs.oa_locations.url_for_landing_page') },
        { name: 'url_for_pdf', info: this.$t('unpaywallArgs.oa_locations.url_for_pdf') },
        { name: 'version', info: this.$t('unpaywallArgs.oa_locations.version') }
      ]
    },
    zAuthorsAttr () {
      return [
        { name: 'family', info: this.$t('unpaywallArgs.z_authors.family') },
        { name: 'given', info: this.$t('unpaywallArgs.z_authors.given') },
        { name: 'ORCID', info: this.$t('unpaywallArgs.z_authors.ORCID') }
      ]
    },
    attributes () {
      return this.hideSimple
        ? []
        : this.simpleSelected
          .concat(this.hideOBestOaLocation ? [] : this.flatten(this.bestOaLocationSelected, 'best_oa_location'))
          .concat(this.hideOFirstLocation ? [] : this.flatten(this.firstOaLocationSelected, 'first_oa_location'))
          .concat(this.hideOaLocations ? [] : this.flatten(this.oaLocationsSelected, 'oa_locations'))
          .concat(this.hideZAuthor ? [] : this.flatten(this.zAuthorsSelected, 'z_authors'))
    }
  },
  mounted () {
    if (this.all) {
      this.selectAll()
    } else {
      this.simpleSelected = this.hideSimple ? [] : this.simple
      this.bestOaLocationSelected = this.hideOBestOaLocation ? [] : this.bestOaLocation
      this.firstOaLocationSelected = this.hideOFirstLocation ? [] : this.firstOaLocation
      this.oaLocationsSelected = this.hideOaLocations ? [] : this.oaLocations
      this.zAuthorsSelected = this.hideZAuthor ? [] : this.zAuthors
    }
  },
  methods: {
    selectAll () {
      this.simpleSelected = this.hideSimple ? [] : this.unpaywallAttr.map(e => e.name)
      this.bestOaLocationSelected = this.hideOBestOaLocation ? [] : this.oaLocationAttr.map(e => e.name)
      this.firstOaLocationSelected = this.hideOFirstLocation ? [] : this.oaLocationAttr.map(e => e.name)
      this.oaLocationsSelected = this.hideOaLocations ? [] : this.oaLocationAttr.map(e => e.name)
      this.zAuthorsSelected = this.hideZAuthor ? [] : this.zAuthorsAttr.map(e => e.name)
      this.$emit('attributes', this.attributes)
    },
    unselectAll () {
      this.simpleSelected = []
      this.bestOaLocationSelected = []
      this.firstOaLocationSelected = []
      this.oaLocationsSelected = []
      this.zAuthorsSelected = []
      this.$emit('attributes', this.attributes)
    },
    setAttributes (key, e) {
      if (!this[key]) { return false }
      this[key] = e
      this.$emit('attributes', this.attributes)
    },
    flatten (e, attr) {
      return e.map(e => `${attr}.${e}`)
    }
  }
}
</script>