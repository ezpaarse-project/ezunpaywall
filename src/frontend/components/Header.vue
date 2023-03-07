<template>
  <v-app-bar app dark fixed clipped-left color="primary">
    <v-app-bar-nav-icon dark @click.stop="setDrawer()" />
    <v-toolbar-title> {{ getTitle() }} </v-toolbar-title>
    <v-spacer />
    <v-menu
      v-model="help"
      :close-on-content-click="false"
      :nudge-width="200"
      max-width="500"
      offset-x
      transition="slide-x-transition"
    >
      <template #activator="{ on }">
        <v-btn class="mr-5" icon v-on="on">
          <v-icon>mdi-help-circle</v-icon>
        </v-btn>
      </template>

      <v-card class="text-justify">
        <v-card-text>
          {{ $t('header.help') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="body-2"
            text
            @click="help = false"
          >
            {{ $t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    <status />
  </v-app-bar>
</template>

<script>
import Status from '~/components/header/Status.vue'

export default {
  name: 'Header',
  components: {
    Status
  },
  data: () => {
    return {
      help: false
    }
  },
  computed: {
    drawer () {
      return this.$store.state.drawer.status
    }
  },
  methods: {
    setDrawer () {
      this.$store.dispatch('drawer/setDrawer', !this.drawer)
    },
    getTitle () {
      if (this.$config.environment === 'integration') {
        return `ezunpaywall ${this.$t('integration')}`
      }
      if (this.$config.environment === 'production') {
        return 'ezunpaywall'
      }
      return `ezunpaywall ${this.$t('development')}`
    }
  }
}
</script>
