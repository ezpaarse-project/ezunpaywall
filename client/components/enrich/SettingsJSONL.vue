<template>
  <div>
    <SelectAttributes
      :items="unpaywallAttr"
      :label="'simple'"
      @tab="getTab"
    />
    <SelectAttributes
      :items="oa_location"
      :label="'best_oa_location'"
      @tab="getTab"
    />
    <SelectAttributes
      :items="oa_location"
      :label="'first_oa_location'"
      @tab="getTab"
    />
    <SelectAttributes
      :items="oa_location"
      :label="'oa_locations'"
      @tab="getTab"
    />
  </div>
</template>
<script>
import SelectAttributes from '~/components/enrich/SelectAttributes.vue'

export default {
  components: {
    SelectAttributes
  },
  data: () => {
    return {
      enrichedFile: '',
      simple: [],

      best_oa_location: [],
      first_oa_location: [],
      oa_locations: []
    }
  },
  computed: {
    unpaywallAttr () {
      return [
        { name: 'data_standard', info: this.$t('ui.components.enrich.Settings.info.general.data_standard') },
        { name: 'doi_url', info: this.$t('ui.components.enrich.Settings.info.general.doi_url') },
        { name: 'genre', info: this.$t('ui.components.enrich.Settings.info.general.genre') },
        { name: 'is_oa', info: this.$t('ui.components.enrich.Settings.info.general.is_oa') },
        { name: 'is_paratext', info: this.$t('ui.components.enrich.Settings.info.general.is_paratext') },
        { name: 'journal_is_in_doaj', info: this.$t('ui.components.enrich.Settings.info.general.journal_is_in_doaj') },
        { name: 'journal_is_oa', info: this.$t('ui.components.enrich.Settings.info.general.journal_is_oa') },
        { name: 'journal_issn_l', info: this.$t('ui.components.enrich.Settings.info.general.journal_issn_l') },
        { name: 'journal_issns', info: this.$t('ui.components.enrich.Settings.info.general.journal_issns') },
        { name: 'journal_name', info: this.$t('ui.components.enrich.Settings.info.general.journal_name') },
        { name: 'oa_status', info: this.$t('ui.components.enrich.Settings.info.general.oa_status') },
        { name: 'published_date', info: this.$t('ui.components.enrich.Settings.info.general.published_date') },
        { name: 'publisher', info: this.$t('ui.components.enrich.Settings.info.general.publisher') },
        { name: 'title', info: this.$t('ui.components.enrich.Settings.info.general.title') },
        { name: 'updated', info: this.$t('ui.components.enrich.Settings.info.general.updated') },
        { name: 'year', info: this.$t('ui.components.enrich.Settings.info.general.year') }
      ]
    },
    oa_location () {
      return [
        { name: 'evidence', info: this.$t('ui.components.enrich.Settings.info.oa_location.evidence') },
        { name: 'host_type', info: this.$t('ui.components.enrich.Settings.info.oa_location.host_type') },
        { name: 'is_best', info: this.$t('ui.components.enrich.Settings.info.oa_location.is_best') },
        { name: 'license', info: this.$t('ui.components.enrich.Settings.info.oa_location.license') },
        { name: 'pmh_id', info: this.$t('ui.components.enrich.Settings.info.oa_location.pmh_id') },
        { name: 'updated', info: this.$t('ui.components.enrich.Settings.info.oa_location.updated') },
        { name: 'url', info: this.$t('ui.components.enrich.Settings.info.oa_location.url') },
        { name: 'url_for_landing_page', info: this.$t('ui.components.enrich.Settings.info.oa_location.url_for_landing_page') },
        { name: 'url_for_pdf', info: this.$t('ui.components.enrich.Settings.info.oa_location.url_for_pdf') },
        { name: 'version', info: this.$t('ui.components.enrich.Settings.info.oa_location.version') }
      ]
    }
  },
  methods: {
    /**
     * give setting to parent
     */
    getSetting () {
      this.$emit('setting', [
        ...this.simple.slice(),
        ...this.best_oa_location.map(el => `best_oa_location.${el}`),
        ...this.oa_locations.map(el => `oa_location.${el}`),
        ...this.first_oa_location.map(el => `first_oa_location.${el}`),
      ])
    },
    getTab (event) {
      this[event.label] = event.tab
      this.getSetting()
    }
  }
}
</script>

<style>
</style>
