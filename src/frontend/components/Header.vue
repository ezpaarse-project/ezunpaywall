<template>
  <v-app-bar app dark fixed clipped-left color="#4caf50">
    <v-app-bar-nav-icon dark @click.stop="setDrawer(!drawer)" />
    <v-toolbar-title> ezunpaywall </v-toolbar-title>
  </v-app-bar>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Header',
  computed: {
    drawer () {
      return this.$store.state.drawer
    }
  },
  methods: mapActions({
    setDrawer: 'SET_DRAWER'
  })
}
</script>
