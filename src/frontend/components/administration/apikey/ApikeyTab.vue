<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('administration.apikey.title') }} </v-toolbar-title>
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>
    <v-card-actions>
      <v-spacer />
      <v-btn
        @click.stop="setVisible(true)"
      >
        {{ $t('administration.apikey.buttonCreate') }}
      </v-btn>
      <CreateDialog
        v-model="createDialogVisible"
        @created="getApikeys()"
        @closed="setVisible(false)"
      />
    </v-card-actions>

    <Loader v-if="loading" />
    <NoData v-else-if="apikeys.length === 0" :local-key="'administration.apikey.noApikeys'" />
    <v-row v-else class="ma-2">
      <v-col
        v-for="(key) in apikeys"
        :key="key.apikey"
        cols="12"
        sm="12"
        md="12"
        lg="6"
        xl="6"
      >
        <ApikeyCard
          :apikey="key.apikey"
          :config="key.config"
          @deleted="getApikeys()"
          @updated="getApikeys()"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import CreateDialog from '~/components/administration/apikey/CreateDialog.vue'
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'
import ApikeyCard from '~/components/administration/apikey/ApikeyCard.vue'

export default {
  name: 'ApikeyTab',
  components: {
    CreateDialog,
    Loader,
    NoData,
    ApikeyCard
  },
  data () {
    return {
      loading: false,
      createDialogVisible: false,
      apikeys: []
    }
  },
  async mounted () {
    await this.getApikeys()
  },
  methods: {
    setVisible (value) {
      this.createDialogVisible = value
    },
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
        this.$store.dispatch(
          'snacks/error',
          this.$t('administration.errorApikey')
        )
        this.loading = false
        return
      }
      this.loading = false
      this.apikeys = res?.data
    }
  }
}
</script>
