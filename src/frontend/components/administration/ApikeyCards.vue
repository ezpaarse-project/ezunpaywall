<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('administration.apikey.title')" />
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>

    <ApikeyCreateButton
      @created="getApikeys()"
    />
    <v-row v-if="apikeys.length === 0" align="center" justify="center" class="ma-2">
      <v-col class="text-center" cols="12" sm="4">
        {{ $t("administration.apikey.noApikeys") }}
      </v-col>
    </v-row>
    <v-row v-else class="ma-2">
      <v-col
        v-for="(apikey, id) in apikeys"
        :key="id"
        cols="12"
        sm="12"
        md="12"
        lg="6"
        xl="6"
      >
        <v-card>
          <v-card-title class="pt-5 pl-5 pr-5 ma-2">
            <v-row>
              {{ apikey[Object.keys(apikey)[0]].name }}
              <v-spacer />
              <span v-if="apikey[Object.keys(apikey)[0]].allowed" class="green--text"> Allowed </span>
              <v-icon v-if="apikey[Object.keys(apikey)[0]].allowed" size="30" right color="green">
                mdi-check
              </v-icon>

              <span v-if="!apikey[Object.keys(apikey)[0]].allowed" class="red--text"> Not Allowed </span>
              <v-icon v-if="!apikey[Object.keys(apikey)[0]].allowed" size="30" right color="red">
                mdi-close
              </v-icon>
            </v-row>
          </v-card-title>

          <v-card-subtitle class="pb-0">
            {{ Object.keys(apikey)[0] }}
          </v-card-subtitle>

          <v-divider class="ma-2" />

          <div class="ml-8">
            access:
            <v-chip
              v-for="access in apikey[Object.keys(apikey)[0]].access"
              :key="access"
              color="primary"
              text-color="white"
              class="ma-1"
              label
              small
            >
              {{ access }}
            </v-chip>
          </div>

          <div class="ml-8">
            attributes:
            <v-chip
              v-for="attributes in apikey[Object.keys(apikey)[0]].attributes"
              :key="attributes"
              color="green darken-3"
              text-color="white"
              class="ma-1"
              label
              small
            >
              {{ attributes }}
            </v-chip>
          </div>

          <v-card-actions>
            <ApikeyUpdateButton
              :apikey="Object.keys(apikey)[0]"
              :apikey-config="apikey[Object.keys(apikey)[0]]"
              @updated="getApikeys()"
            />
            <v-spacer />
            <ApikeyDeleteButton
              :apikey="Object.keys(apikey)[0]"
              @deleted="getApikeys()"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>

import ApikeyDeleteButton from '~/components/administration/ApikeyDeleteButton.vue'
import ApikeyUpdateButton from '~/components/administration/ApikeyUpdateButton.vue'
import ApikeyCreateButton from '~/components/administration/ApikeyCreateButton.vue'

export default {
  name: 'ApikeyCard',
  components: {
    ApikeyDeleteButton,
    ApikeyUpdateButton,
    ApikeyCreateButton
  },
  data () {
    return {
      deleted: false,
      apikeys: {}
    }
  },
  async mounted () {
    await this.getApikeys()
  },
  methods: {
    async getApikeys () {
      let res
      this.loading = true
      try {
        res = await this.$apikey({
          method: 'GET',
          url: '/keys',
          headers: {
            'X-API-KEY': this.$store.state.admin.password
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.errorApikey'))
        this.loading = false
        return
      }
      this.apikeys = res?.data
    }
  }
}
</script>
