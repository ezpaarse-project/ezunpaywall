<template>
  <v-app-bar app dark fixed clipped-left color="primary">
    <v-app-bar-nav-icon dark @click.stop="setDrawer()" />
    <v-toolbar-title> ezunpaywall </v-toolbar-title>
    <v-spacer />
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
  computed: {
    drawer () {
      return this.$store.state.drawer.status
    }
  },
  methods: {
    setDrawer () {
      this.$store.dispatch('drawer/setDrawer', !this.drawer)
    }
  }
}
</script>
