<template>
  <v-dialog :value="value" max-width="1000px" @input="updateVisible($event)">
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
      <v-card-text class="mt-4">
        <v-form :id="`form-${apikey}`" v-model="validForm" @submit.prevent="updateApikey()">
          <v-text-field
            v-model="name"
            :rules="nameRule"
            label="Name"
            name="name"
            outlined
            clearable
            required
            autofocus
          />
          <v-card-actions>
            <span class="mr-2" v-text="$t('administration.apikey.access')" />
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
          <v-card-actions>
            <span class="mr-2" v-text="`${$t('administration.apikey.allowed')} :`" />
            <v-checkbox
              v-model="allowed"
            />
          </v-card-actions>
          <SettingsAttributes
            :all="attributesAll"
            :simple="attributesSimple"
            :best-oa-location="attributesBestOaLocation"
            :first-oa-location="attributesFirstOaLocation"
            :oa-locations="attributesOaLocations"
            :z-authors="attributesZAuthors"
            @attributes="updateAttributes"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="updateVisible(false)"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          :form="`form-${apikey}`"
          :disabled="!valid"
          :loading="loading"
          class="green--text"
        >
          {{ $t('update') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsAttributes from '~/components/administration/SettingsAttributes.vue'

export default {
  name: 'ApikeyUpdateDialog',
  components: {
    SettingsAttributes
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    apikey: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      validForm: true,
      loading: false,
      name: this.config.name,
      enrich: false,
      graphql: false,
      attributes: this.config.attributes,
      allowed: this.config.allowed
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
      return this.attributes?.includes('*')
    }
  },
  mounted () {
    this.graphql = this.config?.access.includes('graphql')
    this.enrich = this.config?.access.includes('enrich')
  },
  methods: {
    updateVisible (visible) {
      this.$emit('input', visible)
    },
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
      this.$emit('updated')
      this.loading = false
      this.updateVisible(false)
    },
    updateAttributes (attributesSelected) {
      this.attributes = attributesSelected
    }
  }
}
</script>
