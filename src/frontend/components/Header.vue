<template>
  <v-app-bar app dark fixed clipped-left color="primary">
    <v-app-bar-nav-icon dark @click.stop="setDrawer()" />
    <v-toolbar-title> {{ getTitle() }} </v-toolbar-title>
    <v-spacer />
    <Help />
    <Status />
  </v-app-bar>
</template>

<script>
import Status from '~/components/header/Status.vue'
import Help from '~/components/header/Help.vue'

export default {
  name: 'Header',
  components: {
    Status,
    Help
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
