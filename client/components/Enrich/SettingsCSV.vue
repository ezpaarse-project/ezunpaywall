<template>
  <div>
    <v-text-field
      v-model="enrichedFile"
      :label="$t('ui.pages.enrich.settings.name')"
    />
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
  </div>
</template>
<script>
import Select from '~/components/Select.vue'

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
      oa_locations: [],

      unpaywallAttr: [
        'data_standard',
        'doi_url',
        'genre',
        'is_oa',
        'is_paratext',
        'journal_is_in_doaj',
        'journal_is_oa',
        'journal_issn_l',
        'journal_issns',
        'journal_name',
        'os_status',
        'published_date',
        'publisher',
        'title',
        'updated',
        'year'
      ],
      oa_location: [
        'evidence',
        'host_type',
        'is_best',
        'license',
        'pmh_id',
        'updated',
        'url',
        'url_for_landing_page',
        'url_for_pdf',
        'version'
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
      this.best_oa_location.forEach((el) => {
        array1.push(`best_oa_location.${el}`)
      })
      this.first_oa_location.forEach((el) => {
        array2.push(`first_oa_location.${el}`)
      })
      const setting = this.simple
        .concat(array1)
        .concat(array2)

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
