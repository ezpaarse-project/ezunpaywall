<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('administration.apikey.title') }} </v-toolbar-title>
      <v-spacer />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            @click.stop="importDialogVisible = true"
            v-on="on"
          >
            <v-icon>mdi-file-import</v-icon>
          </v-btn>
        </template>
        {{ $t("administration.apikey.import") }}
      </v-tooltip>
      <ImportDialog
        v-model="importDialogVisible"
        @imported="getApikeys()"
        @closed="importDialogVisible = false"
      />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            @click.stop="exportDialogVisible = true"
            v-on="on"
          >
            <v-icon>mdi-export-variant</v-icon>
          </v-btn>
        </template>
        {{ $t("administration.apikey.export") }}
      </v-tooltip>
      <ExportDialog
        v-model="exportDialogVisible"
        :apikeys="apikeys"
        @created="getApikeys()"
        @closed="exportDialogVisible = false"
      />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            @click.stop="createDialogVisible = true"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t("administration.apikey.create") }}
      </v-tooltip>
      <CreateDialog
        v-model="createDialogVisible"
        @created="getApikeys()"
        @closed="createDialogVisible = false"
      />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            :disabled="loading"
            @click.stop="getApikeys()"
            v-on="on"
          >
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </template>
        {{ $t("administration.apikey.reload") }}
      </v-tooltip>
    </v-toolbar>

    <v-row
      v-if="loading"
      align="center"
      justify="center"
      class="ma-2"
    >
      <Loader />
    </v-row>
    <NoData v-else-if="!apikeys || apikeys.length === 0" :text="$t('administration.apikey.noApikeys')" />
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
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'
import ApikeyCard from '~/components/administration/apikey/ApikeyCard.vue'

export default {
  name: 'ApikeyTab',
  components: {
    CreateDialog,
    ImportDialog,
    ExportDialog,
    Loader,
    NoData,
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
            'X-API-KEY': this.$store.getters['admin/getPassword']
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('error.apikey.get'))
        this.loading = false
        return
      }
      this.loading = false
      this.apikeys = res?.data
    }
  }
}
</script>
