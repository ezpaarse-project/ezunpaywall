<template>
  <v-container fluid>
    <v-checkbox
      v-model="all"
      :label="checkAll"
      @click.stop
      @change="switchAll(all)"
    />
    <v-checkbox v-model="selected" label="is_oa" value="is_oa" />
    <v-checkbox v-model="selected" label="doi_url" value="doi_url" />
    <v-checkbox v-model="selected" label="genre" value="genre" />
    <v-checkbox v-model="selected" label="title" value="title" />
    <v-checkbox v-model="selected" label="updated" value="updated" />
    <v-checkbox v-model="selected" label="year" value="year" />

    <v-list-group no-action>
      <template #activator>
        <v-checkbox
          v-model="best_oa_location_all"
          @click.stop
          @change="switchOaLocation('best_oa_location', best_oa_location_all)"
        />
        <v-list-item-title class="body-2">
          best_oa_location
        </v-list-item-title>
      </template>
      <v-list-item v-for="(attr, i) in oa_location" :key="i">
        <v-checkbox v-model="best_oa_location" :label="attr" :value="attr" />
      </v-list-item>
    </v-list-group>

    <v-list-group no-action>
      <template #activator>
        <v-checkbox
          v-model="first_oa_location_all"
          @click.stop
          @change="switchOaLocation('first_oa_location', first_oa_location_all)"
        />
        <v-list-item-title class="body-2">
          first_oa_location
        </v-list-item-title>
      </template>
      <v-list-item v-for="(attr, i) in oa_location" :key="i">
        <v-checkbox v-model="first_oa_location" :label="attr" :value="attr" />
      </v-list-item>
    </v-list-group>

    <v-list-group no-action>
      <template #activator>
        <v-checkbox
          v-model="oa_locations_all"
          @click.stop
          @change="switchOaLocation('oa_locations', oa_locations_all)"
        />
        <v-list-item-title class="body-2">
          oa_locations
        </v-list-item-title>
      </template>
      <v-list-item v-for="(attr, i) in oa_location" :key="i">
        <v-checkbox v-model="oa_locations" :label="attr" :value="attr" />
      </v-list-item>
    </v-list-group>

    <v-checkbox
      v-model="selected"
      label="data_standard"
      value="data_standard"
    />
    <v-checkbox v-model="selected" label="is_paratext" value="is_paratext" />
    <v-checkbox
      v-model="selected"
      label="journal_is_in_doaj"
      value="journal_is_in_doaj"
    />
    <v-checkbox
      v-model="selected"
      label="journal_is_oa"
      value="journal_is_oa"
    />
    <v-checkbox
      v-model="selected"
      label="journal_issns"
      value="journal_issns"
    />
    <v-checkbox
      v-model="selected"
      label="journal_issn_l"
      value="journal_issn_l"
    />
    <v-checkbox v-model="selected" label="journal_name" value="journal_name" />
    <v-checkbox v-model="selected" label="os_status" value="os_status" />
    <v-checkbox
      v-model="selected"
      label="published_date"
      value="published_date"
    />
    <v-checkbox v-model="selected" label="publisher" value="publisher" />
  </v-container>
</template>

<script>
export default {
  data: () => {
    return {
      // v-model of select
      all: false,
      // v-model of oa_location group checkbox
      best_oa_location_all: false,
      first_oa_location_all: false,
      oa_locations_all: false,

      // v-model of oa_location list checkbox
      selected: [],
      best_oa_location: [],
      oa_locations: [],
      first_oa_location: [],
      unpaywallAttr: [
        'is_oa',
        'data_standard',
        'doi_url',
        'genre',
        'is_paratext',
        'journal_is_in_doaj',
        'journal_is_oa',
        'journal_issns',
        'journal_issn_l',
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
  computed: {
    checkAll () {
      if (this.all) {
        return this.$t('ui.components.settings.unselectAll')
      } else {
        return this.$t('ui.components.settings.selectAll')
      }
    }
  },
  methods: {
    switchAll (checked) {
      if (checked === true) {
        this.selectAll()
      } else {
        this.unselectAll()
      }
    },
    unselectAll () {
      this.selected = []
      this.best_oa_location_all = false
      this.first_oa_location_all = false
      this.oa_locations_all = false
      this.best_oa_location = []
      this.oa_locations = []
      this.first_oa_location = []
    },
    selectAll () {
      this.selected = this.unpaywallAttr
      this.best_oa_location_all = true
      this.first_oa_location_all = true
      this.oa_locations_all = true
      this.best_oa_location = this.oa_location
      this.oa_locations = this.oa_location
      this.first_oa_location = this.oa_location
    },
    switchOaLocation (type, checked) {
      if (checked === true) {
        this[type] = this.oa_location
      } else {
        this[type] = []
      }
    }
  }
}
</script>

<style>
</style>
