<template>
  <v-dialog :value="value" max-width="1000px" @input="updateVisible($event)">
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <span class="mr-2" v-text="$t('administration.apikey.create')" />
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form id="formCreate" v-model="valid" @submit.prevent="createApikey()">
          <v-text-field
            v-model="name"
            :rules="nameRule"
            :label="$t('administration.apikey.name')"
            name="name"
            outlined
            clearable
            required
            autofocus
          />
          <v-text-field
            v-model="owner"
            :label="$t('administration.apikey.owner')"
            name="owner"
            outlined
            clearable
            required
            autofocus
          />
          <v-text-field
            v-model="description"
            :label="$t('administration.apikey.description')"
            name="description"
            outlined
            clearable
            required
            autofocus
          />
          <v-card-actions>
            <span class="mr-2" v-text="`${$t('administration.apikey.access')}`" />
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
          <v-divider />
          <v-card-title> {{ $t('administration.apikey.attributes') }} </v-card-title>
          <SettingsAttributes
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
          form="formCreate"
          :disabled="!valid"
          :loading="loading"
          class="green--text"
        >
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsAttributes from '~/components/unpaywallArgs/SettingsAttributes.vue'

export default {
  name: 'ApikeyCreateDialog',
  components: {
    SettingsAttributes
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      valid: false,
      name: '',
      owner: '',
      description: '',
      enrich: false,
      graphql: true,
      attributes: ['doi'],
      allowed: true
    }
  },
  computed: {
    validForm () {
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
    }
  },
  methods: {
    updateVisible (visible) {
      this.$emit('input', visible)
    },
    async createApikey () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'POST',
          url: '/keys',
          data: {
            name: this.name,
            owner: this.owner,
            description: this.description,
            attributes: this.attributes,
            access: this.access,
            allowed: this.allowed
          },
          headers: {
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('administration.apikey.errorCreate'))
        this.loading = false
        return
      }
      this.$store.dispatch('snacks/info', this.$t('administration.apikey.infoCreated'))
      this.$emit('created')
      this.loading = false
      this.updateVisible(false)
    },
    updateAttributes (attributesSelected) {
      // TODO 50 is the sum of attributes available through ezunpaywall
      if (attributesSelected.length === 50) {
        this.attributes = ['*']
      } else {
        this.attributes = attributesSelected
      }
    }
  }
}
</script>
