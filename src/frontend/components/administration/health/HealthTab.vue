<template>
  <v-card>
    <v-toolbar color="secondary" dark flat dense>
      <v-toolbar-title v-text="$t('administration.health.title')" />
      <v-spacer />
      <v-icon>mdi-security</v-icon>
    </v-toolbar>

    <v-row
      v-if="healths.length === 0"
      align="center"
      justify="center"
      class="ma-2"
    >
      <v-col class="text-center" cols="12" sm="4">
        {{ $t("administration.health.noHealth") }}
      </v-col>
    </v-row>
    <v-row v-else class="ma-2">
      <v-col
        v-for="(config, name) in healths"
        :key="name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <Card :name="name" :config="config" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import Card from '~/components/administration/health/Card.vue'

export default {
  name: 'HealthTab',
  components: {
    Card
  },
  data () {
    return {
      healths: []
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
        return
      }
      this.healths = res?.data
    }
  }
}
</script>
