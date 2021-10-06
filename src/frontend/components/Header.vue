<template>
  <v-app-bar app dark fixed clipped-left color="#4caf50">
    <v-app-bar-nav-icon dark @click.stop="setDrawer()" />
    <v-toolbar-title> ezunpaywall </v-toolbar-title>
  </v-app-bar>
</template>

<script>

export default {
  name: 'Header',
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
