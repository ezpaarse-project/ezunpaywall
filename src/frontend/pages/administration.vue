<template>
  <section>
    <WeekHistory />
    <v-card>
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title v-text="$t('administration.health.title')" />
        <v-spacer />
        <v-icon>mdi-security</v-icon>
      </v-toolbar>

      <v-row v-if="healths.length === 0" align="center" justify="center" class="ma-2">
        <v-col class="text-center" cols="12" sm="4">
          {{ $t("administration.health.noHealths") }}
        </v-col>
      </v-row>
      <v-row v-else class="ma-2">
        <v-col
          v-for="(globalHealth, globalName) in healths"
          :key="globalName"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <HealthCards :global-name="globalName" :global-health="globalHealth" />
        </v-col>
      </v-row>
    </v-card>

    <Apikeycards />
  </section>
</template>

<script>

import WeekHistory from '~/components/administration/WeekHistory.vue'
import HealthCards from '~/components/administration/HealthCards.vue'
import Apikeycards from '~/components/administration/ApikeyCards.vue'

export default {
  name: 'Administration',
  components: {
    WeekHistory,
    HealthCards,
    Apikeycards
  },
  data () {
    return {
      healths: {}
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
        this.$store.dispatch('snacks/error', this.$t('administration.errorHelth'))
        this.loading = false
      }
      this.healths = res?.data
    },

    async isLogin () {
      let res
      try {
        res = await this.$apikey.get('/login')
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.errorLogin'))
        this.loading = false
      }
    }
  }
}
</script>
