<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('administration.apikey.title')" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="importDialogVisible = true"
      >
        <v-icon>mdi-file-import</v-icon>
      </v-btn>
      <ImportDialog
        v-model="importDialogVisible"
        @imported="getApikeys()"
        @closed="importDialogVisible = false"
      />
      <v-btn
        icon
        @click.stop="exportDialogVisible = true"
      >
        <v-icon>mdi-export-variant</v-icon>
      </v-btn>
      <ExportDialog
        v-model="exportDialogVisible"
        :apikeys="apikeys"
        @created="getApikeys()"
        @closed="exportDialogVisible = false"
      />
      <v-btn
        icon
        @click.stop="createDialogVisible = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <CreateDialog
        v-model="createDialogVisible"
        @created="getApikeys()"
        @closed="createDialogVisible = false"
      />
      <v-btn
        icon
        :disabled="loading"
        @click.stop="getApikeys()"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </v-toolbar>

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
import ImportDialog from '~/components/administration/apikey/ImportDialog.vue'
import ExportDialog from '~/components/administration/apikey/ExportDialog.vue'
import ApikeyCard from '~/components/administration/apikey/ApikeyCard.vue'

export default {
  name: 'ApikeyTab',
  components: {
    CreateDialog,
    ImportDialog,
    ExportDialog,
    ApikeyCard
  },
  data () {
    return {
      loading: false,
      createDialogVisible: false,
      importDialogVisible: false,
      exportDialogVisible: false,
      apikeys: []
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
