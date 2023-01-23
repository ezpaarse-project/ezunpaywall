<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('administration.apikey.title')" />
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>
    <v-card-actions>
      <v-spacer />
      <v-btn
        @click.stop="setShow(true)"
        v-text="$t('administration.apikey.buttonCreate')"
      />

      <CreateDialog
        :dialog="dialog"
        @created="getApikeys()"
        @closed="setShow(false)"
      />
    </v-card-actions>

    <v-row
      v-if="apikeys.length === 0"
      align="center"
      justify="center"
      class="ma-2"
    >
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
        <Card
          :apikey="Object.keys(apikey)[0]"
          :config="apikey[Object.keys(apikey)[0]]"
          @deleted="getApikeys()"
          @updated="getApikeys()"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import CreateDialog from '~/components/administration/apikey/CreateDialog.vue'
import Card from '~/components/administration/apikey/Card.vue'

export default {
  name: 'ApikeyTab',
  components: {
    CreateDialog,
    Card
  },
  data () {
    return {
      dialog: false,
      apikeys: {}
    }
  },
  async mounted () {
    await this.getApikeys()
  },
  methods: {
    setShow (value) {
      this.dialog = value
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

      this.apikeys = res?.data
    }
  }
}
</script>
