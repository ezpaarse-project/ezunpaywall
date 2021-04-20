<template>
  <v-app
    id="ez-unpaywall"
  >
    <AppDrawer />
    <AppHeader />
    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'

export default {
  components: {
    AppHeader,
    AppDrawer
  }
}
</script>
