<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title>
        {{ $t("administration.health.title") }}
      </v-toolbar-title>
      <v-spacer />
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            :disabled="loading"
            @click.stop="getHealths()"
            v-on="on"
          >
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </template>
        {{ $t("administration.health.reload") }}
      </v-tooltip>
    </v-toolbar>

    <v-row v-if="loading" align="center" justify="center" class="ma-2">
      <Loader />
    </v-row>
    <NoData
      v-else-if="!healths || Object.keys(healths).length === 0"
      :text="$t('administration.health.noHealth')"
    />
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
    await this.getHealths()
  },
  methods: {
    async getHealths () {
      let res
      this.loading = true
      try {
        res = await this.$health.get('/status')
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('error.health.get'))
        this.loading = false
        return
      }
      this.healths = res?.data
      this.loading = false
    }
  }
}
</script>
