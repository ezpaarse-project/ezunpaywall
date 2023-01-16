<template>
  <v-col cols="auto">
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="1000"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          color="orange"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <span class="mr-2" v-text="$t('administration.apikey.update')" />
          <v-chip
            label
            color="secondary"
            text-color="white"
          >
            {{ apikey }}
          </v-chip>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form" v-model="valid" class="mt-4">
            <v-text-field
              v-model="name"
              :rules="nameRule"
              label="Name"
              name="name"
              outlined
              clearable
              required
            />
            <v-card-actions>
              <span class="mr-2">Access: </span>
              <v-checkbox
                v-model="graphql"
                class="mr-2"
                label="graphql"
              />
              <v-checkbox
                v-model="enrich"
                label="enrich"
              />
            </v-card-actions>
            <SettingsAttributes
              :all="attributesAll"
              :simple="attributesSimple"
              :best-oa-location="attributesBestOaLocation"
              :first-oa-location="attributesFirstOaLocation"
              :oa-locations="attributesOaLocations"
              :z-authors="attributesZAuthors"
              @attributes="setAttributes"
            />
            <v-checkbox
              v-model="allowed"
              label="allowed"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            class="red--text"
            @click="dialog = false"
            v-text="$t('cancel')"
          />
          <v-spacer />
          <v-btn
            text
            :disabled="!valid"
            class="green--text"
            @click="updateApikey()"
            v-text="$t('update')"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>

import SettingsAttributes from '~/components/administration/SettingsAttributes.vue'

export default {
  name: 'ApikeyUpdateButton',
  components: {
    SettingsAttributes
  },
  props: {
    apikey: {
      type: String,
      default: ''
    },
    apikeyConfig: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      dialog: false,
      name: this.apikeyConfig.name,
      enrich: false,
      graphql: false,
      attributes: this.apikeyConfig.attributes,
      allowed: this.apikeyConfig.allowed
    }
  },
  computed: {
    valid () {
      return this?.attributes?.length > 0 && this?.name?.length > 0 && this?.access?.length > 0
    },
    nameRule () {
      return [v => !!v || this.$t('required')]
    },
    access () {
      const res = []
      if (this.enrich) { res.push('enrich') }
      if (this.graphql) { res.push('graphql') }
      return res
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
    attributesAll () {
      return this.attributes.includes('*')
    }
  },
  mounted () {
    this.graphql = this.apikeyConfig.access.includes('graphql')
    this.enrich = this.apikeyConfig.access.includes('enrich')
  },
  methods: {
    async updateApikey () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'PUT',
          url: `/keys/${this.apikey}`,
          data: {
            name: this.name,
            attributes: this.attributes,
            access: this.access,
            allowed: this.allowed
          },
          headers: {
            'X-API-KEY': this.$store.state.admin.password
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.apikey.errorUpdate'))
        this.loading = false
        return
      }
      this.$store.dispatch('snacks/info', this.$t('administration.apikey.infoUpdate'))
      this.dialog = false
      this.$emit('updated')
    },
    setAttributes (e) {
      this.attributes = e
    }
  }
}
</script>
