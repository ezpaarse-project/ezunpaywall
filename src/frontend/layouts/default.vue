<template>
  <v-app
    id="ezunpaywall"
  >
    <AppDrawer />
    <AppHeader />
    <Snackbar />

    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Snackbar from '~/components/Snackbar.vue'
import AppHeader from '~/components/Header.vue'
import AppDrawer from '~/components/Drawer.vue'

export default {
  components: {
    AppHeader,
    AppDrawer,
    Snackbar
  }
}
</script>
