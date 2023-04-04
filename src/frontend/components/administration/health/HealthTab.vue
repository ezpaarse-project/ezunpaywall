<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title> {{ $t('administration.health.title') }} </v-toolbar-title>
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>

    <Loader v-if="loading" />
    <NoData v-else-if="!healths || Object.keys(healths).length === 0" :local-key="$t('administration.health.noHealth')" />
    <v-row v-else class="ma-2">
      <v-col
        v-for="(health, name) in healths"
        :key="name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="3"
      >
        <HealthCard :name="name" :health="health" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import HealthCard from '~/components/administration/health/HealthCard.vue'
import Loader from '~/components/Loader.vue'
import NoData from '~/components/NoData.vue'

export default {
  name: 'HealthTab',
  components: {
    HealthCard,
    Loader,
    NoData
  },
  data () {
    return {
      loading: false,
      healths: false
    }
  },
  async mounted () {
    await this.getHealth()
  },
  methods: {
    async getHealth () {
      let res
      this.loading = true
      try {
        res = await this.$health.get('/health')
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.health.errorHealth'))
        this.loading = false
        return
      }
      this.healths = res?.data
      this.loading = false
    }
  }
}
</script>
