<template>
  <v-dialog :value="visible" max-width="1000px" @input="closeDialog">
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <span class="mr-2" v-text="$t('administration.apikey.create')" />
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" class="mt-4">
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
          @click.stop="closeDialog()"
          v-text="$t('cancel')"
        />
        <v-spacer />
        <v-btn
          :loading="loading"
          text
          :disabled="!valid"
          class="green--text"
          @click="createApikey()"
          v-text="$t('create')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsAttributes from '~/components/administration/SettingsAttributes.vue'

export default {
  name: 'ApikeyCreateDialog',
  components: {
    SettingsAttributes
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      name: '',
      enrich: false,
      graphql: true,
      attributes: ['doi'],
      allowed: true
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
  methods: {
    closeDialog () {
      this.$emit('closed')
    },
    async createApikey () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'POST',
          url: '/keys',
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
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('administration.apikey.errorCreate'))
        this.loading = false
        return
      }
      this.$store.dispatch('snacks/info', this.$t('administration.apikey.infoCreated'))
      this.$emit('created')
      this.loading = false
      this.closeDialog()
    },
    updateAttributes (attributesSelected) {
      this.attributes = attributesSelected
    }
  }
}
</script>
