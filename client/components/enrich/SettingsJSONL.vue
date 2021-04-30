<template>
  <div>
    <Select
      :items="unpaywallAttr"
      :label="'simple'"
      @tab="getTab"
    />
    <Select
      :items="oa_location"
      :label="'best_oa_location'"
      @tab="getTab"
    />
    <Select
      :items="oa_location"
      :label="'first_oa_location'"
      @tab="getTab"
    />
    <Select
      :items="oa_location"
      :label="'oa_locations'"
      @tab="getTab"
    />
  </div>
</template>
<script>
import Select from '~/components/enrich/Select.vue'

export default {
  components: {
    Select
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
      const array1 = []
      const array2 = []
      const array3 = []
      this.best_oa_location.forEach((el) => {
        array1.push(`best_oa_location.${el}`)
      })
      this.oa_locations.forEach((el) => {
        array2.push(`oa_location.${el}`)
      })
      this.first_oa_location.forEach((el) => {
        array3.push(`first_oa_location.${el}`)
      })
      const setting = this.simple
        .concat(array1)
        .concat(array2)
        .concat(array3)

      this.$emit('setting', setting)
      return setting
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
